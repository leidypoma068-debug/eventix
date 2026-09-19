import { Head, Link, usePage } from '@inertiajs/react';
import { HeartIcon, TicketIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import ClientLayout from '../../Layouts/ClientLayout';
import ItemCard from '../../Components/ItemCard';

export default function Favorites({ events = [] }) {
    const { flash } = usePage().props;

    return (
        <>
            <Head title="Favoritos" />

            <ClientLayout>
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-pink-700">
                                <HeartSolidIcon className="h-4 w-4 text-red-500" />
                                EVENTIX
                            </span>

                            <h1 className="mt-4 text-3xl font-black text-slate-900">
                                Mis favoritos
                            </h1>

                            <p className="mt-2 text-slate-500">
                                Aquí aparecen los eventos que guardaste con el corazón.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-4 text-white shadow-lg">
                            <HeartSolidIcon className="h-9 w-9" />
                            <div>
                                <p className="text-xs text-pink-100">Eventos guardados</p>
                                <p className="text-2xl font-black">{events.length}</p>
                            </div>
                        </div>
                    </div>

                    {flash?.success && (
                        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
                            {flash.success}
                        </div>
                    )}

                    {events.length > 0 ? (
                        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {events.map((event) => (
                                <ItemCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-8 rounded-3xl border border-violet-100 bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
                                <HeartIcon className="h-10 w-10 text-pink-600" />
                            </div>

                            <h2 className="mt-5 text-xl font-black text-slate-900">
                                Todavía no tienes favoritos
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Presiona el corazón de cualquier evento y aparecerá aquí.
                            </p>

                            <Link
                                href="/#eventos"
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700"
                            >
                                <TicketIcon className="h-5 w-5" />
                                Explorar eventos
                            </Link>
                        </div>
                    )}
                </div>
            </ClientLayout>
        </>
    );
}
