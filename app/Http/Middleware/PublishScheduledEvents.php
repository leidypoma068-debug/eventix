<?php

namespace App\Http\Middleware;

use App\Models\Event;
use Closure;
use Illuminate\Http\Request;

class PublishScheduledEvents
{
    public function handle(Request $request, Closure $next)
    {
        // Respaldo para entornos locales: si el scheduler no está corriendo,
        // la primera petición después de la hora también publica el evento.
        Event::query()
            ->where('estado', 'programado')
            ->whereNull('eliminado_en')
            ->whereNotNull('publicar_en')
            ->where('publicar_en', '<=', now())
            ->get()
            ->each(function (Event $event) {
                $event->update([
                    'estado' => 'publicado',
                    'fecha_publicacion' => now(),
                    'publicar_en' => null,
                    'id_publicador' => $event->id_publicador ?: $event->id_administrador,
                ]);
            });

        return $next($request);
    }
}
