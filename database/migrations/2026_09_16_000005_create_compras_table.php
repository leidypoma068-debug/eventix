<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('compras', function (Blueprint $table) {
            $table->id('id_compra');
            $table->foreignId('id_usuario')->constrained('usuarios','id_usuario')->restrictOnDelete();
            $table->foreignId('id_evento')->constrained('eventos','id_evento')->restrictOnDelete();
            $table->enum('estado',['pendiente','pagada','rechazada','cancelada'])->default('pendiente');
            $table->enum('metodo_pago',['tarjeta','qr'])->default('tarjeta');
            $table->decimal('subtotal',10,2);
            $table->decimal('cargo_servicio',10,2)->default(0);
            $table->decimal('total',10,2);
            $table->string('referencia_pago',100)->nullable()->unique();
            $table->dateTime('fecha_pago')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('compras'); }
};
