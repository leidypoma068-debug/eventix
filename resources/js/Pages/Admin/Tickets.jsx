import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    CalendarDaysIcon,
    MapPinIcon,
    PhotoIcon,
    TicketIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../Layouts/AdminLayout';
import { Badge, Card, PageTitle } from '../../Components/AdminUi';

export default function Tickets({ tickets = [] }) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const filtered = useMemo(
        () => tickets.filter((ticket) => {
            const text = `${ticket.code} ${ticket.event} ${ticket.type} ${ticket.holder} ${ticket.email}`.toLowerCase();
            return (!status || ticket.status === status) && text.includes(search.toLowerCase());
        }),
        [tickets, search, status]
    );

    return (
        <AdminLayout>
            <Head title="Entradas" />

            <div className="mx-auto max-w-[1600px] p-5 sm:p-8">
                <PageTitle
                    title="Entradas emitidas"
                    description="Consulta el evento, imagen, titular, tipo de entrada, código, estado y validación."
                />

                <Card className="mt-6 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar código, evento, titular..."
                            className="flex-1 rounded-xl border-slate-200"
                        />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-xl border-slate-200"
                        >
                            <option value="">Todos los estados</option>
                            <option value="vigente">Vigente</option>
                            <option value="usada">Usada</option>
                            <option value="transferida">Transferida</option>
                            <option value="anulada">Anulada</option>
                        </select>
                    </div>
                </Card>

                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    {filtered.map((ticket) => (
                        <Card key={ticket.id} className="overflow-hidden">
                            <div className="grid sm:grid-cols-[180px_1fr]">
                                {ticket.eventImage ? (
                                    <img
                                        src={ticket.eventImage}
                                        alt={ticket.event || 'Evento'}
                                        className="h-full min-h-44 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex min-h-44 items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100">
                                        <PhotoIcon className="h-14 w-14 text-violet-400" />
                                    </div>
                                )}

                                <div className="p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider text-violet-500">
                                                {ticket.type || 'Entrada'}
                                            </p>
                                            <h3 className="mt-1 text-lg font-black text-slate-900">
                                                {ticket.event || 'Evento'}
                                            </h3>
                                        </div>

                                        <Badge
                                            tone={
                                                ticket.status === 'vigente'
                                                    ? 'green'
                                                    : ticket.status === 'usada'
                                                        ? 'violet'
                                                        : ticket.status === 'anulada'
                                                            ? 'red'
                                                            : 'amber'
                                            }
                                        >
                                            {ticket.status}
                                        </Badge>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                                        <p className="flex items-center gap-2">
                                            <TicketIcon className="h-5 w-5 text-violet-600" />
                                            <span className="font-mono text-xs font-black text-violet-700">{ticket.code}</span>
                                        </p>
                                        {(ticket.eventDate || ticket.eventTime) && (
                                            <p className="flex items-center gap-2">
                                                <CalendarDaysIcon className="h-5 w-5 text-violet-600" />
                                                {ticket.eventDate || '—'} {ticket.eventTime ? `· ${ticket.eventTime} h` : ''}
                                            </p>
                                        )}
                                        {ticket.eventLocation && (
                                            <p className="flex items-center gap-2">
                                                <MapPinIcon className="h-5 w-5 text-violet-600" />
                                                {ticket.eventLocation}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Titular</p>
                                            <p className="mt-1 font-bold text-slate-800">{ticket.holder || '—'}</p>
                                            <p className="text-xs text-slate-400">{ticket.email || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Validación</p>
                                            <p className="mt-1 font-semibold text-slate-700">{ticket.usedAt || 'Aún no utilizada'}</p>
                                            <p className="text-xs text-slate-400">Emitida: {ticket.createdAt || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {!filtered.length && (
                    <Card className="mt-5 p-8 text-center text-sm text-slate-400">
                        No hay entradas con esos filtros.
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
