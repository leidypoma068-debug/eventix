<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketType extends Model
{
    protected $table = 'tipos_entrada';

    protected $primaryKey = 'id_tipo_entrada';

    protected $fillable = [
        'id_evento',
        'nombre',
        'descripcion',
        'precio',
        'cupo_total',
        'limite_por_compra',
        'fecha_inicio_venta',
        'fecha_fin_venta',
        'estado',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'cupo_total' => 'integer',
        'limite_por_compra' => 'integer',
        'fecha_inicio_venta' => 'datetime:Y-m-d H:i:s',
        'fecha_fin_venta' => 'datetime:Y-m-d H:i:s',
        'estado' => 'boolean',
    ];

    protected $attributes = [
        'estado' => true,
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(
            Event::class,
            'id_evento',
            'id_evento'
        );
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('estado', true);
    }
}