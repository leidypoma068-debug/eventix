<?php

use App\Http\Controllers\ClientRefundController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/mis-reembolsos', [ClientRefundController::class, 'index'])
        ->name('refunds.client.index');

    Route::post('/mis-reembolsos/{purchase}', [ClientRefundController::class, 'store'])
        ->name('refunds.client.store');

    Route::patch('/notificaciones/leer-todas', [NotificationController::class, 'readAll'])
        ->name('notifications.readAll');

    Route::patch('/notificaciones/{notification}/leer', [NotificationController::class, 'read'])
        ->name('notifications.read');
});
