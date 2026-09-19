<?php

use App\Http\Controllers\Auth\ClientPasswordResetController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/olvide-mi-contrasena', [ClientPasswordResetController::class, 'create'])
        ->name('client.password.forgot');

    Route::post('/olvide-mi-contrasena', [ClientPasswordResetController::class, 'sendCode'])
        ->middleware('throttle:5,1')
        ->name('client.password.email');

    Route::get('/verificar-codigo', [ClientPasswordResetController::class, 'verifyForm'])
        ->name('client.password.verify.form');

    Route::post('/verificar-codigo', [ClientPasswordResetController::class, 'verifyCode'])
        ->middleware('throttle:10,1')
        ->name('client.password.verify');

    Route::get('/restablecer-contrasena', [ClientPasswordResetController::class, 'resetForm'])
        ->name('client.password.reset.form');

    Route::post('/restablecer-contrasena', [ClientPasswordResetController::class, 'reset'])
        ->middleware('throttle:5,1')
        ->name('client.password.reset');
});
