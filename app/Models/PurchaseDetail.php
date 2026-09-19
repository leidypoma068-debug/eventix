<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PurchaseDetail extends Model {
    protected $table='detalles_compra'; protected $primaryKey='id_detalle_compra';
    protected $fillable=['id_compra','id_tipo_entrada','cantidad','precio_unitario','subtotal'];
    public function purchase(){ return $this->belongsTo(Purchase::class,'id_compra','id_compra'); }
    public function ticketType(){ return $this->belongsTo(TicketType::class,'id_tipo_entrada','id_tipo_entrada'); }
}
