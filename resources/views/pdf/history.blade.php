<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>{{ $title }}</title>
<style>
    @page { margin: 24px; }
    body { font-family: DejaVu Sans, sans-serif; color: #172033; font-size: 10px; }
    h1 { font-size: 20px; margin: 0; color: #5b21b6; }
    h2 { font-size: 14px; margin: 16px 0 6px; }
    h3 { font-size: 11px; margin: 10px 0 4px; }
    .muted { color: #64748b; }
    .header { border-bottom: 2px solid #ede9fe; padding-bottom: 10px; margin-bottom: 14px; }
    .summary { width: 100%; margin: 8px 0 10px; border-collapse: collapse; }
    .summary td { border: 1px solid #e2e8f0; padding: 6px; background: #fafafa; }
    table.data { width: 100%; border-collapse: collapse; margin-top: 6px; }
    table.data th { background: #f5f3ff; color: #5b21b6; text-align: left; padding: 6px; border: 1px solid #ddd6fe; font-size: 8px; }
    table.data td { padding: 5px; border: 1px solid #e2e8f0; vertical-align: top; font-size: 8px; }
    .event { page-break-inside: avoid; margin-bottom: 16px; }
    .badge { display: inline-block; padding: 3px 6px; border-radius: 8px; background: #ede9fe; color: #5b21b6; font-weight: bold; }
    .danger { background: #fee2e2; color: #b91c1c; }
    .green { background: #dcfce7; color: #166534; }
    .page-break { page-break-after: always; }
</style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p class="muted">Generado: {{ $generatedAt }} · EVENTIX</p>
    </div>

    @forelse($events as $event)
        <div class="event">
            <h2>{{ $event['title'] }}</h2>
            <p>
                <span class="badge">{{ strtoupper($event['category']) }}</span>
                <span class="badge {{ $event['status']==='cancelado' ? 'danger' : ($event['status']==='publicado' ? 'green' : '') }}">{{ strtoupper($event['status']) }}</span>
                @if($event['deleted']) <span class="badge danger">ELIMINADO DE INTERFACES</span> @endif
            </p>
            <p class="muted">{{ $event['displayDate'] }} · {{ $event['time'] }} @if($event['endTime']) - {{ $event['endTime'] }} @endif · {{ $event['location'] }} · Responsable: {{ $event['publisher'] }}</p>

            <table class="summary">
                <tr>
                    <td><b>Aforo:</b> {{ $event['capacity'] }}</td>
                    <td><b>Entradas:</b> {{ $event['tickets'] }}</td>
                    <td><b>Usadas:</b> {{ $event['usedTickets'] }}</td>
                    <td><b>Compras pagadas:</b> {{ $event['paidPurchases'] }}</td>
                    <td><b>Ingresos:</b> Bs {{ number_format($event['income'],2) }}</td>
                    <td><b>Reembolsos:</b> Bs {{ number_format($event['refunds'],2) }}</td>
                </tr>
            </table>

            <h3>Compras y entradas</h3>
            @forelse($event['purchases'] as $purchase)
                <table class="data">
                    <thead>
                        <tr>
                            <th>Compra</th><th>Cliente</th><th>Método</th><th>Referencia</th><th>Fecha</th><th>Entradas</th><th>Servicio</th><th>Total</th><th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>#{{ $purchase['id'] }}</td>
                            <td>{{ $purchase['customer'] }}<br><span class="muted">{{ $purchase['email'] ?? '' }}</span></td>
                            <td>{{ $purchase['method'] }}</td>
                            <td>{{ $purchase['reference'] }}</td>
                            <td>{{ $purchase['date'] }}</td>
                            <td>{{ $purchase['ticketCount'] }}</td>
                            <td>Bs {{ number_format($purchase['fee'],2) }}</td>
                            <td><b>Bs {{ number_format($purchase['total'],2) }}</b></td>
                            <td>{{ $purchase['status'] }}</td>
                        </tr>
                    </tbody>
                </table>

                @if(count($purchase['tickets']))
                    <table class="data">
                        <thead><tr><th>Código</th><th>Tipo</th><th>Titular</th><th>Correo</th><th>Estado</th><th>Validada</th></tr></thead>
                        <tbody>
                        @foreach($purchase['tickets'] as $ticket)
                            <tr>
                                <td>{{ $ticket['code'] }}</td>
                                <td>{{ $ticket['type'] }}</td>
                                <td>{{ $ticket['holder'] }}</td>
                                <td>{{ $ticket['email'] }}</td>
                                <td>{{ $ticket['status'] }}</td>
                                <td>{{ $ticket['usedAt'] ?? '—' }}</td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                @endif
            @empty
                <p class="muted">Este evento no tiene compras registradas.</p>
            @endforelse
        </div>
    @empty
        <p>No hay eventos que coincidan con los filtros seleccionados.</p>
    @endforelse
</body>
</html>
