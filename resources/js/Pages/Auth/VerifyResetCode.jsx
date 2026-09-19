import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthRecoveryLayout from '../../Components/AuthRecoveryLayout';

export default function VerifyResetCode({ correo }) {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        codigo: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/verificar-codigo');
    };

    return (
        <>
            <Head title="Verificar código" />
            <AuthRecoveryLayout>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
                    Paso 2 de 3
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    Verifica tu correo
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                    Ingresa el código de 6 dígitos que enviamos a <span className="font-bold text-slate-700">{correo}</span>.
                </p>

                {flash?.success && (
                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={submit}>
                    <div>
                        <label htmlFor="codigo" className="text-sm font-bold text-slate-700">
                            Código de verificación
                        </label>
                        <input
                            id="codigo"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={data.codigo}
                            onChange={(e) => setData('codigo', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="mt-2 h-14 w-full rounded-xl border-violet-200 text-center text-2xl font-black tracking-[0.5em] text-violet-700 focus:border-violet-500 focus:ring-violet-500"
                        />
                        {errors.codigo && (
                            <p className="mt-2 text-sm text-red-600">{errors.codigo}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-60"
                    >
                        {processing ? 'Verificando…' : 'Verificar código'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    ¿No llegó el código?{' '}
                    <Link href="/olvide-mi-contrasena" className="font-extrabold text-violet-600 hover:text-violet-700">
                        Solicitar otro
                    </Link>
                </p>
            </AuthRecoveryLayout>
        </>
    );
}
