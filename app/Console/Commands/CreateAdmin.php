<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CreateAdmin extends Command
{
    protected $signature = 'eventix:crear-admin';

    protected $description = 'Crear un administrador de EVENTIX';

    public function handle(): int
    {
        $datos = [
            'nombre' => trim((string) $this->ask('Nombre')),
            'apellido' => trim((string) $this->ask('Apellido')),
            'correo' => trim((string) $this->ask('Correo electrónico')),
            'telefono' => trim((string) $this->ask('Teléfono (opcional)')),
            'password' => $this->secret(
                'Contraseña (mínimo 12 caracteres)',
                false
            ),
            'password_confirmation' => $this->secret(
                'Repite la contraseña',
                false
            ),
        ];

        $validacion = Validator::make($datos, [
            'nombre' => ['required', 'string', 'max:100'],
            'apellido' => ['required', 'string', 'max:100'],
            'correo' => [
                'required',
                'email',
                'max:150',
                'unique:usuarios,correo',
            ],
            'telefono' => ['nullable', 'string', 'max:30'],
            'password' => [
                'required',
                'string',
                'min:12',
                'confirmed',
            ],
        ], [
            'required' => 'El campo :attribute es obligatorio.',
            'max' => 'El campo :attribute admite hasta :max caracteres.',
            'correo.email' => 'Introduce un correo electrónico válido.',
            'correo.unique' => 'Ese correo ya está registrado.',
            'password.min' => 'La contraseña debe tener al menos 12 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ], [
            'correo' => 'correo electrónico',
            'password' => 'contraseña',
        ]);

        if ($validacion->fails()) {
            foreach ($validacion->errors()->all() as $mensaje) {
                $this->error($mensaje);
            }

            return self::FAILURE;
        }

        if (strlen($datos['password']) > 72) {
            $this->error(
                'La contraseña es demasiado larga. Usa una más corta.'
            );

            return self::FAILURE;
        }

        $usuario = new User([
            'nombre' => $datos['nombre'],
            'apellido' => $datos['apellido'],
            'correo' => $datos['correo'],
            'telefono' => $datos['telefono'] !== ''
                ? $datos['telefono']
                : null,
            'password_hash' => $datos['password'],
        ]);

        $usuario->rol = 'administrador';

        $usuario->save();

        $this->info('Administrador creado correctamente.');
        $this->line('ID del administrador: ' . $usuario->id_usuario);

        return self::SUCCESS;
    }
}