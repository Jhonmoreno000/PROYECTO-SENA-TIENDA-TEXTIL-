import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Importación de íconos desde lucide-react
import {
    Truck,
    ShieldCheck,
    CreditCard,
    Headphones,
} from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function Benefits() {
    const containerRef = useRef(null);

    const benefits = [
        {
            icon: Truck,
            title: 'Envío Gratis',
            description: 'En compras superiores a $100.000',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: ShieldCheck,
            title: 'Garantía de Calidad',
            description: '100% telas auténticas y certificadas',
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: CreditCard,
            title: 'Pago Seguro',
            description: 'Múltiples métodos de pago disponibles',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: Headphones,
            title: 'Soporte 24/7',
            description: 'Atención personalizada cuando la necesites',
            color: 'from-orange-500 to-red-500',
        },
    ];

    useGSAP(() => {
        const cards = gsap.utils.toArray('.benefit-card');
        gsap.fromTo(cards, 
            { opacity: 0, y: 50, filter: 'blur(10px)' },
            { 
                opacity: 1, 
                y: 0, 
                filter: 'blur(0px)',
                duration: 1, 
                stagger: 0.15, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 85%", // Comienza la animación cuando el 85% superior del contenedor entra al viewport
                    once: true        // Solo se anima una vez
                }
            }
        );
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="section-container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                        <div
                            key={index}
                            className="benefit-card card p-6 text-center group cursor-pointer hover:-translate-y-2 hover:scale-105 transition-all duration-300"
                        >
                            <div className="mb-4 flex justify-center">
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${benefit.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2 dark:text-white">{benefit.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default Benefits;
