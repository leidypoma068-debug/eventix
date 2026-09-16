<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (Request $request) {
    $filters = $request->validate([
        'search' => ['nullable', 'string', 'max:120'],
        'date' => ['nullable', 'date_format:Y-m-d'],
        'category' => ['nullable', 'integer', 'min:1'],
        'location' => ['nullable', 'string', 'max:120'],
    ], [
        'search.string' => 'La búsqueda debe contener texto.',
        'search.max' => 'La búsqueda admite hasta 120 caracteres.',
        'date.date_format' => 'Selecciona una fecha válida.',
        'category.integer' => 'Selecciona una categoría válida.',
        'category.min' => 'Selecciona una categoría válida.',
        'location.string' => 'Selecciona una ubicación válida.',
        'location.max' => 'La ubicación admite hasta 120 caracteres.',
    ]);

    return Inertia::render('Home/Home', [
        'filters' => $filters,
        'categories' => [],
        'locations' => [],
    ]);
})->name('home');