<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventixNotification;
use App\Models\Purchase;
use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    private function eventImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $path = trim($path);

        if ($path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, 'data:')) {
            return $path;
        }

        if (str_starts_with($path, '/')) {
            return $path;
        }

        if (str_starts_with($path, 'storage/') || str_starts_with($path, 'img/') || str_starts_with($path, 'images/')) {
            return '/'.$path;
        }

        return '/storage/'.ltrim($path, '/');
    }

    public function show(Event $event)
    {
        abort_unless($event->estado === 'publicado', 404);

        $event->load([
            'category',
            'ticket_types' => fn ($query) => $query->active()->orderBy('precio'),
        ]);

        $types = $event->ticket_types->map(function ($type) {
            $sold = Ticket::where('id_tipo_entrada', $type->id_tipo_entrada)
                ->whereIn('estado', ['vigente', 'usada', 'transferida'])
                ->count();

            return [
                'id' => $type->id_tipo_entrada,
                'name' => $type->nombre,
                'description' => $type->descripcion,
                'price' => (float) $type->precio,
                'max_purchase' => $type->limite_por_compra,
                'available' => max(0, $type->cupo_total - $sold),
            ];
        });

        return Inertia::render('Checkout/Checkout', [
            'event' => [
                'id' => $event->id_evento,
                'title' => $event->nombre,
                'date' => $event->fecha_evento->format('Y-m-d'),
                'time' => substr($event->hora_inicio, 0, 5),
                'location' => $event->ubicacion,
                'image' => $this->eventImageUrl($event->imagen),
            ],
            'ticketTypes' => $types,
            'serviceFeePercent' => (float) ($event->porcentaje_servicio ?? 5),
        ]);
    }

    public function paymentQr(Request $request)
    {
        $amount = max(0, (float) $request->query('amount', 0));
        $payload = 'EVENTIX|PAGO|Bs '.number_format($amount, 2, '.', '').'|REF '.Str::upper(Str::random(8));

        return response(
            \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(260)->margin(1)->generate($payload),
            200,
            ['Content-Type' => 'image/svg+xml']
        );
    }

    public function store(Request $request, Event $event)
    {
        $data = $request->validate([
            'method' => ['required', 'in:tarjeta,qr'],
            'quantities' => ['required', 'array'],
            'quantities.*' => ['nullable', 'integer', 'min:0'],
        ]);

        $selected = collect($data['quantities'])->filter(fn ($quantity) => (int) $quantity > 0);

        if ($selected->isEmpty()) {
            return back()->withErrors([
                'quantities' => 'Selecciona al menos una entrada.',
            ]);
        }

        $purchase = DB::transaction(function () use ($event, $selected, $data, $request) {
            $details = [];
            $subtotal = 0;
            $totalQty = 0;

            foreach ($selected as $id => $qty) {
                $type = TicketType::where('id_evento', $event->id_evento)
                    ->whereKey($id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $qty = (int) $qty;
                $sold = Ticket::where('id_tipo_entrada', $type->id_tipo_entrada)
                    ->whereIn('estado', ['vigente', 'usada', 'transferida'])
                    ->count();

                $available = $type->cupo_total - $sold;

                if ($qty > $available || $qty > $type->limite_por_compra) {
                    abort(422, 'No hay cupo suficiente o superaste el límite por compra.');
                }

                $line = (float) $type->precio * $qty;
                $subtotal += $line;
                $totalQty += $qty;

                $details[] = [
                    'type' => $type,
                    'qty' => $qty,
                    'line' => $line,
                ];
            }

            if ($totalQty > 10) {
                abort(422, 'Máximo 10 entradas por transacción.');
            }

            $serviceFeePercent = max(0, min(100, (float) ($event->porcentaje_servicio ?? 5)));
            $fee = round($subtotal * ($serviceFeePercent / 100), 2);
            $total = $subtotal + $fee;

            $purchase = Purchase::create([
                'id_usuario' => $request->user()->id_usuario,
                'id_evento' => $event->id_evento,
                'estado' => 'pagada',
                'metodo_pago' => $data['method'],
                'subtotal' => $subtotal,
                'cargo_servicio' => $fee,
                'total' => $total,
                'referencia_pago' => Str::upper(($data['method'] === 'qr' ? 'QR-' : 'CARD-').Str::random(14)),
                'fecha_pago' => now(),
            ]);

            foreach ($details as $detail) {
                $purchase->details()->create([
                    'id_tipo_entrada' => $detail['type']->id_tipo_entrada,
                    'cantidad' => $detail['qty'],
                    'precio_unitario' => $detail['type']->precio,
                    'subtotal' => $detail['line'],
                ]);

                for ($i = 0; $i < $detail['qty']; $i++) {
                    $purchase->tickets()->create([
                        'id_usuario' => $request->user()->id_usuario,
                        'id_evento' => $event->id_evento,
                        'id_tipo_entrada' => $detail['type']->id_tipo_entrada,
                        'codigo' => 'EVT-'.Str::upper(Str::random(10)),
                        'qr_token' => (string) Str::uuid(),
                        'estado' => 'vigente',
                        'titular_nombre' => trim($request->user()->nombre.' '.$request->user()->apellido),
                        'titular_correo' => $request->user()->correo,
                    ]);
                }
            }

            return $purchase;
        });

        $purchase->load(['event.publisher', 'user', 'details']);
        $ticketCount = (int) $purchase->details->sum('cantidad');
        $customerName = trim(($purchase->user?->nombre ?? '').' '.($purchase->user?->apellido ?? ''));

        // Solo el administrador principal recibe notificaciones de nuevas ventas.
        User::where('rol', 'administrador')
            ->where('estado', true)
            ->get()
            ->each(function ($admin) use ($purchase, $ticketCount, $customerName) {
                EventixNotification::create([
                    'id_usuario' => $admin->id_usuario,
                    'tipo' => 'venta_realizada',
                    'titulo' => 'Nueva venta confirmada',
                    'mensaje' => $customerName.' compró '.$ticketCount.' '.($ticketCount === 1 ? 'entrada' : 'entradas').' para '.$purchase->event->nombre.' por Bs '.number_format((float) $purchase->total, 2).'.',
                    'url' => '/admin/ventas',
                    'metadata' => [
                        'purchase_id' => $purchase->id_compra,
                        'event_id' => $purchase->id_evento,
                        'ticket_count' => $ticketCount,
                        'total' => (float) $purchase->total,
                    ],
                ]);
            });

        try {
            Mail::raw(
                'Tu compra EVENTIX #'.$purchase->id_compra.' fue confirmada. Revisa Mis entradas para ver tus códigos QR.',
                fn ($message) => $message->to($request->user()->correo)->subject('EVENTIX - Compra confirmada')
            );
        } catch (\Throwable $exception) {
            // El correo no bloquea la compra si el entorno local no tiene SMTP configurado.
        }

        return redirect()->route('tickets.index')->with('success', 'Compra confirmada. Tus entradas QR ya están listas.');
    }
}
