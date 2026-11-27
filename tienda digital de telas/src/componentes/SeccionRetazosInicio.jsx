import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scissors, ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import TarjetaRetazo from './TarjetaRetazo';
import { getApiUrl } from '../config';

gsap.registerPlugin(ScrollTrigger);

const RETAZOS_DESTACADOS_DEFAULT = [
    {
        id: 901,
        remnantCode: 'RET-ROL-101',
        productId: 1,
        name: 'Lino Belga Natural',
        category: 'Lino',
        material: '100% Lino Europeo',
        image: '/images/hero-detail-1.webp',
        lengthMeters: 0.85,
        widthMeters: 1.50,
        originalPrice: 38250,
        price: 22950,
        discountPercent: 40,
        status: 'DISPONIBLE',
        dyeLot: 'LT-2026-01',
        notes: 'Remanente de corte limpio de rollo maestro, ideal para blusas, cojines o sastrería.',
    },
    {
        id: 902,
        remnantCode: 'RET-ROL-104',
        productId: 2,
        name: 'Seda Italiana Marfil',
        category: 'Seda',
        material: '100% Seda Natural',
        image: '/images/hero-detail-2.webp',
        lengthMeters: 0.70,
        widthMeters: 1.45,
        originalPrice: 52500,
        price: 31500,
        discountPercent: 40,
        status: 'DISPONIBLE',
        dyeLot: 'LT-2026-04',
        notes: 'Pieza única con caída fluida y brillo satinado, lista para pañoletas o forrería fina.',
    },
    {
        id: 903,
        remnantCode: 'RET-ROL-109',
        productId: 3,
        name: 'Algodón Egipcio Peinado',
        category: 'Algodon',
        material: '100% Algodón Egipcio',
        image: '/images/hero-detail-3.webp',
        lengthMeters: 0.65,
        widthMeters: 1.50,
        originalPrice: 24700,
        price: 14820,
        discountPercent: 40,
        status: 'DISPONIBLE',
        dyeLot: 'LT-2026-09',
        notes: 'Sobrante de lote verificado con tacto suave y alta densidad de hilo.',
    },
];

function SeccionRetazosInicio() {
    const [retazos, setRetazos] = useState(RETAZOS_DESTACADOS_DEFAULT);
    const containerRef = useRef(null);

    useEffect(() => {
        let montado = true;
        fetch(getApiUrl('/api/retazos'))
            .then(res => res.ok ? res.json() : null)
            .then(datos => {
                if (montado && Array.isArray(datos) && datos.length > 0) {
                    setRetazos(datos.slice(0, 3));
                }
            })
            .catch(() => {
                // Silencioso: mantiene los destacados por defecto
            });
        return () => { montado = false; };
    }, []);

    useGSAP(() => {
        const tl = gsap.timeline({
            defaults: { force3D: true },
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 88%",
                once: true
            }
        });

        tl.fromTo('.sr-header',
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.28, stagger: 0.03, ease: "power2.out" }
        );

        tl.fromTo('.sr-card',
            { opacity: 0, y: 18, scale: 0.98 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 0.32, force3D: true, stagger: 0.03, ease: "power3.out",
                clearProps: "transform"
            },
            "-=0.18"
        );

        tl.fromTo('.sr-cta',
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.2)", clearProps: "transform" },
            "-=0.15"
        );
    }, { scope: containerRef, dependencies: [retazos.length] });

    return (
        <section ref={containerRef} className="section-container bg-amber-50/40 dark:bg-slate-900/60 border-y border-amber-200/40 dark:border-amber-900/20 py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Encabezado de la Sección */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3 border border-amber-300/50 dark:border-amber-800/40">
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Oportunidad de Liquidación Textil</span>
                        <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-bold">40% OFF</span>
                    </div>

                    <h2 className="sr-header text-3xl md:text-4xl font-display font-bold mb-3 dark:text-white">
                        Venta de <span className="text-gradient">Retazos Exclusivos</span>
                    </h2>
                    <p className="sr-header text-gray-600 dark:text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
                        Piezas finales únicas de rollos maestros con medidas fijas, trazabilidad de tintorería y descuento cerrado. ¡Ideales para diseñadores y creadores!
                    </p>
                </div>

                {/* Grid de Retazos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10">
                    {retazos.map((retazo) => (
                        <div key={retazo.id} className="sr-card">
                            <TarjetaRetazo retazo={retazo} />
                        </div>
                    ))}
                </div>

                {/* Llamado a la Acción y Garantías */}
                <div className="sr-cta flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800/90 shadow-sm border border-slate-200/80 dark:border-slate-700">
                    <div className="flex items-center gap-3 text-left">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                Garantía de Pieza Única
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Medidas exactas verificadas en bodega, stock unitario (1 sola unidad por pieza) y entrega inmediata.
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/retazos"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 shrink-0"
                    >
                        <span>Explorar todos los Retazos</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default SeccionRetazosInicio;
