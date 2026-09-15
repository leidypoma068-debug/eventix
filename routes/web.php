<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'EVENTIX - Sistema de Venta de Entradas para Eventos';
})->name('home');