import { Head, Link, router } from '@inertiajs/react';
import {
    BanknotesIcon,
    CalendarDaysIcon,
    CheckBadgeIcon,
    ClipboardDocumentCheckIcon,
    ClockIcon,
    CurrencyDollarIcon,
    QrCodeIcon,
    TicketIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../Layouts/AdminLayout';

const money = (value) =>
    new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB',
        minimumFractionDigits: 2,
    }).format(Number(value || 0));

export default function MyDashboard({
    profile = {},
    metrics = {},
    permissions = [],
    nextEvents = [],
    tasks = [],
    recentActivity = [],
}) {
    return (
        <AdminLayout>
            <Head title="Mi panel de trabajo" />

            <main className="mx-auto max-w-[1600px] p-5 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-500">
                            Panel personal
                        </p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                            Mi panel de trabajo
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {profile.name} · {profile.position}
                            {profile.employeeNumber ? ` · ${profile.employeeNumber}` : ''}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/admin/eventos" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow hover:bg-violet-700">
                            Mis eventos
                        </Link>
                        <Link href="/admin/validar" className="rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-black text-violet-700">
                            Validar QR
                        </Link>
                    </div>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat icon={CalendarDaysIcon} label="Mis eventos" value={metrics.events ?? 0} note={`${metrics.published ?? 0} publicados · ${metrics.upcoming ?? 0} próximos`} />
                    <Stat icon={TicketIcon} label="Entradas generadas" value={metrics.tickets ?? 0} note={`${metrics.usedTickets ?? 0} utilizadas`} />
                    <Stat icon={BanknotesIcon} label="Ventas" value={metrics.sales ?? 0} note={`Ingresos: ${money(metrics.revenue)}`} />
                    <Stat icon={CurrencyDollarIcon} label="Mi comisión" value={money(metrics.commission)} note={`${Number(profile.commissionRate || 0).toFixed(2)}% configurado`} />
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <Section title="Próximos eventos" icon={ClockIcon}>
                        <div className="space-y-3">
                            {nextEvents.length ? nextEvents.map((event) => (
                                <div key={event.id} className="rounded-2xl border border-slate-100 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-black text-slate-800">{event.title}</p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {event.date} · {event.time} · {event.location}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                                            {event.status}
                                        </span>
                                    </div>
                                </div>
                            )) : <Empty text="No tienes próximos eventos asignados." />}
                        </div>
                    </Section>

                    <Section title="Mis permisos" icon={CheckBadgeIcon}>
                        <div className="flex flex-wrap gap-2">
                            {permissions.map((permission) => (
                                <span
                                    key={permission.key}
                                    className={`rounded-full px-3 py-2 text-xs font-black ${
                                        permission.enabled
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-slate-100 text-slate-400 line-through'
                                    }`}
                                >
                                    {permission.enabled ? '✓ ' : '× '}
                                    {permission.label}
                                </span>
                            ))}
                        </div>
                    </Section>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                    <Section title={`Mis tareas (${metrics.pendingTasks ?? 0} pendientes)`} icon={ClipboardDocumentCheckIcon}>
                        <div className="space-y-3">
                            {tasks.length ? tasks.map((task) => (
                                <div key={task.id} className="rounded-2xl border border-slate-100 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-black text-slate-800">{task.title}</p>
                                            {task.description && <p className="mt-1 text-xs text-slate-500">{task.description}</p>}
                                            {task.due && <p className="mt-2 text-xs font-bold text-amber-600">Vence: {task.due}</p>}
                                        </div>

                                        <select
                                            defaultValue={task.status}
                                            onChange={(e) =>
                                                router.patch(
                                                    `/admin/tareas/${task.id}`,
                                                    { estado: e.target.value },
                                                    { preserveScroll: true }
                                                )
                                            }
                                            className="rounded-xl border-slate-200 text-xs font-bold"
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="en_progreso">En progreso</option>
                                            <option value="completada">Completada</option>
                                        </select>
                                    </div>
                                </div>
                            )) : <Empty text="No tienes tareas pendientes." />}
                        </div>
                    </Section>

                    <Section title="Mi actividad reciente" icon={QrCodeIcon}>
                        <div className="space-y-3">
                            {recentActivity.length ? recentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{activity.action}</p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {activity.entity || 'sistema'} · {activity.date}
                                        </p>
                                    </div>
                                </div>
                            )) : <Empty text="Todavía no tienes actividad registrada." />}
                        </div>
                    </Section>
                </div>
            </main>
        </AdminLayout>
    );
}

function Stat({ icon: Icon, label, value, note }) {
    return (
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                    <Icon className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
                    <p className="mt-1 text-xs text-slate-500">{note}</p>
                </div>
            </div>
        </div>
    );
}

function Section({ title, icon: Icon, children }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                    <Icon className="h-5 w-5 text-violet-600" />
                </div>
                <h2 className="text-lg font-black text-slate-900">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function Empty({ text }) {
    return <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">{text}</p>;
}
