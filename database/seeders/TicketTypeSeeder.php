<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

class TicketTypeSeeder extends Seeder
{
    public function run(): void
    {
        $evento = Event::where('nombre', 'Concierto de Verano')
            ->where('fecha_evento', '2025-07-20')
            ->where('hora_inicio', '19:00:00')
            ->where('ubicacion', 'Estadio Nacional · Ciudad de México')
            ->first();

        if (!$evento) {
            throw new RuntimeException(
                'Primero debes cargar el evento con EventSeeder.'
            );
        }

        if ($evento->ticket_types()->where('nombre', 'General')->exists()) {
            $this->command->info('La entrada General ya está registrada.');

            return;
        }

        $this->command->info(
            'Evento: ' . $evento->nombre .
            ' | Aforo total: ' . $evento->aforo_total .
            ' | Precio General: Bs 100'
        );

        $datos = [
            'cupo_total' => trim((string) $this->command->ask(
                '¿Cuántas entradas General tendrá el evento?'
            )),
            'limite_por_compra' => trim((string) $this->command->ask(
                '¿Cuántas entradas General se podrán comprar por operación?'
            )),
            'fecha_inicio_venta' => trim((string) $this->command->ask(
                'Inicio de venta: AAAA-MM-DD HH:MM'
            )),
            'fecha_fin_venta' => trim((string) $this->command->ask(
                'Cierre de venta: AAAA-MM-DD HH:MM'
            )),
        ];

        $entrada = DB::transaction(function () use ($evento, $datos) {
            $eventoActual = Event::whereKey($evento->id_evento)
                ->lockForUpdate()
                ->firstOrFail();

            $existente = $eventoActual->ticket_types()
                ->where('nombre', 'General')
                ->first();

            if ($existente) {
                return $existente;
            }

            $cupoAsignado = (int) $eventoActual->ticket_types()
                ->sum('cupo_total');

            $cupoRestante = $eventoActual->aforo_total - $cupoAsignado;

            $validados = Validator::make($datos, [
                'cupo_total' => [
                    'required',
                    'integer',
                    'min:1',
                    'max:' . $cupoRestante,
                ],
                'limite_por_compra' => [
                    'required',
                    'integer',
                    'min:1',
                    'lte:cupo_total',
                ],
                'fecha_inicio_venta' => [
                    'required',
                    'date_format:Y-m-d H:i',
                ],
                'fecha_fin_venta' => [
                    'required',
                    'date_format:Y-m-d H:i',
                    'after:fecha_inicio_venta',
                ],
            ], [
                'required' => 'Completa el campo :attribute.',
                'integer' => ':attribute debe ser un número entero.',
                'min' => ':attribute debe ser como mínimo :min.',
                'max' => 'El cupo supera el aforo que queda por asignar.',
                'lte' => 'El límite por compra no puede superar el cupo General.',
                'date_format' => ':attribute debe usar AAAA-MM-DD HH:MM.',
                'after' => 'El cierre debe ser posterior al inicio de venta.',
            ], [
                'cupo_total' => 'cupo General',
                'limite_por_compra' => 'límite por compra',
                'fecha_inicio_venta' => 'inicio de venta',
                'fecha_fin_venta' => 'cierre de venta',
            ])->validate();

            return $eventoActual->ticket_types()->create([
                'nombre' => 'General',
                'descripcion' => null,
                'precio' => '100.00',
                'cupo_total' => $validados['cupo_total'],
                'limite_por_compra' => $validados['limite_por_compra'],
                'fecha_inicio_venta' => $validados['fecha_inicio_venta'] . ':00',
                'fecha_fin_venta' => $validados['fecha_fin_venta'] . ':00',
                'estado' => true,
            ]);
        });

        $this->command->info(
            $entrada->wasRecentlyCreated
                ? 'Entrada General creada correctamente.'
                : 'La entrada General ya estaba registrada.'
        );
    }
}