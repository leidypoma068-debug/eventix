<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivity;
use App\Models\AdminTask;
use App\Models\Event;
use App\Models\Purchase;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExperienceController extends Controller
{
    private array $permissionLabels = [
        'dashboard.view' => 'Ver dashboard',
        'events.view' => 'Ver eventos',
        'events.create' => 'Crear eventos',
        'events.edit' => 'Editar eventos',
        'events.publish' => 'Publicar eventos',
        'tickets.view' => 'Ver entradas',
        'stock.view' => 'Ver stock y aforo',
        'qr.validate' => 'Validar QR',
        'sales.view' => 'Ver ventas',
        'reports.view' => 'Ver reportes',
        'analytics.view' => 'Ver analítica',
        'clients.view' => 'Ver clientes',
        'profile.update' => 'Editar perfil',
    ];

    private function requireStaff(Request $request): void
    {
        abort_unless($request->user()?->isStaff(), 403);
    }

    private function requireMainAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdministrator(), 403);
    }

    private function eventIdsFor(Request $request)
    {
        $user = $request->user();

        if ($user->isAdministrator()) {
            return Event::query()->whereNull('eliminado_en')->pluck('id_evento');
        }

        return Event::query()
            ->whereNull('eliminado_en')
            ->where(function ($query) use ($user) {
                $query->where('id_publicador', $user->id_usuario)
                    ->orWhere('id_administrador', $user->id_usuario);
            })
            ->pluck('id_evento');
    }

    public function myDashboard(Request $request)
    {
        $this->requireStaff($request);

        $user = $request->user();
        $eventIds = $this->eventIdsFor($request);
        $paid = Purchase::where('estado', 'pagada')->whereIn('id_evento', $eventIds);
        $revenue = (float) (clone $paid)->sum('total');
        $commissionRate = (float) ($user->comision_porcentaje ?? 0);

        $nextEvents = Event::with('category')
            ->whereIn('id_evento', $eventIds)
            ->whereNull('eliminado_en')
            ->whereDate('fecha_evento', '>=', today())
            ->orderBy('fecha_evento')
            ->orderBy('hora_inicio')
            ->take(6)
            ->get()
            ->map(fn ($event) => [
                'id' => (int) $event->id_evento,
                'title' => $event->nombre,
                'date' => $event->fecha_evento?->format('Y-m-d'),
                'time' => $event->hora_inicio ? substr($event->hora_inicio, 0, 5) : null,
                'status' => $event->estado,
                'category' => $event->category?->nombre,
                'location' => $event->ubicacion,
            ]);

        $tasks = AdminTask::where('asignado_a', $user->id_usuario)
            ->orderByRaw("CASE WHEN estado = 'pendiente' THEN 0 WHEN estado = 'en_progreso' THEN 1 ELSE 2 END")
            ->orderBy('vence_en')
            ->take(8)
            ->get()
            ->map(fn ($task) => [
                'id' => (int) $task->id_tarea,
                'title' => $task->titulo,
                'description' => $task->descripcion,
                'priority' => $task->prioridad,
                'status' => $task->estado,
                'due' => $task->vence_en?->format('d/m/Y H:i'),
            ]);

        $recentActivity = AdminActivity::where('id_usuario', $user->id_usuario)
            ->latest('id_actividad')
            ->take(10)
            ->get()
            ->map(fn ($activity) => [
                'id' => (int) $activity->id_actividad,
                'action' => $activity->accion,
                'entity' => $activity->entidad_tipo,
                'date' => $activity->created_at?->format('d/m/Y H:i'),
            ]);

        $permissions = collect($this->permissionLabels)->map(fn ($label, $key) => [
            'key' => $key,
            'label' => $label,
            'enabled' => $user->isAdministrator() || $user->hasAdminPermission($key),
        ])->values();

        return Inertia::render('Admin/MyDashboard', [
            'profile' => [
                'name' => trim($user->nombre . ' ' . $user->apellido),
                'position' => $user->cargo ?: ($user->isAdministrator() ? 'Administrador' : 'Subadministrador'),
                'employeeNumber' => $user->numero_empleado,
                'commissionRate' => $commissionRate,
            ],
            'metrics' => [
                'events' => $eventIds->count(),
                'published' => Event::whereIn('id_evento', $eventIds)->where('estado', 'publicado')->count(),
                'upcoming' => Event::whereIn('id_evento', $eventIds)->where('estado', 'proximamente')->count(),
                'drafts' => Event::whereIn('id_evento', $eventIds)->where('estado', 'borrador')->count(),
                'tickets' => Ticket::whereIn('id_evento', $eventIds)->count(),
                'usedTickets' => Ticket::whereIn('id_evento', $eventIds)->where('estado', 'usada')->count(),
                'sales' => (clone $paid)->count(),
                'revenue' => $revenue,
                'commission' => round($revenue * ($commissionRate / 100), 2),
                'pendingTasks' => AdminTask::where('asignado_a', $user->id_usuario)
                    ->whereIn('estado', ['pendiente', 'en_progreso'])
                    ->count(),
            ],
            'permissions' => $permissions,
            'nextEvents' => $nextEvents,
            'tasks' => $tasks,
            'recentActivity' => $recentActivity,
        ]);
    }

    public function audit(Request $request)
    {
        $this->requireMainAdmin($request);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'user' => ['nullable', 'integer'],
            'entity' => ['nullable', 'string', 'max:60'],
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $query = AdminActivity::with('user');

        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('accion', 'like', "%{$term}%")
                    ->orWhere('entidad_tipo', 'like', "%{$term}%")
                    ->orWhereHas('user', function ($u) use ($term) {
                        $u->where('nombre', 'like', "%{$term}%")
                          ->orWhere('apellido', 'like', "%{$term}%")
                          ->orWhere('correo', 'like', "%{$term}%");
                    });
            });
        }

        if (!empty($filters['user'])) $query->where('id_usuario', $filters['user']);
        if (!empty($filters['entity'])) $query->where('entidad_tipo', $filters['entity']);
        if (!empty($filters['date'])) $query->whereDate('created_at', $filters['date']);

        $activities = $query->latest('id_actividad')->paginate(25)->withQueryString()
            ->through(fn ($activity) => [
                'id' => (int) $activity->id_actividad,
                'action' => $activity->accion,
                'entity' => $activity->entidad_tipo ?: 'sistema',
                'entityId' => $activity->entidad_id,
                'ip' => $activity->ip,
                'date' => $activity->created_at?->format('d/m/Y H:i:s'),
                'user' => [
                    'name' => $activity->user ? trim($activity->user->nombre . ' ' . $activity->user->apellido) : 'Sistema',
                    'role' => $activity->user?->rol,
                ],
            ]);

        return Inertia::render('Admin/Audit', [
            'activities' => $activities,
            'users' => User::whereIn('rol', ['administrador', 'subadministrador'])
                ->orderBy('nombre')->get()->map(fn ($user) => [
                    'id' => (int) $user->id_usuario,
                    'name' => trim($user->nombre . ' ' . $user->apellido),
                ]),
            'entities' => AdminActivity::whereNotNull('entidad_tipo')
                ->distinct()->orderBy('entidad_tipo')->pluck('entidad_tipo')->values(),
            'filters' => $filters,
        ]);
    }
}
