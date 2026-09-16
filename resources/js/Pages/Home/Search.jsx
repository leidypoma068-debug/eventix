import { useForm, usePage } from '@inertiajs/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import FilterCategories from './FilterCategories';

export default function Search() {
    const {
        filters = {},
        categories = [],
        locations = [],
    } = usePage().props;

    const { data, setData, get, processing, errors } = useForm({
        search: filters.search || '',
        date: filters.date || '',
        category: filters.category || '',
        location: filters.location || '',
    });

    function handleChange(event) {
        setData(event.target.name, event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();

        get('/', {
            preserveScroll: true,
            preserveState: false,
        });
    }

    const fieldClass =
        'h-12 w-full min-w-0 rounded-lg border border-primary-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-600 focus:ring-primary-600 disabled:bg-slate-50 disabled:text-slate-400';

    const labelClass =
        'mb-2 block text-xs font-semibold text-slate-600';

    return (
        <section
            aria-label="Buscador de eventos"
            className="mt-6 rounded-2xl border border-primary-100 bg-white p-4 shadow-sm sm:p-5"
        >
            <form
                onSubmit={handleSubmit}
                role="search"
                className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-12"
            >
                <div className="min-w-0 sm:col-span-2 lg:col-span-4">
                    <label htmlFor="event-search" className="sr-only">
                        Buscar eventos
                    </label>

                    <div className="relative">
                        <MagnifyingGlassIcon
                            className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-primary-600"
                            aria-hidden="true"
                        />

                        <input
                            id="event-search"
                            type="search"
                            name="search"
                            value={data.search}
                            onChange={handleChange}
                            maxLength={120}
                            placeholder="Buscar eventos, artistas o lugares..."
                            className={`${fieldClass} pl-10`}
                        />
                    </div>
                </div>

                <div className="min-w-0 lg:col-span-2">
                    <label htmlFor="event-date" className={labelClass}>
                        Fecha
                    </label>

                    <input
                        id="event-date"
                        type="date"
                        name="date"
                        value={data.date}
                        onChange={handleChange}
                        className={fieldClass}
                    />
                </div>

                <div className="min-w-0 lg:col-span-2">
                    <label htmlFor="event-category" className={labelClass}>
                        Categoría
                    </label>

                    <select
                        id="event-category"
                        name="category"
                        value={data.category}
                        onChange={handleChange}
                        disabled={categories.length === 0}
                        className={fieldClass}
                    >
                        <option value="">Todas las categorías</option>

                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="min-w-0 lg:col-span-2">
                    <label htmlFor="event-location" className={labelClass}>
                        Ubicación
                    </label>

                    <select
                        id="event-location"
                        name="location"
                        value={data.location}
                        onChange={handleChange}
                        disabled={locations.length === 0}
                        className={fieldClass}
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
                    className="btn btn-primary h-12 gap-2 disabled:cursor-wait disabled:opacity-60 lg:col-span-2"
                >
                    <MagnifyingGlassIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                    />

                    {processing ? 'Enviando…' : 'Buscar'}
                </button>
            </form>

                        <FilterCategories
                categories={categories}
                value={data.category}
                onChange={(category) => setData('category', category)}
                disabled={processing}
            />
            

            {Object.keys(errors).length > 0 && (
                <div role="alert" className="mt-3 text-sm text-red-600">
                    {Object.entries(errors).map(([field, message]) => (
                        <p key={field}>{message}</p>
                    ))}
                </div>
            )}
        </section>
    );
}