import { Head, useForm, usePage } from '@inertiajs/react';
import AuthRecoveryLayout from '../../Components/AuthRecoveryLayout';

export default function ForgotPassword() {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        correo: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/olvide-mi-contrasena');
    };

    return (
        <>
            <Head title="Olvidé mi contraseña" />
            <AuthRecoveryLayout>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
                    EVENTIX
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    ¿Olvidaste tu contraseña?
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                    Escribe el correo de tu cuenta de cliente. Te enviaremos un código de verificación de 6 dígitos.
                </p>

                {flash?.success && (
                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={submit}>
                    <div>
                        <label htmlFor="correo" className="text-sm font-bold text-slate-700">
                            Correo electrónico
                        </label>
                        <input
                            id="correo"
                            type="email"
                            autoComplete="email"
                            value={data.correo}
                            onChange={(e) => setData('correo', e.target.value)}
                            placeholder="tu@correo.com"
                            className="mt-2 h-12 w-full rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                        />
                        {errors.correo && (
                            <p className="mt-2 text-sm text-red-600">{errors.correo}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-60"
                    >
                        {processing ? 'Enviando código…' : 'Enviar código de verificación'}
                    </button>
                </form>

                <div className="mt-6 rounded-2xl bg-violet-50 p-4 text-xs leading-5 text-violet-700">
                    El código vence en 10 minutos y solo puede utilizarse para restablecer la contraseña de una cuenta de cliente.
                </div>
            </AuthRecoveryLayout>
        </>
    );
}
