<?php

use App\Http\Controllers\Admin\ExperienceController;
use App\Http\Controllers\ClientPurchaseController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/mis-compras', [ClientPurchaseController::class, 'index'])
        ->name('purchases.client.index');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/mi-panel', [ExperienceController::class, 'myDashboard'])
        ->name('my-dashboard');

    Route::get('/auditoria', [ExperienceController::class, 'audit'])
        ->name('audit');
});
