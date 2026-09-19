import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import ClientLayout from '../../Layouts/ClientLayout';

import {
    TicketIcon,
    CreditCardIcon,
    QrCodeIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    CheckCircleIcon,
    ChevronRightIcon,
    CalendarDaysIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';


export default function Checkout({
    event,
    ticketTypes,
    serviceFeePercent,
}) {
    const initialQuantities = Object.fromEntries(
        ticketTypes.map((ticket) => [ticket.id, 0])
    );

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        method: 'tarjeta',
        quantities: initialQuantities,
    });

    /*
     * Estos datos son solo visuales para la demostración.
     * NO se envían ni se guardan en nuestra base de datos.
     */
    const [card, setCard] = useState({
        number: '',
        expiration: '',
        cvv: '',
        holder: '',
    });

    const [termsAccepted, setTermsAccepted] = useState(false);

    const subtotal = ticketTypes.reduce(
        (sum, ticket) =>
            sum +
            Number(ticket.price) *
                (Number(data.quantities[ticket.id]) || 0),
        0
    );

    const fee = subtotal * (serviceFeePercent / 100);
    const total = subtotal + fee;

    const selectedTickets = ticketTypes.filter(
        (ticket) => Number(data.quantities[ticket.id]) > 0
    );

    const setQty = (id, value, max) => {
        setData('quantities', {
            ...data.quantities,

            [id]: Math.max(
                0,
                Math.min(Number(value) || 0, max)
            ),
        });
    };

    const submit = (e) => {
        e.preventDefault();

        if (!termsAccepted) {
            return;
        }

        post(`/checkout/${event.id}`);
    };
    return (
        <>
            <Head title="Finalizar compra" />

            <ClientLayout>
<div className="px-4 py-7 sm:px-7 lg:px-10">

    {/* ========================================= */}
    {/* TITULO                                    */}
    {/* ========================================= */}

    <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Finalizar compra
        </h1>

        <p className="mt-1 text-sm text-slate-500">
            Estás a un paso de vivir una experiencia inolvidable.
        </p>
    </div>

    {/* ========================================= */}
    {/* PASOS                                    */}
    {/* ========================================= */}

    <div className="mx-auto mt-7 max-w-3xl">

        <div className="flex items-center">

            <Step
                number="✓"
                title="Carrito"
                completed
            />

            <div className="h-[2px] flex-1 bg-violet-600" />

            <Step
                number="2"
                title="Pago"
                active
            />

            <div className="h-[2px] flex-1 bg-slate-200" />

            <Step
                number="3"
                title="Confirmación"
            />

        </div>

    </div>

                        {/* ========================================= */}
                        {/* CHECKOUT                                  */}
                        {/* ========================================= */}

                        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">

                            {/* COLUMNA IZQUIERDA */}

                            <form
                                onSubmit={submit}
                                className="space-y-6"
                            >

                                {/* SELECCION DE ENTRADAS */}

                                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                    <div className="mb-5">

                                        <h2 className="text-lg font-black text-slate-900">
                                            Tus entradas
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Puedes modificar la cantidad antes de pagar.
                                        </p>

                                    </div>

                                    <div className="space-y-3">

                                        {ticketTypes.map((ticket) => {

                                            const max = Math.min(
                                                ticket.max_purchase,
                                                ticket.available
                                            );

                                            return (
                                                <div
                                                    key={ticket.id}
                                                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-200 sm:flex-row sm:items-center sm:justify-between"
                                                >

                                                    <div>

                                                        <p className="font-black text-slate-900">
                                                            {ticket.name}
                                                        </p>

                                                        {ticket.description && (
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {ticket.description}
                                                            </p>
                                                        )}

                                                        <div className="mt-2 flex flex-wrap gap-3 text-sm">

                                                            <span className="font-bold text-violet-700">
                                                                Bs {Number(ticket.price).toFixed(2)}
                                                            </span>

                                                            <span className="text-slate-400">
                                                                Disponible: {ticket.available}
                                                            </span>

                                                        </div>

                                                    </div>

                                                    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setQty(
                                                                    ticket.id,
                                                                    Number(data.quantities[ticket.id]) - 1,
                                                                    max
                                                                )
                                                            }
                                                            className="h-10 w-10 text-lg font-bold text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                                                        >
                                                            −
                                                        </button>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={max}
                                                            value={data.quantities[ticket.id]}
                                                            onChange={(e) =>
                                                                setQty(
                                                                    ticket.id,
                                                                    e.target.value,
                                                                    max
                                                                )
                                                            }
                                                            className="h-10 w-14 border-x border-y-0 border-slate-200 p-0 text-center font-bold focus:border-violet-400 focus:ring-0"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setQty(
                                                                    ticket.id,
                                                                    Number(data.quantities[ticket.id]) + 1,
                                                                    max
                                                                )
                                                            }
                                                            className="h-10 w-10 text-lg font-bold text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                                                        >
                                                            +
                                                        </button>

                                                    </div>

                                                </div>
                                            );
                                        })}

                                    </div>

                                </section>

                                {/* ========================================= */}
                                {/* METODO DE PAGO                            */}
                                {/* ========================================= */}

                                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                    <div className="mb-5">

                                        <h2 className="text-lg font-black text-slate-900">
                                            Método de pago
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Selecciona cómo deseas pagar tu compra.
                                        </p>

                                    </div>

                                    {/* TARJETA */}

                                    <div
                                        className={`overflow-hidden rounded-2xl border-2 transition ${
                                            data.method === 'tarjeta'
                                                ? 'border-violet-500 bg-violet-50/40'
                                                : 'border-slate-200 bg-white'
                                        }`}
                                    >

                                        <label className="flex cursor-pointer items-center gap-4 p-5">

                                            <input
                                                type="radio"
                                                name="payment-method"
                                                checked={data.method === 'tarjeta'}
                                                onChange={() =>
                                                    setData('method', 'tarjeta')
                                                }
                                                className="text-violet-600 focus:ring-violet-500"
                                            />

                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
                                                <CreditCardIcon className="h-6 w-6 text-violet-700" />
                                            </div>

                                            <div className="flex-1">

                                                <p className="font-black text-slate-900">
                                                    Tarjeta de crédito/débito
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    Visa, Mastercard y otras tarjetas.
                                                </p>

                                            </div>

                                            <ChevronRightIcon className="h-5 w-5 text-slate-400" />

                                        </label>

                                        {data.method === 'tarjeta' && (

                                            <div className="border-t border-violet-100 px-5 pb-5 pt-4">

                                                <div className="grid gap-4">

                                                    <Field
                                                        label="Número de tarjeta"
                                                        placeholder="1234 5678 9012 3456"
                                                        value={card.number}
                                                        onChange={(value) =>
                                                            setCard({
                                                                ...card,
                                                                number: value,
                                                            })
                                                        }
                                                    />

                                                    <div className="grid gap-4 sm:grid-cols-2">

                                                        <Field
                                                            label="Fecha de expiración"
                                                            placeholder="MM / AA"
                                                            value={card.expiration}
                                                            onChange={(value) =>
                                                                setCard({
                                                                    ...card,
                                                                    expiration: value,
                                                                })
                                                            }
                                                        />

                                                        <Field
                                                            label="Código de seguridad (CVV)"
                                                            placeholder="123"
                                                            value={card.cvv}
                                                            onChange={(value) =>
                                                                setCard({
                                                                    ...card,
                                                                    cvv: value,
                                                                })
                                                            }
                                                        />

                                                    </div>

                                                    <Field
                                                        label="Nombre en la tarjeta"
                                                        placeholder="Nombre del titular"
                                                        value={card.holder}
                                                        onChange={(value) =>
                                                            setCard({
                                                                ...card,
                                                                holder: value,
                                                            })
                                                        }
                                                    />

                                                </div>

                                                <div className="mt-4 flex gap-2 rounded-xl bg-white p-3 text-xs text-slate-500">

                                                    <LockClosedIcon className="h-5 w-5 shrink-0 text-violet-600" />

                                                    <p>
                                                        Demostración académica: EVENTIX no almacena los datos completos de la tarjeta.
                                                    </p>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                    {/* QR */}

                                    <div
                                        className={`mt-3 overflow-hidden rounded-2xl border-2 transition ${
                                            data.method === 'qr'
                                                ? 'border-violet-500 bg-violet-50/40'
                                                : 'border-slate-200 bg-white'
                                        }`}
                                    >

                                        <label className="flex cursor-pointer items-center gap-4 p-5">

                                            <input
                                                type="radio"
                                                name="payment-method"
                                                checked={data.method === 'qr'}
                                                onChange={() =>
                                                    setData('method', 'qr')
                                                }
                                                className="text-violet-600 focus:ring-violet-500"
                                            />

                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
                                                <QrCodeIcon className="h-6 w-6 text-violet-700" />
                                            </div>

                                            <div className="flex-1">

                                                <p className="font-black text-slate-900">
                                                    Pago por QR
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    Escanea el código desde tu aplicación bancaria.
                                                </p>

                                            </div>

                                            <ChevronRightIcon className="h-5 w-5 text-slate-400" />

                                        </label>

                                        {data.method === 'qr' && (

                                            <div className="border-t border-violet-100 p-6 text-center">

                                                {total > 0 ? (
                                                    <>
                                                        <div className="mx-auto w-fit rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">

                                                            <img
                                                                src={`/payment-qr?amount=${total.toFixed(2)}`}
                                                                alt="QR de pago EVENTIX"
                                                                className="h-56 w-56"
                                                            />

                                                        </div>

                                                        <p className="mt-4 text-sm font-bold text-slate-700">
                                                            Escanea para pagar Bs {total.toFixed(2)}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            QR de demostración académica.
                                                        </p>
                                                    </>
                                                ) : (

                                                    <p className="rounded-xl bg-white p-4 text-sm text-slate-500">
                                                        Primero selecciona al menos una entrada para generar el QR.
                                                    </p>

                                                )}

                                            </div>

                                        )}

                                    </div>

                                    {/* ERRORES */}

                                    {Object.values(errors).map((message, index) => (
                                        <p
                                            key={index}
                                            className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                                        >
                                            {message}
                                        </p>
                                    ))}

                                    {/* TERMINOS */}

                                    <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-slate-600">

                                        <input
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) =>
                                                setTermsAccepted(e.target.checked)
                                            }
                                            className="mt-1 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                        />

                                        <span>
                                            Acepto los términos y condiciones y la política de privacidad de EVENTIX.
                                        </span>

                                    </label>

                                    {/* BOTON */}

                                    <button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            total <= 0 ||
                                            !termsAccepted
                                        }
                                        className="mt-5 flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 font-black text-white shadow-lg transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        <span className="flex items-center gap-2">

                                            <LockClosedIcon className="h-5 w-5" />

                                            {processing
                                                ? 'Procesando...'
                                                : 'Pagar ahora'}

                                        </span>

                                        <span>
                                            Bs {total.toFixed(2)}
                                        </span>

                                    </button>

                                    <p className="mt-3 text-center text-xs text-slate-400">
                                        Pago protegido. Tus entradas se generan únicamente después de confirmar la compra.
                                    </p>

                                </section>

                            </form>

                            {/* ========================================= */}
                            {/* RESUMEN DE COMPRA                         */}
                            {/* ========================================= */}

                            <aside className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <h2 className="text-lg font-black text-slate-900">
                                        Resumen de compra
                                    </h2>

                                    <TicketIcon className="h-6 w-6 -rotate-12 text-violet-600" />

                                </div>

                                {/* EVENTO */}

                                <div className="mt-5 flex gap-4">

                                    {event.image ? (
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="h-24 w-28 rounded-xl object-cover"
                                        />
                                    ) : (

                                        <div className="flex h-24 w-28 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700">
                                            <TicketIcon className="h-10 w-10 -rotate-12 text-white" />
                                        </div>

                                    )}

                                    <div className="min-w-0">

                                        <p className="font-black text-slate-900">
                                            {event.title}
                                        </p>

                                        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                            <CalendarDaysIcon className="h-4 w-4 text-violet-600" />
                                            {event.date} · {event.time} h
                                        </p>

                                        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                            <MapPinIcon className="h-4 w-4 text-violet-600" />
                                            {event.location}
                                        </p>

                                    </div>

                                </div>

                                {/* ENTRADAS */}

                                <div className="mt-6 border-t border-slate-100 pt-5">

                                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Entradas seleccionadas
                                    </p>

                                    {selectedTickets.length === 0 ? (

                                        <p className="text-sm text-slate-400">
                                            Todavía no seleccionaste entradas.
                                        </p>

                                    ) : (

                                        <div className="space-y-3">

                                            {selectedTickets.map((ticket) => {

                                                const quantity =
                                                    Number(data.quantities[ticket.id]) || 0;

                                                return (
                                                    <div
                                                        key={ticket.id}
                                                        className="flex justify-between gap-4 text-sm"
                                                    >

                                                        <span className="text-slate-600">
                                                            {quantity} × {ticket.name}
                                                        </span>

                                                        <span className="font-bold text-slate-800">
                                                            Bs {(quantity * Number(ticket.price)).toFixed(2)}
                                                        </span>

                                                    </div>
                                                );
                                            })}

                                        </div>

                                    )}

                                </div>

                                {/* TOTALES */}

                                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">

                                    <div className="flex justify-between text-slate-500">
                                        <span>Subtotal</span>
                                        <span>Bs {subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between text-slate-500">
                                        <span>
                                            Cargo por servicio ({serviceFeePercent}%)
                                        </span>

                                        <span>
                                            Bs {fee.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between rounded-xl bg-violet-50 px-4 py-4 text-xl font-black text-violet-700">
                                        <span>Total</span>
                                        <span>Bs {total.toFixed(2)}</span>
                                    </div>

                                </div>

                                {/* ========================================= */}
                                {/* BENEFICIOS                                */}
                                {/* ========================================= */}

                                <div className="mt-6 space-y-4">

                                    <Benefit
                                        icon={ShieldCheckIcon}
                                        title="Compra segura"
                                        description="Tus datos están protegidos."
                                    />

                                    <Benefit
                                        icon={TicketIcon}
                                        title="Entrega inmediata"
                                        description="Recibe tus entradas digitales al instante."
                                    />

                                    <Benefit
                                        icon={CheckCircleIcon}
                                        title="QR único"
                                        description="Cada entrada tiene un código individual."
                                    />

                                </div>

                            </aside>

                        </div>

                </div>

            </ClientLayout>
        </>
    );
}

function Step({
    number,
    title,
    active = false,
    completed = false,
}) {
    return (
        <div className="relative flex flex-col items-center">

            <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                    active || completed
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                }`}
            >
                {number}
            </div>

            <span
                className={`absolute top-11 whitespace-nowrap text-xs font-bold ${
                    active || completed
                        ? 'text-violet-700'
                        : 'text-slate-400'
                }`}
            >
                {title}
            </span>

        </div>
    );
}


function Field({
    label,
    placeholder,
    value,
    onChange,
}) {
    return (
        <label className="block">

            <span className="mb-2 block text-xs font-bold text-slate-600">
                {label}
            </span>

            <input
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border-slate-200 text-sm shadow-sm focus:border-violet-400 focus:ring-violet-400"
            />

        </label>
    );
}


function Benefit({
    icon: Icon,
    title,
    description,
}) {
    return (
        <div className="flex gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100">
                <Icon className="h-5 w-5 text-violet-700" />
            </div>

            <div>

                <p className="text-sm font-bold text-slate-800">
                    {title}
                </p>

                <p className="text-xs text-slate-500">
                    {description}
                </p>

            </div>

        </div>
    );
}