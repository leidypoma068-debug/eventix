<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientPurchaseController extends Controller
{
    private function imageUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) return $path;
        if (str_starts_with($path, '/')) return asset(ltrim($path, '/'));
        if (str_starts_with($path, 'storage/') || str_starts_with($path, 'img/') || str_starts_with($path, 'images/')) return asset($path);
        return asset('storage/' . ltrim($path, '/'));
    }

    public function index(Request $request)
    {
        $userId = (int) $request->user()->id_usuario;

        $purchases = Purchase::with([
            'event',
            'details.ticketType',
            'tickets.ticketType',
            'refunds.tickets',
        ])
        ->where('id_usuario', $userId)
        ->latest('id_compra')
        ->get()
        ->map(function ($purchase) use ($userId) {
            $approvedRefundTicketIds = $purchase->refunds
                ->where('estado', 'aprobado')
                ->flatMap(fn ($refund) => $refund->tickets->pluck('id_entrada'))
                ->map(fn ($id) => (int) $id)
                ->unique();

            $tickets = $purchase->tickets->map(function ($ticket) use ($userId, $approvedRefundTicketIds) {
                $belongs = (int) $ticket->id_usuario === $userId;
                $label = 'Disponible';
                $tone = 'green';

                if (!$belongs) {
                    $label = 'Transferida';
                    $tone = 'blue';
                } elseif ($ticket->estado === 'usada') {
                    $label = 'Usada';
                    $tone = 'slate';
                } elseif ($approvedRefundTicketIds->contains((int) $ticket->id_entrada) || in_array($ticket->estado, ['anulada', 'reembolsada'], true)) {
                    $label = 'Reembolsada / anulada';
                    $tone = 'red';
                } elseif ($ticket->estado !== 'vigente') {
                    $label = ucfirst((string) $ticket->estado);
                    $tone = 'amber';
                }

                return [
                    'id' => (int) $ticket->id_entrada,
                    'code' => $ticket->codigo,
                    'type' => $ticket->ticketType?->nombre ?? 'Entrada',
                    'state' => $ticket->estado,
                    'statusLabel' => $label,
                    'tone' => $tone,
                    'belongsToClient' => $belongs,
                ];
            })->values();

            return [
                'id' => (int) $purchase->id_compra,
                'status' => $purchase->estado,
                'method' => $purchase->metodo_pago,
                'reference' => $purchase->referencia_pago,
                'subtotal' => (float) $purchase->subtotal,
                'serviceFee' => (float) $purchase->cargo_servicio,
                'total' => (float) $purchase->total,
                'paidAt' => $purchase->fecha_pago?->format('d/m/Y H:i'),
                'event' => [
                    'id' => (int) $purchase->event->id_evento,
                    'title' => $purchase->event->nombre,
                    'date' => $purchase->event->fecha_evento?->format('Y-m-d'),
                    'time' => $purchase->event->hora_inicio ? substr($purchase->event->hora_inicio, 0, 5) : null,
                    'location' => $purchase->event->ubicacion,
                    'image' => $this->imageUrl($purchase->event->imagen),
                ],
                'ticketTypes' => $purchase->details->map(fn ($detail) => [
                    'type' => $detail->ticketType?->nombre ?? 'Entrada',
                    'quantity' => (int) $detail->cantidad,
                    'unitPrice' => (float) $detail->precio_unitario,
                    'subtotal' => (float) $detail->subtotal,
                ])->values(),
                'tickets' => $tickets,
                'summary' => [
                    'total' => $tickets->count(),
                    'available' => $tickets->where('belongsToClient', true)->where('state', 'vigente')->count(),
                    'used' => $tickets->where('state', 'usada')->count(),
                    'transferred' => $tickets->where('belongsToClient', false)->count(),
                    'refunded' => $approvedRefundTicketIds->count(),
                ],
            ];
        });

        return Inertia::render('Profile/Purchases', [
            'purchases' => $purchases,
            'totals' => [
                'purchases' => $purchases->count(),
                'spent' => (float) $purchases->where('status', 'pagada')->sum('total'),
                'tickets' => (int) $purchases->sum(fn ($purchase) => $purchase['summary']['total']),
                'used' => (int) $purchases->sum(fn ($purchase) => $purchase['summary']['used']),
            ],
        ]);
    }
}
