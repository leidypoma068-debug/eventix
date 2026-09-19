import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarDaysIcon,
    MapPinIcon,
    TicketIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import EventixHeader from '../../Components/EventixHeader';
import ClientLayout from '../../Layouts/ClientLayout';

const df = new Intl.DateTimeFormat('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const pf = new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

function DetailsContent({ event, user }) {
    const date = df.format(new Date(`${event.date}T00:00:00`));

    return (
        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
            <Link
                href="/"
                className="mb-5 inline-flex items-center text-sm font-semibold text-violet-600 transition hover:text-violet-800"
            >
                ← Volver a eventos
            </Link>

            <div className="grid gap-6 lg:grid-cols-3">
                <article className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm lg:col-span-2">
                    <div className="flex aspect-video items-center justify-center overflow-hidden bg-violet-50">
                        {event.image ? (
                            <img
                                src={event.image}
                                alt={event.title}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <TicketIcon className="h-24 w-24 -rotate-12 text-violet-300" />
                        )}
                    </div>

                    <div className="p-6">
                        {event.category && (
                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                {event.category.name}
                            </span>
                        )}

                        <h1 className="mt-3 text-3xl font-extrabold text-slate-950">
                            {event.title}
                        </h1>

                        <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                            <p className="flex gap-2">
                                <CalendarDaysIcon className="h-5 w-5 shrink-0 text-violet-600" />
                                {date} · {event.time} h
                            </p>
                            <p className="flex gap-2">
                                <MapPinIcon className="h-5 w-5 shrink-0 text-violet-600" />
                                {event.location}
                            </p>
                        </div>

                        <section className="mt-6 border-t border-violet-100 pt-6">
                            <h2 className="font-bold text-slate-900">Acerca del evento</h2>
                            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                                {event.description}
                            </p>
                        </section>
                    </div>
                </article>

                <aside className="h-fit rounded-2xl border border-violet-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <TicketIcon className="h-5 w-5 text-violet-600" />
                        Selecciona tus entradas
                    </h2>

                    <div className="mt-4 divide-y divide-violet-100">
                        {(event.ticketTypes ?? []).map((ticket) => (
                            <div key={ticket.id} className="py-4">
                                <div className="flex justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-900">{ticket.name}</p>
                                        <p className="text-xs text-slate-500">
                                            Disponible: {ticket.available}
                                        </p>
                                    </div>
                                    <p className="font-bold text-violet-700">
                                        Bs {pf.format(Number(ticket.price))}
                                    </p>
                                </div>
                                {ticket.description && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        {ticket.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 rounded-xl bg-violet-50 p-3 text-xs text-violet-800">
                        <ShieldCheckIcon className="mb-1 h-5 w-5" />
                        Compra segura, entrada digital y QR único.
                    </div>

                    <Link
                        href={user ? `/checkout/${event.id}` : '/login'}
                        className="mt-5 flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-3 font-bold text-white shadow-sm transition hover:bg-violet-700"
                    >
                        {user ? 'Comprar entradas' : 'Inicia sesión para comprar'}
                    </Link>
                </aside>
            </div>
        </main>
    );
}

export default function EventDetails({ event }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const role = user?.role ?? user?.rol ?? null;
    const isClient = Boolean(user) && role === 'cliente';

    return (
        <>
            <Head title={event.title} />

            {isClient ? (
                <ClientLayout>
                    <div className="min-h-[calc(100vh-80px)] bg-slate-50">
                        <DetailsContent event={event} user={user} />
                    </div>
                </ClientLayout>
            ) : (
                <div className="min-h-screen bg-slate-50 pt-20">
                    <EventixHeader />
                    <DetailsContent event={event} user={user} />
                </div>
            )}
        </>
    );
}
