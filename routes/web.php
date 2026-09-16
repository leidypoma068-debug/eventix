<?php

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

Route::get('/', function (Request $request) {
    $filters = $request->validate([
        'search' => ['nullable', 'string', 'max:120'],
        'date' => ['nullable', 'date_format:Y-m-d'],
        'category' => [
            'nullable',
            'integer',
            'min:1',
            Rule::exists('categorias', 'id_categoria')
                ->where('estado', true),
        ],
        'location' => ['nullable', 'string', 'max:120'],
    ], [
        'search.string' => 'La búsqueda debe contener texto.',
        'search.max' => 'La búsqueda admite hasta 120 caracteres.',
        'date.date_format' => 'Selecciona una fecha válida.',
        'category.integer' => 'Selecciona una categoría válida.',
        'category.min' => 'Selecciona una categoría válida.',
        'category.exists' => 'La categoría seleccionada no está disponible.',
        'location.string' => 'Selecciona una ubicación válida.',
        'location.max' => 'La ubicación admite hasta 120 caracteres.',
    ]);

    $categories = Category::active()
        ->orderBy('id_categoria')
        ->get(['id_categoria', 'nombre']);

    return Inertia::render('Home/Home', [
        'filters' => $filters,
        'categories' => CategoryResource::collection($categories)
            ->resolve($request),
        'locations' => [],
    ]);
})->name('home');