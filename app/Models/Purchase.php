<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Purchase extends Model {
    protected $table='compras'; protected $primaryKey='id_compra';
    protected $fillable=['id_usuario','id_evento','estado','metodo_pago','subtotal','cargo_servicio','total','referencia_pago','fecha_pago'];
    protected $casts=['subtotal'=>'decimal:2','cargo_servicio'=>'decimal:2','total'=>'decimal:2','fecha_pago'=>'datetime'];
    public function user(){ return $this->belongsTo(User::class,'id_usuario','id_usuario'); }
    public function event(){ return $this->belongsTo(Event::class,'id_evento','id_evento'); }
    public function details(){ return $this->hasMany(PurchaseDetail::class,'id_compra','id_compra'); }
    public function tickets(){ return $this->hasMany(Ticket::class,'id_compra','id_compra'); }
    public function refunds(){ return $this->hasMany(RefundRequest::class,'id_compra','id_compra'); }
}
