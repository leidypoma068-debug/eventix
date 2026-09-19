<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('reembolso_entradas')) {
            Schema::create('reembolso_entradas', function (Blueprint $table) {
                $table->id('id_reembolso_entrada');
                $table->foreignId('id_reembolso')
                    ->constrained('solicitudes_reembolso', 'id_reembolso')
                    ->cascadeOnDelete();
                $table->foreignId('id_entrada')
                    ->constrained('entradas', 'id_entrada')
                    ->restrictOnDelete();
                $table->decimal('monto', 10, 2);
                $table->timestamps();

                $table->unique(['id_reembolso', 'id_entrada']);
                $table->index('id_entrada');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reembolso_entradas');
    }
};
