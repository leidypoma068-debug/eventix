<?php

namespace App\Http\Controllers;

use App\Models\EventixNotification;
use App\Models\Purchase;
use App\Models\RefundRequest;
use App\Models\Ticket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ClientRefundController extends Controller
{
    private function eventDateTime($event): Carbon
    {
        return Carbon::parse($event->fecha_evento->format('Y-m-d').' '.substr($event->hora_inicio, 0, 5));
    }

    private function eventImageUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) return $path;
        if (str_starts_with($path, '/')) return asset(ltrim($path, '/'));
        if (str_starts_with($path, 'storage/') || str_starts_with($path, 'img/') || str_starts_with($path, 'images/')) return asset($path);
        return asset('storage/'.$path);
    }

    private function ticketPrice(Purchase $purchase, Ticket $ticket): float
    {
        $detail = $purchase->details->firstWhere('id_tipo_entrada', $ticket->id_tipo_entrada);
        return (float) ($detail?->precio_unitario ?? 0);
    }

    private function refundPayload(RefundRequest $refund): array
    {
        return [
            'id' => (int) $refund->id_reembolso,
            'status' => $refund->estado,
            'reason' => $refund->motivo,
            'amount' => (float) $refund->monto,
            'requestedAt' => $refund->solicitado_en?->format('d/m/Y H:i'),
            'resolvedAt' => $refund->resuelto_en?->format('d/m/Y H:i'),
            'adminNote' => $refund->observacion_admin,
            'tickets' => $refund->tickets->map(fn ($ticket) => [
                'id' => (int) $ticket->id_entrada,
                'code' => $ticket->codigo,
                'type' => $ticket->ticketType?->nombre ?? 'Entrada',
                'amount' => (float) ($ticket->pivot?->monto ?? 0),
            ])->values(),
        ];
    }

    public function index(Request $request)
    {
        $userId = (int) $request->user()->id_usuario;

        $purchases = Purchase::with([
                'event',
                'details',
                'tickets.ticketType',
                'refunds.tickets.ticketType',
            ])
            ->where('id_usuario', $userId)
            ->where('estado', 'pagada')
            ->latest('id_compra')
            ->get()
            ->map(function ($purchase) use ($userId) {
                $eventAt = $this->eventDateTime($purchase->event);
                $hoursUntil = now()->diffInHours($eventAt, false);

                $blockedByRefund = $purchase->refunds
                    ->whereIn('estado', ['pendiente', 'aprobado'])
                    ->flatMap(fn ($refund) => $refund->tickets->pluck('id_entrada'))
                    ->map(fn ($id) => (int) $id)
                    ->unique();

                $tickets = $purchase->tickets->map(function ($ticket) use ($purchase, $userId, $blockedByRefund) {
                    $price = $this->ticketPrice($purchase, $ticket);
                    $isOwner = (int) $ticket->id_usuario === $userId;
                    $inRefund = $blockedByRefund->contains((int) $ticket->id_entrada);

                    $eligible = $isOwner
                        && $ticket->estado === 'vigente'
                        && !$inRefund;

                    $label = 'Disponible';
                    $reason = null;

                    if (!$isOwner) {
                        $label = 'Transferida';
                        $reason = 'Esta entrada fue transferida y ya no pertenece a tu cuenta.';
                    } elseif ($ticket->estado === 'usada') {
                        $label = 'Usada';
                        $reason = 'Esta entrada ya fue utilizada para ingresar al evento.';
                    } elseif ($ticket->estado === 'anulada') {
                        $label = 'Anulada';
                        $reason = 'Esta entrada ya fue anulada y no puede volver a reembolsarse.';
                    } elseif ($inRefund) {
                        $label = 'En reembolso';
                        $reason = 'Esta entrada ya está incluida en una solicitud pendiente o aprobada.';
                    } elseif ($ticket->estado !== 'vigente') {
                        $label = ucfirst((string) $ticket->estado);
                        $reason = 'Esta entrada no se encuentra disponible para reembolso.';
                    }

                    return [
                        'id' => (int) $ticket->id_entrada,
                        'code' => $ticket->codigo,
                        'type' => $ticket->ticketType?->nombre ?? 'Entrada',
                        'price' => $price,
                        'state' => $ticket->estado,
                        'statusLabel' => $label,
                        'eligible' => $eligible,
                        'reason' => $reason,
                    ];
                })->values();

                $eligibleTickets = $tickets->where('eligible', true)->values();
                $refunds = $purchase->refunds
                    ->sortByDesc('id_reembolso')
                    ->map(fn ($refund) => $this->refundPayload($refund))
                    ->values();

                return [
                    'id' => (int) $purchase->id_compra,
                    'event' => [
                        'id' => (int) $purchase->event->id_evento,
                        'title' => $purchase->event->nombre,
                        'date' => $purchase->event->fecha_evento->format('Y-m-d'),
                        'time' => substr($purchase->event->hora_inicio, 0, 5),
                        'location' => $purchase->event->ubicacion,
                        'image' => $this->eventImageUrl($purchase->event->imagen),
                    ],
                    'total' => (float) $purchase->total,
                    'serviceFee' => (float) $purchase->cargo_servicio,
                    'method' => $purchase->metodo_pago,
                    'paidAt' => $purchase->fecha_pago?->format('d/m/Y H:i'),
                    'hoursUntil' => $hoursUntil,
                    'withinTime' => $hoursUntil >= 72,
                    'eligible' => $hoursUntil >= 72 && $eligibleTickets->isNotEmpty(),
                    'canRequest' => $hoursUntil >= 72 && $eligibleTickets->isNotEmpty(),
                    'tickets' => $tickets,
                    'summary' => [
                        'total' => $tickets->count(),
                        'eligible' => $eligibleTickets->count(),
                        'used' => $tickets->where('statusLabel', 'Usada')->count(),
                        'transferred' => $tickets->where('statusLabel', 'Transferida')->count(),
                        'annulled' => $tickets->where('statusLabel', 'Anulada')->count(),
                        'inRefund' => $tickets->where('statusLabel', 'En reembolso')->count(),
                        'refundableAmount' => (float) $eligibleTickets->sum('price'),
                    ],
                    'refunds' => $refunds,
                    'refund' => $refunds->first(),
                ];
            });

        return Inertia::render('Profile/Refunds', [
            'purchases' => $purchases,
            'ruleHours' => 72,
        ]);
    }

    public function store(Request $request, Purchase $purchase)
    {
        abort_unless((int) $purchase->id_usuario === (int) $request->user()->id_usuario, 403);
        abort_unless($purchase->estado === 'pagada', 422);

        $purchase->load(['event', 'details']);
        $hoursUntil = now()->diffInHours($this->eventDateTime($purchase->event), false);

        if ($hoursUntil < 72) {
            return back()->withErrors([
                'refund' => 'El reembolso solo puede solicitarse con al menos 72 horas de anticipación al evento.',
            ]);
        }

        $data = $request->validate([
            'motivo' => ['required', 'string', 'min:10', 'max:1000'],
            'ticket_ids' => ['required', 'array', 'min:1'],
            'ticket_ids.*' => ['required', 'integer', 'distinct'],
        ]);

        $selectedIds = collect($data['ticket_ids'])->map(fn ($id) => (int) $id)->unique()->values();

        DB::transaction(function () use ($request, $purchase, $data, $selectedIds) {
            $tickets = Ticket::with('ticketType')
                ->where('id_compra', $purchase->id_compra)
                ->whereIn('id_entrada', $selectedIds)
                ->lockForUpdate()
                ->get();

            if ($tickets->count() !== $selectedIds->count()) {
                throw ValidationException::withMessages(['refund' => 'Una o más entradas seleccionadas no pertenecen a esta compra.']);
            }

            foreach ($tickets as $ticket) {
                if ((int) $ticket->id_usuario !== (int) $request->user()->id_usuario) {
                    throw ValidationException::withMessages(['refund' => 'Una de las entradas seleccionadas fue transferida y ya no pertenece a tu cuenta.']);
                }

                if ($ticket->estado === 'usada') {
                    throw ValidationException::withMessages(['refund' => 'Una de las entradas seleccionadas ya fue utilizada y no puede reembolsarse.']);
                }

                if ($ticket->estado !== 'vigente') {
                    throw ValidationException::withMessages(['refund' => 'Una de las entradas seleccionadas ya no está disponible para reembolso.']);
                }
            }

            $alreadyRequested = DB::table('reembolso_entradas as re')
                ->join('solicitudes_reembolso as sr', 'sr.id_reembolso', '=', 're.id_reembolso')
                ->whereIn('re.id_entrada', $selectedIds)
                ->whereIn('sr.estado', ['pendiente', 'aprobado'])
                ->exists();

            if ($alreadyRequested) {
                throw ValidationException::withMessages(['refund' => 'Una de las entradas seleccionadas ya está incluida en otra solicitud de reembolso.']);
            }

            $amounts = [];
            $totalRefundable = 0.0;

            foreach ($tickets as $ticket) {
                $price = $this->ticketPrice($purchase, $ticket);
                $amounts[$ticket->id_entrada] = ['monto' => $price];
                $totalRefundable += $price;
            }

            $refund = RefundRequest::create([
                'id_compra' => $purchase->id_compra,
                'id_usuario' => $request->user()->id_usuario,
                'motivo' => $data['motivo'],
                'monto' => $totalRefundable,
                'estado' => 'pendiente',
                'solicitado_en' => now(),
            ]);

            $refund->tickets()->attach($amounts);

            $count = $tickets->count();
            $ticketWord = $count === 1 ? 'entrada' : 'entradas';

            EventixNotification::create([
                'id_usuario' => $request->user()->id_usuario,
                'tipo' => 'reembolso_recibido',
                'titulo' => 'Solicitud de reembolso recibida',
                'mensaje' => 'Recibimos tu solicitud para '.$count.' '.$ticketWord.' de '.$purchase->event->nombre.'. Monto solicitado: Bs '.number_format($totalRefundable, 2).'.',
                'url' => '/mis-reembolsos',
                'metadata' => [
                    'refund_id' => $refund->id_reembolso,
                    'purchase_id' => $purchase->id_compra,
                    'ticket_ids' => $selectedIds->all(),
                ],
            ]);

            $staff = User::whereIn('rol', ['administrador', 'subadministrador'])
                ->where('estado', true)
                ->get();

            foreach ($staff as $employee) {
                EventixNotification::create([
                    'id_usuario' => $employee->id_usuario,
                    'tipo' => 'reembolso_solicitado',
                    'titulo' => 'Nueva solicitud de reembolso',
                    'mensaje' => trim($request->user()->nombre.' '.$request->user()->apellido).' solicitó el reembolso de '.$count.' '.$ticketWord.' de la compra #'.$purchase->id_compra.' para '.$purchase->event->nombre.'.',
                    'url' => $employee->rol === 'administrador' ? '/admin/reembolsos' : null,
                    'metadata' => [
                        'refund_id' => $refund->id_reembolso,
                        'purchase_id' => $purchase->id_compra,
                        'event_id' => $purchase->id_evento,
                        'ticket_ids' => $selectedIds->all(),
                    ],
                ]);
            }
        });

        return back()->with('success', 'Solicitud enviada únicamente por las entradas seleccionadas.');
    }
}
