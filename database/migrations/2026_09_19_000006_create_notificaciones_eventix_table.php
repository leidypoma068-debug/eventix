<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('notificaciones_eventix')) {
            Schema::create('notificaciones_eventix', function (Blueprint $table) {
                $table->id('id_notificacion');
                $table->foreignId('id_usuario')->constrained('usuarios', 'id_usuario')->cascadeOnDelete();
                $table->string('tipo', 60);
                $table->string('titulo', 180);
                $table->text('mensaje');
                $table->string('url', 255)->nullable();
                $table->json('metadata')->nullable();
                $table->boolean('leida')->default(false);
                $table->dateTime('leida_en')->nullable();
                $table->timestamps();

                $table->index(['id_usuario', 'leida']);
                $table->index(['id_usuario', 'tipo']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones_eventix');
    }
};
