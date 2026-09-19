import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Badge, Card, PageTitle, money } from '../../Components/AdminUi';

export default function Refunds({ requests = [], purchases = [], ruleHours = 72 }) {
    const create = (purchase) => {
        const motivo = prompt('Motivo de la solicitud (opcional):', 'Solicitud del cliente');
        router.post(
            `/admin/reembolsos/compras/${purchase.id}`,
            { motivo: motivo || '' },
            { preserveScroll: true }
        );
    };

    const resolve = (refund, action) => {
        const note = prompt(`Observación para ${action}:`, '');
        router.patch(
            `/admin/reembolsos/${refund.id}`,
            { action, observacion_admin: note || '' },
            { preserveScroll: true }
        );
    };

    return (
        <AdminLayout>
            <Head title="Reembolsos" />

            <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
                <PageTitle
                    title="Reembolsos"
                    description={`Los reembolsos ahora se procesan por entrada individual. Regla: mínimo ${ruleHours} horas antes del evento.`}
                />

                <Card className="mt-6 p-6">
                    <h2 className="text-lg font-black">Compras con entradas elegibles</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        El sistema excluye automáticamente entradas usadas, transferidas, anuladas o ya incluidas en otro reembolso.
                    </p>

                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Compra</th>
                                    <th>Cliente</th>
                                    <th>Evento</th>
                                    <th>Fecha evento</th>
                                    <th>Total compra</th>
                                    <th>Entradas elegibles</th>
                                    <th>Monto elegible</th>
                                    <th>Tiempo</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map((purchase) => (
                                    <tr key={purchase.id} className="border-t">
                                        <td className="px-4 py-3 font-black">#{purchase.id}</td>
                                        <td>{purchase.customer}</td>
                                        <td>{purchase.event}</td>
                                        <td>{purchase.eventAt}</td>
                                        <td>{money(purchase.total)}</td>
                                        <td className="font-black">{purchase.eligibleTickets}</td>
                                        <td className="font-black text-violet-700">{money(purchase.refundableAmount)}</td>
                                        <td>
                                            <Badge tone={purchase.eligible ? 'green' : 'red'}>
                                                {purchase.eligible
                                                    ? `${purchase.hoursUntil} h · elegible`
                                                    : `${purchase.hoursUntil} h · no elegible`}
                                            </Badge>
                                        </td>
                                        <td>
                                            {purchase.eligible && (
                                                <button
                                                    onClick={() => create(purchase)}
                                                    className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-black text-white"
                                                >
                                                    Registrar solicitud
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card className="mt-6 overflow-hidden">
                    <div className="border-b p-6">
                        <h2 className="text-lg font-black">Solicitudes registradas</h2>
                        <p className="text-sm text-slate-500">
                            Aprobar anula únicamente las entradas incluidas en esa solicitud. Las usadas o transferidas nunca se anulan por un reembolso del comprador original.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-400">
                                <tr>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th>Evento</th>
                                    <th>Entradas</th>
                                    <th>Monto</th>
                                    <th>Motivo</th>
                                    <th>Estado</th>
                                    <th>Resolución</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((refund) => (
                                    <tr key={refund.id} className="border-t align-top">
                                        <td className="px-6 py-4">{refund.customer}</td>
                                        <td>{refund.event}</td>
                                        <td className="min-w-56 py-3">
                                            {refund.tickets?.length > 0 ? (
                                                <div className="space-y-2">
                                                    {refund.tickets.map((ticket) => (
                                                        <div key={ticket.id} className="rounded-lg bg-slate-50 px-3 py-2 text-xs">
                                                            <p className="font-black text-slate-700">{ticket.type}</p>
                                                            <p className="text-slate-400">{ticket.code}</p>
                                                            <p className="font-bold text-violet-700">{money(ticket.amount)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Badge tone="amber">Solicitud antigua</Badge>
                                            )}
                                        </td>
                                        <td className="font-black">{money(refund.amount)}</td>
                                        <td className="max-w-xs">{refund.reason || '—'}</td>
                                        <td>
                                            <Badge tone={refund.status === 'aprobado' ? 'green' : refund.status === 'rechazado' ? 'red' : 'amber'}>
                                                {refund.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            <p>{refund.resolvedBy || '—'}</p>
                                            <p className="text-xs text-slate-400">{refund.resolvedAt || refund.requestedAt}</p>
                                        </td>
                                        <td>
                                            {refund.status === 'pendiente' && refund.tickets?.length > 0 && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => resolve(refund, 'aprobar')}
                                                        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white"
                                                    >
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => resolve(refund, 'rechazar')}
                                                        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-white"
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            )}
                                        </td>
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
