<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivity;
use App\Models\AdminTask;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventixNotification;
use App\Models\Purchase;
use App\Models\RefundRequest;
use App\Models\Ticket;
use App\Models\TicketType;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminController extends Controller
{
    private array $permissionLabels = [
        'dashboard.view' => 'Ver dashboard',
        'events.view' => 'Ver eventos',
        'events.create' => 'Crear eventos',
        'events.edit' => 'Editar eventos',
        'events.publish' => 'Publicar/programar eventos',
        'tickets.view' => 'Ver entradas',
        'stock.view' => 'Ver stock y aforo',
        'qr.validate' => 'Validar QR/códigos',
        'sales.view' => 'Ver ventas',
        'reports.view' => 'Ver reportes',
        'analytics.view' => 'Ver analítica',
        'clients.view' => 'Ver clientes',
        'profile.update' => 'Editar su perfil',
    ];

    private function requirePermission(Request $request, string $permission): void
    {
        abort_unless($request->user()?->hasAdminPermission($permission), 403);
    }

    private function requireMainAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdministrator(), 403);
    }

    private function scopeEvents(Request $request)
    {
        $q = Event::query()->whereNull('eliminado_en');

        if (!$request->user()->isAdministrator()) {
            $q->where('estado', '!=', 'cancelado')
              ->where(function ($s) use ($request) {
                  $s->where('id_publicador', $request->user()->id_usuario)
                    ->orWhere('id_administrador', $request->user()->id_usuario);
              });
        }

        return $q;
    }

    private function log(Request $request, string $action, ?string $entityType = null, ?int $entityId = null, array $detail = []): void
    {
        AdminActivity::create([
            'id_usuario' => $request->user()?->id_usuario,
            'accion' => $action,
            'entidad_tipo' => $entityType,
            'entidad_id' => $entityId,
            'detalle' => $detail ?: null,
            'ip' => $request->ip(),
        ]);
    }

    private function eventDateTime(Event $event)
    {
        return \Carbon\Carbon::parse($event->fecha_evento->format('Y-m-d').' '.substr($event->hora_inicio, 0, 5));
    }

    private function eventImageUrl(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) return $path;
        if (str_starts_with($path, '/')) return asset(ltrim($path, '/'));
        if (str_starts_with($path, 'storage/') || str_starts_with($path, 'img/') || str_starts_with($path, 'images/')) return asset($path);
        return asset('storage/'.$path);
    }

    public function dashboard(Request $request)
    {
        $this->requirePermission($request, 'dashboard.view');

        $eventIds = $this->scopeEvents($request)->pluck('id_evento');
        $paid = Purchase::where('estado', 'pagada')->whereIn('id_evento', $eventIds);
        $refundTotal = RefundRequest::where('estado', 'aprobado')
            ->whereHas('purchase', fn($q) => $q->whereIn('id_evento', $eventIds))->sum('monto');

        $days = collect(range(6, 0))->map(function ($ago) use ($eventIds) {
            $date = now()->subDays($ago)->toDateString();
            $q = Purchase::where('estado','pagada')->whereIn('id_evento',$eventIds)->whereDate('fecha_pago',$date);
            return [
                'label' => now()->subDays($ago)->locale('es')->isoFormat('ddd'),
                'date' => $date,
                'count' => (clone $q)->count(),
                'income' => (float) (clone $q)->sum('total'),
            ];
        });

        $types = TicketType::whereHas('event', fn($q) => $q->whereIn('id_evento',$eventIds))
            ->get()->map(function($type){
                $sold = Ticket::where('id_tipo_entrada',$type->id_tipo_entrada)->whereIn('estado',['vigente','usada','transferida'])->count();
                return ['label'=>$type->nombre,'count'=>$sold];
            })->groupBy('label')->map(fn($g,$label)=>['label'=>$label,'count'=>$g->sum('count')])->sortByDesc('count')->take(6)->values();

        $staffLeaderboard = collect();
        if ($request->user()->isAdministrator()) {
            $staffLeaderboard = User::whereIn('rol',['administrador','subadministrador'])->where('estado',true)->get()
                ->map(function($staff){
                    $eventIds = Event::where('id_publicador',$staff->id_usuario)->pluck('id_evento');
                    $sales = Purchase::where('estado','pagada')->whereIn('id_evento',$eventIds);
                    $tickets = Ticket::whereIn('id_evento',$eventIds)->count();
                    $revenue = (float)(clone $sales)->sum('total');
                    return [
                        'id'=>(int)$staff->id_usuario,
                        'name'=>trim($staff->nombre.' '.$staff->apellido),
                        'position'=>$staff->cargo ?: ($staff->rol==='administrador'?'Administrador':'Subadministrador'),
                        'photo'=>$staff->foto_perfil ? asset('storage/'.$staff->foto_perfil) : null,
                        'events'=>$eventIds->count(),
                        'tickets'=>$tickets,
                        'sales'=>(clone $sales)->count(),
                        'revenue'=>$revenue,
                        'commission'=>(float)round($revenue*((float)$staff->comision_porcentaje/100),2),
                    ];
                })->sortByDesc('tickets')->values();
        }

        $recentActivity = AdminActivity::with('user')->latest()->take(10)->get()->map(fn($a)=>[
            'id'=>(int)$a->id_actividad,
            'action'=>$a->accion,
            'user'=>$a->user ? trim($a->user->nombre.' '.$a->user->apellido) : 'Sistema',
            'date'=>$a->created_at?->format('d/m/Y H:i'),
        ]);

        $tasks = $request->user()->assignedTasks()->latest()->take(6)->get()->map(fn($t)=>[
            'id'=>(int)$t->id_tarea,'title'=>$t->titulo,'priority'=>$t->prioridad,'status'=>$t->estado,
            'due'=>$t->vence_en?->format('d/m/Y H:i'),
        ]);

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'events' => $eventIds->count(),
                'published' => $this->scopeEvents($request)->where('estado','publicado')->count(),
                'tickets' => Ticket::whereIn('id_evento',$eventIds)->count(),
                'usedTickets' => Ticket::whereIn('id_evento',$eventIds)->where('estado','usada')->count(),
                'income' => (float)(clone $paid)->sum('total'),
                'serviceFees' => (float)(clone $paid)->sum('cargo_servicio'),
                'refunds' => (float)$refundTotal,
                'netIncome' => (float)((clone $paid)->sum('total') - $refundTotal),
                'clients' => $request->user()->isAdministrator() ? User::where('rol','cliente')->where('estado',true)->count() : null,
            ],
            'sales7Days'=>$days,
            'ticketTypes'=>$types,
            'staffLeaderboard'=>$staffLeaderboard,
            'recentActivity'=>$recentActivity,
            'tasks'=>$tasks,
        ]);
    }

    public function events(Request $request)
    {
        $this->requirePermission($request, 'events.view');
        $events = $this->scopeEvents($request)->with(['category','ticket_types','publisher'])->orderByDesc('id_evento')->get()->map(function($e){
            $sold = Ticket::where('id_evento',$e->id_evento)->whereIn('estado',['vigente','usada','transferida'])->count();
            return [
                'id'=>(int)$e->id_evento,'title'=>$e->nombre,'description'=>$e->descripcion,
                'category_id'=>(int)$e->id_categoria,'category'=>$e->category?->nombre,
                'date'=>$e->fecha_evento->format('Y-m-d'),'time'=>substr($e->hora_inicio,0,5),'endTime'=>$e->hora_fin?substr($e->hora_fin,0,5):null,
                'location'=>$e->ubicacion,'capacity'=>(int)$e->aforo_total,'sold'=>$sold,'available'=>max(0,$e->aforo_total-$sold),
                'serviceFeePercent'=>(float)($e->porcentaje_servicio ?? 5),
                'status'=>$e->estado,'image'=>$this->eventImageUrl($e->imagen),
                'publishAt'=>$e->publicar_en?->format('Y-m-d\TH:i'),'publishedAt'=>$e->fecha_publicacion?->format('d/m/Y H:i'),
                'publisherId'=>$e->id_publicador ? (int)$e->id_publicador : null,
                'publisher'=>$e->publisher ? trim($e->publisher->nombre.' '.$e->publisher->apellido) : null,
                'ticketTypes'=>$e->ticket_types->map(fn($t)=>['id'=>(int)$t->id_tipo_entrada,'name'=>$t->nombre,'price'=>(float)$t->precio,'capacity'=>(int)$t->cupo_total]),
            ];
        });

        return Inertia::render('Admin/Events', [
            'events'=>$events,
            'categories'=>Category::active()->orderBy('nombre')->get(['id_categoria','nombre']),
            'staff'=>User::whereIn('rol',['administrador','subadministrador'])->where('estado',true)->orderBy('nombre')->get()->map(fn($u)=>['id'=>(int)$u->id_usuario,'name'=>trim($u->nombre.' '.$u->apellido)]),
            'permissions'=>['create'=>$request->user()->hasAdminPermission('events.create'),'edit'=>$request->user()->hasAdminPermission('events.edit'),'publish'=>$request->user()->hasAdminPermission('events.publish'),'permanentDelete'=>$request->user()->isAdministrator()],
        ]);
    }

    public function storeCategory(Request $request)
    {
        $this->requirePermission($request, 'events.create');

        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:100', Rule::unique('categorias', 'nombre')],
            'descripcion' => ['nullable', 'string', 'max:255'],
        ]);

        $category = Category::create([
            'nombre' => trim($data['nombre']),
            'descripcion' => $data['descripcion'] ?? null,
            'estado' => true,
        ]);

        $this->log($request, 'Categoría creada', 'categoria', $category->id_categoria, ['nombre' => $category->nombre]);

        return back()->with('success', 'Categoría creada. Ya puedes seleccionarla en el evento.');
    }

    private function eventRules(Request $request, ?Event $event = null): array
    {
        return [
            'nombre'=>['required','string','max:150'],
            'descripcion'=>['required','string'],
            'id_categoria'=>['required','exists:categorias,id_categoria'],
            'fecha_evento'=>['required','date'],
            'hora_inicio'=>['required'],
            'hora_fin'=>['nullable'],
            'ubicacion'=>['required','string','max:255'],
            'aforo_total'=>['required','integer','min:1'],
            'porcentaje_servicio'=>['required','numeric','min:0','max:100'],
            'estado'=>['required',Rule::in(['borrador','proximamente','programado','publicado','cancelado'])],
            'publicar_en'=>['nullable','required_if:estado,programado','required_if:estado,proximamente','date'],
            'id_publicador'=>['nullable','exists:usuarios,id_usuario'],
            'imagen_archivo'=>['nullable','image','mimes:jpg,jpeg,png,webp','max:4096'],
            'tipos_entrada'=>['nullable','array'],
            'tipos_entrada.*.nombre'=>['required_with:tipos_entrada','string','max:100'],
            'tipos_entrada.*.descripcion'=>['nullable','string','max:255'],
            'tipos_entrada.*.precio'=>['required_with:tipos_entrada','numeric','min:0'],
            'tipos_entrada.*.cupo_total'=>['required_with:tipos_entrada','integer','min:1'],
            'tipos_entrada.*.limite_por_compra'=>['required_with:tipos_entrada','integer','min:1'],
        ];
    }

    private function normalizePublicationData(Request $request, array $data, ?Event $event = null): array
    {
        if (!$request->user()->hasAdminPermission('events.publish')) {
            $data['estado'] = $event?->estado ?? 'borrador';
            $data['publicar_en'] = $event?->publicar_en;
            return $data;
        }

        if (in_array($data['estado'], ['programado', 'proximamente'], true)) {
            $publishAt = \Carbon\Carbon::parse($data['publicar_en']);

            if ($publishAt->lessThanOrEqualTo(now())) {
                $data['estado'] = 'publicado';
                $data['fecha_publicacion'] = now();
                $data['publicar_en'] = null;
            } else {
                // "programado" permanece oculto.
                // "proximamente" se muestra en la portada, pero todavía no permite comprar.
                $data['fecha_publicacion'] = null;
            }
        } elseif ($data['estado'] === 'publicado') {
            $data['fecha_publicacion'] = $event?->fecha_publicacion ?: now();
            $data['publicar_en'] = null;
        } elseif ($data['estado'] === 'borrador') {
            $data['publicar_en'] = null;
            $data['fecha_publicacion'] = null;
        }

        return $data;
    }

    public function storeEvent(Request $request)
    {
        $this->requirePermission($request, 'events.create');
        $data = $request->validate($this->eventRules($request));

        $types = collect($data['tipos_entrada'] ?? [])->filter(fn ($type) => !empty($type['nombre']))->values();

        if ($types->isEmpty()) {
            return back()->withErrors(['tipos_entrada' => 'Agrega al menos un tipo de entrada antes de crear el evento.'])->withInput();
        }

        $assignedCapacity = (int) $types->sum(fn ($type) => (int) ($type['cupo_total'] ?? 0));
        if ($assignedCapacity > (int) $data['aforo_total']) {
            return back()->withErrors(['tipos_entrada' => 'La suma de los cupos de entrada ('.$assignedCapacity.') supera el aforo total del evento ('.$data['aforo_total'].').'])->withInput();
        }

        if (!$request->user()->isAdministrator()) {
            $data['id_publicador'] = $request->user()->id_usuario;
        }

        $data = $this->normalizePublicationData($request, $data);

        if ($request->hasFile('imagen_archivo')) {
            $data['imagen'] = $request->file('imagen_archivo')->store('events', 'public');
        }

        unset($data['imagen_archivo'], $data['tipos_entrada']);
        $data['id_administrador'] = $request->user()->id_usuario;
        $data['id_publicador'] = $data['id_publicador'] ?: $request->user()->id_usuario;

        $event = DB::transaction(function () use ($data, $types) {
            $event = Event::create($data);
            foreach ($types as $type) {
                $event->ticket_types()->create([
                    'nombre' => $type['nombre'],
                    'descripcion' => $type['descripcion'] ?? null,
                    'precio' => $type['precio'],
                    'cupo_total' => $type['cupo_total'],
                    'limite_por_compra' => $type['limite_por_compra'],
                    'fecha_inicio_venta' => now(),
                    'fecha_fin_venta' => $event->fecha_evento->copy()->endOfDay(),
                    'estado' => true,
                ]);
            }
            return $event;
        });

        $this->log($request, 'Evento creado', 'evento', $event->id_evento, [
            'estado' => $event->estado,
            'tipos_entrada' => $types->count(),
            'publicar_en' => $event->publicar_en?->toDateTimeString(),
            'porcentaje_servicio' => (float) $event->porcentaje_servicio,
        ]);

        $message = match ($event->estado) {
            'proximamente' => 'Evento creado como Próximamente. Ya aparece en la portada y se publicará automáticamente en la fecha indicada.',
            'programado' => 'Evento creado y programado. Permanecerá oculto hasta la fecha de publicación.',
            default => 'Evento creado correctamente.',
        };

        return back()->with('success', $message);
    }

    public function updateEvent(Request $request, Event $event)
    {
        $this->requirePermission($request, 'events.edit');

        if (!$request->user()->isAdministrator()) {
            abort_unless(in_array($event->id_publicador, [$request->user()->id_usuario, null], true)
                || $event->id_administrador === $request->user()->id_usuario, 403);
        }

        $data = $request->validate($this->eventRules($request, $event));

        if (!$request->user()->isAdministrator()) {
            $data['id_publicador'] = $request->user()->id_usuario;
        }

        $data = $this->normalizePublicationData($request, $data, $event);

        if ($request->hasFile('imagen_archivo')) {
            if ($event->imagen) Storage::disk('public')->delete($event->imagen);
            $data['imagen'] = $request->file('imagen_archivo')->store('events', 'public');
        }

        unset($data['imagen_archivo'], $data['tipos_entrada']);

        if ($data['estado'] === 'publicado') {
            $data['id_publicador'] = $data['id_publicador'] ?: $request->user()->id_usuario;
        }

        $event->update($data);

        $this->log($request, 'Evento actualizado', 'evento', $event->id_evento, [
            'estado' => $event->estado,
            'publicar_en' => $event->publicar_en?->toDateTimeString(),
            'porcentaje_servicio' => (float) $event->porcentaje_servicio,
        ]);

        $message = match ($event->estado) {
            'proximamente' => 'Evento actualizado como Próximamente. Seguirá visible en la portada hasta publicarse automáticamente.',
            'programado' => 'Evento actualizado. Permanecerá oculto hasta la publicación automática.',
            default => 'Evento actualizado correctamente.',
        };

        return back()->with('success', $message);
    }

    public function deleteEvent(Request $request, Event $event)
    {
        $this->requirePermission($request, 'events.edit');

        abort_if($event->eliminado_en !== null, 404);

        if ($event->estado === 'cancelado') {
            return back()->with('success', 'El evento ya estaba cancelado.');
        }

        DB::transaction(function () use ($request, $event) {
            $event->update([
                'estado' => 'cancelado',
                'publicar_en' => null,
            ]);

            $clientIds = Purchase::where('id_evento', $event->id_evento)
                ->whereNotNull('id_usuario')
                ->pluck('id_usuario');

            if (\Illuminate\Support\Facades\Schema::hasTable('favoritos')) {
                $favoriteClientIds = DB::table('favoritos')
                    ->where('id_evento', $event->id_evento)
                    ->pluck('id_usuario');

                $clientIds = $clientIds->merge($favoriteClientIds);
            }

            $clientIds = $clientIds->unique()->values();

            foreach ($clientIds as $clientId) {
                EventixNotification::create([
                    'id_usuario' => $clientId,
                    'tipo' => 'evento_cancelado',
                    'titulo' => 'Evento cancelado',
                    'mensaje' => 'El evento '.$event->nombre.' fue cancelado. Revisa tus entradas y las opciones disponibles.',
                    'url' => '/mis-entradas',
                    'metadata' => [
                        'event_id' => $event->id_evento,
                        'event_name' => $event->nombre,
                        'cancelled_at' => now()->toDateTimeString(),
                    ],
                ]);
            }

            $staffIds = User::whereIn('rol', ['administrador', 'subadministrador'])
                ->where('estado', true)
                ->where('id_usuario', '!=', $request->user()->id_usuario)
                ->when(
                    \Illuminate\Support\Facades\Schema::hasColumn('usuarios', 'eliminado_en'),
                    fn ($q) => $q->whereNull('eliminado_en')
                )
                ->pluck('id_usuario');

            foreach ($staffIds as $staffId) {
                EventixNotification::create([
                    'id_usuario' => $staffId,
                    'tipo' => 'evento_cancelado',
                    'titulo' => 'Evento cancelado',
                    'mensaje' => trim($request->user()->nombre.' '.$request->user()->apellido).' canceló el evento '.$event->nombre.'.',
                    'url' => '/admin',
                    'metadata' => [
                        'event_id' => $event->id_evento,
                        'event_name' => $event->nombre,
                        'cancelled_by' => $request->user()->id_usuario,
                        'cancelled_at' => now()->toDateTimeString(),
                    ],
                ]);
            }

            $this->log(
                $request,
                'Evento cancelado',
                'evento',
                $event->id_evento,
                [
                    'clientes_notificados' => $clientIds->count(),
                    'personal_notificado' => $staffIds->count(),
                ]
            );
        });

        return back()->with(
            'success',
            'Evento cancelado. Ya no aparece para clientes ni subadministradores y se enviaron las notificaciones.'
        );
    }

    public function destroyEventPermanently(Request $request, Event $event)
    {
        $this->requireMainAdmin($request);

        abort_unless(
            $event->estado === 'cancelado',
            422,
            'Primero debes cancelar el evento antes de eliminarlo definitivamente.'
        );

        if ($event->eliminado_en) {
            return redirect()->route('admin.events')
                ->with('success', 'El evento ya estaba eliminado definitivamente de las interfaces.');
        }

        DB::transaction(function () use ($request, $event) {
            if (\Illuminate\Support\Facades\Schema::hasTable('favoritos')) {
                DB::table('favoritos')
                    ->where('id_evento', $event->id_evento)
                    ->delete();
            }

            $event->update([
                'eliminado_en' => now(),
                'publicar_en' => null,
            ]);

            $this->log(
                $request,
                'Evento eliminado definitivamente de interfaces',
                'evento',
                $event->id_evento,
                ['nombre' => $event->nombre]
            );
        });

        return redirect()->route('admin.events')
            ->with(
                'success',
                'Evento eliminado definitivamente de EVENTIX. Ya no será visible en ninguna interfaz.'
            );
    }

    public function publishEvent(Request $request, Event $event)
    {
        $this->requirePermission($request, 'events.publish');

        abort_if($event->eliminado_en !== null, 404);

        if ($event->estado === 'cancelado') {
            return redirect()->route('admin.events')
                ->withErrors(['estado' => 'Un evento cancelado no puede publicarse directamente.']);
        }

        $event->update([
            'estado' => 'publicado',
            'fecha_publicacion' => now(),
            'publicar_en' => null,
            'id_publicador' => $request->user()->id_usuario,
        ]);

        $this->log($request, 'Evento publicado ahora', 'evento', $event->id_evento);

        return redirect()->route('admin.events')
            ->with('success', 'Evento publicado correctamente. Ya está visible para los clientes.');
    }

    public function storeType(Request $request, Event $event)
    {
        $this->requirePermission($request,'events.edit');
        $data=$request->validate([
            'nombre'=>['required','string','max:100'],
            'descripcion'=>['nullable','string','max:255'],
            'precio'=>['required','numeric','min:0'],
            'cupo_total'=>['required','integer','min:1'],
            'limite_por_compra'=>['required','integer','min:1'],
        ]);

        $assigned = (int) $event->ticket_types()->sum('cupo_total');
        if (($assigned + (int) $data['cupo_total']) > (int) $event->aforo_total) {
            return back()->withErrors([
                'cupo_total' => 'Este tipo supera el aforo disponible. Ya hay '.$assigned.' cupos asignados de '.$event->aforo_total.'.',
            ]);
        }

        $event->ticket_types()->create($data+[
            'fecha_inicio_venta'=>now(),
            'fecha_fin_venta'=>$event->fecha_evento->copy()->endOfDay(),
            'estado'=>true,
        ]);
        $this->log($request,'Tipo de entrada creado','evento',$event->id_evento,['tipo'=>$data['nombre']]);
        return back()->with('success','Tipo de entrada creado.');
    }

    public function tickets(Request $request)
    {
        $this->requirePermission($request,'tickets.view');
        $eventIds=$this->scopeEvents($request)->pluck('id_evento');
        $tickets=Ticket::with(['event','ticketType','user'])->whereIn('id_evento',$eventIds)->latest('id_entrada')->take(300)->get()->map(fn($t)=>[
            'id'=>(int)$t->id_entrada,
            'code'=>$t->codigo,
            'event'=>$t->event?->nombre,
            'eventImage'=>$this->eventImageUrl($t->event?->imagen),
            'eventDate'=>$t->event?->fecha_evento?->format('d/m/Y'),
            'eventTime'=>$t->event?->hora_inicio ? substr($t->event->hora_inicio,0,5) : null,
            'eventLocation'=>$t->event?->ubicacion,
            'type'=>$t->ticketType?->nombre,
            'holder'=>$t->titular_nombre,
            'email'=>$t->titular_correo,
            'status'=>$t->estado,
            'usedAt'=>$t->usada_at?->format('d/m/Y H:i'),
            'createdAt'=>$t->created_at?->format('d/m/Y H:i')
        ]);
        return Inertia::render('Admin/Tickets',['tickets'=>$tickets]);
    }

    public function stock(Request $request)
    {
        $this->requirePermission($request,'stock.view');
        $events=$this->scopeEvents($request)->with(['ticket_types','publisher'])->orderBy('fecha_evento')->get()->map(function($e){
            $types=$e->ticket_types->map(function($t){
                $sold=Ticket::where('id_tipo_entrada',$t->id_tipo_entrada)->whereIn('estado',['vigente','usada','transferida'])->count();
                $available=max(0,$t->cupo_total-$sold); $pct=$t->cupo_total?round(($sold/$t->cupo_total)*100):0;
                return ['id'=>(int)$t->id_tipo_entrada,'name'=>$t->nombre,'capacity'=>(int)$t->cupo_total,'sold'=>$sold,'available'=>$available,'percent'=>$pct,'alert'=>$available===0?'agotado':($available<=max(5,ceil($t->cupo_total*.1))?'bajo':'normal')];
            });
            return ['id'=>(int)$e->id_evento,'title'=>$e->nombre,'date'=>$e->fecha_evento->format('d/m/Y'),'status'=>$e->estado,'publisher'=>$e->publisher?trim($e->publisher->nombre.' '.$e->publisher->apellido):'Sin asignar','types'=>$types];
        });
        return Inertia::render('Admin/Stock',['events'=>$events]);
    }

    public function sales(Request $request)
    {
        $this->requirePermission($request,'sales.view');
        $eventIds=$this->scopeEvents($request)->pluck('id_evento');
        $sales=Purchase::with(['user','event.publisher','details'])->whereIn('id_evento',$eventIds)->latest('id_compra')->take(300)->get()->map(function($p){
            return ['id'=>(int)$p->id_compra,'reference'=>$p->referencia_pago,'customer'=>trim(($p->user?->nombre??'').' '.($p->user?->apellido??'')),'email'=>$p->user?->correo,'event'=>$p->event?->nombre,'publisher'=>$p->event?->publisher?trim($p->event->publisher->nombre.' '.$p->event->publisher->apellido):'Sin asignar','method'=>$p->metodo_pago,'status'=>$p->estado,'ticketCount'=>(int)$p->details->sum('cantidad'),'subtotal'=>(float)$p->subtotal,'fee'=>(float)$p->cargo_servicio,'total'=>(float)$p->total,'date'=>optional($p->fecha_pago??$p->created_at)->format('d/m/Y H:i')];
        });
        return Inertia::render('Admin/Sales',['sales'=>$sales]);
    }

    public function validatePage(Request $request)
    {
        $this->requirePermission($request,'qr.validate');
        $recent=Ticket::with(['event','ticketType'])->where('estado','usada')->latest('usada_at')->take(8)->get()->map(fn($t)=>['code'=>$t->codigo,'event'=>$t->event?->nombre,'holder'=>$t->titular_nombre,'usedAt'=>$t->usada_at?->format('H:i')]);
        return Inertia::render('Admin/ValidateTicket',['result'=>null,'recent'=>$recent]);
    }

    public function validateForm(Request $request)
    {
        $this->requirePermission($request,'qr.validate');
        $data=$request->validate(['value'=>['required','string','max:255']]);
        $value=trim($data['value']);
        $ticket=Ticket::with(['event','ticketType'])->where('qr_token',$value)->orWhere('codigo',$value)->first();
        if(!$ticket) return back()->withErrors(['value'=>'No se encontró una entrada con ese QR o código.']);
        return $this->performValidation($request,$ticket);
    }

    public function validateToken(Request $request, string $token)
    {
        $this->requirePermission($request,'qr.validate');
        $ticket=Ticket::with(['event','ticketType'])->where('qr_token',$token)->orWhere('codigo',$token)->firstOrFail();
        return $this->performValidation($request,$ticket);
    }

    private function performValidation(Request $request, Ticket $ticket)
    {
        if($ticket->estado==='usada') return Inertia::render('Admin/ValidateTicket',['result'=>['ok'=>false,'message'=>'Esta entrada ya fue utilizada.','code'=>$ticket->codigo,'usedAt'=>$ticket->usada_at?->format('d/m/Y H:i')],'recent'=>[]]);
        if($ticket->estado!=='vigente') return Inertia::render('Admin/ValidateTicket',['result'=>['ok'=>false,'message'=>'Entrada no válida: '.$ticket->estado.'.','code'=>$ticket->codigo],'recent'=>[]]);
        $ticket->update(['estado'=>'usada','usada_at'=>now()]);
        $this->log($request,'Entrada validada','entrada',$ticket->id_entrada,['codigo'=>$ticket->codigo]);
        return Inertia::render('Admin/ValidateTicket',['result'=>['ok'=>true,'message'=>'Entrada válida. Acceso registrado.','code'=>$ticket->codigo,'event'=>$ticket->event?->nombre,'type'=>$ticket->ticketType?->nombre,'holder'=>$ticket->titular_nombre],'recent'=>[]]);
    }

    public function reports(Request $request)
    {
        $this->requirePermission($request,'reports.view');
        $events=$this->scopeEvents($request)->with('publisher')->withCount('tickets')->orderByDesc('fecha_evento')->get()->map(function($e){
            $paid=Purchase::where('id_evento',$e->id_evento)->where('estado','pagada');
            $refund=RefundRequest::where('estado','aprobado')->whereHas('purchase',fn($q)=>$q->where('id_evento',$e->id_evento))->sum('monto');
            return ['id'=>(int)$e->id_evento,'title'=>$e->nombre,'date'=>$e->fecha_evento->format('Y-m-d'),'tickets'=>$e->tickets_count,'capacity'=>(int)$e->aforo_total,'income'=>(float)(clone $paid)->sum('total'),'serviceFees'=>(float)(clone $paid)->sum('cargo_servicio'),'refunds'=>(float)$refund,'publisher'=>$e->publisher?trim($e->publisher->nombre.' '.$e->publisher->apellido):'Sin asignar','status'=>$e->estado];
        });
        return Inertia::render('Admin/Reports',['events'=>$events]);
    }

    public function report(Request $request, Event $event)
    {
        $this->requirePermission($request,'reports.view');
        $event->load(['ticket_types','publisher']);
        $rows=$event->ticket_types->map(function($type){$qty=Ticket::where('id_tipo_entrada',$type->id_tipo_entrada)->count();return ['name'=>$type->nombre,'qty'=>$qty,'price'=>(float)$type->precio,'income'=>$qty*(float)$type->precio];});
        $paid=Purchase::where('id_evento',$event->id_evento)->where('estado','pagada');
        $refund=(float)RefundRequest::where('estado','aprobado')->whereHas('purchase',fn($q)=>$q->where('id_evento',$event->id_evento))->sum('monto');
        return Pdf::loadView('pdf.report',['event'=>$event,'rows'=>$rows,'total'=>(float)(clone $paid)->sum('total'),'serviceFees'=>(float)(clone $paid)->sum('cargo_servicio'),'refunds'=>$refund,'net'=>(float)((clone $paid)->sum('total')-$refund)])->download('reporte-eventix-'.$event->id_evento.'.pdf');
    }

    public function analytics(Request $request)
    {
        $this->requirePermission($request,'analytics.view');
        $eventIds=$this->scopeEvents($request)->pluck('id_evento');
        $paid=Purchase::where('estado','pagada')->whereIn('id_evento',$eventIds)->get();
        $byHour=$paid->filter(fn($p)=>$p->fecha_pago)->groupBy(fn($p)=>$p->fecha_pago->format('H:00'))->map(fn($g,$h)=>['label'=>$h,'count'=>$g->count(),'income'=>(float)$g->sum('total')])->sortBy('label')->values();
        $byEvent=Event::whereIn('id_evento',$eventIds)->with('publisher')->get()->map(function($e){$sales=Purchase::where('estado','pagada')->where('id_evento',$e->id_evento);return ['id'=>(int)$e->id_evento,'title'=>$e->nombre,'tickets'=>Ticket::where('id_evento',$e->id_evento)->count(),'sales'=>(clone $sales)->count(),'income'=>(float)(clone $sales)->sum('total'),'publisher'=>$e->publisher?trim($e->publisher->nombre.' '.$e->publisher->apellido):'Sin asignar'];})->sortByDesc('tickets')->values();
        return Inertia::render('Admin/Analytics',['byHour'=>$byHour,'byEvent'=>$byEvent]);
    }

    public function clients(Request $request)
    {
        $this->requirePermission($request,'clients.view');
        $clients=User::where('rol','cliente')->withCount(['purchases','tickets'])->orderByDesc('id_usuario')->get()->map(function($u){return ['id'=>(int)$u->id_usuario,'name'=>trim($u->nombre.' '.$u->apellido),'email'=>$u->correo,'phone'=>$u->telefono,'active'=>(bool)$u->estado,'purchases'=>$u->purchases_count,'tickets'=>$u->tickets_count,'spent'=>(float)$u->purchases()->where('estado','pagada')->sum('total'),'lastAccess'=>$u->ultimo_acceso?->format('d/m/Y H:i'),'createdAt'=>$u->created_at?->format('d/m/Y')];});
        return Inertia::render('Admin/Clients',['clients'=>$clients]);
    }

    public function staff(Request $request)
    {
        $this->requireMainAdmin($request);
        $staff=User::whereIn('rol',['administrador','subadministrador'])->whereNull('eliminado_en')->withCount('assignedTasks')->orderByRaw("FIELD(rol,'administrador','subadministrador')")->orderBy('nombre')->get()->map(function($u){
            $eventIds=Event::where('id_publicador',$u->id_usuario)->pluck('id_evento');$sales=Purchase::where('estado','pagada')->whereIn('id_evento',$eventIds);$revenue=(float)(clone $sales)->sum('total');
            return ['id'=>(int)$u->id_usuario,'name'=>$u->nombre,'lastName'=>$u->apellido,'fullName'=>trim($u->nombre.' '.$u->apellido),'email'=>$u->correo,'phone'=>$u->telefono,'photo'=>$u->foto_perfil?asset('storage/'.$u->foto_perfil):null,'employeeNumber'=>$u->numero_empleado,'position'=>$u->cargo,'role'=>$u->rol,'active'=>(bool)$u->estado,'permissions'=>$u->permisos??[],'commissionPercent'=>(float)$u->comision_porcentaje,'hiredAt'=>$u->fecha_contratacion?->format('Y-m-d'),'events'=>$eventIds->count(),'tickets'=>Ticket::whereIn('id_evento',$eventIds)->count(),'sales'=>(clone $sales)->count(),'revenue'=>$revenue,'commission'=>(float)round($revenue*((float)$u->comision_porcentaje/100),2),'tasks'=>$u->assigned_tasks_count];
        });
        $tasks=AdminTask::with(['assignee','assigner'])->latest()->take(100)->get()->map(fn($t)=>['id'=>(int)$t->id_tarea,'title'=>$t->titulo,'description'=>$t->descripcion,'priority'=>$t->prioridad,'status'=>$t->estado,'due'=>$t->vence_en?->format('Y-m-d\TH:i'),'assigneeId'=>(int)$t->asignado_a,'assignee'=>$t->assignee?trim($t->assignee->nombre.' '.$t->assignee->apellido):null,'assigner'=>$t->assigner?trim($t->assigner->nombre.' '.$t->assigner->apellido):null]);
        return Inertia::render('Admin/Staff',['staff'=>$staff,'tasks'=>$tasks,'permissionOptions'=>collect($this->permissionLabels)->map(fn($label,$key)=>['key'=>$key,'label'=>$label])->values()]);
    }

    public function storeStaff(Request $request)
    {
        $this->requireMainAdmin($request);
        $data=$request->validate(['nombre'=>['required','string','max:100'],'apellido'=>['required','string','max:100'],'correo'=>['required','email','max:150','unique:usuarios,correo'],'telefono'=>['nullable','string','max:30'],'numero_empleado'=>['required','string','max:40','unique:usuarios,numero_empleado'],'cargo'=>['nullable','string','max:100'],'comision_porcentaje'=>['nullable','numeric','min:0','max:100'],'permisos'=>['array'],'permisos.*'=>[Rule::in(array_keys($this->permissionLabels))],'password'=>['required','string','min:8'],'foto_perfil'=>['nullable','image','mimes:jpg,jpeg,png,webp','max:4096']]);
        $photo=$request->hasFile('foto_perfil')?$request->file('foto_perfil')->store('profiles','public'):null;
        $user=User::create(['nombre'=>$data['nombre'],'apellido'=>$data['apellido'],'correo'=>$data['correo'],'telefono'=>$data['telefono']??null,'foto_perfil'=>$photo,'numero_empleado'=>$data['numero_empleado'],'cargo'=>$data['cargo']??'Subadministrador','permisos'=>$data['permisos']??['dashboard.view','events.view','events.create','events.edit','events.publish','tickets.view','stock.view','qr.validate','profile.update'],'comision_porcentaje'=>$data['comision_porcentaje']??0,'fecha_contratacion'=>now(),'creado_por'=>$request->user()->id_usuario,'password_hash'=>$data['password'],'rol'=>'subadministrador','estado'=>true]);
        $this->log($request,'Empleado creado','usuario',$user->id_usuario,['correo'=>$user->correo]);
        return back()->with('success','Empleado creado. Solo el administrador puede crear cuentas de personal.');
    }

    public function updateStaff(Request $request, User $user)
    {
        $this->requireMainAdmin($request); abort_unless(in_array($user->rol,['administrador','subadministrador'],true),404);
        $data=$request->validate(['nombre'=>['required','string','max:100'],'apellido'=>['required','string','max:100'],'correo'=>['required','email','max:150',Rule::unique('usuarios','correo')->ignore($user->id_usuario,'id_usuario')],'telefono'=>['nullable','string','max:30'],'numero_empleado'=>['nullable','string','max:40',Rule::unique('usuarios','numero_empleado')->ignore($user->id_usuario,'id_usuario')],'cargo'=>['nullable','string','max:100'],'comision_porcentaje'=>['nullable','numeric','min:0','max:100'],'permisos'=>['array'],'permisos.*'=>[Rule::in(array_keys($this->permissionLabels))],'password'=>['nullable','string','min:8'],'foto_perfil'=>['nullable','image','mimes:jpg,jpeg,png,webp','max:4096']]);
        if($request->hasFile('foto_perfil')){if($user->foto_perfil)Storage::disk('public')->delete($user->foto_perfil);$data['foto_perfil']=$request->file('foto_perfil')->store('profiles','public');}
        if(!empty($data['password'])){$data['password_hash']=$data['password'];} unset($data['password']);
        if($user->rol==='administrador') unset($data['permisos']);
        $user->update($data);$this->log($request,'Empleado actualizado','usuario',$user->id_usuario);return back()->with('success','Datos del empleado actualizados.');
    }

    public function toggleStaff(Request $request, User $user)
    {
        $this->requireMainAdmin($request);abort_if($user->id_usuario===$request->user()->id_usuario,422,'No puedes desactivar tu propia cuenta.');$user->update(['estado'=>!$user->estado]);$this->log($request,$user->estado?'Empleado activado':'Empleado desactivado','usuario',$user->id_usuario);return back()->with('success','Estado del empleado actualizado.');
    }

    public function destroyStaff(Request $request, User $user)
    {
        $this->requireMainAdmin($request);

        abort_if(
            $user->id_usuario === $request->user()->id_usuario,
            422,
            'No puedes eliminar tu propia cuenta.'
        );

        abort_unless(
            $user->rol === 'subadministrador',
            422,
            'Solo se pueden eliminar cuentas de empleados/subadministradores.'
        );

        if ($user->eliminado_en) {
            return back()->with('success', 'El empleado ya estaba eliminado.');
        }

        DB::transaction(function () use ($request, $user) {
            // Las tareas operativas dejan de mostrarse al retirar al empleado.
            AdminTask::where('asignado_a', $user->id_usuario)->delete();

            // Eliminación lógica: conservamos la cuenta para mantener el historial
            // de eventos, ventas, comisiones y auditoría asociado a este trabajador.
            $user->estado = false;
            $user->permisos = [];
            $user->eliminado_en = now();
            $user->save();

            $this->log(
                $request,
                'Empleado eliminado',
                'usuario',
                $user->id_usuario,
                ['correo' => $user->correo]
            );
        });

        return redirect()
            ->route('admin.staff')
            ->with('success', 'Empleado eliminado correctamente. Su historial de eventos y ventas se conserva.');
    }

    public function assignTask(Request $request, User $user)
    {
        $this->requireMainAdmin($request);abort_unless($user->rol==='subadministrador',422);
        $data=$request->validate(['titulo'=>['required','string','max:160'],'descripcion'=>['nullable','string'],'prioridad'=>['required',Rule::in(['baja','media','alta'])],'vence_en'=>['nullable','date']]);
        $task=AdminTask::create($data+['asignado_a'=>$user->id_usuario,'asignado_por'=>$request->user()->id_usuario,'estado'=>'pendiente']);$this->log($request,'Tarea asignada','tarea',$task->id_tarea,['empleado'=>$user->id_usuario]);return back()->with('success','Tarea asignada.');
    }

    public function updateTask(Request $request, AdminTask $task)
    {
        abort_unless($request->user()->isAdministrator() || $task->asignado_a===$request->user()->id_usuario,403);
        $data=$request->validate(['estado'=>['required',Rule::in(['pendiente','en_progreso','completada'])]]);$data['completada_en']=$data['estado']==='completada'?now():null;$task->update($data);$this->log($request,'Tarea actualizada','tarea',$task->id_tarea,['estado'=>$task->estado]);return back()->with('success','Tarea actualizada.');
    }

    public function profile(Request $request)
    {
        $u=$request->user();return Inertia::render('Admin/Profile',['profile'=>['name'=>$u->nombre,'lastName'=>$u->apellido,'email'=>$u->correo,'phone'=>$u->telefono,'photo'=>$u->foto_perfil?asset('storage/'.$u->foto_perfil):null,'employeeNumber'=>$u->numero_empleado,'position'=>$u->cargo,'role'=>$u->rol]]);
    }

    public function updateProfile(Request $request)
    {
        $u=$request->user();$data=$request->validate(['nombre'=>['required','string','max:100'],'apellido'=>['required','string','max:100'],'correo'=>['required','email','max:150',Rule::unique('usuarios','correo')->ignore($u->id_usuario,'id_usuario')],'telefono'=>['nullable','string','max:30'],'foto_perfil'=>['nullable','image','mimes:jpg,jpeg,png,webp','max:4096']]);
        if($request->hasFile('foto_perfil')){if($u->foto_perfil)Storage::disk('public')->delete($u->foto_perfil);$data['foto_perfil']=$request->file('foto_perfil')->store('profiles','public');}$u->update($data);$this->log($request,'Perfil actualizado','usuario',$u->id_usuario);return back()->with('success','Perfil actualizado.');
    }

    public function updatePassword(Request $request)
    {
        $u=$request->user();$data=$request->validate(['current_password'=>['required','string'],'password'=>['required','confirmed','string','min:8']]);if(!Hash::check($data['current_password'],$u->password_hash))return back()->withErrors(['current_password'=>'La contraseña actual no es correcta.']);$u->update(['password_hash'=>$data['password']]);$this->log($request,'Contraseña actualizada','usuario',$u->id_usuario);return back()->with('success','Contraseña actualizada.');
    }

    public function refunds(Request $request)
    {
        $this->requireMainAdmin($request);

        $requests = RefundRequest::with(['purchase.event', 'user', 'resolver', 'tickets.ticketType'])
            ->latest()
            ->get()
            ->map(function ($r) {
                return [
                    'id' => (int) $r->id_reembolso,
                    'purchaseId' => (int) $r->id_compra,
                    'customer' => trim(($r->user?->nombre ?? '').' '.($r->user?->apellido ?? '')),
                    'event' => $r->purchase?->event?->nombre,
                    'amount' => (float) $r->monto,
                    'reason' => $r->motivo,
                    'status' => $r->estado,
                    'requestedAt' => $r->solicitado_en?->format('d/m/Y H:i'),
                    'resolvedAt' => $r->resuelto_en?->format('d/m/Y H:i'),
                    'resolvedBy' => $r->resolver ? trim($r->resolver->nombre.' '.$r->resolver->apellido) : null,
                    'note' => $r->observacion_admin,
                    'tickets' => $r->tickets->map(fn ($ticket) => [
                        'id' => (int) $ticket->id_entrada,
                        'code' => $ticket->codigo,
                        'type' => $ticket->ticketType?->nombre ?? 'Entrada',
                        'amount' => (float) ($ticket->pivot?->monto ?? 0),
                    ])->values(),
                ];
            });

        $eligible = Purchase::with(['user', 'event', 'tickets.ticketType', 'details', 'refunds.tickets'])
            ->where('estado', 'pagada')
            ->latest('id_compra')
            ->take(150)
            ->get()
            ->map(function ($p) {
                $eventAt = $this->eventDateTime($p->event);
                $hours = now()->diffInHours($eventAt, false);
                $blocked = $p->refunds
                    ->whereIn('estado', ['pendiente', 'aprobado'])
                    ->flatMap(fn ($r) => $r->tickets->pluck('id_entrada'))
                    ->map(fn ($id) => (int) $id)
                    ->unique();

                $eligibleTickets = $p->tickets->filter(function ($ticket) use ($p, $blocked) {
                    return (int) $ticket->id_usuario === (int) $p->id_usuario
                        && $ticket->estado === 'vigente'
                        && !$blocked->contains((int) $ticket->id_entrada);
                });

                $amount = $eligibleTickets->sum(function ($ticket) use ($p) {
                    $detail = $p->details->firstWhere('id_tipo_entrada', $ticket->id_tipo_entrada);
                    return (float) ($detail?->precio_unitario ?? 0);
                });

                return [
                    'id' => (int) $p->id_compra,
                    'customer' => trim(($p->user?->nombre ?? '').' '.($p->user?->apellido ?? '')),
                    'event' => $p->event?->nombre,
                    'eventAt' => $eventAt->format('d/m/Y H:i'),
                    'total' => (float) $p->total,
                    'hoursUntil' => $hours,
                    'eligible' => $hours >= 72 && $eligibleTickets->isNotEmpty(),
                    'eligibleTickets' => $eligibleTickets->count(),
                    'refundableAmount' => (float) $amount,
                ];
            });

        return Inertia::render('Admin/Refunds', [
            'requests' => $requests,
            'purchases' => $eligible,
            'ruleHours' => 72,
        ]);
    }

    public function requestRefund(Request $request, Purchase $purchase)
    {
        $this->requireMainAdmin($request);
        abort_unless($purchase->estado === 'pagada', 422);

        $purchase->loadMissing(['event', 'tickets.ticketType', 'details', 'refunds.tickets']);
        $hours = now()->diffInHours($this->eventDateTime($purchase->event), false);

        if ($hours < 72) {
            return back()->withErrors([
                'refund' => 'El reembolso solo puede solicitarse con al menos 72 horas de anticipación al evento.',
            ]);
        }

        $blocked = $purchase->refunds
            ->whereIn('estado', ['pendiente', 'aprobado'])
            ->flatMap(fn ($r) => $r->tickets->pluck('id_entrada'))
            ->map(fn ($id) => (int) $id)
            ->unique();

        $eligibleTickets = $purchase->tickets->filter(function ($ticket) use ($purchase, $blocked) {
            return (int) $ticket->id_usuario === (int) $purchase->id_usuario
                && $ticket->estado === 'vigente'
                && !$blocked->contains((int) $ticket->id_entrada);
        });

        if ($eligibleTickets->isEmpty()) {
            return back()->withErrors([
                'refund' => 'Esta compra no tiene entradas vigentes y pertenecientes al cliente que puedan reembolsarse.',
            ]);
        }

        $data = $request->validate([
            'motivo' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($request, $purchase, $eligibleTickets, $data) {
            $amounts = [];
            $total = 0.0;

            foreach ($eligibleTickets as $ticket) {
                $detail = $purchase->details->firstWhere('id_tipo_entrada', $ticket->id_tipo_entrada);
                $price = (float) ($detail?->precio_unitario ?? 0);
                $amounts[$ticket->id_entrada] = ['monto' => $price];
                $total += $price;
            }

            $r = RefundRequest::create([
                'id_compra' => $purchase->id_compra,
                'id_usuario' => $purchase->id_usuario,
                'motivo' => $data['motivo'] ?? 'Solicitud registrada por administración',
                'monto' => $total,
                'estado' => 'pendiente',
                'solicitado_en' => now(),
            ]);

            $r->tickets()->attach($amounts);

            EventixNotification::create([
                'id_usuario' => $purchase->id_usuario,
                'tipo' => 'reembolso_recibido',
                'titulo' => 'Solicitud de reembolso registrada',
                'mensaje' => 'Se registró una solicitud por '.$eligibleTickets->count().' entrada(s) de '.$purchase->event->nombre.'. Monto solicitado: Bs '.number_format($total, 2).'.',
                'url' => '/mis-reembolsos',
                'metadata' => [
                    'refund_id' => $r->id_reembolso,
                    'purchase_id' => $purchase->id_compra,
                    'ticket_ids' => $eligibleTickets->pluck('id_entrada')->all(),
                ],
            ]);

            $this->log($request, 'Solicitud de reembolso registrada', 'reembolso', $r->id_reembolso);
        });

        return back()->with('success', 'Solicitud registrada únicamente por las entradas elegibles.');
    }

    public function resolveRefund(Request $request, RefundRequest $refund)
    {
        $this->requireMainAdmin($request);

        $data = $request->validate([
            'action' => ['required', Rule::in(['aprobar', 'rechazar'])],
            'observacion_admin' => ['nullable', 'string', 'max:1000'],
        ]);

        abort_unless($refund->estado === 'pendiente', 422);
        $status = $data['action'] === 'aprobar' ? 'aprobado' : 'rechazado';

        $refund->load(['tickets', 'purchase.event']);

        if ($status === 'aprobado' && $refund->tickets->isEmpty()) {
            return back()->withErrors([
                'refund' => 'Esta es una solicitud antigua sin entradas individuales asociadas. Por seguridad no se aprobará automáticamente.',
            ]);
        }

        if ($status === 'aprobado') {
            foreach ($refund->tickets as $ticket) {
                if ((int) $ticket->id_compra !== (int) $refund->id_compra) {
                    return back()->withErrors(['refund' => 'Una entrada seleccionada no pertenece a la compra de esta solicitud.']);
                }
                if ((int) $ticket->id_usuario !== (int) $refund->id_usuario) {
                    return back()->withErrors(['refund' => 'Una entrada fue transferida después de solicitar el reembolso y ya no puede reembolsarse.']);
                }
                if ($ticket->estado === 'usada') {
                    return back()->withErrors(['refund' => 'Una entrada fue utilizada después de solicitar el reembolso y ya no puede reembolsarse.']);
                }
                if ($ticket->estado !== 'vigente') {
                    return back()->withErrors(['refund' => 'Una entrada seleccionada ya no está vigente. Revisa la solicitud antes de aprobarla.']);
                }
            }
        }

        DB::transaction(function () use ($refund, $request, $data, $status) {
            $refund->update([
                'estado' => $status,
                'resuelto_en' => now(),
                'resuelto_por' => $request->user()->id_usuario,
                'observacion_admin' => $data['observacion_admin'] ?? null,
            ]);

            if ($status === 'aprobado') {
                Ticket::whereIn('id_entrada', $refund->tickets->pluck('id_entrada'))
                    ->where('estado', 'vigente')
                    ->where('id_usuario', $refund->id_usuario)
                    ->update(['estado' => 'anulada']);
            }

            $eventName = $refund->purchase?->event?->nombre ?? 'tu evento';
            $count = $refund->tickets->count();

            EventixNotification::create([
                'id_usuario' => $refund->id_usuario,
                'tipo' => 'reembolso_resuelto',
                'titulo' => $status === 'aprobado' ? 'Reembolso aprobado' : 'Reembolso rechazado',
                'mensaje' => $status === 'aprobado'
                    ? 'Tu reembolso para '.$eventName.' fue aprobado por '.$count.' entrada(s). Monto: Bs '.number_format((float) $refund->monto, 2).'. Solo esas entradas quedaron anuladas.'
                    : 'Tu solicitud de reembolso para '.$eventName.' fue rechazada.'.(!empty($data['observacion_admin']) ? ' Motivo: '.$data['observacion_admin'] : ''),
                'url' => '/mis-reembolsos',
                'metadata' => [
                    'refund_id' => $refund->id_reembolso,
                    'purchase_id' => $refund->id_compra,
                    'ticket_ids' => $refund->tickets->pluck('id_entrada')->all(),
                    'status' => $status,
                ],
            ]);
        });

        $this->log($request, 'Reembolso '.$status, 'reembolso', $refund->id_reembolso);

        return back()->with(
            'success',
            $status === 'aprobado'
                ? 'Reembolso aprobado. Solo las entradas seleccionadas fueron anuladas.'
                : 'Reembolso rechazado. El cliente ya recibió la notificación.'
        );
    }

    private function historyBaseQuery(Request $request)
    {
        $query = Event::query()->with([
            'category','publisher','tickets.ticketType','purchases.user','purchases.tickets.ticketType','purchases.refunds',
        ]);
        if (!$request->user()->isAdministrator()) {
            $query->where(function ($q) use ($request) {
                $q->where('id_publicador', $request->user()->id_usuario)
                  ->orWhere('id_administrador', $request->user()->id_usuario);
            });
        }
        return $query;
    }

    private function mapHistoryEvent(Event $event): array
    {
        $eventAt = \Carbon\Carbon::parse($event->fecha_evento->format('Y-m-d').' '.substr($event->hora_inicio, 0, 5));
        $paidPurchases = $event->purchases->where('estado', 'pagada');
        $refunds = $event->purchases->flatMap(fn ($purchase) => $purchase->refunds)->where('estado', 'aprobado');
        $purchases = $event->purchases->sortByDesc(fn ($purchase) => $purchase->fecha_pago ?? $purchase->created_at)->values()->map(function ($purchase) {
            return [
                'id'=>(int)$purchase->id_compra,
                'customer'=>trim(($purchase->user?->nombre ?? '').' '.($purchase->user?->apellido ?? '')) ?: 'Cliente',
                'email'=>$purchase->user?->correo,
                'phone'=>$purchase->user?->telefono,
                'method'=>$purchase->metodo_pago ?: '—',
                'reference'=>$purchase->referencia_pago ?: '—',
                'subtotal'=>(float)$purchase->subtotal,
                'fee'=>(float)$purchase->cargo_servicio,
                'total'=>(float)$purchase->total,
                'status'=>$purchase->estado,
                'date'=>($purchase->fecha_pago ?? $purchase->created_at)?->format('d/m/Y H:i'),
                'ticketCount'=>$purchase->tickets->count(),
                'tickets'=>$purchase->tickets->map(fn ($ticket)=>[
                    'id'=>(int)$ticket->id_entrada,'code'=>$ticket->codigo,'type'=>$ticket->ticketType?->nombre,
                    'holder'=>$ticket->titular_nombre,'email'=>$ticket->titular_correo,'status'=>$ticket->estado,
                    'usedAt'=>$ticket->usada_at?->format('d/m/Y H:i'),
                ])->values()->all(),
            ];
        })->all();
        return [
            'id'=>(int)$event->id_evento,'title'=>$event->nombre,'categoryId'=>(int)$event->id_categoria,
            'category'=>$event->category?->nombre ?: 'Sin categoría','date'=>$event->fecha_evento->format('Y-m-d'),
            'displayDate'=>$event->fecha_evento->format('d/m/Y'),'time'=>substr($event->hora_inicio,0,5),
            'endTime'=>$event->hora_fin?substr($event->hora_fin,0,5):null,'location'=>$event->ubicacion,'status'=>$event->estado,
            'period'=>$eventAt->isPast()?'pasado':'actual','deleted'=>(bool)$event->eliminado_en,
            'publisher'=>$event->publisher?trim($event->publisher->nombre.' '.$event->publisher->apellido):'Sin asignar',
            'capacity'=>(int)$event->aforo_total,'tickets'=>$event->tickets->count(),
            'usedTickets'=>$event->tickets->where('estado','usada')->count(),
            'validTickets'=>$event->tickets->whereIn('estado',['vigente','usada','transferida'])->count(),
            'annulledTickets'=>$event->tickets->where('estado','anulada')->count(),
            'purchasesCount'=>$event->purchases->count(),'paidPurchases'=>$paidPurchases->count(),
            'income'=>(float)$paidPurchases->sum('total'),'serviceFees'=>(float)$paidPurchases->sum('cargo_servicio'),
            'refunds'=>(float)$refunds->sum('monto'),'purchases'=>$purchases,
        ];
    }

    private function historyDataset(Request $request)
    {
        return $this->historyBaseQuery($request)->orderByDesc('fecha_evento')->orderByDesc('hora_inicio')->get()
            ->map(fn (Event $event) => $this->mapHistoryEvent($event));
    }

    private function filterHistoryDataset($events, Request $request)
    {
        $search = mb_strtolower(trim((string)$request->query('search','')));
        $category = (int)$request->query('category',0);
        $period = $request->query('period','');
        $status = $request->query('status','');
        return $events
            ->when($search !== '', fn($rows)=>$rows->filter(function($event) use($search){
                return str_contains(mb_strtolower($event['title'].' '.$event['category'].' '.$event['location'].' '.$event['publisher']),$search);
            }))
            ->when($category>0, fn($rows)=>$rows->where('categoryId',$category))
            ->when(in_array($period,['actual','pasado'],true), fn($rows)=>$rows->where('period',$period))
            ->when($status!=='', fn($rows)=>$rows->where('status',$status))->values();
    }

    public function history(Request $request)
    {
        $this->requirePermission($request,'reports.view');
        return Inertia::render('Admin/History',[
            'events'=>$this->historyDataset($request)->values(),
            'categories'=>Category::orderBy('nombre')->get(['id_categoria','nombre']),
        ]);
    }

    public function historyPdf(Request $request)
    {
        $this->requirePermission($request,'reports.view');
        $events=$this->filterHistoryDataset($this->historyDataset($request),$request);
        return Pdf::loadView('pdf.history',[
            'events'=>$events,'title'=>'Historial general de EVENTIX','generatedAt'=>now()->format('d/m/Y H:i'),
            'filters'=>['search'=>$request->query('search'),'category'=>$request->query('category'),'period'=>$request->query('period'),'status'=>$request->query('status')],
        ])->setPaper('a4','landscape')->download('historial-eventix-'.now()->format('Ymd-His').'.pdf');
    }

    public function historyEventPdf(Request $request, Event $event)
    {
        $this->requirePermission($request,'reports.view');
        if(!$request->user()->isAdministrator()){
            abort_unless($event->id_publicador===$request->user()->id_usuario || $event->id_administrador===$request->user()->id_usuario,403);
        }
        $event->load(['category','publisher','tickets.ticketType','purchases.user','purchases.tickets.ticketType','purchases.refunds']);
        return Pdf::loadView('pdf.history',[
            'events'=>collect([$this->mapHistoryEvent($event)]),'title'=>'Historial del evento: '.$event->nombre,
            'generatedAt'=>now()->format('d/m/Y H:i'),'filters'=>[],
        ])->setPaper('a4','landscape')->download('historial-evento-'.$event->id_evento.'.pdf');
    }

}
