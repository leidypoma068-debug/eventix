import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    BellIcon,
    CheckIcon,
    BanknotesIcon,
    ArrowUturnLeftIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

function NotificationIcon({ type }) {
    if (type === 'evento_cancelado') {
        return (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                <XCircleIcon className="h-5 w-5" />
            </div>
        );
    }

    if (type === 'venta_realizada') {
        return (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <BanknotesIcon className="h-5 w-5" />
            </div>
        );
    }

    return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <ArrowUturnLeftIcon className="h-5 w-5" />
        </div>
    );
}

export default function NotificationBell({ data = { items: [], unreadCount: 0 } }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const items = Array.isArray(data?.items) ? data.items : [];
    const unreadCount = Number(data?.unreadCount || 0);

    useEffect(() => {
        const close = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const openNotification = (notification) => {
        router.patch(
            `/notificaciones/${notification.id}/leer`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setOpen(false);
                    if (notification.url) {
                        router.visit(notification.url);
                    }
                },
            }
        );
    };

    const readAll = () => {
        router.patch(
            '/notificaciones/leer-todas',
            {},
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                title="Notificaciones"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-black leading-4 text-white shadow">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-14 z-[90] w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <p className="font-black text-slate-900">Notificaciones</p>
                            <p className="text-xs text-slate-400">
                                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={readAll}
                                className="inline-flex items-center gap-1 text-xs font-black text-violet-700 hover:text-violet-900"
                            >
                                <CheckIcon className="h-4 w-4" />
                                Marcar leídas
                            </button>
                        )}
                    </div>

                    <div className="max-h-[430px] overflow-y-auto">
                        {items.length === 0 ? (
                            <div className="p-8 text-center">
                                <BellIcon className="mx-auto h-10 w-10 text-slate-200" />
                                <p className="mt-3 text-sm font-bold text-slate-500">Aún no tienes notificaciones.</p>
                            </div>
                        ) : (
                            items.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => openNotification(notification)}
                                    className={`flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-violet-50 ${
                                        notification.read ? 'bg-white' : 'bg-violet-50/60'
                                    }`}
                                >
                                    <NotificationIcon type={notification.type} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start gap-2">
                                            <p className="flex-1 text-sm font-black text-slate-800">
                                                {notification.title}
                                            </p>
                                            {!notification.read && (
                                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-600" />
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                            {notification.message}
                                        </p>
                                        <p className="mt-2 text-[11px] font-semibold text-slate-400">
                                            {notification.createdAt}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
