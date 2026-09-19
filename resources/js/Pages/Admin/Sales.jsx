import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Badge, Card, PageTitle, money } from '../../Components/AdminUi';

export default function Sales({ sales = [] }) {
    const [search, setSearch] = useState('');

    const rows = useMemo(
        () => sales.filter((sale) =>
            `${sale.customer} ${sale.email} ${sale.event} ${sale.publisher} ${sale.reference}`
                .toLowerCase()
                .includes(search.toLowerCase())
        ),
        [sales, search]
    );

    const paidRows = rows.filter((sale) => sale.status === 'pagada');
    const total = paidRows.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const fees = paidRows.reduce((sum, sale) => sum + Number(sale.fee || 0), 0);
    const tickets = paidRows.reduce((sum, sale) => sum + Number(sale.ticketCount || 0), 0);

    return (
        <AdminLayout>
            <Head title="Informe de ventas" />

            <div className="mx-auto max-w-[1600px] p-5 sm:p-8">
                <PageTitle
                    title="Informe de ventas"
                    description="Aquí queda el detalle de cada venta: cliente, evento, responsable, cantidad de entradas, comisión, total y hora de compra."
                />

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <Card className="p-5">
                        <p className="text-sm text-slate-500">Entradas vendidas</p>
                        <p className="mt-2 text-3xl font-black text-indigo-700">{tickets}</p>
                    </Card>
                    <Card className="p-5">
                        <p className="text-sm text-slate-500">Total cobrado</p>
                        <p className="mt-2 text-3xl font-black text-violet-700">{money(total)}</p>
                    </Card>
                    <Card className="p-5">
                        <p className="text-sm text-slate-500">Comisión / cargos por servicio</p>
                        <p className="mt-2 text-3xl font-black text-emerald-600">{money(fees)}</p>
                    </Card>
                </div>

                <Card className="mt-5 p-5">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border-slate-200"
                        placeholder="Buscar cliente, evento, trabajador o referencia..."
                    />
                </Card>

                <Card className="mt-5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1250px] text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
                                <tr>
                                    <th className="px-6 py-4">Compra</th>
                                    <th>Cliente</th>
                                    <th>Evento</th>
                                    <th>Responsable</th>
                                    <th>Entradas</th>
                                    <th>Método</th>
                                    <th>Subtotal</th>
                                    <th>Comisión</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Fecha y hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((sale) => (
                                    <tr key={sale.id} className="border-t border-slate-100">
                                        <td className="px-6 py-4 font-black text-violet-700">#{sale.id}</td>
                                        <td>
                                            <p className="font-bold">{sale.customer}</p>
                                            <p className="text-xs text-slate-400">{sale.email}</p>
                                        </td>
                                        <td className="font-semibold">{sale.event}</td>
                                        <td>{sale.publisher}</td>
                                        <td>
                                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">
                                                {sale.ticketCount || 0}
                                            </span>
                                        </td>
                                        <td>{sale.method}</td>
                                        <td>{money(sale.subtotal)}</td>
                                        <td className="font-bold text-emerald-600">{money(sale.fee)}</td>
                                        <td className="font-black">{money(sale.total)}</td>
                                        <td>
                                            <Badge tone={sale.status === 'pagada' ? 'green' : sale.status === 'rechazada' ? 'red' : 'amber'}>
                                                {sale.status}
                                            </Badge>
                                        </td>
                                        <td>{sale.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
