<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('usuarios', 'eliminado_en')) {
            Schema::table('usuarios', function (Blueprint $table) {
                $table->timestamp('eliminado_en')->nullable()->after('estado');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('usuarios', 'eliminado_en')) {
            Schema::table('usuarios', function (Blueprint $table) {
                $table->dropColumn('eliminado_en');
            });
        }
    }
};
