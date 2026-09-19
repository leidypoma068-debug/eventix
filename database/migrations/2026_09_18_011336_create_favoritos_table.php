<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favoritos', function (Blueprint $table) {
            $table->id('id_favorito');

            $table->foreignId('id_usuario')
                ->constrained('usuarios', 'id_usuario')
                ->cascadeOnDelete();

            $table->foreignId('id_evento')
                ->constrained('eventos', 'id_evento')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(
                ['id_usuario', 'id_evento'],
                'favorito_usuario_evento_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favoritos');
    }
};