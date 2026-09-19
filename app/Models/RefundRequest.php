<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefundRequest extends Model
{
    protected $table = 'solicitudes_reembolso';
    protected $primaryKey = 'id_reembolso';

    protected $fillable = [
        'id_compra',
        'id_usuario',
        'motivo',
        'monto',
        'estado',
        'solicitado_en',
        'resuelto_en',
        'resuelto_por',
        'observacion_admin',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'solicitado_en' => 'datetime',
        'resuelto_en' => 'datetime',
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class, 'id_compra', 'id_compra');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resuelto_por', 'id_usuario');
    }

    public function tickets()
    {
        return $this->belongsToMany(
            Ticket::class,
            'reembolso_entradas',
            'id_reembolso',
            'id_entrada',
            'id_reembolso',
            'id_entrada'
        )->withPivot('monto')->withTimestamps();
    }
}
