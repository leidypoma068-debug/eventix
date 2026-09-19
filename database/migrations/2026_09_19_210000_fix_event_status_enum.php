<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("
            ALTER TABLE `eventos`
            MODIFY `estado`
            ENUM('borrador','proximamente','programado','publicado','cancelado')
            NOT NULL DEFAULT 'borrador'
        ");
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::table('eventos')
            ->where('estado', 'proximamente')
            ->update(['estado' => 'programado']);

        DB::statement("
            ALTER TABLE `eventos`
            MODIFY `estado`
            ENUM('borrador','programado','publicado','cancelado')
            NOT NULL DEFAULT 'borrador'
        ");
    }
};
