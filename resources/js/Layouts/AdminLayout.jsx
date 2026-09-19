import { useEffect, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import NotificationBell from '../Components/NotificationBell';
import {
    HomeIcon,
    CalendarDaysIcon,
    TicketIcon,
    BanknotesIcon,
    QrCodeIcon,
    DocumentChartBarIcon,
    ChartBarIcon,
    UsersIcon,
    UserGroupIcon,
    ArchiveBoxIcon,
    ArrowUturnLeftIcon,
    UserCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowRightOnRectangleIcon,
    ClipboardDocumentCheckIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const allItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, permission: 'dashboard.view' },
    { name: 'Eventos', href: '/admin/eventos', icon: CalendarDaysIcon, permission: 'events.view' },
    { name: 'Entradas', href: '/admin/entradas', icon: TicketIcon, permission: 'tickets.view' },
    { name: 'Stock y aforo', href: '/admin/stock', icon: ArchiveBoxIcon, permission: 'stock.view' },
    { name: 'Informe de ventas', href: '/admin/ventas', icon: BanknotesIcon, permission: 'sales.view' },
    { name: 'Validación QR', href: '/admin/validar', icon: QrCodeIcon, permission: 'qr.validate' },
    { name: 'Reportes', href: '/admin/reportes', icon: DocumentChartBarIcon, permission: 'reports.view' },
    { name: 'Analítica', href: '/admin/analitica', icon: ChartBarIcon, permission: 'analytics.view' },
    { name: 'Clientes', href: '/admin/clientes', icon: UsersIcon, permission: 'clients.view' },
    { name: 'Empleados', href: '/admin/empleados', icon: UserGroupIcon, adminOnly: true },
    { name: 'Reembolsos', href: '/admin/reembolsos', icon: ArrowUturnLeftIcon, adminOnly: true },
    { name: 'Auditoría', href: '/admin/auditoria', icon: ShieldCheckIcon, adminOnly: true },
    { name: 'Mi perfil', href: '/admin/perfil', icon: UserCircleIcon },
];

export default function AdminLayout({ children }) {
    const { adminContext = {}, adminNotifications = { items: [], unreadCount: 0 } } = usePage().props;
    const profile = adminContext.profile || {};
    const isMainAdmin = Boolean(adminContext.isMainAdmin);
    const permissions = adminContext.permissions || [];
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        setCollapsed(localStorage.getItem('eventix-admin-sidebar') === 'collapsed');
    }, []);

    const can = (permission) => isMainAdmin || permissions.includes('*') || !permission || permissions.includes(permission);

    const menu = useMemo(
        () =>
            allItems
                .map((item) =>
                    item.name === 'Dashboard' && !isMainAdmin
                        ? { ...item, name: 'Mi panel', href: '/admin/mi-panel' }
                        : item
                )
                .filter((item) => (!item.adminOnly || isMainAdmin) && can(item.permission)),
        [isMainAdmin, permissions]
    );

    const toggleSidebar = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('eventix-admin-sidebar', next ? 'collapsed' : 'expanded');
    };

    const path = window.location.pathname;
    const initials = (profile.name || 'AD').split(/\s+/).filter(Boolean).slice(0, 2).map((v) => v[0]).join('').toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
                <div className="flex h-full items-center justify-between gap-4 px-5 sm:px-7">
                    <Link href={isMainAdmin ? "/admin" : "/admin/mi-panel"} className="flex shrink-0 items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg">
                            <TicketIcon className="h-7 w-7 -rotate-12" />
                        </div>
                        <div>
                            <p className="text-xl font-black leading-none text-violet-700">EVENTIX</p>
                            <p className="mt-1 text-xs font-semibold text-slate-400">Centro de administración</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <NotificationBell data={adminNotifications} />

                        <Link href="/admin/perfil" className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-violet-50">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-black text-slate-800">{profile.name || 'Administrador EVENTIX'}</p>
                                <p className="text-xs text-slate-400">{profile.position || (isMainAdmin ? 'Administrador' : 'Subadministrador')}</p>
                            </div>
                            {profile.photo ? (
                                <img src={profile.photo} alt="Perfil" className="h-11 w-11 rounded-full object-cover ring-2 ring-violet-100" />
                            ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 font-black text-violet-700">{initials}</div>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            <aside className={`fixed bottom-0 left-0 top-20 z-40 hidden overflow-y-auto bg-gradient-to-b from-slate-950 via-indigo-950 to-violet-950 text-white shadow-2xl transition-all duration-300 lg:block ${collapsed ? 'w-24' : 'w-64'}`}>
                <div className="flex justify-end p-4">
                    <button type="button" onClick={toggleSidebar} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20" title={collapsed ? 'Mostrar menú' : 'Ocultar menú'}>
                        {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
                    </button>
                </div>

                <div className={`mx-4 mb-5 rounded-2xl border border-white/10 bg-white/10 ${collapsed ? 'p-3' : 'p-4'}`}>
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                        {profile.photo ? <img src={profile.photo} alt="Perfil" className="h-11 w-11 rounded-full object-cover" /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-500 font-black">{initials}</div>}
                        {!collapsed && <div className="min-w-0"><p className="text-xs text-violet-200">{isMainAdmin ? 'Administrador principal' : 'Subadministrador'}</p><p className="truncate text-sm font-black">{profile.name}</p><p className="truncate text-[11px] text-violet-300">{profile.employeeNumber || profile.email}</p></div>}
                    </div>
                </div>

                <nav className="space-y-1 px-4">
                    {menu.map((item) => {
                        const Icon = item.icon;
                        const active = item.href === '/admin' ? path === '/admin' : path.startsWith(item.href);
                        return (
                            <Link key={item.name} href={item.href} title={collapsed ? item.name : undefined} className={`flex items-center rounded-xl py-3 text-sm font-bold transition ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'} ${active ? 'bg-violet-600 text-white shadow-lg' : 'text-violet-100 hover:bg-white/10'}`}>
                                <Icon className="h-5 w-5 shrink-0" />
                                {!collapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {!collapsed && (
                    <div className="mx-4 mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <ClipboardDocumentCheckIcon className="h-7 w-7 text-violet-300" />
                        <p className="mt-3 text-sm font-black">Control EVENTIX</p>
                        <p className="mt-1 text-xs leading-relaxed text-violet-200">Publicación programada, stock, ventas, QR, reportes y trazabilidad por trabajador.</p>
                    </div>
                )}

                <div className="mt-6 border-t border-white/10 p-4">
                    <Link href="/logout" method="post" as="button" title={collapsed ? 'Cerrar sesión' : undefined} className={`flex w-full items-center rounded-xl py-3 text-sm font-bold text-violet-100 transition hover:bg-red-500/20 hover:text-red-200 ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}>
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        {!collapsed && <span>Cerrar sesión</span>}
                    </Link>
                </div>
            </aside>

            <main className={`min-h-screen pt-20 transition-all duration-300 ${collapsed ? 'lg:ml-24' : 'lg:ml-64'}`}>
                {children}
            </main>
        </div>
    );
}
