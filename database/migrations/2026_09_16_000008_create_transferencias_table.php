<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('transferencias', function (Blueprint $table) {
            $table->id('id_transferencia');
            $table->foreignId('id_entrada')->constrained('entradas','id_entrada')->restrictOnDelete();
            $table->foreignId('id_usuario_origen')->constrained('usuarios','id_usuario')->restrictOnDelete();
            $table->foreignId('id_usuario_destino')->constrained('usuarios','id_usuario')->restrictOnDelete();
            $table->string('qr_token_anterior',36);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('transferencias'); }
};
