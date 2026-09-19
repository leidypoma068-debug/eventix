import { Link } from '@inertiajs/react';
import {
    ShieldCheckIcon,
    TicketIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import EventixHeader from './EventixHeader';

export default function AuthRecoveryLayout({ children }) {
    return (
        <>
            <EventixHeader />

            <main className="min-h-screen bg-[#F5F8FF] px-4 pb-10 pt-28 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-xl lg:grid-cols-[0.92fr_1.08fr]">
                    <section className="flex items-center px-6 py-9 sm:px-10 lg:px-12 lg:py-12">
                        <div className="mx-auto w-full max-w-md">
                            <Link
                                href="/login"
                                className="mb-7 inline-flex items-center gap-2 text-sm font-extrabold text-violet-600 transition hover:text-violet-800"
                            >
                                ← Volver a iniciar sesión
                            </Link>

                            {children}
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
                                    Recuperación segura
                                </span>
                                <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight xl:text-6xl">
                                    Recupera tu cuenta y vuelve a vivir eventos.
                                </h2>
                                <p className="mt-5 max-w-md text-sm leading-6 text-violet-100">
                                    EVENTIX verificará tu correo antes de permitir el cambio de contraseña.
                                </p>
                            </div>

                            <div className="mt-8 grid grid-cols-3 gap-3">
                                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                                    <TicketIcon className="h-6 w-6" />
                                    <p className="mt-3 text-xs font-bold">Código único</p>
                                </div>
                                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                                    <ShieldCheckIcon className="h-6 w-6" />
                                    <p className="mt-3 text-xs font-bold">Verificación segura</p>
                                </div>
                                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                                    <UserGroupIcon className="h-6 w-6" />
                                    <p className="mt-3 text-xs font-bold">Solo clientes</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
