<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteController extends Controller
{
    public function index(Request $request): Response
    {
        $events = $request->user()
            ->favorites()
            ->published()
            ->with('category')
            ->withMin([
                'ticket_types as precio_desde' => fn ($query) => $query->active(),
            ], 'precio')
            ->orderBy('fecha_evento')
            ->orderBy('hora_inicio')
            ->get();

        return Inertia::render('Profile/Favorites', [
            'events' => EventResource::collection($events)->resolve($request),
        ]);
    }

    public function store(Request $request, Event $event)
    {
        abort_unless($event->estado === 'publicado', 404);

        $request->user()
            ->favorites()
            ->syncWithoutDetaching([(int) $event->id_evento]);

        return back()->with('success', 'Evento agregado a favoritos.');
    }

    public function destroy(Request $request, Event $event)
    {
        $request->user()
            ->favorites()
            ->detach((int) $event->id_evento);

        return back()->with('success', 'Evento eliminado de favoritos.');
    }
}
