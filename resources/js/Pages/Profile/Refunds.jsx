import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ArrowUturnLeftIcon,
    CalendarDaysIcon,
    ClockIcon,
    MapPinIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    TicketIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import ClientLayout from '../../Layouts/ClientLayout';

const money = (value) => `Bs ${Number(value || 0).toFixed(2)}`;

function StatusBadge({ status }) {
    const classes = {
        pendiente: 'bg-amber-100 text-amber-700',
        aprobado: 'bg-emerald-100 text-emerald-700',
        rechazado: 'bg-red-100 text-red-700',
    };

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${classes[status] || 'bg-slate-100 text-slate-600'}`}>
            {status}
        </span>
    );
}

function TicketState({ ticket }) {
    const classes = ticket.eligible
        ? 'bg-emerald-100 text-emerald-700'
        : ticket.statusLabel === 'Usada'
          ? 'bg-red-100 text-red-700'
          : ticket.statusLabel === 'Transferida'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-slate-100 text-slate-600';

    return (
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${classes}`}>
            {ticket.statusLabel}
        </span>
    );
}

function RefundForm({ purchase, onClose }) {
    const eligibleIds = purchase.tickets.filter((ticket) => ticket.eligible).map((ticket) => ticket.id);
    const form = useForm({ motivo: '', ticket_ids: eligibleIds });

    const toggleTicket = (id) => {
        const selected = form.data.ticket_ids.includes(id);
        form.setData(
            'ticket_ids',
            selected
                ? form.data.ticket_ids.filter((ticketId) => ticketId !== id)
                : [...form.data.ticket_ids, id]
        );
    };

    const selectedAmount = purchase.tickets
        .filter((ticket) => form.data.ticket_ids.includes(ticket.id))
        .reduce((sum, ticket) => sum + Number(ticket.price || 0), 0);

    const submit = (event) => {
        event.preventDefault();
        form.post(`/mis-reembolsos/${purchase.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <form onSubmit={submit} className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-5">
            <div className="flex items-center gap-2">
                <TicketIcon className="h-5 w-5 text-violet-700" />
                <h3 className="font-black text-violet-950">Selecciona las entradas a reembolsar</h3>
            </div>

            <div className="mt-4 space-y-3">
                {purchase.tickets.filter((ticket) => ticket.eligible).map((ticket) => (
                    <label
                        key={ticket.id}
                        className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-violet-200 bg-white p-4"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <input
                                type="checkbox"
                                checked={form.data.ticket_ids.includes(ticket.id)}
                                onChange={() => toggleTicket(ticket.id)}
                                className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                            />
                            <div className="min-w-0">
                                <p className="font-black text-slate-800">{ticket.type}</p>
                                <p className="truncate text-xs text-slate-400">{ticket.code}</p>
                            </div>
                        </div>
                        <p className="font-black text-violet-700">{money(ticket.price)}</p>
                    </label>
                ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                <div>
                    <p className="text-xs font-bold uppercase text-slate-400">Monto elegible seleccionado</p>
                    <p className="text-xl font-black text-violet-700">{money(selectedAmount)}</p>
                </div>
                <p className="max-w-sm text-xs text-slate-500">
                    El cargo por servicio no forma parte del monto reembolsable.
                </p>
            </div>

            <label className="mt-5 block text-sm font-black text-violet-900">Cuéntanos el motivo del reembolso</label>
            <textarea
                rows="4"
                value={form.data.motivo}
                onChange={(e) => form.setData('motivo', e.target.value)}
                placeholder="Ejemplo: no podré asistir al evento por un cambio de horario..."
                className="mt-2 w-full rounded-xl border-violet-200 bg-white text-sm focus:border-violet-500 focus:ring-violet-500"
            />

            {form.errors.ticket_ids && <p className="mt-2 text-sm font-bold text-red-600">{form.errors.ticket_ids}</p>}
            {form.errors.motivo && <p className="mt-2 text-sm font-bold text-red-600">{form.errors.motivo}</p>}
            {form.errors.refund && <p className="mt-2 text-sm font-bold text-red-600">{form.errors.refund}</p>}

            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    disabled={form.processing || form.data.ticket_ids.length === 0}
                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-black text-white shadow transition hover:bg-violet-700 disabled:opacity-50"
                >
                    {form.processing ? 'Enviando...' : 'Enviar solicitud'}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}

function EligibilitySummary({ purchase }) {
    const { summary } = purchase;

    if (!purchase.withinTime) {
        return (
            <div className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
                <ExclamationTriangleIcon className="h-6 w-6 shrink-0 text-red-600" />
                <div>
                    <p className="font-black text-red-900">Fuera del plazo de reembolso</p>
                    <p className="mt-1 text-sm text-red-700">Faltan menos de 72 horas para el evento.</p>
                </div>
            </div>
        );
    }

    if (summary.eligible === 0) {
        return (
            <div className="mt-5 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <ExclamationTriangleIcon className="h-6 w-6 shrink-0 text-slate-500" />
                <div>
                    <p className="font-black text-slate-800">No tienes entradas disponibles para reembolso</p>
                    <p className="mt-1 text-sm text-slate-500">Las entradas usadas, transferidas, anuladas o ya incluidas en otro reembolso no pueden volver a solicitarse.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex gap-3">
                <CheckCircleIcon className="h-6 w-6 shrink-0 text-emerald-600" />
                <div>
                    <p className="font-black text-emerald-900">
                        Tienes {summary.eligible} {summary.eligible === 1 ? 'entrada disponible' : 'entradas disponibles'} para reembolso
                    </p>
                    <p className="mt-1 text-sm text-emerald-700">
                        De {summary.total} {summary.total === 1 ? 'entrada comprada' : 'entradas compradas'},
                        {summary.used > 0 ? ` ${summary.used} ${summary.used === 1 ? 'ya fue utilizada' : 'ya fueron utilizadas'}` : ''}
                        {summary.used > 0 && summary.transferred > 0 ? ' y' : ''}
                        {summary.transferred > 0 ? ` ${summary.transferred} ${summary.transferred === 1 ? 'fue transferida' : 'fueron transferidas'}` : ''}.
                        {' '}Solo puedes solicitar las que todavía te pertenecen y están vigentes.
                    </p>
                </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white px-4 py-3">
                    <p className="text-xs font-bold uppercase text-slate-400">Monto original de compra</p>
                    <p className="mt-1 font-black text-slate-800">{money(purchase.total)}</p>
                </div>
                <div className="rounded-xl bg-white px-4 py-3">
                    <p className="text-xs font-bold uppercase text-slate-400">Monto actualmente elegible</p>
                    <p className="mt-1 font-black text-emerald-700">{money(summary.refundableAmount)}</p>
                </div>
            </div>
        </div>
    );
}

export default function Refunds({ purchases = [], ruleHours = 72 }) {
    const [requesting, setRequesting] = useState(null);

    const pendingCount = useMemo(
        () => purchases.reduce(
            (count, purchase) => count + (purchase.refunds || []).filter((refund) => refund.status === 'pendiente').length,
            0
        ),
        [purchases]
    );

    return (
        <ClientLayout>
            <Head title="Mis reembolsos" />

            <div className="mx-auto max-w-6xl p-5 sm:p-8">
                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                                    <ArrowUturnLeftIcon className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-violet-100">EVENTIX</p>
                                    <h1 className="text-3xl font-black">Mis reembolsos</h1>
                                </div>
                            </div>
                            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-violet-100">
                                Puedes solicitar reembolso con al menos {ruleHours} horas de anticipación. EVENTIX revisa cada entrada de forma individual.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-center backdrop-blur">
                            <p className="text-3xl font-black">{pendingCount}</p>
                            <p className="text-xs font-bold text-violet-100">Solicitudes pendientes</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex gap-3">
                        <ShieldCheckIcon className="h-6 w-6 shrink-0 text-amber-600" />
                        <div>
                            <p className="font-black text-amber-900">Reembolso por entrada</p>
                            <p className="mt-1 text-sm text-amber-800">
                                Una entrada usada no se reembolsa. Una entrada transferida ya pertenece al nuevo titular. Solo se reembolsan entradas vigentes que todavía estén en tu cuenta. El cargo por servicio no se devuelve.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-7 space-y-5">
                    {purchases.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                            <ArrowUturnLeftIcon className="mx-auto h-12 w-12 text-slate-200" />
                            <p className="mt-4 text-lg font-black text-slate-700">No tienes compras disponibles para reembolso.</p>
                        </div>
                    ) : (
                        purchases.map((purchase) => {
                            const activeForm = requesting === purchase.id;

                            return (
                                <article key={purchase.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                    <div className="grid lg:grid-cols-[240px_1fr]">
                                        <div className="min-h-52 bg-gradient-to-br from-violet-100 to-indigo-100">
                                            {purchase.event?.image ? (
                                                <img src={purchase.event.image} alt={purchase.event.title} className="h-full min-h-52 w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full min-h-52 items-center justify-center">
                                                    <ArrowUturnLeftIcon className="h-16 w-16 text-violet-300" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6">
                                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-wider text-violet-500">Compra #{purchase.id}</p>
                                                    <h2 className="mt-1 text-2xl font-black text-slate-900">{purchase.event?.title}</h2>

                                                    <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
                                                        <span className="flex items-center gap-2"><CalendarDaysIcon className="h-5 w-5 text-violet-500" />{purchase.event?.date}</span>
                                                        <span className="flex items-center gap-2"><ClockIcon className="h-5 w-5 text-violet-500" />{purchase.event?.time}</span>
                                                        <span className="flex items-center gap-2"><MapPinIcon className="h-5 w-5 text-violet-500" />{purchase.event?.location}</span>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl bg-slate-50 px-5 py-4 text-right">
                                                    <p className="text-xs font-bold uppercase text-slate-400">Monto de compra</p>
                                                    <p className="mt-1 text-2xl font-black text-violet-700">{money(purchase.total)}</p>
                                                </div>
                                            </div>

                                            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                                                <div className="border-b bg-slate-50 px-5 py-3">
                                                    <p className="text-sm font-black text-slate-800">Estado de tus entradas</p>
                                                </div>
                                                <div className="divide-y">
                                                    {purchase.tickets.map((ticket) => (
                                                        <div key={ticket.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <p className="font-black text-slate-800">{ticket.type}</p>
                                                                    <TicketState ticket={ticket} />
                                                                </div>
                                                                <p className="mt-1 text-xs text-slate-400">{ticket.code}</p>
                                                                {ticket.reason && <p className="mt-1 text-xs font-semibold text-slate-500">{ticket.reason}</p>}
                                                            </div>
                                                            <p className="font-black text-slate-700">{money(ticket.price)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <EligibilitySummary purchase={purchase} />

                                            {(purchase.refunds || []).map((refund) => (
                                                <div key={refund.id} className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            {refund.status === 'aprobado' ? (
                                                                <CheckCircleIcon className="h-7 w-7 text-emerald-600" />
                                                            ) : refund.status === 'rechazado' ? (
                                                                <XCircleIcon className="h-7 w-7 text-red-600" />
                                                            ) : (
                                                                <ClockIcon className="h-7 w-7 text-amber-600" />
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-black text-slate-800">Solicitud de reembolso #{refund.id}</p>
                                                                <p className="text-xs text-slate-400">Solicitada: {refund.requestedAt}</p>
                                                            </div>
                                                        </div>
                                                        <StatusBadge status={refund.status} />
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {(refund.tickets || []).map((ticket) => (
                                                            <span key={ticket.id} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-600">
                                                                {ticket.type} · {ticket.code} · {money(ticket.amount)}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="mt-4 flex items-center gap-2 text-sm">
                                                        <span className="font-black text-slate-700">Monto solicitado:</span>
                                                        <span className="font-black text-violet-700">{money(refund.amount)}</span>
                                                    </div>
                                                    <p className="mt-2 text-sm text-slate-600"><span className="font-black">Motivo:</span> {refund.reason}</p>
                                                    {refund.adminNote && <p className="mt-2 text-sm text-slate-600"><span className="font-black">Respuesta del administrador:</span> {refund.adminNote}</p>}
                                                    {refund.resolvedAt && <p className="mt-2 text-xs text-slate-400">Resuelto: {refund.resolvedAt}</p>}
                                                </div>
                                            ))}

                                            {purchase.canRequest && (
                                                <div className="mt-5 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRequesting(activeForm ? null : purchase.id)}
                                                        className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow transition hover:bg-violet-700"
                                                    >
                                                        {activeForm ? 'Cerrar solicitud' : 'Pedir reembolso'}
                                                        {!activeForm && <ArrowRightIcon className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            )}

                                            {activeForm && purchase.canRequest && (
                                                <RefundForm purchase={purchase} onClose={() => setRequesting(null)} />
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}
