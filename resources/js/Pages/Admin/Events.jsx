import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    CalendarDaysIcon,
    ClockIcon,
    MapPinIcon,
    PencilSquareIcon,
    PhotoIcon,
    PlusIcon,
    TagIcon,
    TicketIcon,
    TrashIcon,
    UserIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../Layouts/AdminLayout';
import { Badge, Card, PageTitle, Progress } from '../../Components/AdminUi';

const defaultTicketTypes = () => [
    { nombre: 'General', descripcion: '', precio: '', cupo_total: '', limite_por_compra: 4 },
    { nombre: 'Preferencial', descripcion: '', precio: '', cupo_total: '', limite_por_compra: 4 },
    { nombre: 'VIP', descripcion: '', precio: '', cupo_total: '', limite_por_compra: 4 },
];

const emptyForm = () => ({
    nombre: '',
    descripcion: '',
    id_categoria: '',
    fecha_evento: '',
    hora_inicio: '',
    hora_fin: '',
    ubicacion: '',
    aforo_total: '',
    porcentaje_servicio: 5,
    estado: 'borrador',
    publicar_en: '',
    id_publicador: '',
    imagen_archivo: null,
    tipos_entrada: defaultTicketTypes(),
});

export default function Events({ events = [], categories = [], staff = [], permissions = {} }) {
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [typeEvent, setTypeEvent] = useState(null);
    const [showCategoryCreator, setShowCategoryCreator] = useState(false);

    const form = useForm(emptyForm());
    const categoryForm = useForm({ nombre: '', descripcion: '' });
    const typeForm = useForm({
        nombre: '',
        descripcion: '',
        precio: '',
        cupo_total: '',
        limite_por_compra: 4,
    });

    const filtered = useMemo(
        () => events.filter((event) =>
            `${event.title} ${event.location} ${event.publisher || ''} ${event.category || ''}`
                .toLowerCase()
                .includes(search.toLowerCase())
        ),
        [events, search]
    );

    const assignedCapacity = useMemo(
        () => (form.data.tipos_entrada || []).reduce((sum, type) => sum + (Number(type.cupo_total) || 0), 0),
        [form.data.tipos_entrada]
    );

    const startCreate = () => {
        setEditing(null);
        form.setData(emptyForm());
        form.clearErrors();
        setShowForm(true);
        setTimeout(() => document.getElementById('admin-event-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    };

    const startEdit = (event) => {
        setEditing(event);
        form.setData({
            nombre: event.title,
            descripcion: event.description,
            id_categoria: event.category_id,
            fecha_evento: event.date,
            hora_inicio: event.time,
            hora_fin: event.endTime || '',
            ubicacion: event.location,
            aforo_total: event.capacity,
            porcentaje_servicio: event.serviceFeePercent ?? 5,
            estado: event.status,
            publicar_en: event.publishAt || '',
            id_publicador: event.publisherId || '',
            imagen_archivo: null,
            tipos_entrada: [],
        });
        form.clearErrors();
        setShowForm(true);
        setTimeout(() => document.getElementById('admin-event-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    };

    const closeForm = () => {
        setEditing(null);
        setShowForm(false);
        setShowCategoryCreator(false);
        form.setData(emptyForm());
        form.clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            form.post(`/admin/eventos/${editing.id}/actualizar`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: closeForm,
            });
        } else {
            form.post('/admin/eventos', {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: closeForm,
            });
        }
    };

    const cancelEvent = (event) => {
        if (!window.confirm(`¿Cancelar el evento “${event.title}”? Se avisará a los clientes afectados y al personal administrativo.`)) return;
        router.delete(`/admin/eventos/${event.id}`, { preserveScroll: true });
    };

    const permanentlyDeleteEvent = (event) => {
        if (!window.confirm(
            `¿Eliminar DEFINITIVAMENTE “${event.title}” de EVENTIX?\n\nEsta acción lo quitará de todas las interfaces. Si existen ventas o entradas, el historial interno se conservará para no romper reportes y reembolsos.`
        )) return;
        router.delete(`/admin/eventos/${event.id}/permanente`, { preserveScroll: true });
    };

    const updateCreateType = (index, field, value) => {
        const next = [...(form.data.tipos_entrada || [])];
        next[index] = { ...next[index], [field]: value };
        form.setData('tipos_entrada', next);
    };

    const addCreateType = () => {
        form.setData('tipos_entrada', [
            ...(form.data.tipos_entrada || []),
            { nombre: '', descripcion: '', precio: '', cupo_total: '', limite_por_compra: 4 },
        ]);
    };

    const removeCreateType = (index) => {
        const next = (form.data.tipos_entrada || []).filter((_, i) => i !== index);
        form.setData('tipos_entrada', next);
    };

    const createCategory = (e) => {
        e.preventDefault();
        categoryForm.post('/admin/categorias', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                categoryForm.reset();
                setShowCategoryCreator(false);
            },
        });
    };

    const openTypeCreatorForEditing = () => {
        if (!editing) {
            document.getElementById('create-ticket-types')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setTypeEvent(editing);
        typeForm.reset();
    };

    return (
        <AdminLayout>
            <Head title="Gestión de eventos" />
            <div className="mx-auto max-w-[1600px] p-5 sm:p-8">
                <PageTitle
                    title="Gestión de eventos"
                    description="Administra eventos, publicación automática, categorías y tipos de entrada desde una sola pantalla."
                />

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar evento, categoría, lugar o responsable..."
                        className="w-full rounded-xl border-slate-200 sm:max-w-md"
                    />
                    <p className="text-sm font-bold text-slate-500">{filtered.length} eventos registrados</p>
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    {filtered.map((event) => {
                        const pct = event.capacity ? Math.round((event.sold / event.capacity) * 100) : 0;
                        return (
                            <Card key={event.id} className="overflow-hidden">
                                <div className="grid md:grid-cols-[210px_1fr]">
                                    {event.image ? (
                                        <img src={event.image} alt={event.title} className="h-full min-h-56 w-full object-cover" />
                                    ) : (
                                        <div className="flex min-h-56 items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100">
                                            <PhotoIcon className="h-16 w-16 text-violet-400" />
                                        </div>
                                    )}

                                    <div className="p-5">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge tone={tone(event.status)}>{event.status}</Badge>
                                                    {event.publishAt && <Badge tone="blue">Programa: {event.publishAt.replace('T', ' ')}</Badge>}
                                                </div>
                                                <h3 className="mt-3 text-xl font-black text-slate-900">{event.title}</h3>
                                                <p className="mt-1 text-sm text-slate-500">{event.category}</p>
                                                <p className="mt-2 text-xs font-black text-violet-700">Cargo por servicio EVENTIX: {Number(event.serviceFeePercent ?? 5).toFixed(2)}%</p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {permissions.edit && event.status !== 'cancelado' && (
                                                    <button type="button" onClick={() => cancelEvent(event)} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-100">
                                                        <TrashIcon className="h-4 w-4" />Cancelar
                                                    </button>
                                                )}
                                                {permissions.permanentDelete && event.status === 'cancelado' && (
                                                    <button type="button" onClick={() => permanentlyDeleteEvent(event)} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-red-700">
                                                        <TrashIcon className="h-4 w-4" />Eliminar definitivo
                                                    </button>
                                                )}
                                                {permissions.edit && (
                                                    <button type="button" onClick={() => startEdit(event)} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 hover:bg-violet-100">
                                                        <PencilSquareIcon className="h-4 w-4" />Editar
                                                    </button>
                                                )}
                                                {permissions.publish && event.status !== 'publicado' && event.status !== 'cancelado' && (
                                                    <button type="button" onClick={() => router.post(`/admin/eventos/${event.id}/publicar`, {}, { preserveScroll: true })} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700">
                                                        Publicar ahora
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                            <span className="flex items-center gap-2"><CalendarDaysIcon className="h-5 w-5 text-violet-600" />{event.date}</span>
                                            <span className="flex items-center gap-2"><ClockIcon className="h-5 w-5 text-violet-600" />{event.time} {event.endTime ? `- ${event.endTime}` : ''}</span>
                                            <span className="flex items-center gap-2"><MapPinIcon className="h-5 w-5 text-violet-600" />{event.location}</span>
                                            <span className="flex items-center gap-2"><UserIcon className="h-5 w-5 text-violet-600" />Responsable: {event.publisher || 'Sin asignar'}</span>
                                            <span className="flex items-center gap-2 sm:col-span-2"><TicketIcon className="h-5 w-5 text-violet-600" />{event.sold} vendidas · {event.available} disponibles · aforo {event.capacity}</span>
                                        </div>

                                        <div className="mt-4">
                                            <div className="mb-2 flex justify-between text-xs font-bold text-slate-500"><span>Ocupación</span><span>{pct}%</span></div>
                                            <Progress value={pct} />
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {event.ticketTypes.map((type) => (
                                                <span key={type.id} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                                                    {type.name} · Bs {type.price} · cupo {type.capacity}
                                                </span>
                                            ))}
                                            {permissions.edit && (
                                                <button type="button" onClick={() => { setTypeEvent(event); typeForm.reset(); }} className="rounded-full border border-violet-200 px-3 py-1 text-xs font-black text-violet-700">
                                                    <PlusIcon className="mr-1 inline h-4 w-4" />Crear tipo de entrada
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {!filtered.length && <Card className="mt-5 p-8 text-center text-sm text-slate-400">No hay eventos con esa búsqueda.</Card>}

                {permissions.create && !showForm && (
                    <div className="mt-8 flex justify-center">
                        <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-4 font-black text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl">
                            <PlusIcon className="h-5 w-5" />Crear nuevo evento
                        </button>
                    </div>
                )}

                {showForm && (permissions.create || permissions.edit) && (
                    <Card id="admin-event-form" className="mt-8 p-6 scroll-mt-24">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{editing ? `Editar evento: ${editing.title}` : 'Crear nuevo evento'}</h2>
                                <p className="mt-1 text-sm text-slate-500">Configura el evento, la publicación automática, imagen, categoría y entradas en un solo formulario.</p>
                            </div>
                            <button type="button" onClick={closeForm} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Cerrar formulario</button>
                        </div>

                        <form onSubmit={submit} className="mt-5 grid gap-4 lg:grid-cols-4">
                            <Field label="Nombre"><input value={form.data.nombre} onChange={(e) => form.setData('nombre', e.target.value)} className="input" /></Field>

                            <Field label="Categoría">
                                <select value={form.data.id_categoria} onChange={(e) => form.setData('id_categoria', e.target.value)} className="input">
                                    <option value="">Seleccionar</option>
                                    {categories.map((category) => <option key={category.id_categoria} value={category.id_categoria}>{category.nombre}</option>)}
                                </select>
                                {permissions.create && (
                                    <button type="button" onClick={() => setShowCategoryCreator((v) => !v)} className="mt-2 inline-flex items-center gap-1 text-xs font-black text-violet-700">
                                        <PlusIcon className="h-4 w-4" />Crear tipo de categoría
                                    </button>
                                )}
                            </Field>

                            <Field label="Fecha"><input type="date" value={form.data.fecha_evento} onChange={(e) => form.setData('fecha_evento', e.target.value)} className="input" /></Field>
                            <Field label="Hora inicio"><input type="time" value={form.data.hora_inicio} onChange={(e) => form.setData('hora_inicio', e.target.value)} className="input" /></Field>

                            {showCategoryCreator && (
                                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 lg:col-span-4">
                                    <div className="flex items-center gap-2"><TagIcon className="h-5 w-5 text-violet-700" /><p className="font-black text-violet-900">Nueva categoría</p></div>
                                    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.5fr_auto]">
                                        <input placeholder="Nombre de categoría" value={categoryForm.data.nombre} onChange={(e) => categoryForm.setData('nombre', e.target.value)} className="input" />
                                        <input placeholder="Descripción opcional" value={categoryForm.data.descripcion} onChange={(e) => categoryForm.setData('descripcion', e.target.value)} className="input" />
                                        <button type="button" onClick={createCategory} disabled={categoryForm.processing} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Crear categoría</button>
                                    </div>
                                    {Object.values(categoryForm.errors).map((error, index) => <p key={index} className="mt-2 text-sm font-bold text-red-600">{error}</p>)}
                                </div>
                            )}

                            <Field label="Hora fin"><input type="time" value={form.data.hora_fin} onChange={(e) => form.setData('hora_fin', e.target.value)} className="input" /></Field>
                            <Field label="Lugar"><input value={form.data.ubicacion} onChange={(e) => form.setData('ubicacion', e.target.value)} className="input" /></Field>
                            <Field label="Aforo total"><input type="number" min="1" value={form.data.aforo_total} onChange={(e) => form.setData('aforo_total', e.target.value)} className="input" /></Field>
                            <Field label="Responsable/publicador">
                                <select value={form.data.id_publicador} onChange={(e) => form.setData('id_publicador', e.target.value)} className="input">
                                    <option value="">Yo / sin asignar</option>
                                    {staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                                </select>
                            </Field>

                            <Field label="Estado">
                                <select
                                    value={form.data.estado}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        form.setData('estado', value);
                                        if (value !== 'programado') form.setData('publicar_en', '');
                                    }}
                                    className="input"
                                >
                                    <option value="borrador">Borrador</option>
                                    <option value="programado">Programar publicación</option>
                                    <option value="publicado">Publicar ahora</option>
                                    {editing?.status === 'cancelado' && <option value="cancelado">Cancelado</option>}
                                </select>
                            </Field>

                            <Field label="Publicar automáticamente">
                                <input
                                    type="datetime-local"
                                    value={form.data.publicar_en}
                                    onChange={(e) => form.setData('publicar_en', e.target.value)}
                                    disabled={form.data.estado !== 'programado'}
                                    className="input disabled:bg-slate-100 disabled:text-slate-400"
                                />
                                <p className="mt-1 text-[11px] text-slate-400">
                                    {form.data.estado === 'programado' ? 'Se publicará sola al llegar esta fecha y hora.' : 'Selecciona “Programar publicación” para activar este campo.'}
                                </p>
                            </Field>

                            <Field label="Cargo por servicio (%)">
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={form.data.porcentaje_servicio}
                                        onChange={(e) => form.setData('porcentaje_servicio', e.target.value)}
                                        className="input pr-10"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-violet-600">%</span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-400">Lo define el administrador o subadministrador para este evento. Se suma al precio que paga el cliente.</p>
                            </Field>

                            <Field label="Imagen del evento">
                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-violet-300 bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700">
                                    <PhotoIcon className="h-5 w-5" />Elegir archivo
                                    <input type="file" accept="image/*" onChange={(e) => form.setData('imagen_archivo', e.target.files?.[0] || null)} className="hidden" />
                                </label>
                                {form.data.imagen_archivo && <p className="mt-1 truncate text-xs text-slate-400">{form.data.imagen_archivo.name}</p>}
                            </Field>

                            <Field label="Tipos de entrada">
                                <button type="button" onClick={openTypeCreatorForEditing} className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-black text-violet-700 hover:bg-violet-100">
                                    <PlusIcon className="h-5 w-5" />Crear tipo de entrada
                                </button>
                                <p className="mt-1 text-[11px] text-slate-400">{editing ? `${editing.ticketTypes.length} tipos registrados` : `${form.data.tipos_entrada.length} tipos preparados`}</p>
                            </Field>

                            <Field label="Descripción" className="lg:col-span-4">
                                <textarea rows="3" value={form.data.descripcion} onChange={(e) => form.setData('descripcion', e.target.value)} className="input" />
                            </Field>

                            {!editing && (
                                <div id="create-ticket-types" className="rounded-3xl border border-violet-100 bg-violet-50/50 p-5 lg:col-span-4 scroll-mt-28">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-2"><TicketIcon className="h-6 w-6 text-violet-700" /><h3 className="text-lg font-black text-slate-900">Tipos de entrada</h3></div>
                                            <p className="mt-1 text-sm text-slate-500">General, Preferencial y VIP aparecen por defecto. Puedes editarlos, quitarlos o crear otros.</p>
                                        </div>
                                        <button type="button" onClick={addCreateType} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white"><PlusIcon className="h-5 w-5" />Crear tipo de entrada</button>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {(form.data.tipos_entrada || []).map((type, index) => (
                                            <div key={index} className="grid gap-3 rounded-2xl border border-white bg-white p-4 shadow-sm md:grid-cols-[1.1fr_1fr_1fr_1fr_auto]">
                                                <input placeholder="Tipo" value={type.nombre} onChange={(e) => updateCreateType(index, 'nombre', e.target.value)} className="input" />
                                                <input type="number" min="0" step="0.01" placeholder="Precio Bs" value={type.precio} onChange={(e) => updateCreateType(index, 'precio', e.target.value)} className="input" />
                                                <input type="number" min="1" placeholder="Cupo" value={type.cupo_total} onChange={(e) => updateCreateType(index, 'cupo_total', e.target.value)} className="input" />
                                                <input type="number" min="1" placeholder="Máx. compra" value={type.limite_por_compra} onChange={(e) => updateCreateType(index, 'limite_por_compra', e.target.value)} className="input" />
                                                <button type="button" onClick={() => removeCreateType(index)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50" title="Quitar tipo"><XMarkIcon className="h-5 w-5" /></button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-bold ${assignedCapacity > Number(form.data.aforo_total || 0) && Number(form.data.aforo_total || 0) > 0 ? 'bg-red-50 text-red-700' : 'bg-white text-slate-600'}`}>
                                        <span>Aforo asignado a entradas</span>
                                        <span>{assignedCapacity} / {Number(form.data.aforo_total || 0)} {assignedCapacity > Number(form.data.aforo_total || 0) && Number(form.data.aforo_total || 0) > 0 ? '· supera el aforo' : ''}</span>
                                    </div>
                                </div>
                            )}

                            {editing && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-4">
                                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">Entradas registradas para este evento</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {editing.ticketTypes.length ? editing.ticketTypes.map((type) => (
                                            <span key={type.id} className="rounded-full bg-white px-3 py-2 text-xs font-bold text-violet-700 shadow-sm">{type.name} · Bs {type.price} · cupo {type.capacity}</span>
                                        )) : <span className="text-sm text-slate-400">Sin tipos registrados.</span>}
                                        <button type="button" onClick={openTypeCreatorForEditing} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-black text-violet-700"><PlusIcon className="mr-1 inline h-4 w-4" />Crear tipo de entrada</button>
                                    </div>
                                </div>
                            )}

                            <div className="lg:col-span-4">
                                {Object.values(form.errors).map((error, index) => <p key={index} className="mb-1 text-sm font-bold text-red-600">{error}</p>)}
                                <button disabled={form.processing} className="mt-2 rounded-xl bg-violet-600 px-6 py-3 font-black text-white shadow hover:bg-violet-700 disabled:opacity-50">
                                    {form.processing ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear evento'}
                                </button>
                            </div>
                        </form>
                    </Card>
                )}

                {typeEvent && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
                        <Card className="w-full max-w-lg p-6">
                            <div className="flex justify-between">
                                <div><h3 className="text-xl font-black">Crear tipo de entrada</h3><p className="text-sm text-slate-500">{typeEvent.title}</p></div>
                                <button type="button" onClick={() => setTypeEvent(null)} className="text-slate-400">✕</button>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); typeForm.post(`/admin/eventos/${typeEvent.id}/tipos`, { preserveScroll: true, onSuccess: () => setTypeEvent(null) }); }} className="mt-5 grid gap-4 sm:grid-cols-2">
                                <Field label="Nombre"><input className="input" value={typeForm.data.nombre} onChange={(e) => typeForm.setData('nombre', e.target.value)} /></Field>
                                <Field label="Precio"><input type="number" min="0" step="0.01" className="input" value={typeForm.data.precio} onChange={(e) => typeForm.setData('precio', e.target.value)} /></Field>
                                <Field label="Cupo"><input type="number" min="1" className="input" value={typeForm.data.cupo_total} onChange={(e) => typeForm.setData('cupo_total', e.target.value)} /></Field>
                                <Field label="Límite por compra"><input type="number" min="1" className="input" value={typeForm.data.limite_por_compra} onChange={(e) => typeForm.setData('limite_por_compra', e.target.value)} /></Field>
                                <Field label="Descripción" className="sm:col-span-2"><input className="input" value={typeForm.data.descripcion} onChange={(e) => typeForm.setData('descripcion', e.target.value)} /></Field>
                                {Object.values(typeForm.errors).map((error, index) => <p key={index} className="text-sm font-bold text-red-600 sm:col-span-2">{error}</p>)}
                                <button className="rounded-xl bg-violet-600 px-5 py-3 font-black text-white sm:col-span-2">Guardar tipo</button>
                            </form>
                        </Card>
                    </div>
                )}

                <style>{`.input{width:100%;border-radius:.75rem;border:1px solid rgb(226 232 240);font-size:.875rem}.input:focus{border-color:rgb(139 92 246);box-shadow:0 0 0 1px rgb(139 92 246);outline:none}`}</style>
            </div>
        </AdminLayout>
    );
}

function Field({ label, children, className = '' }) {
    return <label className={`block ${className}`}><span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>{children}</label>;
}

function tone(status) {
    return status === 'publicado' ? 'green' : status === 'programado' ? 'blue' : status === 'cancelado' ? 'red' : 'amber';
}
