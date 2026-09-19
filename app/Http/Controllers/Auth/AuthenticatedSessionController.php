<?php
namespace App\Http\Controllers\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
class AuthenticatedSessionController extends Controller {
    public function create(){ return Inertia::render('Auth/Login'); }
    public function store(Request $request){
        $data=$request->validate(['correo'=>['required','email'],'password'=>['required','string']]);
        if(!Auth::attempt(['correo'=>$data['correo'],'password'=>$data['password'],'estado'=>1],$request->boolean('remember'))){
            return back()->withErrors(['correo'=>'Correo o contraseña incorrectos.'])->onlyInput('correo');
        }
        $request->session()->regenerate();
        $request->user()->forceFill(['ultimo_acceso'=>now()])->save();
        return redirect()->intended(in_array($request->user()->rol,['administrador','subadministrador'],true)?route('admin.dashboard'):route('home'));
    }
    public function destroy(Request $request){ Auth::guard('web')->logout(); $request->session()->invalidate(); $request->session()->regenerateToken(); return redirect('/'); }
}
