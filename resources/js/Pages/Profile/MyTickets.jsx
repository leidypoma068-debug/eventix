import { Head, useForm, usePage } from '@inertiajs/react';

import {
    ArrowDownTrayIcon,
    ArrowPathIcon,
    CalendarDaysIcon,
    MapPinIcon,
    QrCodeIcon,
    TicketIcon,
} from '@heroicons/react/24/outline';

import ClientLayout from '../../Layouts/ClientLayout';

export default function MyTickets({ tickets }) {
    const flash = usePage().props.flash?.success;

    return (
        <>
            <Head title="Mis entradas" />

            <ClientLayout>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

                    {/* CABECERA */}

                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

                        <div>
                            <span className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-violet-700">
                                EVENTIX
                            </span>

                            <h1 className="mt-4 text-3xl font-black text-slate-900">
                                Mis entradas
                            </h1>

                            <p className="mt-2 text-slate-500">
                                Aquí tienes tus entradas digitales y códigos QR para ingresar a tus eventos.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 px-5 py-4 text-white shadow-lg">

                            <TicketIcon className="h-9 w-9 -rotate-12" />

                            <div>
                                <p className="text-xs text-violet-100">
                                    Total de entradas
                                </p>

                                <p className="text-2xl font-black">
                                    {tickets.length}
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* MENSAJE */}

                    {flash && (
                        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
                            {flash}
                        </div>
                    )}

                    {/* ENTRADAS */}

                    {tickets.length > 0 ? (

                        <div className="mt-8 grid gap-6 xl:grid-cols-2">

                            {tickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.id}
                                    ticket={ticket}
                                />
                            ))}

                        </div>

                    ) : (

                        <div className="mt-8 rounded-3xl border border-violet-100 bg-white p-12 text-center shadow-sm">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">

                                <TicketIcon className="h-10 w-10 -rotate-12 text-violet-600" />

                            </div>

                            <h2 className="mt-5 text-xl font-black text-slate-900">
                                Aún no tienes entradas
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Cuando compres una entrada aparecerá aquí junto con su código QR.
                            </p>

                        </div>

                    )}

                </div>

            </ClientLayout>
        </>
    );
}


function TicketCard({ ticket }) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        correo: '',
    });

    const isUsed = ticket.status === 'usada';
    const isTransferred = ticket.status === 'transferida';

    const statusClasses = isUsed
        ? 'bg-slate-100 text-slate-600'
        : isTransferred
            ? 'bg-amber-100 text-amber-700'
            : 'bg-green-100 text-green-700';

    const statusText = isUsed
        ? 'Utilizada'
        : isTransferred
            ? 'Transferida'
            : 'Vigente';

    const submitTransfer = (e) => {
        e.preventDefault();

        post(`/entradas/${ticket.id}/transferir`);
    };

    return (
        <article className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

            {/* CABECERA DE ENTRADA */}

            <div className="bg-gradient-to-r from-violet-600 to-indigo-700 px-6 py-5 text-white">

                <div className="flex items-start justify-between gap-4">

                    <div>

                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">
                            EVENTIX · Entrada digital
                        </p>

                        <h2 className="mt-2 text-2xl font-black">
                            {ticket.event.title}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-violet-100">
                            {ticket.type}
                        </p>

                    </div>

                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClasses}`}>
                        {statusText}
                    </span>

                </div>

            </div>

            <div className="grid md:grid-cols-[190px_1fr]">

                {/* QR */}

                <div className="flex flex-col items-center justify-center border-b border-violet-100 bg-violet-50/40 p-6 md:border-b-0 md:border-r">

                    <div className="rounded-2xl bg-white p-3 shadow-sm">

                        <img
                            src={ticket.qr_url}
                            alt={`QR entrada ${ticket.code}`}
                            className="h-40 w-40"
                        />

                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-violet-700">

                        <QrCodeIcon className="h-4 w-4" />

                        QR único

                    </div>

                    <p className="mt-2 break-all text-center font-mono text-[11px] text-slate-400">
                        {ticket.code}
                    </p>

                </div>

                {/* DATOS */}

                <div className="p-6">

                    <div className="space-y-4">

                        <InfoRow
                            icon={CalendarDaysIcon}
                            label="Fecha y hora"
                            value={`${ticket.event.date} · ${ticket.event.time} h`}
                        />

                        <InfoRow
                            icon={MapPinIcon}
                            label="Lugar"
                            value={ticket.event.location}
                        />

                    </div>

                    {/* ACCIONES */}

                    <div className="mt-6 flex flex-wrap gap-3">

                        <a
                            href={ticket.pdf_url}
                            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                        >

                            <ArrowDownTrayIcon className="h-5 w-5" />

                            Descargar entrada

                        </a>

                    </div>

                    {/* TRANSFERENCIA */}

                    {ticket.status === 'vigente' && (

                        <form
                            onSubmit={submitTransfer}
                            className="mt-6 border-t border-slate-100 pt-5"
                        >

                            <div className="flex items-center gap-2">

                                <ArrowPathIcon className="h-5 w-5 text-violet-600" />

                                <p className="text-sm font-black text-slate-800">
                                    Transferir entrada
                                </p>

                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                                El QR actual dejará de ser válido y se generará uno nuevo para el nuevo titular.
                            </p>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={data.correo}
                                    onChange={(e) =>
                                        setData(
                                            'correo',
                                            e.target.value
                                        )
                                    }
                                    className="min-w-0 flex-1 rounded-xl border-slate-200 text-sm focus:border-violet-400 focus:ring-violet-400"
                                />

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Transfiriendo...'
                                        : 'Transferir'}
                                </button>

                            </div>

                            {errors.correo && (
                                <p className="mt-2 text-sm font-semibold text-red-600">
                                    {errors.correo}
                                </p>
                            )}

                        </form>

                    )}

                </div>

            </div>

        </article>
    );
}


function InfoRow({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="flex gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">

                <Icon className="h-5 w-5 text-violet-700" />

            </div>

            <div>

                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {label}
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                    {value}
                </p>

            </div>

        </div>
    );
}