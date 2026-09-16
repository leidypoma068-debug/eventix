<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');

            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('correo', 150)->unique();
            $table->string('password_hash', 255);
            $table->string('telefono', 30)->nullable();

            $table->enum('rol', [
                'cliente',
                'administrador',
            ])->default('cliente');

            $table->boolean('estado')->default(true);
            $table->boolean('email_verificado')->default(false);

            $table->dateTime('ultimo_acceso')->nullable();
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};