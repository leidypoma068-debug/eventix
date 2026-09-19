<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetCode;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ClientPasswordResetController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendCode(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'correo' => ['required', 'email', 'max:255'],
        ]);

        $correo = strtolower(trim($validated['correo']));

        $request->session()->put('password_reset_email', $correo);
        $request->session()->forget('password_reset_verified');

        $user = User::query()
            ->where('correo', $correo)
            ->where('rol', 'cliente')
            ->where('estado', true)
            ->first();

        // Respuesta genérica para no revelar si un correo está registrado.
        if (!$user) {
            return redirect('/verificar-codigo')->with(
                'success',
                'Si el correo corresponde a una cuenta de cliente, recibirás un código de verificación.'
            );
        }

        $code = (string) random_int(100000, 999999);

        PasswordResetCode::query()->where('correo', $correo)->delete();

        PasswordResetCode::create([
            'correo' => $correo,
            'codigo_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(10),
        ]);

        try {
            Mail::raw(
                "Tu código de verificación de EVENTIX es: {$code}\n\nEste código vence en 10 minutos.\nSi no solicitaste este cambio, ignora este mensaje.",
                function ($message) use ($correo) {
                    $message->to($correo)
                        ->subject('Código para restablecer tu contraseña - EVENTIX');
                }
            );
        } catch (\Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'correo' => 'No se pudo enviar el correo en este momento. Revisa la configuración de correo de EVENTIX e inténtalo nuevamente.',
            ]);
        }

        return redirect('/verificar-codigo')->with(
            'success',
            'Te enviamos un código de 6 dígitos. Revisa tu correo.'
        );
    }

    public function verifyForm(Request $request): Response|RedirectResponse
    {
        if (!$request->session()->has('password_reset_email')) {
            return redirect('/olvide-mi-contrasena');
        }

        return Inertia::render('Auth/VerifyResetCode', [
            'correo' => $request->session()->get('password_reset_email'),
        ]);
    }

    public function verifyCode(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'codigo' => ['required', 'digits:6'],
        ]);

        $correo = $request->session()->get('password_reset_email');

        if (!$correo) {
            return redirect('/olvide-mi-contrasena');
        }

        $reset = PasswordResetCode::query()
            ->where('correo', $correo)
            ->first();

        if (!$reset || $reset->expires_at->isPast()) {
            PasswordResetCode::query()->where('correo', $correo)->delete();

            return back()->withErrors([
                'codigo' => 'El código venció. Solicita uno nuevo.',
            ]);
        }

        if (!Hash::check($validated['codigo'], $reset->codigo_hash)) {
            return back()->withErrors([
                'codigo' => 'El código de verificación no es correcto.',
            ]);
        }

        $reset->update(['verified_at' => now()]);
        $request->session()->put('password_reset_verified', true);

        return redirect('/restablecer-contrasena');
    }

    public function resetForm(Request $request): Response|RedirectResponse
    {
        if (
            !$request->session()->has('password_reset_email') ||
            !$request->session()->get('password_reset_verified')
        ) {
            return redirect('/olvide-mi-contrasena');
        }

        return Inertia::render('Auth/ResetPasswordClient');
    }

    public function reset(Request $request): RedirectResponse
    {
        if (
            !$request->session()->has('password_reset_email') ||
            !$request->session()->get('password_reset_verified')
        ) {
            return redirect('/olvide-mi-contrasena');
        }

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $correo = $request->session()->get('password_reset_email');

        $reset = PasswordResetCode::query()
            ->where('correo', $correo)
            ->whereNotNull('verified_at')
            ->first();

        if (!$reset || $reset->expires_at->isPast()) {
            PasswordResetCode::query()->where('correo', $correo)->delete();
            $request->session()->forget(['password_reset_email', 'password_reset_verified']);

            return redirect('/olvide-mi-contrasena')->withErrors([
                'correo' => 'La verificación venció. Solicita un código nuevo.',
            ]);
        }

        $user = User::query()
            ->where('correo', $correo)
            ->where('rol', 'cliente')
            ->where('estado', true)
            ->first();

        if (!$user) {
            return redirect('/olvide-mi-contrasena');
        }

        $user->password_hash = Hash::make($validated['password']);
        $user->save();

        PasswordResetCode::query()->where('correo', $correo)->delete();
        $request->session()->forget(['password_reset_email', 'password_reset_verified']);

        return redirect('/login')->with(
            'success',
            'Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión.'
        );
    }
}
