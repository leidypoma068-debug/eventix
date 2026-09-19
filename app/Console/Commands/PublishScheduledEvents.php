<?php

namespace App\Console\Commands;

use App\Models\AdminActivity;
use App\Models\Event;
use Illuminate\Console\Command;

class PublishScheduledEvents extends Command
{
    protected $signature = 'eventix:publicar-programados';
    protected $description = 'Publica automáticamente los eventos cuya fecha y hora programada ya se cumplió.';

    public function handle(): int
    {
        $events = Event::query()
            ->whereIn('estado', ['programado', 'proximamente'])
            ->whereNull('eliminado_en')
            ->whereNotNull('publicar_en')
            ->where('publicar_en', '<=', now())
            ->get();

        foreach ($events as $event) {
            $event->update([
                'estado' => 'publicado',
                'fecha_publicacion' => now(),
                'publicar_en' => null,
                'id_publicador' => $event->id_publicador ?: $event->id_administrador,
            ]);

            AdminActivity::create([
                'id_usuario' => $event->id_publicador ?: $event->id_administrador,
                'accion' => 'Evento publicado automáticamente desde programación',
                'entidad_tipo' => 'evento',
                'entidad_id' => $event->id_evento,
                'detalle' => ['nombre' => $event->nombre],
                'ip' => null,
            ]);
        }

        if ($events->count()) {
            $this->info('EVENTIX publicó '.$events->count().' evento(s) programado(s).');
        }

        return self::SUCCESS;
    }
}
