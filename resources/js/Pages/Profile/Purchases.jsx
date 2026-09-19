import { Head, Link } from '@inertiajs/react';
import {
    BanknotesIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    MapPinIcon,
    ReceiptPercentIcon,
    TicketIcon,
} from '@heroicons/react/24/outline';
import ClientLayout from '../../Layouts/ClientLayout';

const money = (value) =>
    new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB',
        minimumFractionDigits: 2,
    }).format(Number(value || 0));

const toneClass = (tone) => ({
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
}[tone] || 'bg-slate-100 text-slate-600');

export default function Purchases({ purchases = [], totals = {} }) {
    return (
        <ClientLayout>
            <Head title="Mis compras" />

            <main className="mx-auto max-w-[1450px] px-4 py-8 sm:px-7 lg:px-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-500">
                            Historial del cliente
                        </p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            Mis compras
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Revisa pagos, entradas usadas, transferidas, reembolsadas y disponibles.
                        </p>
                    </div>

                    <Link
                        href="/mis-entradas"
                        className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow hover:bg-violet-700"
                    >
                        Ver mis entradas
                    </Link>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat icon={ReceiptPercentIcon} label="Compras" value={totals.purchases ?? 0} />
                    <Stat icon={BanknotesIcon} label="Total pagado" value={money(totals.spent)} />
                    <Stat icon={TicketIcon} label="Entradas compradas" value={totals.tickets ?? 0} />
                    <Stat icon={CheckCircleIcon} label="Entradas utilizadas" value={totals.used ?? 0} />
                </div>

                <div className="mt-8 space-y-6">
                    {purchases.map((purchase) => (
                        <article
                            key={purchase.id}
                            className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm"
                        >
                            <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
                                <div className="min-h-52 bg-violet-50">
                                    {purchase.event.image ? (
                                        <img
                                            src={purchase.event.image}
                                            alt={purchase.event.title}
                                            className="h-full min-h-52 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full min-h-52 items-center justify-center">
                                            <TicketIcon className="h-16 w-16 -rotate-12 text-violet-300" />
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 sm:p-7">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider text-violet-500">
                                                Compra #{purchase.id}
                                            </p>
                                            <h2 className="mt-1 text-2xl font-black text-slate-900">
                                                {purchase.event.title}
                                            </h2>

                                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-2">
                                                    <CalendarDaysIcon className="h-4 w-4 text-violet-600" />
                                                    {purchase.event.date} · {purchase.event.time}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <MapPinIcon className="h-4 w-4 text-violet-600" />
                                                    {purchase.event.location}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl bg-violet-50 px-5 py-4 text-right">
                                            <p className="text-xs font-black uppercase text-slate-400">Total pagado</p>
                                            <p className="mt-1 text-2xl font-black text-violet-700">
                                                {money(purchase.total)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        <Mini label="Disponibles" value={purchase.summary.available} />
                                        <Mini label="Usadas" value={purchase.summary.used} />
                                        <Mini label="Transferidas" value={purchase.summary.transferred} />
                                        <Mini label="Reembolsadas" value={purchase.summary.refunded} />
                                    </div>

                                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                                        <section className="rounded-2xl border border-slate-100 p-5">
                                            <h3 className="font-black text-slate-900">Detalle del pago</h3>
                                            <dl className="mt-4 space-y-3 text-sm">
                                                <Row label="Fecha de pago" value={purchase.paidAt || '—'} />
                                                <Row label="Método" value={purchase.method || '—'} />
                                                <Row label="Referencia" value={purchase.reference || '—'} />
                                                <Row label="Subtotal" value={money(purchase.subtotal)} />
                                                <Row label="Cargo EVENTIX" value={money(purchase.serviceFee)} />
                                                <Row label="Total" value={money(purchase.total)} strong />
                                            </dl>
                                        </section>

                                        <section className="rounded-2xl border border-slate-100 p-5">
                                            <h3 className="font-black text-slate-900">Estado de las entradas</h3>
                                            <div className="mt-4 space-y-3">
                                                {purchase.tickets.map((ticket) => (
                                                    <div
                                                        key={ticket.id}
                                                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-black text-slate-800">
                                                                {ticket.type}
                                                            </p>
                                                            <p className="truncate font-mono text-[11px] text-slate-400">
                                                                {ticket.code}
                                                            </p>
                                                        </div>
                                                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${toneClass(ticket.tone)}`}>
                                                            {ticket.statusLabel}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <Link
                                            href="/mis-entradas"
                                            className="rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-black text-violet-700"
                                        >
                                            Ver QR y entradas
                                        </Link>
                                        <Link
                                            href="/mis-reembolsos"
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600"
                                        >
                                            Revisar reembolsos
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}

                    {purchases.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-violet-200 bg-white p-10 text-center">
                            <TicketIcon className="mx-auto h-12 w-12 text-violet-300" />
                            <h2 className="mt-4 text-xl font-black text-slate-800">Todavía no tienes compras</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Cuando compres entradas, aquí aparecerá tu historial.
                            </p>
                            <Link
                                href="/#eventos"
                                className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white"
                            >
                                Explorar eventos
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </ClientLayout>
    );
}

function Stat({ icon: Icon, label, value }) {
    return (
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                    <Icon className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
                </div>
            </div>
        </div>
    );
}

function Mini({ label, value }) {
    return (
        <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-bold text-slate-400">{label}</p>
            <p className="mt-1 text-lg font-black text-slate-800">{value}</p>
        </div>
    );
}

function Row({ label, value, strong = false }) {
    return (
        <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{label}</dt>
            <dd className={strong ? 'font-black text-violet-700' : 'font-bold text-slate-800'}>
                {value}
            </dd>
        </div>
    );
}
