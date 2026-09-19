<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventixNotification extends Model
{
    protected $table = 'notificaciones_eventix';
    protected $primaryKey = 'id_notificacion';

    protected $fillable = [
        'id_usuario',
        'tipo',
        'titulo',
        'mensaje',
        'url',
        'metadata',
        'leida',
        'leida_en',
    ];

    protected $casts = [
        'metadata' => 'array',
        'leida' => 'boolean',
        'leida_en' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }
}
