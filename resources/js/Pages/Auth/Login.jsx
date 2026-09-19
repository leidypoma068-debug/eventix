import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ShieldCheckIcon,
    TicketIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import EventixHeader from '../../Components/EventixHeader';

export default function Login() {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        correo: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Iniciar sesión" />
            <EventixHeader />

            <main className="min-h-screen bg-[#F5F8FF] px-4 pb-10 pt-28 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-xl lg:grid-cols-[0.92fr_1.08fr]">
                    <section className="flex items-center px-6 py-9 sm:px-10 lg:px-12 lg:py-12">
                        <div className="mx-auto w-full max-w-md">
                            <div className="mb-7 grid grid-cols-2 rounded-2xl bg-violet-50 p-1.5">
                                <Link
                                    href="/login"
                                    className="rounded-xl bg-white px-4 py-3 text-center text-sm font-extrabold text-violet-700 shadow-sm"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-xl px-4 py-3 text-center text-sm font-bold text-slate-500 transition hover:text-violet-700"
                                >
                                    Registrarse
                                </Link>
                            </div>

                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
                                EVENTIX
                            </p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                Bienvenido de nuevo
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Ingresa a tu cuenta para administrar tus entradas, favoritos y próximos eventos.
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

                                <div>
                                    <div className="flex items-center justify-between gap-4">
                                        <label htmlFor="password" className="text-sm font-bold text-slate-700">
                                            Contraseña
                                        </label>
                                        <Link
                                            href="/olvide-mi-contrasena"
                                            className="text-sm font-extrabold text-violet-600 transition hover:text-violet-800"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Ingresa tu contraseña"
                                        className="mt-2 h-12 w-full rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500"
                                    />
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                                    />
                                    Recordarme
                                </label>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-60"
                                >
                                    {processing ? 'Ingresando…' : 'Iniciar sesión'}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-slate-500">
                                ¿No tienes cuenta?{' '}
                                <Link href="/register" className="font-extrabold text-violet-600 hover:text-violet-700">
                                    Regístrate aquí
                                </Link>
                            </p>
                        </div>
                    </section>

                    <section className="relative hidden min-h-[660px] overflow-hidden lg:block">
                        <img
                            src="/img/events/concierto-verano.jpg"
                            alt="Público disfrutando de un concierto"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#17073b]/95 via-violet-950/45 to-indigo-900/10" />

                        <div className="relative flex h-full flex-col justify-end p-10 text-white xl:p-12">
                            <div className="max-w-lg">
                                <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur">
                                    Vive más eventos
                                </span>
                                <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight xl:text-6xl">
                                    Tu próxima experiencia empieza aquí.
                                </h2>
                                <p className="mt-5 max-w-md text-sm leading-6 text-violet-100">
                                    Descubre conciertos, festivales, teatro y deportes. Compra tus entradas y llévalas siempre contigo.
                                </p>
                            </div>

                            <div className="mt-8 grid grid-cols-3 gap-3">
                                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                                    <TicketIcon className="h-6 w-6" />
                                    <p className="mt-3 text-xs font-bold">Eventos reales</p>
                                </div>
                                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                                    <ShieldCheckIcon className="h-6 w-6" />
                                    <p className="mt-3 text-xs font-bold">Compra segura</p>
                                </div>
                                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                                    <UserGroupIcon className="h-6 w-6" />
                                    <p className="mt-3 text-xs font-bold">Vive con otros</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
