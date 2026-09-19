import { Head, useForm } from '@inertiajs/react';
import AuthRecoveryLayout from '../../Components/AuthRecoveryLayout';

export default function ResetPasswordClient() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/restablecer-contrasena');
    };

    return (
        <>
            <Head title="Nueva contraseña" />
            <AuthRecoveryLayout>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
                    Paso 3 de 3
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    Crea tu nueva contraseña
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                    El código fue verificado. Ahora escribe tu nueva contraseña y confírmala.
                </p>

                <form className="mt-8 space-y-5" onSubmit={submit}>
                    <div>
                        <label htmlFor="password" className="text-sm font-bold text-slate-700">
                            Nueva contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Mínimo 8 caracteres"
                            className="mt-2 h-12 w-full rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="text-sm font-bold text-slate-700">
                            Confirmar nueva contraseña
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Repite la contraseña"
                            className="mt-2 h-12 w-full rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-60"
                    >
                        {processing ? 'Guardando…' : 'Cambiar contraseña'}
                    </button>
                </form>
            </AuthRecoveryLayout>
        </>
    );
}
