import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CalendarDaysIcon,
    CheckBadgeIcon,
    MapPinIcon,
    TicketIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';

export default function GuestHeroCarousel() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const slides = useMemo(() => [
        {
            image: '/img/eventix-home/hero-eventos.jpg',
            eyebrow: 'EVENTIX · La Paz',
            title: 'Vive más eventos',
            subtitle: 'Conciertos, festivales, teatro, deportes y mucho más en un solo lugar.',
            badge: 'Experiencias que empiezan aquí',
        },
        {
            image: '/img/eventix-home/hero-comunidad.jpg',
            eyebrow: 'Encuentra tu próximo plan',
            title: 'Momentos que sí se recuerdan',
            subtitle: 'Explora eventos, elige tu entrada y recibe tu acceso digital de forma sencilla.',
            badge: 'Compra fácil y rápida',
        },
        {
            image: '/img/eventix-home/hero-deportes.jpg',
            eyebrow: 'Cultura · Música · Deportes',
            title: 'Todo lo que te gusta, más cerca',
            subtitle: 'Busca por fecha, categoría o ubicación y descubre nuevas experiencias.',
            badge: 'Eventos para todos',
        },
    ], []);

    const [active, setActive] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActive((current) => (current + 1) % slides.length);
        }, 5500);

        return () => window.clearInterval(timer);
    }, [slides.length]);

    const goTo = (index) => setActive((index + slides.length) % slides.length);

    const secondaryHref = !user
        ? '/login'
        : ['administrador', 'subadministrador'].includes(user?.role)
            ? '/admin'
            : '/mis-entradas';

    const secondaryLabel = !user
        ? 'Iniciar sesión'
        : ['administrador', 'subadministrador'].includes(user?.role)
            ? 'Ir al panel'
            : 'Mis entradas';

    return (
        <section className="relative overflow-hidden rounded-[30px] border border-violet-100 bg-slate-950 shadow-[0_24px_70px_rgba(76,29,149,0.18)]">
            <div className="relative h-[360px] sm:h-[410px] lg:h-[430px]">
                {slides.map((slide, index) => (
                    <div
                        key={slide.title}
                        className={`absolute inset-0 transition-all duration-700 ${
                            active === index
                                ? 'z-10 scale-100 opacity-100'
                                : 'z-0 scale-[1.02] opacity-0'
                        }`}
                    >
                        <img
                            src={slide.image}
                            alt=""
                            className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-violet-950/80 to-violet-900/15" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full max-w-3xl px-7 py-10 sm:px-11 lg:px-14">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-violet-100 backdrop-blur-md">
                                    <TicketIcon className="h-4 w-4" />
                                    {slide.eyebrow}
                                </span>

                                <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
                                    {slide.title}
                                </h1>

                                <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-200 sm:text-lg">
                                    {slide.subtitle}
                                </p>

                                <div className="mt-7 flex flex-wrap items-center gap-3">
                                    <a
                                        href="#eventos"
                                        className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-violet-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-violet-50"
                                    >
                                        Explorar eventos
                                    </a>

                                    <Link
                                        href={secondaryHref}
                                        className="inline-flex items-center justify-center rounded-2xl border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
                                    >
                                        {secondaryLabel}
                                    </Link>
                                </div>

                                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-100">
                                    <CheckBadgeIcon className="h-5 w-5" />
                                    {slide.badge}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => goTo(active - 1)}
                    className="absolute left-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur transition hover:bg-white/20 sm:flex"
                    aria-label="Anterior"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>

                <button
                    type="button"
                    onClick={() => goTo(active + 1)}
                    className="absolute right-4 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur transition hover:bg-white/20 sm:flex"
                    aria-label="Siguiente"
                >
                    <ArrowRightIcon className="h-5 w-5" />
                </button>

                <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-md">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.title}
                            type="button"
                            onClick={() => setActive(index)}
                            aria-label={`Ir a diapositiva ${index + 1}`}
                            className={`h-2.5 rounded-full transition-all ${
                                active === index ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'
                            }`}
                        />
                    ))}
                </div>
            </div>

            <div className="relative z-30 grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
                <div className="flex items-center gap-3 bg-violet-950/80 px-6 py-4 text-white backdrop-blur">
                    <CalendarDaysIcon className="h-6 w-6 text-violet-300" />
                    <div>
                        <p className="text-sm font-black">Eventos actualizados</p>
                        <p className="text-xs text-violet-200">Encuentra nuevas fechas y experiencias</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-violet-950/80 px-6 py-4 text-white backdrop-blur">
                    <TicketIcon className="h-6 w-6 text-violet-300" />
                    <div>
                        <p className="text-sm font-black">Entradas digitales</p>
                        <p className="text-xs text-violet-200">Tu acceso EVENTIX siempre a mano</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-violet-950/80 px-6 py-4 text-white backdrop-blur">
                    <MapPinIcon className="h-6 w-6 text-violet-300" />
                    <div>
                        <p className="text-sm font-black">Planes cerca de ti</p>
                        <p className="text-xs text-violet-200">Busca por ubicación y categoría</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
