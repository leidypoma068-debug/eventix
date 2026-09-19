import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    FunnelIcon,
    MagnifyingGlassIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Audit({
    activities = { data: [], links: [] },
    users = [],
    entities = [],
    filters = {},
}) {
    const { data, setData } = useForm({
        search: filters.search || '',
        user: filters.user ? String(filters.user) : '',
        entity: filters.entity || '',
        date: filters.date || '',
    });

    const apply = (e) => {
        e.preventDefault();

        router.get(
            '/admin/auditoria',
            {
                search: data.search || undefined,
                user: data.user || undefined,
                entity: data.entity || undefined,
                date: data.date || undefined,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clear = () => router.get('/admin/auditoria', {}, { replace: true });

    return (
        <AdminLayout>
            <Head title="Auditoría" />

            <main className="mx-auto max-w-[1600px] p-5 sm:p-8">
                <div className="flex items-end gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
                        <ShieldCheckIcon className="h-7 w-7 text-violet-700" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-500">
                            Trazabilidad
                        </p>
                        <h1 className="text-3xl font-black text-slate-900">Auditoría del sistema</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Revisa quién hizo cada acción, cuándo y sobre qué módulo.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={apply}
                    className="mt-7 grid gap-3 rounded-3xl border border-violet-100 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5"
                >
                    <div className="relative xl:col-span-2">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-500" />
                        <input
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            placeholder="Buscar acción, usuario o módulo..."
                            className="h-12 w-full rounded-xl border-slate-200 pl-11 pr-4 text-sm"
                        />
                    </div>

                    <select
                        value={data.user}
                        onChange={(e) => setData('user', e.target.value)}
                        className="h-12 rounded-xl border-slate-200 text-sm"
                    >
                        <option value="">Todos los usuarios</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>

                    <select
                        value={data.entity}
                        onChange={(e) => setData('entity', e.target.value)}
                        className="h-12 rounded-xl border-slate-200 text-sm"
                    >
                        <option value="">Todos los módulos</option>
                        {entities.map((entity) => (
                            <option key={entity} value={entity}>{entity}</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={data.date}
                        onChange={(e) => setData('date', e.target.value)}
                        className="h-12 rounded-xl border-slate-200 text-sm"
                    />

                    <div className="flex gap-3 xl:col-span-5">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white"
                        >
                            <FunnelIcon className="h-4 w-4" />
                            Aplicar filtros
                        </button>
                        <button
                            type="button"
                            onClick={clear}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600"
                        >
                            Limpiar
                        </button>
                    </div>
                </form>

                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-sm">
                            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-5 py-4">Fecha</th>
                                    <th className="px-5 py-4">Usuario</th>
                                    <th className="px-5 py-4">Acción</th>
                                    <th className="px-5 py-4">Módulo</th>
                                    <th className="px-5 py-4">ID</th>
                                    <th className="px-5 py-4">IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.data?.map((activity) => (
                                    <tr key={activity.id} className="border-t border-slate-100">
                                        <td className="px-5 py-4 text-slate-500">{activity.date}</td>
                                        <td className="px-5 py-4">
                                            <p className="font-black text-slate-800">{activity.user.name}</p>
                                            <p className="text-xs text-slate-400">{activity.user.role || 'sistema'}</p>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-700">{activity.action}</td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                                                {activity.entity}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">{activity.entityId ?? '—'}</td>
                                        <td className="px-5 py-4 font-mono text-xs text-slate-400">{activity.ip || '—'}</td>
                                    </tr>
                                ))}

                                {!activities.data?.length && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            No se encontraron actividades con esos filtros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {activities.links?.length > 3 && (
                        <div className="flex flex-wrap justify-center gap-2 border-t border-slate-100 p-4">
                            {activities.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveScroll
                                        className={`rounded-lg px-3 py-2 text-xs font-black ${
                                            link.active
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-700'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-300"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </main>
        </AdminLayout>
    );
}
