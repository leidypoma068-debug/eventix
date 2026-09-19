<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => (int) $user->id_usuario,
                    'name' => trim($user->nombre . ' ' . $user->apellido),
                    'nombre' => $user->nombre,
                    'apellido' => $user->apellido,
                    'email' => $user->correo,
                    'role' => $user->rol,
                ] : null,
            ],

            'favorites' => function () use ($user) {
                if (!$user || $user->rol !== 'cliente') {
                    return [
                        'ids' => [],
                        'items' => [],
                    ];
                }

                $ids = $user->favorites()
                    ->pluck('eventos.id_evento')
                    ->map(fn ($id) => (int) $id)
                    ->values()
                    ->all();

                $items = $user->favorites()
                    ->published()
                    ->orderBy('fecha_evento')
                    ->orderBy('hora_inicio')
                    ->take(5)
                    ->get()
                    ->map(fn ($event) => [
                        'id' => (int) $event->id_evento,
                        'title' => $event->nombre,
                    ])
                    ->values()
                    ->all();

                return [
                    'ids' => $ids,
                    'items' => $items,
                ];
            },

            // El cliente solo recibe avisos relacionados con sus reembolsos.
            'clientNotifications' => function () use ($user) {
                if (!$user || $user->rol !== 'cliente') {
                    return [
                        'items' => [],
                        'unreadCount' => 0,
                    ];
                }

                $query = $user->eventixNotifications()
                    ->whereIn('tipo', [
                        'reembolso_recibido',
                        'reembolso_resuelto',
                        'evento_cancelado',
                    ]);

                $items = (clone $query)
                    ->latest('id_notificacion')
                    ->take(12)
                    ->get()
                    ->map(fn ($notification) => [
                        'id' => (int) $notification->id_notificacion,
                        'type' => $notification->tipo,
                        'title' => $notification->titulo,
                        'message' => $notification->mensaje,
                        'url' => $notification->url,
                        'read' => (bool) $notification->leida,
                        'createdAt' => $notification->created_at?->diffForHumans(),
                    ])
                    ->values()
                    ->all();

                return [
                    'items' => $items,
                    'unreadCount' => (clone $query)->where('leida', false)->count(),
                ];
            },

            // Subadministrador: SOLO solicitudes de reembolso.
            // Administrador principal: solicitudes de reembolso + nuevas ventas.
            'adminNotifications' => function () use ($user) {
                if (!$user || !in_array($user->rol, ['administrador', 'subadministrador'], true)) {
                    return [
                        'items' => [],
                        'unreadCount' => 0,
                    ];
                }

                $types = $user->rol === 'administrador'
                    ? ['reembolso_solicitado', 'venta_realizada', 'evento_cancelado']
                    : ['reembolso_solicitado', 'evento_cancelado'];

                $query = $user->eventixNotifications()->whereIn('tipo', $types);

                $items = (clone $query)
                    ->latest('id_notificacion')
                    ->take(15)
                    ->get()
                    ->map(fn ($notification) => [
                        'id' => (int) $notification->id_notificacion,
                        'type' => $notification->tipo,
                        'title' => $notification->titulo,
                        'message' => $notification->mensaje,
                        'url' => $notification->url,
                        'read' => (bool) $notification->leida,
                        'createdAt' => $notification->created_at?->diffForHumans(),
                    ])
                    ->values()
                    ->all();

                return [
                    'items' => $items,
                    'unreadCount' => (clone $query)->where('leida', false)->count(),
                ];
            },

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
