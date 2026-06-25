import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Users, TrendingUp, Heart, Award, Handshake, Rocket, Leaf } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedPage from '../components/AnimatedPage';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function About() {
    const containerRef = useRef(null);

    const stats = [
        { icon: Star, value: '15+', label: 'Años de Experiencia' },
        { icon: Users, value: '10,000+', label: 'Clientes Satisfechos' },
        { icon: TrendingUp, value: '500+', label: 'Productos Premium' },
        { icon: Heart, value: '100%', label: 'Calidad Garantizada' },
    ];

    const values = [
        {
            title: 'Calidad Premium',
            description: 'Seleccionamos cuidadosamente cada tela para garantizar la más alta calidad en todos nuestros productos.',
            icon: Award,
        },
        {
            title: 'Compromiso',
            description: 'Nos comprometemos con la satisfacción de nuestros clientes, ofreciendo productos excepcionales y servicio personalizado.',
            icon: Handshake,
        },
        {
            title: 'Innovación',
            description: 'Constantemente buscamos las últimas tendencias y tecnologías en textiles para ofrecer lo mejor del mercado.',
            icon: Rocket,
        },
        {
            title: 'Sostenibilidad',
            description: 'Trabajamos con proveedores responsables y promovemos prácticas sostenibles en toda nuestra cadena de suministro.',
            icon: Leaf,
        },
    ];

    useGSAP(() => {
        gsap.fromTo('.about-hero-text', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });

        gsap.fromTo('.about-stat',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
                scrollTrigger: { trigger: '.about-stats', start: "top 80%", once: true } }
        );

        gsap.fromTo('.about-story-left', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: '.about-story', start: "top 80%", once: true } });
        gsap.fromTo('.about-story-right', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: '.about-story', start: "top 80%", once: true } });

        gsap.fromTo('.about-value',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out",
                scrollTrigger: { trigger: '.about-values', start: "top 80%", once: true } }
        );
    }, { scope: containerRef });

    return (
        <div className="min-h-screen flex flex-col" ref={containerRef}>
            <Header />

            <AnimatedPage className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="about-hero-text text-center">
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                                Sobre D&D Textil
                            </h1>
                            <p className="text-xl text-white/90 max-w-3xl mx-auto">
                                Somos una empresa familiar con más de 15 años de experiencia en la importación y distribución de telas de alta calidad para el mercado colombiano.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-white dark:bg-slate-900 about-stats">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={index} className="about-stat text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                                            <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                                            {stat.value}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="section-container about-story">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="about-story-left">
                            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                                Nuestra Historia
                            </h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                                <p>
                                    D&D Textil nació en 2009 con un sueño: hacer accesibles las mejores telas del mundo para diseñadores, modistas y amantes de la costura en Colombia.
                                </p>
                                <p>
                                    Lo que comenzó como un pequeño local en Bogotá, hoy se ha convertido en una de las distribuidoras de telas más reconocidas del país, con presencia en las principales ciudades y una plataforma digital que nos permite llegar a cada rincón de Colombia.
                                </p>
                                <p>
                                    Trabajamos directamente con fabricantes en Italia, Francia, España y Asia, garantizando autenticidad, calidad y los mejores precios del mercado.
                                </p>
                            </div>
                        </div>

                        <div className="about-story-right relative">
                            <img
                                src="https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=600&h=400&fit=crop"
                                alt="Nuestra tienda"
                                className="rounded-2xl shadow-2xl"
                            />
                            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-xs border border-gray-100 dark:border-slate-700">
                                <div className="text-primary-600 dark:text-primary-400 mb-2">
                                    <Award className="w-10 h-10" />
                                </div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                    Reconocidos por la excelencia
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Premio a la mejor distribuidora 2023
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="section-container bg-gray-50 dark:bg-slate-800 about-values">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            Nuestros Valores
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                            Los principios que guían cada decisión que tomamos
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div
                                    key={index}
                                    className="about-value bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/40 mb-6">
                                        <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                            ¿Listo para crear algo increíble?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Explora nuestro catálogo y descubre las mejores telas para tus proyectos
                        </p>
                        <a
                            href="/catalogo"
                            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:scale-105 active:scale-95"
                        >
                            Ver Catálogo
                        </a>
                    </div>
                </section>
            </AnimatedPage>

            <Footer />
        </div>
    );
}

export default About;
