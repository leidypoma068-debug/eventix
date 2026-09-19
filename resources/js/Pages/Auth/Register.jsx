import { Head, Link, useForm } from '@inertiajs/react';
import {
    ShieldCheckIcon,
    TicketIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import EventixHeader from '../../Components/EventixHeader';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        password: '',
        password_confirmation: '',
    });

    const field =
        'mt-2 h-12 w-full rounded-xl border-violet-200 focus:border-violet-500 focus:ring-violet-500';

    const submit = (event) => {
        event.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Registro" />
            <EventixHeader />

            <main className="min-h-screen bg-[#F5F8FF] px-4 pb-10 pt-28 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-xl lg:grid-cols-[0.92fr_1.08fr]">
                    <section className="px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
                        <div className="mx-auto w-full max-w-md">
                            <div className="mb-6 grid grid-cols-2 rounded-2xl bg-violet-50 p-1.5">
                                <Link
                                    href="/login"
                                    className="rounded-xl px-4 py-3 text-center text-sm font-bold text-slate-500 transition hover:text-violet-700"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-xl bg-white px-4 py-3 text-center text-sm font-extrabold text-violet-700 shadow-sm"
                                >
                                    Registrarse
                                </Link>
                            </div>

                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
                                EVENTIX
                            </p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                                Crea tu cuenta
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Regístrate para guardar eventos, comprar entradas y recibir tus códigos QR.
                            </p>

                            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
                                <label className="text-sm font-bold text-slate-700">
                                    Nombre
                                    <input
                                        className={field}
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        autoComplete="given-name"
                                    />
                                </label>

                                <label className="text-sm font-bold text-slate-700">
                                    Apellido
                                    <input
                                        className={field}
                                        value={data.apellido}
                                        onChange={(e) => setData('apellido', e.target.value)}
                                        autoComplete="family-name"
                                    />
                                </label>

                                <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                                    Correo electrónico
                                    <input
                                        type="email"
                                        className={field}
                                        value={data.correo}
                                        onChange={(e) => setData('correo', e.target.value)}
                                        autoComplete="email"
                                    />
                                </label>

                                <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                                    Teléfono
                                    <input
                                        className={field}
                                        value={data.telefono}
                                        onChange={(e) => setData('telefono', e.target.value)}
                                        autoComplete="tel"
                                    />
                                </label>

                                <label className="text-sm font-bold text-slate-700">
                                    Contraseña
                                    <input
                                        type="password"
                                        className={field}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </label>

                                <label className="text-sm font-bold text-slate-700">
                                    Confirmar contraseña
                                    <input
                                        type="password"
                                        className={field}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </label>

                                {Object.values(errors).map((message, index) => (
                                    <p key={index} className="text-sm text-red-600 sm:col-span-2">
                                        {message}
                                    </p>
                                ))}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
                                >
                                    {processing ? 'Creando cuenta…' : 'Crear cuenta'}
                                </button>
                            </form>

                            <p className="mt-5 text-center text-sm text-slate-500">
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/login" className="font-extrabold text-violet-600 hover:text-violet-700">
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </section>

                    <section className="relative hidden min-h-[720px] overflow-hidden lg:block">
                        <img
                            src="/img/events/concierto-verano.jpg"
                            alt="Público disfrutando de un concierto"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#17073b]/95 via-violet-950/45 to-indigo-900/10" />

                        <div className="relative flex h-full flex-col justify-end p-10 text-white xl:p-12">
                            <div className="max-w-lg">
                                <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur">
                                    Tu cuenta EVENTIX
                                </span>
                                <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight xl:text-6xl">
                                    Guarda tus momentos desde el primer clic.
                                </h2>
                                <p className="mt-5 max-w-md text-sm leading-6 text-violet-100">
                                    Crea tu cuenta, encuentra tu evento y lleva tu entrada digital contigo.
                                </p>
                            </div>

                            <div className="mt-8 grid grid-cols-3 gap-3">
                                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                                    <TicketIcon className="h-6 w-6" />
                                    <p className="mt-3 text-xs font-bold">Entradas digitales</p>
                                </div>
                                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                                    <ShieldCheckIcon className="h-6 w-6" />
                                    <p className="mt-3 text-xs font-bold">Cuenta protegida</p>
                                </div>
                                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                                    <UserGroupIcon className="h-6 w-6" />
                                    <p className="mt-3 text-xs font-bold">Experiencias únicas</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
