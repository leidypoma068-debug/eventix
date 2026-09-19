import { Link, router, usePage } from '@inertiajs/react';
import {
    CalendarDaysIcon,
    MapPinIcon,
    TicketIcon,
    HeartIcon as HeartOutlineIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const dateFormatter = new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const priceFormatter = new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

export default function ItemCard({ event }) {
    const {
        auth,
        favorites = {
            ids: [],
            items: [],
        },
    } = usePage().props;

    const favoriteIds = Array.isArray(favorites.ids)
        ? favorites.ids.map(Number)
        : [];

    const isFavorite = favoriteIds.includes(Number(event.id));

    const date = dateFormatter.format(new Date(`${event.date}T00:00:00`));

    const toggleFavorite = () => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        const options = {
            preserveScroll: true,
            preserveState: true,
        };

        if (isFavorite) {
            router.delete(`/favoritos/${event.id}`, options);
        } else {
            router.post(`/favoritos/${event.id}`, {}, options);
        }
    };

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-violet-50">
                {event.image ? (
                    <img
                        src={event.image}
                        alt={event.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100">
                        <TicketIcon className="h-16 w-16 -rotate-12 text-violet-400" aria-hidden="true" />
                    </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                {event.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white shadow">
                        {event.category.name}
                    </span>
                )}

                <button
                    type="button"
                    onClick={toggleFavorite}
                    aria-pressed={isFavorite}
                    aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    className={`absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110 ${
                        isFavorite ? 'text-red-500' : 'text-slate-600 hover:text-red-500'
                    }`}
                >
                    {isFavorite ? (
                        <HeartSolidIcon className="h-7 w-7 text-red-500" />
                    ) : (
                        <HeartOutlineIcon className="h-7 w-7" />
                    )}
                </button>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-black leading-snug text-slate-900">
                    {event.title}
                </h3>

                <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                    <div className="flex items-start gap-2">
                        <CalendarDaysIcon className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
                        <time dateTime={`${event.date}T${event.time}`}>
                            {date} · {event.time} h
                        </time>
                    </div>

                    <div className="flex items-start gap-2">
                        <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
                        <span>{event.location}</span>
                    </div>
                </div>

                <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Entradas desde
                        </p>

                        {event.price != null ? (
                            <p className="mt-1 text-xl font-black text-violet-700">
                                Bs {priceFormatter.format(Number(event.price))}
                            </p>
                        ) : (
                            <p className="mt-1 text-sm text-slate-500">Precio no disponible</p>
                        )}
                    </div>

                    <Link
                        href={`/eventos/${event.id}`}
                        className="shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg"
                        aria-label={`Ver entradas para ${event.title}`}
                    >
                        Ver entradas
                    </Link>
                </div>
            </div>
        </article>
    );
}
