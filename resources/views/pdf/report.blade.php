<!doctype html>
<html lang="es"><head><meta charset="utf-8"><style>
body{font-family:DejaVu Sans,sans-serif;color:#172033;font-size:12px}.head{background:#5b45ff;color:#fff;padding:18px;border-radius:10px}.brand{font-size:26px;font-weight:bold}.muted{color:#64748b}table{width:100%;border-collapse:collapse;margin-top:18px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#eef2ff}.totals{margin-top:18px;width:48%;margin-left:auto}.totals td{border:none;border-bottom:1px solid #eee}.net{font-size:15px;font-weight:bold;color:#4c1d95}
</style></head><body>
<div class="head"><div class="brand">EVENTIX</div><div>Reporte ejecutivo por evento</div></div>
<h1>{{ $event->nombre }}</h1>
<p>{{ $event->fecha_evento->format('d/m/Y') }} · {{ substr($event->hora_inicio,0,5) }} · {{ $event->ubicacion }}</p>
<p><b>Responsable/publicador:</b> {{ $event->publisher ? trim($event->publisher->nombre.' '.$event->publisher->apellido) : 'Sin asignar' }}</p>
<table><thead><tr><th>Tipo de entrada</th><th>Vendidas</th><th>Precio</th><th>Ingreso estimado</th></tr></thead><tbody>
@foreach($rows as $r)<tr><td>{{ $r['name'] }}</td><td>{{ $r['qty'] }}</td><td>Bs {{ number_format($r['price'],2) }}</td><td>Bs {{ number_format($r['income'],2) }}</td></tr>@endforeach
</tbody></table>
<table class="totals"><tr><td>Ventas cobradas</td><td>Bs {{ number_format($total,2) }}</td></tr><tr><td>Cargos por servicio</td><td>Bs {{ number_format($serviceFees,2) }}</td></tr><tr><td>Reembolsos aprobados</td><td>- Bs {{ number_format($refunds,2) }}</td></tr><tr class="net"><td>Ingreso neto</td><td>Bs {{ number_format($net,2) }}</td></tr></table>
<p class="muted">Documento generado por EVENTIX. Los reembolsos de esta versión académica se registran en el sistema; la devolución monetaria real depende de la pasarela de pago.</p>
</body></html>