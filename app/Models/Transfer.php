<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Transfer extends Model {
    protected $table='transferencias'; protected $primaryKey='id_transferencia';
    protected $fillable=['id_entrada','id_usuario_origen','id_usuario_destino','qr_token_anterior'];
}
