<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        DB::statement("ALTER TABLE usuarios MODIFY rol ENUM('cliente','administrador','subadministrador') NOT NULL DEFAULT 'cliente'");
        Schema::table('usuarios', function(Blueprint $table){
            if(!Schema::hasColumn('usuarios','foto_perfil')) $table->string('foto_perfil',255)->nullable()->after('telefono');
            if(!Schema::hasColumn('usuarios','numero_empleado')) $table->string('numero_empleado',40)->nullable()->unique()->after('foto_perfil');
            if(!Schema::hasColumn('usuarios','cargo')) $table->string('cargo',100)->nullable()->after('numero_empleado');
            if(!Schema::hasColumn('usuarios','permisos')) $table->json('permisos')->nullable()->after('cargo');
            if(!Schema::hasColumn('usuarios','comision_porcentaje')) $table->decimal('comision_porcentaje',5,2)->default(0)->after('permisos');
            if(!Schema::hasColumn('usuarios','fecha_contratacion')) $table->dateTime('fecha_contratacion')->nullable()->after('comision_porcentaje');
            if(!Schema::hasColumn('usuarios','creado_por')) $table->foreignId('creado_por')->nullable()->after('fecha_contratacion')->constrained('usuarios','id_usuario')->nullOnDelete();
        });
    }
    public function down(): void {
        if(Schema::hasColumn('usuarios','creado_por')) Schema::table('usuarios',fn(Blueprint $t)=>$t->dropForeign(['creado_por']));
        Schema::table('usuarios', function(Blueprint $t){ foreach(['foto_perfil','numero_empleado','cargo','permisos','comision_porcentaje','fecha_contratacion','creado_por'] as $c) if(Schema::hasColumn('usuarios',$c)) $t->dropColumn($c); });
        DB::table('usuarios')->where('rol','subadministrador')->update(['rol'=>'cliente']);
        DB::statement("ALTER TABLE usuarios MODIFY rol ENUM('cliente','administrador') NOT NULL DEFAULT 'cliente'");
    }
};
