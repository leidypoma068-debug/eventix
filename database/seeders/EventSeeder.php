<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $administrador = User::active()
            ->where('rol', 'administrador')
            ->orderBy('id_usuario')
            ->first();

        if (!$administrador) {
            throw new RuntimeException(
                'Primero debes crear un administrador activo.'
            );
        }

        $categoria = Category::active()
            ->where('nombre', 'Conciertos')
            ->first();

        if (!$categoria) {
            throw new RuntimeException(
                'No se encontró la categoría Conciertos activa.'
            );
        }

        $evento = Event::firstOrCreate(
            [
                'nombre' => 'Concierto de Verano',
                'fecha_evento' => '2025-07-20',
                'hora_inicio' => '19:00:00',
                'ubicacion' => 'Estadio Nacional · Ciudad de México',
            ],
            [
                'id_categoria' => $categoria->id_categoria,
                'id_administrador' => $administrador->id_usuario,
                'descripcion' => '',
                'hora_fin' => null,
                'aforo_total' => 2000,
                'imagen' => null,
                'estado' => 'publicado',
                'fecha_publicacion' => null,
            ]
        );

        if ($evento->imagen === null) {
    $evento->update([
        'imagen' => '/img/events/concierto-verano.jpg',
    ]);

    $this->command->info('Imagen del concierto asignada correctamente.');
}

        $this->command->info(
            $evento->wasRecentlyCreated
                ? 'Concierto de Verano creado correctamente.'
                : 'Concierto de Verano ya estaba registrado.'
        );

        $this->command->line(
            'ID del evento: ' . $evento->id_evento
        );

        $this->command->line(
            'ID del administrador: ' . $evento->id_administrador
        );
    }
}