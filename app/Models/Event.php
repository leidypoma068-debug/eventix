<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $table = 'eventos';
    protected $primaryKey = 'id_evento';

    protected $fillable = [
        'id_categoria','id_administrador','id_publicador','nombre','descripcion','fecha_evento',
        'hora_inicio','hora_fin','ubicacion','aforo_total','porcentaje_servicio','imagen','estado','fecha_publicacion','publicar_en','eliminado_en',
    ];

    protected $casts = [
        'fecha_evento' => 'date:Y-m-d',
        'aforo_total' => 'integer',
        'porcentaje_servicio' => 'decimal:2',
        'fecha_publicacion' => 'datetime:Y-m-d H:i:s',
        'publicar_en' => 'datetime:Y-m-d H:i:s',
        'eliminado_en' => 'datetime:Y-m-d H:i:s',
    ];

    protected $attributes = ['estado' => 'borrador'];

    public function user(): BelongsTo { return $this->belongsTo(User::class, 'id_administrador', 'id_usuario'); }
    public function publisher(): BelongsTo { return $this->belongsTo(User::class, 'id_publicador', 'id_usuario'); }
    public function category(): BelongsTo { return $this->belongsTo(Category::class, 'id_categoria', 'id_categoria'); }
    public function ticket_types(): HasMany { return $this->hasMany(TicketType::class, 'id_evento', 'id_evento'); }
    public function purchases(): HasMany { return $this->hasMany(Purchase::class, 'id_evento', 'id_evento'); }
    public function tickets(): HasMany { return $this->hasMany(Ticket::class, 'id_evento', 'id_evento'); }
    public function scopePublished(Builder $query): Builder { return $query->where('estado', 'publicado')->whereNull('eliminado_en'); }
    public function scopeVisible(Builder $query): Builder { return $query->whereNull('eliminado_en'); }
}
