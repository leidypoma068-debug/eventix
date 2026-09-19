<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AdminTask extends Model {
    protected $table='tareas_admin'; protected $primaryKey='id_tarea';
    protected $fillable=['asignado_a','asignado_por','titulo','descripcion','prioridad','estado','vence_en','completada_en'];
    protected $casts=['vence_en'=>'datetime','completada_en'=>'datetime'];
    public function assignee(){ return $this->belongsTo(User::class,'asignado_a','id_usuario'); }
    public function assigner(){ return $this->belongsTo(User::class,'asignado_por','id_usuario'); }
}
