<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        abort_unless(
            $user && $user->estado && in_array($user->rol, ['administrador','subadministrador'], true),
            403
        );

        Inertia::share('adminContext', [
            'isMainAdmin' => $user->rol === 'administrador',
            'permissions' => $user->rol === 'administrador' ? ['*'] : ($user->permisos ?? []),
            'profile' => [
                'id' => (int) $user->id_usuario,
                'name' => trim($user->nombre.' '.$user->apellido),
                'firstName' => $user->nombre,
                'lastName' => $user->apellido,
                'email' => $user->correo,
                'phone' => $user->telefono,
                'employeeNumber' => $user->numero_empleado,
                'role' => $user->rol,
                'position' => $user->cargo,
                'photo' => $user->foto_perfil ? asset('storage/'.$user->foto_perfil) : null,
            ],
        ]);

        return $next($request);
    }
}
