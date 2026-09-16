<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            'Conciertos',
            'Festivales',
            'Teatro',
            'Deportes',
            'Comedia',
            'Familia',
            'Arte y Cultura',
        ];

        foreach ($categorias as $nombre) {
            Category::firstOrCreate(
                ['nombre' => $nombre],
                ['estado' => true]
            );
        }
    }
}