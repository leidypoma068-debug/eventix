<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AdminActivity extends Model {
    protected $table='actividades_admin'; protected $primaryKey='id_actividad';
    protected $fillable=['id_usuario','accion','entidad_tipo','entidad_id','detalle','ip'];
    protected $casts=['detalle'=>'array'];
    public function user(){ return $this->belongsTo(User::class,'id_usuario','id_usuario'); }
}
