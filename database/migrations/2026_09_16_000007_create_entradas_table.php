<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('entradas', function (Blueprint $table) {
            $table->id('id_entrada');
            $table->foreignId('id_compra')->constrained('compras','id_compra')->restrictOnDelete();
            $table->foreignId('id_usuario')->constrained('usuarios','id_usuario')->restrictOnDelete();
            $table->foreignId('id_evento')->constrained('eventos','id_evento')->restrictOnDelete();
            $table->foreignId('id_tipo_entrada')->constrained('tipos_entrada','id_tipo_entrada')->restrictOnDelete();
            $table->string('codigo',40)->unique();
            $table->uuid('qr_token')->unique();
            $table->enum('estado',['vigente','usada','transferida','anulada'])->default('vigente');
            $table->string('titular_nombre',200);
            $table->string('titular_correo',150);
            $table->dateTime('usada_at')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('entradas'); }
};
