<?php

use App\Http\Controllers\UpcomingEventController;
use Illuminate\Support\Facades\Route;

Route::get('/eventos-proximos', [UpcomingEventController::class, 'index'])
    ->name('events.upcoming');
