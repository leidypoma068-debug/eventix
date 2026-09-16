<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipos_entrada', function (Blueprint $table) {
            $table->id('id_tipo_entrada');

            $table->foreignId('id_evento')
                ->constrained('eventos', 'id_evento')
                ->restrictOnDelete();

            $table->string('nombre', 100);
            $table->string('descripcion', 255)->nullable();

            $table->decimal('precio', 10, 2);

            $table->unsignedInteger('cupo_total');
            $table->unsignedInteger('limite_por_compra');

            $table->dateTime('fecha_inicio_venta');
            $table->dateTime('fecha_fin_venta');

            $table->boolean('estado')->default(true);

            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos_entrada');
    }
};
