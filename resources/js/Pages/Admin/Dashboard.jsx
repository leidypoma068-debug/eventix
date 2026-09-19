import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CalendarDaysIcon, TicketIcon, BanknotesIcon, UsersIcon, CurrencyDollarIcon,
    ArrowTrendingUpIcon, ClipboardDocumentCheckIcon, QrCodeIcon, UserGroupIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../Layouts/AdminLayout';
import { Badge, Card, PageTitle, Progress, StatCard, money } from '../../Components/AdminUi';

export default function Dashboard({ metrics, sales7Days = [], ticketTypes = [], staffLeaderboard = [], recentActivity = [], tasks = [] }) {
    const { adminContext = {} } = usePage().props;
    const isMainAdmin = Boolean(adminContext.isMainAdmin);
    const maxSales = Math.max(...sales7Days.map((d) => d.count), 1);
    const totalTypes = ticketTypes.reduce((s, t) => s + Number(t.count || 0), 0) || 1;

    return (
        <AdminLayout>
            <Head title="Dashboard administrativo" />
            <div className="mx-auto max-w-[1600px] p-5 sm:p-8">
                <PageTitle title="Dashboard" description="Resumen general de EVENTIX con ventas, aforo, comisiones, actividad y rendimiento del equipo." actions={<><Link href="/admin/eventos" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow hover:bg-violet-700">Gestionar eventos</Link><Link href="/admin/historial" className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-black text-violet-700"><ClockIcon className="h-5 w-5"/>Historial</Link><Link href="/admin/validar" className="rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-black text-violet-700">Validar QR</Link></>} />

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={CalendarDaysIcon} label="Eventos" value={metrics.events} note={`${metrics.published} publicados`} />
                    <StatCard icon={TicketIcon} label="Entradas generadas" value={metrics.tickets} note={`${metrics.usedTickets} utilizadas`} />
                    <StatCard icon={BanknotesIcon} label="Ingresos cobrados" value={money(metrics.income)} note={`Cargos por servicio: ${money(metrics.serviceFees)}`} />
                    <StatCard icon={CurrencyDollarIcon} label="Ingreso neto" value={money(metrics.netIncome)} note={`Reembolsos: ${money(metrics.refunds)}`} />
                </div>

                <div className="mt-6 grid gap-6 2xl:grid-cols-[1.45fr_0.9fr]">
                    <Card className="p-6">
                        <div className="flex items-start justify-between"><div><h2 className="text-lg font-black text-slate-900">Ventas de entradas · últimos 7 días</h2><p className="text-sm text-slate-500">Cantidad de compras pagadas por día.</p></div><ArrowTrendingUpIcon className="h-6 w-6 text-violet-600" /></div>
                        <div className="mt-8 flex h-64 items-end gap-3">
                            {sales7Days.map((d) => <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-black text-violet-700">{d.count}</span><div className="w-full rounded-t-xl bg-gradient-to-t from-violet-700 to-violet-400" style={{height:`${Math.max(12,(d.count/maxSales)*180)}px`}} title={money(d.income)} /><span className="text-xs font-bold capitalize text-slate-400">{d.label}</span></div>)}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-lg font-black text-slate-900">Tipos de entrada</h2><p className="text-sm text-slate-500">Distribución de entradas emitidas.</p>
                        <div className="mt-6 space-y-4">{ticketTypes.length ? ticketTypes.map((t, i) => { const pct = Math.round((t.count/totalTypes)*100); return <div key={`${t.label}-${i}`}><div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-bold text-slate-700">{t.label}</span><span className="font-black text-violet-700">{t.count} · {pct}%</span></div><Progress value={pct} /></div> }) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-400">Todavía no hay entradas vendidas.</p>}</div>
                    </Card>
                </div>

                {isMainAdmin && <Card className="mt-6 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 p-6"><div><h2 className="text-lg font-black text-slate-900">Rendimiento del equipo</h2><p className="text-sm text-slate-500">Ordenado por entradas asociadas a los eventos publicados por cada trabajador.</p></div><Link href="/admin/empleados" className="text-sm font-black text-violet-600">Ver empleados</Link></div>
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-400"><tr><th className="px-6 py-4">#</th><th>Trabajador</th><th>Eventos</th><th>Entradas</th><th>Ventas</th><th>Ingresos</th><th>Comisión</th></tr></thead><tbody>{staffLeaderboard.map((s, i) => <tr key={s.id} className="border-t border-slate-100"><td className="px-6 py-4"><span className={`flex h-8 w-8 items-center justify-center rounded-full font-black ${i===0?'bg-amber-100 text-amber-700':i===1?'bg-slate-200 text-slate-700':i===2?'bg-orange-100 text-orange-700':'bg-violet-50 text-violet-700'}`}>{i+1}</span></td><td className="py-4"><div className="flex items-center gap-3">{s.photo?<img src={s.photo} className="h-9 w-9 rounded-full object-cover"/>:<div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 font-black text-violet-700">{s.name.slice(0,1)}</div>}<div><p className="font-black text-slate-800">{s.name}</p><p className="text-xs text-slate-400">{s.position}</p></div></div></td><td>{s.events}</td><td className="font-black text-violet-700">{s.tickets}</td><td>{s.sales}</td><td>{money(s.revenue)}</td><td>{money(s.commission)}</td></tr>)}</tbody></table></div>
                </Card>}

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                    <Card className="p-6"><div className="flex items-center gap-3"><ClipboardDocumentCheckIcon className="h-6 w-6 text-violet-600"/><h2 className="text-lg font-black text-slate-900">Mis tareas</h2></div><div className="mt-5 space-y-3">{tasks.length ? tasks.map((t)=><TaskRow key={t.id} task={t}/>) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">No tienes tareas asignadas.</p>}</div></Card>
                    <Card className="p-6"><div className="flex items-center gap-3"><UserGroupIcon className="h-6 w-6 text-violet-600"/><h2 className="text-lg font-black text-slate-900">Actividad reciente</h2></div><div className="mt-5 space-y-3">{recentActivity.length ? recentActivity.map((a)=><div key={a.id} className="flex gap-3 rounded-xl border border-slate-100 p-3"><div className="mt-1 h-2 w-2 rounded-full bg-violet-500"/><div><p className="text-sm font-bold text-slate-700">{a.action}</p><p className="text-xs text-slate-400">{a.user} · {a.date}</p></div></div>) : <p className="text-sm text-slate-400">Sin actividad registrada.</p>}</div></Card>
                </div>
            </div>
        </AdminLayout>
    );
}

function TaskRow({ task }) {
    const tone = task.priority === 'alta' ? 'red' : task.priority === 'media' ? 'amber' : 'blue';
    return <div className="rounded-2xl border border-slate-100 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><p className="font-black text-slate-800">{task.title}</p><Badge tone={tone}>{task.priority}</Badge></div>{task.due && <p className="mt-1 text-xs text-slate-400">Vence: {task.due}</p>}</div><select defaultValue={task.status} onChange={(e)=>router.patch(`/admin/tareas/${task.id}`,{estado:e.target.value},{preserveScroll:true})} className="rounded-xl border-slate-200 text-xs font-bold"><option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completada">Completada</option></select></div></div>;
}
