<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('detalles_compra', function (Blueprint $table) {
            $table->id('id_detalle_compra');
            $table->foreignId('id_compra')->constrained('compras','id_compra')->cascadeOnDelete();
            $table->foreignId('id_tipo_entrada')->constrained('tipos_entrada','id_tipo_entrada')->restrictOnDelete();
            $table->unsignedInteger('cantidad');
            $table->decimal('precio_unitario',10,2);
            $table->decimal('subtotal',10,2);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('detalles_compra'); }
};
