<?php
namespace App\Http\Controllers\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
class RegisteredUserController extends Controller {
    public function create(){ return Inertia::render('Auth/Register'); }
    public function store(Request $request){
        $data=$request->validate([
            'nombre'=>['required','string','max:100'],'apellido'=>['required','string','max:100'],
            'correo'=>['required','email','max:150','unique:usuarios,correo'],'telefono'=>['nullable','string','max:30'],
            'password'=>['required','confirmed','min:8']]);
        $user=User::create(['nombre'=>$data['nombre'],'apellido'=>$data['apellido'],'correo'=>$data['correo'],'telefono'=>$data['telefono']??null,'password_hash'=>$data['password'],'rol'=>'cliente','estado'=>true]);
        Auth::login($user); return redirect()->route('home');
    }
}
