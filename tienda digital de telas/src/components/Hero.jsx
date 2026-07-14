import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import Counter from './Counter';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const textRef = useRef(null);
    const badgeRef = useRef(null);
    const patternRef = useRef(null);

    useGSAP(() => {
        // 1. Línea de tiempo maestra para la entrada inicial
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        // Animación de la Imagen (Clip Path Reveal + Zoom interior) - Optimized
        tl.fromTo(imageRef.current, 
            { clipPath: "inset(100% 0% 0% 0%)", scale: 1.05 },
            { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.2, force3D: true }
        );

        if (textRef.current) {
            const texts = textRef.current.children;
            tl.fromTo(texts,
                {
                    y: 30,
                    opacity: 0
                },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.12,
                    ease: "power3.out",
                    force3D: true
                },
                "-=0.6"
            );
        }

        // Animación de entrada para el badge flotante
        if (badgeRef.current) {
            tl.fromTo(badgeRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 },
                "-=0.5"
            );
        }

        gsap.to(imageRef.current, {
            y: "15%",
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: 1
            }
        });

        if (badgeRef.current) {
            gsap.to(badgeRef.current, {
                y: "-50%",
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1
                }
            });
        }

        if (patternRef.current) {
            gsap.to(patternRef.current, {
                y: 200,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1
                }
            });
        }
    }, { scope: containerRef }); // Scope limita el alcance de las selecciones

    return (
        <section ref={containerRef} className="relative min-h-[700px] lg:min-h-[850px] flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-black dark:to-gray-900 pt-24 lg:pt-0">
            
            {/* ===== CAPA DE PARALLAX: Patrón de fondo geométrico ===== */}
            <div 
                ref={patternRef} 
                className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none w-full h-[120%] will-change-transform"
            >
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="section-container relative z-10 w-full grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                
                {/* Contenedor de Textos */}
                <div ref={textRef} className="text-left order-2 lg:order-1 pt-10 lg:pt-0">
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold mb-8 leading-tight text-gray-900 dark:text-white">
                        <span>Telas de </span><br className="hidden lg:block"/>
                        <span className="text-gradient inline-block ml-0 lg:ml-2 pb-2">Calidad alta gama</span>
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-300 mb-12 max-w-xl leading-relaxed">
                        Descubre nuestra exclusiva colección de telas importadas y nacionales.
                        Diseños atemporales y calidad excepcional para proyectos que exigen la perfección.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mb-16">
                        <Link 
                            to="/catalogo" 
                            className="group relative flex items-center justify-center gap-2 py-4 px-8 text-sm uppercase tracking-widest font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 overflow-hidden rounded-sm"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Explorar Colección <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-orange-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
                        </Link>
                        
                        <Link 
                            to="/nosotros" 
                            className="flex items-center justify-center py-4 px-8 text-sm uppercase tracking-widest font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white transition-colors duration-300 rounded-sm"
                        >
                            Conocer Más
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-8 max-w-md pt-8 border-t border-gray-200 dark:border-gray-800">
                        {[{ val: 500, suf: "+", label: "Productos" },
                          { val: 100, suf: "%", label: "Calidad" },
                          { val: 24, suf: "/7", label: "Soporte" }].map((stat, idx) => (
                            <div key={idx} className="text-left">
                                <div className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-1">
                                    <Counter value={stat.val} suffix={stat.suf} delay={1.5 + (idx * 0.2)} />
                                </div>
                                <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contenedor de Imagen (Clip-Path UI y Glassmorphism) */}
                <div className="order-1 lg:order-2 h-[50vh] lg:h-[75vh] w-full relative overflow-hidden rounded-bl-[4rem] rounded-tr-[4rem] shadow-2xl shadow-gray-200/50">
                    <img 
                        ref={imageRef}
                        src="/images/hero-telas-premium.png" 
                        alt="Telas de Lujo"
                        className="w-full h-full object-cover origin-center will-change-transform"
                        style={{ clipPath: "inset(100% 0% 0% 0%)" }}
                    />
                    
                    {/* Badge Envío Gratis (Minimalista con bordes finos) */}
                    <div 
                        ref={badgeRef}
                        className="absolute bottom-8 left-8 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 rounded-full border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] will-change-transform"
                    >
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-widest">
                            Envío Gratis +100k
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
