<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DefaultEventCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Arte y Cultura',
            'Comedia',
            'Conciertos',
            'Deportes',
            'Familia',
            'Festivales',
            'Teatro',
        ];

        foreach ($categories as $name) {
            $values = [];

            if (Schema::hasColumn('categorias', 'estado')) {
                $values['estado'] = true;
            }

            if (Schema::hasColumn('categorias', 'descripcion')) {
                $values['descripcion'] = 'Categoría predeterminada de EVENTIX.';
            }

            if (Schema::hasColumn('categorias', 'updated_at')) {
                $values['updated_at'] = now();
            }

            $exists = DB::table('categorias')
                ->where('nombre', $name)
                ->exists();

            if ($exists) {
                if ($values !== []) {
                    DB::table('categorias')
                        ->where('nombre', $name)
                        ->update($values);
                }

                continue;
            }

            $insert = ['nombre' => $name] + $values;

            if (Schema::hasColumn('categorias', 'created_at')) {
                $insert['created_at'] = now();
            }

            DB::table('categorias')->insert($insert);
        }
    }
}
