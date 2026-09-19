<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function event_details(Request $request, Event $event): Response
    {
        abort_unless($event->estado === 'publicado', 404);

        $event->load([
            'category',
            'ticket_types' => fn ($query) => $query->active()->orderBy('precio'),
        ])->loadMin([
            'ticket_types as precio_desde' => fn ($query) => $query->active(),
        ], 'precio');

        $data = (new EventResource($event))->resolve($request);

        $data['ticketTypes'] = $event->ticket_types
            ->map(function ($type) {
                $sold = Ticket::where('id_tipo_entrada', $type->id_tipo_entrada)
                    ->whereIn('estado', ['vigente', 'usada', 'transferida'])
                    ->count();

                return [
                    'id' => $type->id_tipo_entrada,
                    'name' => $type->nombre,
                    'description' => $type->descripcion,
                    'price' => $type->precio,
                    'max_purchase' => $type->limite_por_compra,
                    'available' => max(0, $type->cupo_total - $sold),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('EventDetails/EventDetails', [
            'event' => $data,
        ]);
    }
}