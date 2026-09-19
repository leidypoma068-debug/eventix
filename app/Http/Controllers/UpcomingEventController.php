<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\JsonResponse;

class UpcomingEventController extends Controller
{
    public function index(): JsonResponse
    {
        $events = Event::query()
            ->with('category')
            ->where('estado', 'proximamente')
            ->whereNull('eliminado_en')
            ->whereNotNull('publicar_en')
            ->where('publicar_en', '>', now())
            ->whereDate('fecha_evento', '>=', today())
            ->orderBy('publicar_en')
            ->take(8)
            ->get()
            ->map(function (Event $event) {
                $image = $event->imagen;

                if ($image) {
                    if (preg_match('/^https?:\\/\\//i', $image) || str_starts_with($image, '/')) {
                        $imageUrl = $image;
                    } else {
                        $imageUrl = asset('storage/' . ltrim($image, '/'));
                    }
                } else {
                    $imageUrl = null;
                }

                return [
                    'id' => (int) $event->id_evento,
                    'title' => $event->nombre,
                    'date' => $event->fecha_evento?->format('Y-m-d'),
                    'time' => $event->hora_inicio ? substr($event->hora_inicio, 0, 5) : null,
                    'location' => $event->ubicacion,
                    'image' => $imageUrl,
                    'category' => $event->category?->nombre,
                    'publishAt' => $event->publicar_en?->format('Y-m-d\\TH:i'),
                    'publishLabel' => $event->publicar_en?->format('d/m/Y H:i'),
                ];
            })
            ->values();

        return response()->json([
            'events' => $events,
        ]);
    }
}
