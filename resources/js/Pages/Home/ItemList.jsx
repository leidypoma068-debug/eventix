import { Link, usePage } from '@inertiajs/react';
import ItemCard from '../../Components/ItemCard';

export default function ItemList() {
    const { events } = usePage().props;
    const { data, meta, links } = events;

    return (
        <section
            className="mt-6"
            aria-labelledby="event-results-title"
        >
            <h2
                id="event-results-title"
                className="mb-4 text-sm font-bold text-slate-900"
            >
                Resultados ({meta.total}{' '}
                {meta.total === 1 ? 'evento' : 'eventos'})
            </h2>

            {data.length > 0 ? (
                <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {data.map((event) => (
                        <ItemCard
                            key={event.id}
                            event={event}
                        />
                    ))}
                </div>
            ) : (
                <p className="rounded-xl border border-primary-100 bg-white p-6 text-sm text-slate-600">
                    No hay eventos para mostrar.
                </p>
            )}

            {meta.last_page > 1 && (
                <nav
                    aria-label="Paginación de eventos"
                    className="mt-6 flex flex-wrap items-center justify-center gap-4"
                >
                    {links.prev && (
                        <Link
                            href={links.prev}
                            preserveScroll
                            className="btn btn-primary"
                        >
                            Anterior
                        </Link>
                    )}

                    <span className="text-sm text-slate-600">
                        Página {meta.current_page} de {meta.last_page}
                    </span>

                    {links.next && (
                        <Link
                            href={links.next}
                            preserveScroll
                            className="btn btn-primary"
                        >
                            Siguiente
                        </Link>
                    )}
                </nav>
            )}
        </section>
    );
}