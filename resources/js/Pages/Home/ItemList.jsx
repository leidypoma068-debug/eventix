import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDaysIcon,
    MapPinIcon,
    TicketIcon,
} from '@heroicons/react/24/outline';
import ItemCard from '../../Components/ItemCard';

const dateFormatter = new Intl.DateTimeFormat('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

function UpcomingCard({ event }) {
    const date = event.date
        ? dateFormatter.format(new Date(`${event.date}T00:00:00`))
        : 'Fecha por confirmar';

    return (
        <Link
            href={`/eventos/${event.id}`}
            className="group flex min-w-[290px] flex-1 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
        >
            <div className="h-28 w-32 shrink-0 overflow-hidden bg-violet-50">
                {event.image ? (
                    <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100">
                        <TicketIcon className="h-10 w-10 -rotate-12 text-violet-400" />
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1 p-4">
                <h3 className="truncate font-black text-slate-900">
                    {event.title}
                </h3>

                <p className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <CalendarDaysIcon className="h-4 w-4 shrink-0 text-violet-600" />
                    {date}
                </p>

                <p className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <MapPinIcon className="h-4 w-4 shrink-0 text-violet-600" />
                    <span className="truncate">{event.location}</span>
                </p>
            </div>
        </Link>
    );
}

function SectionTitle({ emoji, title, subtitle, showAll = true }) {
    return (
        <div className="mb-5 flex items-end justify-between gap-4">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 text-2xl" aria-hidden="true">
                    {emoji}
                </span>

                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        {title}
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                        {subtitle}
                    </p>
                </div>
            </div>

            {showAll && (
                <Link
                    href="/"
                    className="hidden shrink-0 text-sm font-black text-violet-700 transition hover:text-violet-900 sm:inline-flex"
                >
                    Ver todos →
                </Link>
            )}
        </div>
    );
}

export default function ItemList() {
    const { events } = usePage().props;
    const { data = [], meta = {}, links = {} } = events ?? {};

    /*
     * Por ahora usamos los primeros cuatro resultados como destacados.
     * Cuando quieras, después podemos cambiar esto para que el administrador
     * marque manualmente cuáles son destacados desde su panel.
     */
    const featuredEvents = data.slice(0, 4);
    const upcomingEvents = data.slice(4, 8);

    return (
        <div className="mt-9">
            <section aria-labelledby="featured-events-title">
                <div id="featured-events-title">
                    <SectionTitle
                        emoji="🔥"
                        title="Eventos destacados"
                        subtitle="No te pierdas los eventos que están marcando el momento."
                    />
                </div>

                {featuredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {featuredEvents.map((event) => (
                            <ItemCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-violet-200 bg-white p-8 text-center">
                        <TicketIcon className="mx-auto h-10 w-10 text-violet-400" />
                        <p className="mt-3 font-bold text-slate-700">
                            No hay eventos para mostrar.
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Cuando publiques un evento aparecerá aquí.
                        </p>
                    </div>
                )}
            </section>

            <section className="mt-10" aria-labelledby="upcoming-events-title">
                <div id="upcoming-events-title">
                    <SectionTitle
                        emoji="⭐"
                        title="Próximamente"
                        subtitle="Más eventos que te van a encantar."
                        showAll={data.length > 4}
                    />
                </div>

                {upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {upcomingEvents.map((event) => (
                            <UpcomingCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50 px-6 py-7">
                        <p className="font-black text-slate-800">
                            Muy pronto habrá más eventos ✨
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Los próximos eventos que publiques aparecerán en esta sección.
                        </p>
                    </div>
                )}
            </section>

            {meta?.last_page > 1 && (
                <nav
                    aria-label="Paginación de eventos"
                    className="mt-10 flex flex-wrap items-center justify-center gap-4"
                >
                    {links.prev && (
                        <Link
                            href={links.prev}
                            preserveScroll
                            className="rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-black text-violet-700 transition hover:bg-violet-50"
                        >
                            ← Anterior
                        </Link>
                    )}

                    <span className="rounded-xl bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700">
                        Página {meta.current_page} de {meta.last_page}
                    </span>

                    {links.next && (
                        <Link
                            href={links.next}
                            preserveScroll
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:from-violet-700 hover:to-indigo-700"
                        >
                            Siguiente →
                        </Link>
                    )}
                </nav>
            )}
        </div>
    );
}
