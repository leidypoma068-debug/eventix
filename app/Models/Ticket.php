<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Ticket extends Model {
    protected $table='entradas'; protected $primaryKey='id_entrada';
    protected $fillable=['id_compra','id_usuario','id_evento','id_tipo_entrada','codigo','qr_token','estado','titular_nombre','titular_correo','usada_at'];
    protected $casts=['usada_at'=>'datetime'];
    public function purchase(){ return $this->belongsTo(Purchase::class,'id_compra','id_compra'); }
    public function user(){ return $this->belongsTo(User::class,'id_usuario','id_usuario'); }
    public function event(){ return $this->belongsTo(Event::class,'id_evento','id_evento'); }
    public function ticketType(){ return $this->belongsTo(TicketType::class,'id_tipo_entrada','id_tipo_entrada'); }
}
