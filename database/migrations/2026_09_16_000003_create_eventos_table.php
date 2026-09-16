<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eventos', function (Blueprint $table) {
            $table->id('id_evento');

            $table->foreignId('id_categoria')
                ->constrained('categorias', 'id_categoria')
                ->restrictOnDelete();

            $table->foreignId('id_administrador')
                ->constrained('usuarios', 'id_usuario')
                ->restrictOnDelete();

            $table->string('nombre', 150);
            $table->text('descripcion');

            $table->date('fecha_evento');
            $table->time('hora_inicio');
            $table->time('hora_fin')->nullable();

            $table->string('ubicacion', 255);
            $table->unsignedInteger('aforo_total');
            $table->string('imagen', 255)->nullable();

            $table->enum('estado', [
                'borrador',
                'programado',
                'publicado',
                'cancelado',
            ])->default('borrador');

            $table->dateTime('fecha_publicacion')->nullable();

            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eventos');
    }
};