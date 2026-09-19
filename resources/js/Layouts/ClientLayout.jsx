import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    HomeIcon,
    MagnifyingGlassIcon,
    TicketIcon,
    HeartIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowRightOnRectangleIcon,
    ArrowUturnLeftIcon,
    ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import EventixHeader from '../Components/EventixHeader';

export default function ClientLayout({ children }) {
    const page = usePage();
    const {
        auth,
        favorites = {
            ids: [],
            items: [],
        },
    } = page.props;

    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('eventix-sidebar');
        setCollapsed(saved === 'collapsed');
    }, []);

    const toggleSidebar = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('eventix-sidebar', next ? 'collapsed' : 'expanded');
    };

    const user = auth?.user;
    const displayName =
        user?.name?.trim() ||
        [user?.nombre, user?.apellido].filter(Boolean).join(' ') ||
        'Invitado';

    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'CL';

    const currentPath = (page.url || '/').split('?')[0];

    const menu = [
        { name: 'Inicio', href: '/', icon: HomeIcon },
        { name: 'Explorar eventos', href: '/#eventos', icon: MagnifyingGlassIcon },
        { name: 'Mis entradas', href: '/mis-entradas', icon: TicketIcon },
        { name: 'Mis compras', href: '/mis-compras', icon: ReceiptPercentIcon },
        { name: 'Favoritos', href: user ? '/favoritos' : '/login', icon: HeartIcon },
        { name: 'Reembolsos', href: user ? '/mis-reembolsos' : '/login', icon: ArrowUturnLeftIcon },
    ];

    const favoritesCount = Array.isArray(favorites.ids) ? favorites.ids.length : 0;
    const favoriteItems = Array.isArray(favorites.items) ? favorites.items : [];

    const isActive = (item) => {
        if (item.name === 'Inicio') return currentPath === '/';
        if (item.name === 'Explorar eventos') return false;
        if (item.name === 'Mis entradas') return currentPath.startsWith('/mis-entradas');
        if (item.name === 'Mis compras') return currentPath.startsWith('/mis-compras');
        if (item.name === 'Favoritos') return currentPath.startsWith('/favoritos');
        if (item.name === 'Reembolsos') return currentPath.startsWith('/mis-reembolsos');
        return false;
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20">
            <EventixHeader />

            <aside
                className={`
                    fixed bottom-0 left-0 top-20 z-40
                    hidden overflow-y-auto
                    border-r border-slate-200 bg-white
                    shadow-sm transition-all duration-300
                    lg:block
                    ${collapsed ? 'w-24' : 'w-64'}
                `}
            >
                <div className="flex justify-end p-4">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-700 shadow-sm transition hover:bg-violet-50"
                        title={collapsed ? 'Mostrar menú' : 'Ocultar menú'}
                    >
                        {collapsed ? (
                            <ChevronRightIcon className="h-5 w-5" />
                        ) : (
                            <ChevronLeftIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>

                <div
                    className={`mx-4 mb-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-md ${
                        collapsed ? 'p-3' : 'p-5'
                    }`}
                >
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-black">
                            {initials}
                        </div>

                        {!collapsed && (
                            <div className="min-w-0">
                                <p className="text-xs text-violet-200">Bienvenido</p>
                                <p className="truncate font-bold">{displayName}</p>
                                {user?.email && (
                                    <p className="mt-1 truncate text-xs text-violet-200">
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <nav className="space-y-2 px-4">
                    {menu.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        const favoriteMenu = item.name === 'Favoritos';

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={collapsed ? item.name : undefined}
                                className={`
                                    flex items-center rounded-xl py-3 font-semibold transition
                                    ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}
                                    ${
                                        active
                                            ? favoriteMenu
                                                ? 'bg-pink-50 text-pink-600'
                                                : 'bg-violet-50 text-violet-700'
                                            : favoriteMenu
                                                ? 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
                                                : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                                    }
                                `}
                            >
                                <Icon className="h-5 w-5 shrink-0" />

                                {!collapsed && (
                                    <>
                                        <span className="text-sm">{item.name}</span>
                                        {favoriteMenu && user && favoritesCount > 0 && (
                                            <span className="ml-auto rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-black text-pink-600">
                                                {favoritesCount}
                                            </span>
                                        )}
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {!collapsed && user && (
                    <div className="mx-4 mt-6 border-t border-slate-100 pt-5">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                                Mis favoritos
                            </p>
                            <Link
                                href="/favoritos"
                                className="text-xs font-bold text-pink-600 hover:text-pink-700"
                            >
                                Ver todos
                            </Link>
                        </div>

                        {favoriteItems.length > 0 ? (
                            <div className="space-y-2">
                                {favoriteItems.map((event) => (
                                    <Link
                                        key={event.id}
                                        href={`/eventos/${event.id}`}
                                        className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-pink-50"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100">
                                            <HeartSolidIcon className="h-5 w-5 text-red-500" />
                                        </div>
                                        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-600 group-hover:text-pink-700">
                                            {event.title}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl bg-slate-50 p-4 text-center">
                                <HeartIcon className="mx-auto h-7 w-7 text-slate-300" />
                                <p className="mt-2 text-xs text-slate-400">
                                    Todavía no guardaste eventos.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {!collapsed && (
                    <div className="mx-4 mt-8 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
                        <TicketIcon className="h-7 w-7 -rotate-12 text-violet-600" />
                        <p className="mt-3 font-black text-violet-800">EVENTIX</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            Tus entradas siempre contigo. Guarda eventos, compra y presenta tu QR desde EVENTIX.
                        </p>
                    </div>
                )}

                {user && (
                    <div className="mt-6 border-t border-slate-100 p-4">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            title={collapsed ? 'Cerrar sesión' : undefined}
                            className={`flex w-full items-center rounded-xl py-3 font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 ${
                                collapsed ? 'justify-center px-2' : 'gap-3 px-4'
                            }`}
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span className="text-sm">Cerrar sesión</span>}
                        </Link>
                    </div>
                )}
            </aside>

            <main
                className={`min-w-0 transition-[margin] duration-300 ${
                    collapsed ? 'lg:ml-24' : 'lg:ml-64'
                }`}
            >
                {children}
            </main>
        </div>
    );
}
