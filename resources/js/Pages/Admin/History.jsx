import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ArchiveBoxIcon,
    BanknotesIcon,
    CalendarDaysIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    DocumentArrowDownIcon,
    MagnifyingGlassIcon,
    TicketIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../Layouts/AdminLayout';
import { Badge, Card, PageTitle, money } from '../../Components/AdminUi';

export default function History({ events = [], categories = [] }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [period, setPeriod] = useState('');
    const [status, setStatus] = useState('');
    const [openEvent, setOpenEvent] = useState(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return events.filter((event) => {
            const matchesSearch = !q || `${event.title} ${event.category} ${event.location} ${event.publisher}`.toLowerCase().includes(q);
            const matchesCategory = !category || String(event.categoryId) === String(category);
            const matchesPeriod = !period || event.period === period;
            const matchesStatus = !status || event.status === status;
            return matchesSearch && matchesCategory && matchesPeriod && matchesStatus;
        });
    }, [events, search, category, period, status]);

    const totals = useMemo(() => filtered.reduce((acc, event) => ({
        tickets: acc.tickets + Number(event.tickets || 0),
        purchases: acc.purchases + Number(event.purchasesCount || 0),
        income: acc.income + Number(event.income || 0),
        refunds: acc.refunds + Number(event.refunds || 0),
    }), { tickets: 0, purchases: 0, income: 0, refunds: 0 }), [filtered]);

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (period) params.set('period', period);
    if (status) params.set('status', status);
    const generalPdf = `/admin/historial/pdf${params.toString() ? `?${params.toString()}` : ''}`;

    return (
        <AdminLayout>
            <Head title="Historial de eventos" />
            <div className="mx-auto max-w-[1700px] p-5 sm:p-8">
                <PageTitle
                    title="Historial de eventos"
                    description="Consulta eventos actuales y pasados, quién compró cada entrada, método de pago, códigos, validaciones, ingresos y reembolsos. Puedes verlo aquí o descargarlo en PDF."
                    actions={
                        <a href={generalPdf} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-violet-700">
                            <DocumentArrowDownIcon className="h-5 w-5" />Descargar historial filtrado
                        </a>
                    }
                />

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Summary icon={CalendarDaysIcon} label="Eventos encontrados" value={filtered.length} />
                    <Summary icon={TicketIcon} label="Entradas emitidas" value={totals.tickets} />
                    <Summary icon={ArchiveBoxIcon} label="Compras registradas" value={totals.purchases} />
                    <Summary icon={BanknotesIcon} label="Ingresos pagados" value={money(totals.income)} note={`Reembolsos: ${money(totals.refunds)}`} />
                </div>

                <Card className="mt-6 p-5">
                    <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
                        <label className="relative block">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar evento, lugar, categoría o responsable..." className="w-full rounded-xl border-slate-200 pl-11" />
                        </label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border-slate-200">
                            <option value="">Todas las categorías</option>
                            {categories.map((item) => <option key={item.id_categoria} value={item.id_categoria}>{item.nombre}</option>)}
                        </select>
                        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-xl border-slate-200">
                            <option value="">Todos los periodos</option>
                            <option value="actual">Eventos actuales / próximos</option>
                            <option value="pasado">Eventos que ya pasaron</option>
                        </select>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border-slate-200">
                            <option value="">Todos los estados</option>
                            <option value="publicado">Publicado</option>
                            <option value="programado">Programado</option>
                            <option value="borrador">Borrador</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                </Card>

                <div className="mt-6 space-y-5">
                    {filtered.map((event) => {
                        const expanded = openEvent === event.id;
                        return (
                            <Card key={event.id} className="overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge tone={event.period === 'pasado' ? 'blue' : 'green'}>{event.period === 'pasado' ? 'Evento pasado' : 'Actual / próximo'}</Badge>
                                                <Badge tone={tone(event.status)}>{event.status}</Badge>
                                                {event.deleted && <Badge tone="red">Eliminado de interfaces</Badge>}
                                            </div>
                                            <h2 className="mt-3 text-2xl font-black text-slate-900">{event.title}</h2>
                                            <p className="mt-1 text-sm text-slate-500">{event.category} · {event.displayDate} · {event.time}{event.endTime ? ` - ${event.endTime}` : ''} · {event.location}</p>
                                            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600"><UserIcon className="h-4 w-4 text-violet-600" />Responsable: {event.publisher}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <a href={`/admin/historial/eventos/${event.id}/pdf`} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-black text-violet-700 hover:bg-violet-100">
                                                <DocumentArrowDownIcon className="h-4 w-4" />Descargar este evento
                                            </a>
                                            <button type="button" onClick={() => setOpenEvent(expanded ? null : event.id)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white">
                                                {expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                                                {expanded ? 'Ocultar detalles' : 'Ver detalles en la web'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                                        <Mini label="Aforo" value={event.capacity} />
                                        <Mini label="Entradas" value={event.tickets} />
                                        <Mini label="Usadas" value={event.usedTickets} />
                                        <Mini label="Anuladas" value={event.annulledTickets} />
                                        <Mini label="Compras pagadas" value={event.paidPurchases} />
                                        <Mini label="Ingresos" value={money(event.income)} />
                                        <Mini label="Reembolsos" value={money(event.refunds)} />
                                    </div>
                                </div>

                                {expanded && (
                                    <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6">
                                        <h3 className="text-lg font-black text-slate-900">Compras y entradas del evento</h3>
                                        <p className="mt-1 text-sm text-slate-500">Se muestra el cliente, forma de pago, referencia, monto y cada entrada asociada con su estado de validación.</p>

                                        <div className="mt-5 space-y-4">
                                            {event.purchases.length ? event.purchases.map((purchase) => (
                                                <div key={purchase.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                                    <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-2 xl:grid-cols-6">
                                                        <Cell label={`Compra #${purchase.id}`} value={purchase.customer} sub={purchase.email || purchase.phone || 'Sin contacto'} />
                                                        <Cell label="Método de pago" value={purchase.method} sub={`Ref: ${purchase.reference}`} />
                                                        <Cell label="Fecha / hora" value={purchase.date || '—'} />
                                                        <Cell label="Entradas" value={purchase.ticketCount} />
                                                        <Cell label="Cargo servicio" value={money(purchase.fee)} />
                                                        <Cell label="Total" value={money(purchase.total)} sub={purchase.status} strong />
                                                    </div>

                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-400">
                                                                <tr><th className="px-4 py-3">Código</th><th>Tipo</th><th>Titular</th><th>Correo</th><th>Estado</th><th>Validada</th></tr>
                                                            </thead>
                                                            <tbody>
                                                                {purchase.tickets.map((ticket) => (
                                                                    <tr key={ticket.id} className="border-t border-slate-100">
                                                                        <td className="px-4 py-3 font-mono text-xs font-black text-violet-700">{ticket.code}</td>
                                                                        <td className="font-semibold">{ticket.type || '—'}</td>
                                                                        <td>{ticket.holder || purchase.customer}</td>
                                                                        <td className="text-slate-500">{ticket.email || purchase.email || '—'}</td>
                                                                        <td><Badge tone={ticket.status === 'usada' ? 'violet' : ticket.status === 'anulada' ? 'red' : 'green'}>{ticket.status}</Badge></td>
                                                                        <td>{ticket.usedAt || '—'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        {!purchase.tickets.length && <p className="p-4 text-sm text-slate-400">Esta compra no tiene entradas asociadas.</p>}
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">Este evento todavía no tiene compras registradas.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}

                    {!filtered.length && <Card className="p-10 text-center text-sm text-slate-400">No hay eventos que coincidan con los filtros.</Card>}
                </div>
            </div>
        </AdminLayout>
    );
}

function Summary({ icon: Icon, label, value, note }) {
    return <Card className="p-5"><div className="flex items-center gap-4"><div className="rounded-2xl bg-violet-100 p-3"><Icon className="h-6 w-6 text-violet-700" /></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p>{note && <p className="mt-1 text-xs text-slate-400">{note}</p>}</div></div></Card>;
}
function Mini({ label, value }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-bold uppercase text-slate-400">{label}</p><p className="mt-1 font-black text-slate-800">{value}</p></div>; }
function Cell({ label, value, sub, strong = false }) { return <div><p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-1 ${strong ? 'text-lg font-black text-violet-700' : 'font-bold text-slate-800'}`}>{value}</p>{sub && <p className="mt-1 truncate text-xs text-slate-400">{sub}</p>}</div>; }
function tone(status) { return status === 'publicado' ? 'green' : status === 'programado' ? 'blue' : status === 'cancelado' ? 'red' : 'amber'; }
