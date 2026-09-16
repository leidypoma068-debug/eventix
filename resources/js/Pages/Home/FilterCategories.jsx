import {
    MusicalNoteIcon,
    SparklesIcon,
    FilmIcon,
    TrophyIcon,
    FaceSmileIcon,
    UserGroupIcon,
    BuildingLibraryIcon,
    TicketIcon,
} from '@heroicons/react/24/outline';

const categoryIcons = {
    Conciertos: MusicalNoteIcon,
    Festivales: SparklesIcon,
    Teatro: FilmIcon,
    Deportes: TrophyIcon,
    Comedia: FaceSmileIcon,
    Familia: UserGroupIcon,
    'Arte y Cultura': BuildingLibraryIcon,
};

export default function FilterCategories({
    categories = [],
    value = '',
    onChange,
    disabled = false,
}) {
    function buttonClass(active) {
        const base =
            'inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-wait disabled:opacity-60';

        return `${base} ${
            active
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-primary-100 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50'
        }`;
    }

    return (
        <div
            role="group"
            aria-label="Seleccionar categoría"
            className="mt-4 flex flex-wrap gap-2"
        >
            <button
                type="button"
                disabled={disabled}
                aria-pressed={value === ''}
                onClick={() => onChange('')}
                className={buttonClass(value === '')}
            >
                Todos
            </button>

            {categories.map((category) => {
                const active = String(value) === String(category.id);
                const Icon = categoryIcons[category.name] || TicketIcon;

                return (
                    <button
                        key={category.id}
                        type="button"
                        disabled={disabled}
                        aria-pressed={active}
                        onClick={() => onChange(String(category.id))}
                        className={buttonClass(active)}
                    >
                        <Icon
                            aria-hidden="true"
                            className={`h-4 w-4 ${
                                active ? 'text-white' : 'text-primary-600'
                            }`}
                        />

                        {category.name}
                    </button>
                );
            })}
        </div>
    );
}