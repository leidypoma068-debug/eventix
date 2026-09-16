import { Head, Link } from '@inertiajs/react';
import { TicketIcon } from '@heroicons/react/24/outline';
import Search from './Search';

export default function Home() {
    return (
        <>
            <Head title="Eventos" />

            <div className="min-h-screen bg-background">
                <header className="border-b border-primary-100 bg-white">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-4 sm:px-6">
                        <Link
                            href="/"
                            className="flex items-center gap-3"
                            aria-label="EVENTIX, inicio"
                        >
                            <TicketIcon
                                className="h-10 w-10 -rotate-12 text-primary-600"
                                aria-hidden="true"
                            />

                            <div>
                                <span className="block text-2xl font-extrabold leading-none text-primary-700">
                                    EVENTIX
                                </span>

                                <span className="mt-1 block text-xs text-primary-700">
                                    Vive más eventos
                                </span>
                            </div>
                        </Link>

                        <nav aria-label="Navegación principal">
                            <Link
                                href="/"
                                aria-current="page"
                                className="border-b-2 border-primary-600 pb-2 text-sm font-semibold text-primary-600"
                            >
                                Eventos
                            </Link>
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                    <section
                        aria-labelledby="titulo-inicio"
                        className="rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 via-white to-primary-100 p-6 sm:p-8"
                    >
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1
                                    id="titulo-inicio"
                                    className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
                                >
                                    Descubre eventos increíbles
                                </h1>

                                <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
                                    Conciertos, festivales, teatro, deportes y más.
                                    Vive más eventos con EVENTIX.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-primary-700">
                                <TicketIcon
                                    className="h-16 w-16 shrink-0 -rotate-12 text-primary-600"
                                    aria-hidden="true"
                                />

                                <p className="text-sm font-medium leading-relaxed">
                                    Eventos reales.
                                    <br />
                                    Experiencias inolvidables.
                                </p>
                            </div>
                        </div>
                    </section>
                    <Search />
                </main>

            </div>
        </>
    );
}