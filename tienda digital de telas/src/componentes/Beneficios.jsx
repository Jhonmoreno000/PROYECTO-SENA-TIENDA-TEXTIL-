import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatCurrency } from '../utilidades/formateadores';

// Importación de íconos desde lucide-react
import {
    Truck,
    ShieldCheck,
    CreditCard,
    Headphones,
} from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function Beneficios() {
    const containerRef = useRef(null);

    const benefits = [
        {
            icon: Truck,
            title: 'Envío Gratis',
            description: `En compras superiores a ${formatCurrency(100000)}`,
            iconColor: 'text-white',
            badgeBg: 'bg-sky-500 shadow-md shadow-sky-500/30',
            glow: 'rgba(14, 165, 233, 0.15)',
        },
        {
            icon: ShieldCheck,
            title: 'Garantía de Calidad',
            description: '100% telas auténticas y certificadas',
            iconColor: 'text-white',
            badgeBg: 'bg-emerald-500 shadow-md shadow-emerald-500/30',
            glow: 'rgba(16, 185, 129, 0.15)',
        },
        {
            icon: CreditCard,
            title: 'Pago Seguro',
            description: 'Múltiples métodos de pago disponibles',
            iconColor: 'text-white',
            badgeBg: 'bg-purple-600 shadow-md shadow-purple-600/30',
            glow: 'rgba(168, 85, 247, 0.15)',
        },
        {
            icon: Headphones,
            title: 'Soporte 24/7',
            description: 'Atención personalizada cuando la necesites',
            iconColor: 'text-white',
            badgeBg: 'bg-orange-500 shadow-md shadow-orange-500/30',
            glow: 'rgba(249, 115, 22, 0.15)',
        },
    ];

    useGSAP(() => {
        const cards = gsap.utils.toArray('.benefit-card');
        gsap.fromTo(cards, 
            { opacity: 0, y: 18, scale: 0.98 },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                duration: 0.32, 
                stagger: 0.03, 
                ease: "power3.out",
                force3D: true,
                clearProps: "transform",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 88%",
                    once: true
                }
            }
        );
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="section-container my-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                        <div
                            key={index}
                            className="benefit-card relative p-7 text-center rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-lg shadow-slate-900/5 hover:shadow-2xl hover:border-primary-500/40 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer overflow-hidden"
                            style={{
                                background: `radial-gradient(circle at 50% 15%, ${benefit.glow}, transparent 75%)`,
                            }}
                        >
                            <div className="mb-5 flex justify-center">
                                <div className={`w-16 h-16 rounded-full ${benefit.badgeBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {benefit.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                {benefit.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default Beneficios;
