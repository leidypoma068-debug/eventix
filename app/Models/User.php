<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';

    public const STAFF_PERMISSIONS = [
        'dashboard.view',
        'events.view',
        'events.create',
        'events.edit',
        'events.publish',
        'tickets.view',
        'stock.view',
        'qr.validate',
        'sales.view',
        'reports.view',
        'analytics.view',
        'clients.view',
        'profile.update',
    ];

    protected $fillable = [
        'nombre','apellido','correo','telefono','foto_perfil','numero_empleado','cargo',
        'permisos','comision_porcentaje','fecha_contratacion','creado_por','password_hash',
        'rol','estado','email_verificado',
    ];

    protected $hidden = ['password_hash'];

    protected $casts = [
        'password_hash' => 'hashed',
        'permisos' => 'array',
        'comision_porcentaje' => 'decimal:2',
        'fecha_contratacion' => 'datetime:Y-m-d H:i:s',
        'estado' => 'boolean',
        'email_verificado' => 'boolean',
        'ultimo_acceso' => 'datetime:Y-m-d H:i:s',
    ];

    protected $attributes = [
        'rol' => 'cliente',
        'estado' => true,
        'email_verificado' => false,
    ];

    public function getAuthPassword() { return $this->password_hash; }
    public function routeNotificationForMail($notification): string { return $this->correo; }

    public function events(): HasMany { return $this->hasMany(Event::class, 'id_administrador', 'id_usuario'); }
    public function publishedEvents(): HasMany { return $this->hasMany(Event::class, 'id_publicador', 'id_usuario'); }
    public function purchases(): HasMany { return $this->hasMany(Purchase::class, 'id_usuario', 'id_usuario'); }
    public function tickets(): HasMany { return $this->hasMany(Ticket::class, 'id_usuario', 'id_usuario'); }

    public function favorites(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'favoritos', 'id_usuario', 'id_evento', 'id_usuario', 'id_evento')->withTimestamps();
    }

    public function assignedTasks(): HasMany { return $this->hasMany(AdminTask::class, 'asignado_a', 'id_usuario'); }
    public function createdTasks(): HasMany { return $this->hasMany(AdminTask::class, 'asignado_por', 'id_usuario'); }
    public function adminActivities(): HasMany { return $this->hasMany(AdminActivity::class, 'id_usuario', 'id_usuario'); }
    public function resolvedRefunds(): HasMany { return $this->hasMany(RefundRequest::class, 'resuelto_por', 'id_usuario'); }
    public function eventixNotifications(): HasMany { return $this->hasMany(EventixNotification::class, 'id_usuario', 'id_usuario'); }
    public function refundRequests(): HasMany { return $this->hasMany(RefundRequest::class, 'id_usuario', 'id_usuario'); }

    public function isAdministrator(): bool { return $this->rol === 'administrador'; }
    public function isStaff(): bool { return in_array($this->rol, ['administrador','subadministrador'], true); }

    public function hasAdminPermission(string $permission): bool
    {
        if ($this->rol === 'administrador') return true;
        if ($this->rol !== 'subadministrador') return false;
        return in_array($permission, $this->permisos ?? [], true);
    }

    public function scopeActive(Builder $query): Builder { return $query->where('estado', true); }
}
