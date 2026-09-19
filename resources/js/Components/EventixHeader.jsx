import { Link, usePage } from '@inertiajs/react';
import { TicketIcon } from '@heroicons/react/24/outline';
import NotificationBell from './NotificationBell';

export default function EventixHeader() {
    const page = usePage();
    const { auth, clientNotifications = { items: [], unreadCount: 0 } } = page.props;
    const user = auth?.user;

    const displayName =
        user?.name?.trim() ||
        [user?.nombre, user?.apellido].filter(Boolean).join(' ') ||
        'Cliente EVENTIX';

    return (
        <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-violet-100 bg-white/95 shadow-sm backdrop-blur">
            <div className="flex h-full w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex shrink-0 items-center gap-3">
                    <TicketIcon className="h-10 w-10 -rotate-12 text-violet-600" />
                    <div>
                        <span className="block text-2xl font-extrabold leading-none text-violet-700">
                            EVENTIX
                        </span>
                        <span className="text-xs text-violet-600">Vive más eventos</span>
                    </div>
                </Link>

                <nav className="flex items-center gap-2 text-sm font-semibold text-slate-700 sm:gap-4">
                    {!user ? (
                        <Link
                            href="/login"
                            className="rounded-xl bg-violet-600 px-5 py-2.5 text-white shadow-sm transition hover:bg-violet-700"
                        >
                            Iniciar sesión
                        </Link>
                    ) : (
                        <>
                            {user?.role === 'cliente' && (
                                <NotificationBell data={clientNotifications} />
                            )}

                            {['administrador', 'subadministrador'].includes(user?.role) && (
                                <Link
                                    href="/admin"
                                    className="hidden hover:text-violet-600 md:inline"
                                >
                                    Administración
                                </Link>
                            )}

                            <span className="hidden max-w-56 truncate text-slate-500 xl:inline">
                                Hola, {displayName}
                            </span>

                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="rounded-xl border border-violet-200 px-4 py-2 text-violet-700 transition hover:bg-violet-50"
                            >
                                Salir
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
