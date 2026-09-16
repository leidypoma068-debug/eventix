<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $table = 'usuarios';

    protected $primaryKey = 'id_usuario';

    protected $fillable = [
        'nombre',
        'apellido',
        'correo',
        'telefono',
        'password_hash',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'password_hash' => 'hashed',
        'estado' => 'boolean',
        'email_verificado' => 'boolean',
        'ultimo_acceso' => 'datetime:Y-m-d H:i:s',
    ];

    protected $attributes = [
        'rol' => 'cliente',
        'estado' => true,
        'email_verificado' => false,
    ];

    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function routeNotificationForMail($notification): string
    {
        return $this->correo;
    }

    public function events(): HasMany
    {
        return $this->hasMany(
            Event::class,
            'id_administrador',
            'id_usuario'
        );
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('estado', true);
    }
}