<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    protected $table = 'eventos';

    protected $primaryKey = 'id_evento';

    protected $fillable = [
        'id_categoria',
        'id_administrador',
        'nombre',
        'descripcion',
        'fecha_evento',
        'hora_inicio',
        'hora_fin',
        'ubicacion',
        'aforo_total',
        'imagen',
        'estado',
        'fecha_publicacion',
    ];

    protected $casts = [
        'fecha_evento' => 'date:Y-m-d',
        'aforo_total' => 'integer',
        'fecha_publicacion' => 'datetime:Y-m-d H:i:s',
    ];

    protected $attributes = [
        'estado' => 'borrador',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(
            Category::class,
            'id_categoria',
            'id_categoria'
        );
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('estado', 'publicado');
    }
}