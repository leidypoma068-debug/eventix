<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('eventos', function (Blueprint $table) {
            if (!Schema::hasColumn('eventos', 'porcentaje_servicio')) {
                $table->decimal('porcentaje_servicio', 5, 2)->default(5.00)->after('aforo_total');
            }
        });
    }

    public function down(): void
    {
        Schema::table('eventos', function (Blueprint $table) {
            if (Schema::hasColumn('eventos', 'porcentaje_servicio')) {
                $table->dropColumn('porcentaje_servicio');
            }
        });
    }
};
