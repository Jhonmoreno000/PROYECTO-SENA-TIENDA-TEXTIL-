import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

import { useGSAP } from '@gsap/react';


import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getApiUrl } from '../config';

// Slides de respaldo si el backend no responde (los mismos apartados por defecto)
const FALLBACK_SLIDES = [
    { id: 1, title: 'Nueva Colección 2024', subtitle: 'Tendencias exclusivas en telas premium', image: '/images/carousel-nueva-coleccion.png', cta: 'Ver Más', sectionKey: 'nuevas' },
    { id: 2, title: 'Telas Exclusivas', subtitle: 'Diseños únicos para proyectos especiales', image: '/images/carousel-telas-exclusivas.png', cta: 'Explorar', sectionKey: 'exclusivas' },
    { id: 3, title: 'Ofertas Especiales', subtitle: 'Descuentos increíbles en telas seleccionadas', image: '/images/carousel-ofertas-especiales.png', cta: 'Ver Ofertas', sectionKey: 'ofertas' },
];

function Carousel() {
    const navigate = useNavigate();
    const [carouselSlides, setCarouselSlides] = useState(FALLBACK_SLIDES);
    const slides = carouselSlides && carouselSlides.length > 0 ? carouselSlides : FALLBACK_SLIDES;

    const [currentSlide, setCurrentSlide] = useState(0);
    const currentRef = useRef(0);
    const containerRef = useRef(null);
    const slidesRef = useRef([]);

    const animateSlideChange = useCallback((oldIndex, newIndex, direction) => {
        const oldSlide = slidesRef.current[oldIndex];
        const newSlide = slidesRef.current[newIndex];
        
        if (!oldSlide || !newSlide) return;

        gsap.set(newSlide, { xPercent: direction * 100, opacity: 1, zIndex: 10 });
        gsap.set(oldSlide, { zIndex: 1 });

        const title = newSlide.querySelector('.carousel-title');
        const subtitle = newSlide.querySelector('.carousel-subtitle');
        const cta = newSlide.querySelector('.carousel-cta');
        gsap.set([title, subtitle, cta], { y: 30, opacity: 0 });

        const tl = gsap.timeline();
        tl.to(oldSlide, { xPercent: -direction * 50, opacity: 0, duration: 0.8, ease: "power2.inOut" }, 0);
        tl.to(newSlide, { xPercent: 0, opacity: 1, duration: 0.8, ease: "power2.inOut" }, 0);
        tl.to([title, subtitle, cta], {
            y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power2.out"
        }, "-=0.3");

        setCurrentSlide(newIndex);
        currentRef.current = newIndex;
    }, []);

    const nextSlide = useCallback(() => {
        const next = (currentRef.current + 1) % slides.length;
        animateSlideChange(currentRef.current, next, 1);
    }, [slides.length, animateSlideChange]);

    const prevSlide = useCallback(() => {
        const prev = (currentRef.current - 1 + slides.length) % slides.length;
        animateSlideChange(currentRef.current, prev, -1);
    }, [slides.length, animateSlideChange]);

    const goToSlide = useCallback((index) => {
        if (index === currentRef.current) return;
        animateSlideChange(currentRef.current, index, index > currentRef.current ? 1 : -1);
    }, [animateSlideChange]);

    // Auto play (usa ref para evitar stale closure)
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 6000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    // Carga los slides desde la base de datos (los administra el panel admin)
    useEffect(() => {
        fetch(getApiUrl('/api/carousel'))
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.length > 0) {
                    setCarouselSlides(data);
                }
            })
            .catch(() => {
                // Si el backend no responde se mantienen los slides de respaldo
            });
    }, []);

    // Configuración inicial del primer render
    useGSAP(() => {
        slidesRef.current.forEach((slide, i) => {
            if (i === currentSlide) {
                gsap.set(slide, { xPercent: 0, opacity: 1, zIndex: 10 });
                const title = slide.querySelector('.carousel-title');
                const subtitle = slide.querySelector('.carousel-subtitle');
                const cta = slide.querySelector('.carousel-cta');
                gsap.set([title, subtitle, cta], { y: 0, opacity: 1 });
            } else {
                gsap.set(slide, { xPercent: 100, opacity: 0, zIndex: 1 });
            }
        });
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="relative w-full h-[450px] md:h-[600px] overflow-hidden bg-gray-900 group">
            {/* Renderizamos todos los slides absolutamente superpuestos */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    ref={el => slidesRef.current[index] = el}
                    className="absolute inset-0 w-full h-full"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent"></div>
                    </div>

                    <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
                        <div className="max-w-4xl mt-12">
                            <h2 className="carousel-title text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-4 tracking-tight drop-shadow-md">
                                {slide.title}
                            </h2>
                            <p className="carousel-subtitle text-lg md:text-2xl text-gray-200 mb-10 font-light max-w-2xl mx-auto drop-shadow-sm">
                                {slide.subtitle}
                            </p>
                            <div className="carousel-cta">
                                <button
                                    onClick={() => navigate(slide.sectionKey ? `/catalogo?seccion=${slide.sectionKey}` : '/catalogo')}
                                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md px-10 py-3.5 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_24px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95"
                                >
                                    {slide.cta || 'Explorar Colección'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Flechas de Navegación (Tailwind Transitions) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 backdrop-blur-xl border border-white/10 text-white p-3 md:p-4 rounded-full transition-all shadow-lg hover:scale-110 hover:-translate-x-1 active:scale-90"
                    aria-label="Anterior slide"
                >
                    <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 backdrop-blur-xl border border-white/10 text-white p-3 md:p-4 rounded-full transition-all shadow-lg hover:scale-110 hover:translate-x-1 active:scale-90"
                    aria-label="Siguiente slide"
                >
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
            </div>

            {/* Indicadores de Puntos */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2.5 rounded-full transition-all duration-500 ease-out hover:scale-110 ${
                            index === currentSlide
                                ? 'bg-white w-10 shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                                : 'bg-white/40 hover:bg-white/70 w-2.5'
                        }`}
                        aria-label={`Ir al slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

export default Carousel;
