<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">

    <title>Entrada EVENTIX</title>

    <style>
        @page {
            margin: 20px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            background: #f5f3ff;
            margin: 0;
            padding: 0;
            color: #111827;
        }

        .ticket {
            width: 100%;
            border: 3px solid #5b45ff;
            border-radius: 22px;
            overflow: hidden;
            background: #ffffff;
        }

        .header {
            background: #5b45ff;
            color: white;
            padding: 25px 35px;
        }

        .logo {
            font-size: 34px;
            font-weight: bold;
        }

        .subtitle {
            font-size: 13px;
            margin-top: 5px;
        }

        .content {
            width: 100%;
            display: table;
        }

        .info {
            width: 62%;
            display: table-cell;
            vertical-align: top;
            padding: 30px;
            border-right: 2px dashed #c4b5fd;
        }

        .qr-section {
            width: 38%;
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            padding: 30px;
            background: #faf8ff;
        }

        .event-name {
            font-size: 35px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 18px;
        }

        .type {
            display: inline-block;
            background: #ede9fe;
            color: #5b21b6;
            padding: 7px 15px;
            border-radius: 15px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .row {
            font-size: 17px;
            margin: 13px 0;
        }

        .label {
            font-weight: bold;
        }

        .qr-box {
            display: inline-block;
            background: white;
            padding: 15px;
            border: 2px solid #ddd6fe;
            border-radius: 18px;
        }

        .code {
            font-size: 18px;
            font-weight: bold;
            color: #4338ca;
            margin-top: 15px;
        }

        .valid {
            display: inline-block;
            margin-top: 14px;
            padding: 8px 16px;
            background: #dcfce7;
            color: #166534;
            border-radius: 18px;
            font-size: 12px;
            font-weight: bold;
        }

        .notice {
            margin-top: 25px;
            background: #f5f3ff;
            border-radius: 12px;
            padding: 14px;
            color: #5b21b6;
            font-size: 13px;
        }

        .footer {
            text-align: center;
            font-size: 11px;
            color: #64748b;
            padding: 15px;
        }
    </style>
</head>

<body>

<div class="ticket">

    <div class="header">

        <div class="logo">
            EVENTIX
        </div>

        <div class="subtitle">
            Vive más eventos · Entrada digital oficial
        </div>

    </div>

    <div class="content">

        <div class="info">

            <div class="type">
                {{ $ticket->ticketType->nombre }}
            </div>

            <div class="event-name">
                {{ $ticket->event->nombre }}
            </div>

            <div class="row">
                <span class="label">
                    Titular:
                </span>

                {{ $ticket->titular_nombre }}
            </div>

            <div class="row">
                <span class="label">
                    Fecha:
                </span>

                {{ $ticket->event->fecha_evento->format('d/m/Y') }}
            </div>

            <div class="row">
                <span class="label">
                    Hora:
                </span>

                {{ substr($ticket->event->hora_inicio, 0, 5) }}
            </div>

            <div class="row">
                <span class="label">
                    Lugar:
                </span>

                {{ $ticket->event->ubicacion }}
            </div>

            <div class="row">
                <span class="label">
                    Código:
                </span>

                {{ $ticket->codigo }}
            </div>

            <div class="notice">
                Esta entrada contiene un código QR único.
                Una vez que seguridad valide el ingreso,
                la entrada quedará marcada como utilizada
                y no podrá volver a ingresar.
            </div>

        </div>

        <div class="qr-section">

            <h2>
                TU ENTRADA
            </h2>

            <p>
                Presenta este QR en el ingreso
            </p>

<div class="qr-box">
    <img
        src="data:image/svg+xml;base64,{{ base64_encode($qrSvg) }}"
        alt="Código QR EVENTIX"
        style="width:220px; height:220px; display:block;"
    >
</div>

            <div class="code">
                {{ $ticket->codigo }}
            </div>

            <div class="valid">
                ✓ VÁLIDA PARA 1 INGRESO
            </div>

        </div>

    </div>

    <div class="footer">

        EVENTIX · Entrada digital protegida mediante QR único

    </div>

</div>

</body>
</html>