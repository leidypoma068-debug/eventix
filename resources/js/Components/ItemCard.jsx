import {
    CalendarDaysIcon,
    MapPinIcon,
    TicketIcon,
} from '@heroicons/react/24/outline';

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
    const date = dateFormatter.format(
        new Date(`${event.date}T00:00:00`)
    );

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-xl border border-primary-100 bg-white shadow-sm">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-primary-50">
                {event.image ? (
                    <img
                        src={event.image}
                        alt={event.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <TicketIcon
                        className="h-16 w-16 -rotate-12 text-primary-400"
                        aria-hidden="true"
                    />
                )}

                {event.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white">
                        {event.category.name}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <h3 className="text-base font-bold leading-snug text-slate-900">
                    {event.title}
                </h3>

                <div className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
                    <div className="flex items-start gap-2">
                        <CalendarDaysIcon
                            className="mt-0.5 h-4 w-4 shrink-0 text-primary-600"
                            aria-hidden="true"
                        />

                        <time dateTime={`${event.date}T${event.time}`}>
                            {date} · {event.time} h
                        </time>
                    </div>

                    <div className="flex items-start gap-2">
                        <MapPinIcon
                            className="mt-0.5 h-4 w-4 shrink-0 text-primary-600"
                            aria-hidden="true"
                        />

                        <span>{event.location}</span>
                    </div>
                </div>

                <div className="mt-auto pt-4">
                    {event.price != null ? (
                        <p className="text-sm font-semibold text-primary-800">
                            Desde{' '}
                            <span className="font-bold">
                                Bs {priceFormatter.format(Number(event.price))}
                            </span>
                        </p>
                    ) : (
                        <p className="text-sm text-slate-500">
                            Precio no disponible
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}