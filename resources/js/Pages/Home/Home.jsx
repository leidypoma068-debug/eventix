import { Head, usePage } from '@inertiajs/react';
import EventixHeader from '../../Components/EventixHeader';
import ClientLayout from '../../Layouts/ClientLayout';
import GuestHeroCarousel from '../../Components/GuestHeroCarousel';
import Search from './Search';
import ItemList from './ItemList';

function HomeContent() {
    return (
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
            <GuestHeroCarousel />

            <section id="eventos" className="scroll-mt-24 pt-2">
                <Search />
                <ItemList />
            </section>
        </main>
    );
}

export default function Home() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const role = user?.role ?? user?.rol ?? null;
    const isClient = Boolean(user) && role === 'cliente';

    return (
        <>
            <Head title="Eventos" />

            {isClient ? (
                <ClientLayout>
                    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-violet-50/60 via-slate-50 to-white">
                        <HomeContent />
                    </div>
                </ClientLayout>
            ) : (
                <div className="min-h-screen bg-gradient-to-b from-violet-50/60 via-slate-50 to-white pt-20">
                    <EventixHeader />
                    <HomeContent />
                </div>
            )}
        </>
    );
}
