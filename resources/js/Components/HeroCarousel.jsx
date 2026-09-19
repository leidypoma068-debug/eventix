import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
    {
        title: 'Vive la música como nunca',
        subtitle: 'Conciertos, festivales y experiencias inolvidables.',
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=85',
    },
    {
        title: 'Encuentra tu próximo evento',
        subtitle: 'Descubre experiencias únicas en La Paz y mucho más.',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85',
    },
    {
        title: 'Tu entrada, siempre contigo',
        subtitle: 'Compra, guarda y presenta tu QR directamente desde EVENTIX.',
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=85',
    },
];

export default function HeroCarousel() {
    return (
        <section className="overflow-hidden rounded-[28px] shadow-xl">
            <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                effect="fade"
                loop
                autoplay={{
                    delay: 4500,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                className="h-[420px]"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div
                            className="relative h-[420px] w-full bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${slide.image})`,
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-950/90 via-violet-800/65 to-transparent" />

                            <div className="relative z-10 flex h-full max-w-3xl flex-col justify-center px-8 md:px-16">
                                <span className="mb-4 w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                                    EVENTIX · Vive más eventos
                                </span>

                                <h1 className="max-w-2xl text-4xl font-black leading-tight text-white md:text-6xl">
                                    {slide.title}
                                </h1>

                                <p className="mt-5 max-w-xl text-base text-violet-100 md:text-lg">
                                    {slide.subtitle}
                                </p>

                                <div className="mt-7 flex flex-wrap gap-3">
                                    <a
                                        href="#eventos"
                                        className="rounded-xl bg-white px-6 py-3 font-bold text-violet-700 shadow-lg transition hover:scale-105"
                                    >
                                        Explorar eventos
                                    </a>
                                    <a
                                        href="/mis-entradas"
                                        className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
                                        >
                                            Mis entradas
                                        </a>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}