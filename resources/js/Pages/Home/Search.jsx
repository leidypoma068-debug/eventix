import { router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRightIcon,
    CalendarDaysIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    TicketIcon,
} from '@heroicons/react/24/outline';

export default function Search() {
    const {
        filters = {},
        categories = [],
        locations = [],
    } = usePage().props;

    const { data, setData, get, processing, errors } = useForm({
        search: filters.search || '',
        date: filters.date || '',
        category: filters.category ? String(filters.category) : '',
        location: filters.location || '',
    });

    const submit = (event) => {
        event.preventDefault();

        get('/', {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    };

    const applyCategory = (categoryId) => {
        const value = categoryId ? String(categoryId) : '';

        setData('category', value);

        router.get(
            '/',
            {
                search: data.search || undefined,
                date: data.date || undefined,
                category: value || undefined,
                location: data.location || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            }
        );
    };

    const fieldClass =
        'h-16 w-full rounded-2xl border border-violet-100 bg-white pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100';

    return (
        <section
            aria-label="Buscador de eventos"
            className="relative z-20 mx-auto -mt-7 w-full max-w-6xl"
        >
            <form
                onSubmit={submit}
                role="search"
                className="rounded-[24px] border border-violet-100 bg-white/95 p-3 shadow-[0_18px_50px_rgba(91,33,182,0.12)] backdrop-blur sm:p-4"
            >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
                    <div className="relative xl:col-span-4">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-600" />
                        <input
                            type="search"
                            name="search"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            placeholder="Buscar evento, artista o lugar..."
                            maxLength={120}
                            className={fieldClass}
                        />
                    </div>

                    <div className="relative xl:col-span-2">
                        <CalendarDaysIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-600" />
                        <input
                            type="date"
                            name="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            className={fieldClass}
                            aria-label="Fecha"
                        />
                    </div>

                    <div className="relative xl:col-span-2">
                        <TicketIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-600" />
                        <select
                            name="category"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            className={`${fieldClass} appearance-none`}
                            aria-label="Categoría"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map((category) => (
                                <option key={category.id} value={String(category.id)}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative xl:col-span-2">
                        <MapPinIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-600" />
                        <select
                            name="location"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            className={`${fieldClass} appearance-none`}
                            aria-label="Ubicación"
                        >
                            <option value="">Todas las ubicaciones</option>
                            {locations.map((location) => (
                                <option key={location} value={location}>
                                    {location}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700 disabled:cursor-wait disabled:opacity-60 xl:col-span-2"
                    >
                        <MagnifyingGlassIcon className="h-5 w-5" />
                        {processing ? 'Buscando...' : 'Buscar eventos'}
                        {!processing && <ArrowRightIcon className="h-4 w-4" />}
                    </button>
                </div>
            </form>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
                <button
                    type="button"
                    onClick={() => applyCategory('')}
                    className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                        data.category === ''
                            ? 'border-violet-600 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200'
                            : 'border-violet-100 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                    }`}
                >
                    Todos
                </button>

                {categories.map((category) => {
                    const selected = String(data.category) === String(category.id);

                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => applyCategory(category.id)}
                            className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                                selected
                                    ? 'border-violet-600 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200'
                                    : 'border-violet-100 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700'
                            }`}
                        >
                            {category.name}
                        </button>
                    );
                })}
            </div>

            {Object.keys(errors).length > 0 && (
                <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {Object.entries(errors).map(([field, message]) => (
                        <p key={field}>{message}</p>
                    ))}
                </div>
            )}
        </section>
    );
}
