<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void { Schema::table('eventos', function(Blueprint $t){
        if(!Schema::hasColumn('eventos','id_publicador')) $t->foreignId('id_publicador')->nullable()->after('id_administrador')->constrained('usuarios','id_usuario')->nullOnDelete();
        if(!Schema::hasColumn('eventos','publicar_en')) $t->dateTime('publicar_en')->nullable()->after('fecha_publicacion');
    }); }
    public function down(): void { Schema::table('eventos', function(Blueprint $t){ if(Schema::hasColumn('eventos','id_publicador')){$t->dropForeign(['id_publicador']);$t->dropColumn('id_publicador');} if(Schema::hasColumn('eventos','publicar_en'))$t->dropColumn('publicar_en'); }); }
};
