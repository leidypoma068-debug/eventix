<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\Payment\CheckoutController;
use App\Http\Controllers\TicketController;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\EventResource;
use App\Models\Category;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Http\Controllers\FavoriteController;

Route::get('/', function (Request $request) {
    $filters = $request->validate([
        'search' => ['nullable','string','max:120'],
        'date' => ['nullable','date_format:Y-m-d'],
        'category' => ['nullable','integer','min:1',Rule::exists('categorias','id_categoria')->where('estado',true)],
        'location' => ['nullable','string','max:120'],
    ]);

    $events = Event::published()
        ->with('category')
        ->withMin(['ticket_types as precio_desde' => fn($q) => $q->active()], 'precio')
        ->when($filters['search'] ?? null, fn($q,$v) => $q->where(function($s) use($v){
            $s->where('nombre','like',"%{$v}%")->orWhere('descripcion','like',"%{$v}%")->orWhere('ubicacion','like',"%{$v}%");
        }))
        ->when($filters['date'] ?? null, fn($q,$v) => $q->whereDate('fecha_evento',$v))
        ->when($filters['category'] ?? null, fn($q,$v) => $q->where('id_categoria',$v))
        ->when($filters['location'] ?? null, fn($q,$v) => $q->where('ubicacion',$v))
        ->orderBy('fecha_evento')->orderBy('hora_inicio')->paginate(8)->withQueryString();

return Inertia::render('Home/Home', [
    'filters' => $filters,

    'categories' => CategoryResource::collection(
        Category::active()
            ->orderBy('nombre')
            ->get()
    )->resolve($request),

    'locations' => Event::published()
        ->whereNotNull('ubicacion')
        ->distinct()
        ->orderBy('ubicacion')
        ->pluck('ubicacion'),

    'events' => EventResource::collection($events),

    'favoriteIds' => $request->user()
        ? $request->user()
            ->favorites()
            ->pluck('eventos.id_evento')
            ->values()
            ->all()
        : [],
]);
})->name('home');

Route::get('/eventos/{event}', [EventController::class,'event_details'])->name('event');

Route::middleware('auth')->group(function(){
    Route::get('/checkout/{event}', [CheckoutController::class,'show'])->name('checkout');
    Route::post('/checkout/{event}', [CheckoutController::class,'store'])->name('checkout.store');
    Route::get('/payment-qr', [CheckoutController::class,'paymentQr'])->name('payment.qr');
    Route::get('/mis-entradas', [TicketController::class,'index'])->name('tickets.index');
    Route::get('/entradas/{ticket}/qr', [TicketController::class,'qr'])->name('tickets.qr');
    Route::get('/entradas/{ticket}/pdf', [TicketController::class,'pdf'])->name('tickets.pdf');
    Route::post('/entradas/{ticket}/transferir', [TicketController::class,'transfer'])->name('tickets.transfer');
    Route::get('/favoritos', [FavoriteController::class, 'index'])->name('favorites.index');
    Route::post('/favoritos/{event}', [FavoriteController::class, 'store'])->name('favorites.store');
    Route::delete('/favoritos/{event}',[FavoriteController::class, 'destroy'])->name('favorites.destroy');
});

Route::middleware(['auth','admin'])->prefix('admin')->name('admin.')->group(function(){
    Route::get('/', [AdminController::class,'dashboard'])->name('dashboard');
    Route::get('/eventos', [AdminController::class,'events'])->name('events');
    Route::post('/eventos', [AdminController::class,'storeEvent'])->name('events.store');
    Route::put('/eventos/{event}', [AdminController::class,'updateEvent'])->name('events.update');
    Route::delete('/eventos/{event}', [AdminController::class,'deleteEvent'])->name('events.delete');
    Route::post('/eventos/{event}/tipos', [AdminController::class,'storeType'])->name('types.store');
    Route::get('/validar', [AdminController::class,'validatePage'])->name('validate');
    Route::post('/validar', [AdminController::class,'validateForm'])->name('validate.form');
    Route::get('/validar/{token}', [AdminController::class,'validateToken'])->name('validate.token');
    Route::get('/eventos/{event}/reporte', [AdminController::class,'report'])->name('report');
});

require_once __DIR__.'/admin_extra.php';

require_once __DIR__.'/client_extra.php';

require __DIR__.'/password_client.php';

require __DIR__.'/auth.php';

require_once __DIR__.'/upcoming_events.php';

require_once __DIR__.'/experience_extra.php';
