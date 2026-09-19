<?php

use App\Http\Controllers\Admin\AdminController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth','admin'])->prefix('admin')->name('admin.')->group(function(){
    Route::get('/entradas',[AdminController::class,'tickets'])->name('tickets');
    Route::get('/stock',[AdminController::class,'stock'])->name('stock');
    Route::get('/ventas',[AdminController::class,'sales'])->name('sales');
    Route::get('/reportes',[AdminController::class,'reports'])->name('reports');
    Route::get('/analitica',[AdminController::class,'analytics'])->name('analytics');
    Route::get('/clientes',[AdminController::class,'clients'])->name('clients');

    Route::post('/categorias',[AdminController::class,'storeCategory'])->name('categories.store');

    Route::get('/historial',[AdminController::class,'history'])->name('history');
    Route::get('/historial/pdf',[AdminController::class,'historyPdf'])->name('history.pdf');
    Route::get('/historial/eventos/{event}/pdf',[AdminController::class,'historyEventPdf'])->name('history.event.pdf');

    Route::post('/eventos/{event}/actualizar',[AdminController::class,'updateEvent'])->name('events.update.post');
    Route::post('/eventos/{event}/publicar',[AdminController::class,'publishEvent'])->name('events.publish');
    Route::delete('/eventos/{event}/permanente',[AdminController::class,'destroyEventPermanently'])->name('events.destroy.permanent');

    Route::get('/empleados',[AdminController::class,'staff'])->name('staff');
    Route::post('/empleados',[AdminController::class,'storeStaff'])->name('staff.store');
    Route::post('/empleados/{user}',[AdminController::class,'updateStaff'])->name('staff.update');
    Route::patch('/empleados/{user}/estado',[AdminController::class,'toggleStaff'])->name('staff.toggle');
    Route::delete('/empleados/{user}',[AdminController::class,'destroyStaff'])->name('staff.destroy');
    Route::post('/empleados/{user}/tareas',[AdminController::class,'assignTask'])->name('staff.tasks.store');
    Route::patch('/tareas/{task}',[AdminController::class,'updateTask'])->name('tasks.update');

    Route::get('/perfil',[AdminController::class,'profile'])->name('profile');
    Route::post('/perfil',[AdminController::class,'updateProfile'])->name('profile.update');
    Route::patch('/perfil/password',[AdminController::class,'updatePassword'])->name('profile.password');

    Route::get('/reembolsos',[AdminController::class,'refunds'])->name('refunds');
    Route::post('/reembolsos/compras/{purchase}',[AdminController::class,'requestRefund'])->name('refunds.request');
    Route::patch('/reembolsos/{refund}',[AdminController::class,'resolveRefund'])->name('refunds.resolve');

    // Compatibilidad con el paquete anterior.
    Route::get('/usuarios', fn()=>redirect()->route('admin.clients'))->name('users');
});
