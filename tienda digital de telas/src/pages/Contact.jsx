import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedPage from '../components/AnimatedPage';
import Globe from 'react-globe.gl';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Componente interactivo del globo terráqueo centrado en Medellín
const LocationGlobe = () => {
    const globeEl = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [temperature, setTemperature] = useState(null);
    const [time, setTime] = useState(new Date().toLocaleTimeString('es-CO', { hour12: false }));
    const containerRef = useRef();

    useEffect(() => {
        const observeTarget = containerRef.current;
        if (!observeTarget) return;
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });
        resizeObserver.observe(observeTarget);
        return () => resizeObserver.unobserve(observeTarget);
    }, []);

    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.pointOfView({ lat: 6.2442, lng: -75.5812, altitude: 1.2 }, 2000);
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
        }
    }, [dimensions]);

    useEffect(() => {
        const clockInterval = setInterval(() => {
            setTime(new Date().toLocaleTimeString('es-CO', { hour12: false }));
        }, 1000);

        const fetchTelemetry = async () => {
            try {
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=6.2442&longitude=-75.5812&current_weather=true');
                const data = await res.json();
                if (data?.current_weather) {
                    setTemperature(data.current_weather.temperature);
                }
            } catch (err) {
                console.error("Error al obtener telemetría:", err);
            }
        };

        fetchTelemetry();
        const tempInterval = setInterval(fetchTelemetry, 300000);
        
        return () => {
            clearInterval(clockInterval);
            clearInterval(tempInterval);
        };
    }, []);

    const marker = [{ 
        lat: 6.2442, lng: -75.5812, name: 'Medellín', color: '#10b981', temp: temperature, time: time 
    }];

    const currentHour = new Date().getHours();
    const isNight = currentHour < 6 || currentHour >= 18;
    const earthImageUrl = isNight 
        ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
        : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

    return (
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing relative">
            {dimensions.width > 0 && (
                <Globe
                    ref={globeEl}
                    width={dimensions.width}
                    height={dimensions.height}
                    globeImageUrl={earthImageUrl}
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    showAtmosphere={true}
                    atmosphereColor={isNight ? "#4338ca" : "#38bdf8"}
                    atmosphereAltitude={0.15}
                    ringsData={marker}
                    ringLat="lat"
                    ringLng="lng"
                    ringColor="color"
                    ringMaxRadius={4}
                    ringPropagationSpeed={1.5}
                    ringRepeatPeriod={1200}
                    labelsData={[]}
                    htmlElementsData={marker}
                    htmlElement={d => {
                        const el = document.createElement('div');
                        el.innerHTML = `
                            <div class="relative flex items-center justify-center w-4 h-4 cursor-pointer group">
                                <div class="absolute bottom-6 bg-white/90 backdrop-blur-md pl-3 pr-4 py-1.5 rounded-full text-xs font-black text-gray-900 shadow-2xl border border-white/40 flex items-center gap-2 whitespace-nowrap transform transition-transform group-hover:scale-110 group-hover:-translate-y-1">
                                    <div class="flex items-center gap-1.5 border-r border-gray-300 pr-2">
                                        <span class="text-emerald-500 text-[10px] animate-pulse">●</span> ${d.name}
                                    </div>
                                    <div class="flex items-center gap-1 text-primary-600 font-bold border-r border-gray-300 pr-2">
                                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        ${d.temp !== null ? d.temp + '°C' : '...'}
                                    </div>
                                    <div class="flex items-center gap-1 text-gray-700 font-mono font-bold tracking-tighter">
                                        <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        ${d.time}
                                    </div>
                                </div>
                                <div class="w-full h-full rounded-full border-2 border-white shadow-[0_0_15px_rgba(16,185,129,0.8)]" style="background-color: ${d.color};"></div>
                            </div>
                        `;
                        el.style.pointerEvents = 'auto';
                        return el;
                    }}
                    backgroundColor="rgba(0,0,0,0)"
                />
            )}
        </div>
    );
};

function Contact() {
    const containerRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', subject: '', message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        }, 3000);
    };

    const contactInfo = [
        { icon: MapPin, title: 'Dirección', info: 'Calle 123 #45-67', info2: 'Bogotá, Colombia', color: 'from-blue-500 to-cyan-500' },
        { icon: Phone, title: 'Teléfono', info: '+57 (1) 234 5678', info2: '+57 300 123 4567', color: 'from-green-500 to-emerald-500' },
        { icon: Mail, title: 'Email', info: 'info@ddtextil.com', info2: 'ventas@ddtextil.com', color: 'from-purple-500 to-pink-500' },
        { icon: Clock, title: 'Horario', info: 'Lun - Vie: 8:00 AM - 6:00 PM', info2: 'Sáb: 9:00 AM - 2:00 PM', color: 'from-orange-500 to-red-500' },
    ];

    useGSAP(() => {
        gsap.fromTo('.contact-hero-text', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });

        gsap.fromTo('.contact-card',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out",
                scrollTrigger: { trigger: '.contact-cards', start: "top 80%", once: true } }
        );

        gsap.fromTo('.contact-form', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: '.contact-form-section', start: "top 80%", once: true } });
        gsap.fromTo('.contact-map', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: '.contact-form-section', start: "top 80%", once: true } });
    }, { scope: containerRef });

    return (
        <div className="min-h-screen flex flex-col" ref={containerRef}>
            <Header />

            <AnimatedPage className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="contact-hero-text text-center">
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                                Contáctanos
                            </h1>
                            <p className="text-xl text-white/90 max-w-3xl mx-auto">
                                ¿Tienes alguna pregunta? Estamos aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Info Cards */}
                <section className="py-16 bg-white dark:bg-slate-900 contact-cards">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {contactInfo.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={index}
                                        className="contact-card card p-6 text-center shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-xl"
                                    >
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${item.color} mb-4`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{item.info}</p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{item.info2}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Contact Form & Map */}
                <section className="section-container contact-form-section">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Form */}
                        <div className="contact-form">
                            <h2 className="text-3xl font-display font-bold mb-6">
                                Envíanos un Mensaje
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Completa el formulario y nos pondremos en contacto contigo en menos de 24 horas.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block font-semibold mb-2">Nombre Completo *</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="Juan Pérez" />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="block font-semibold mb-2">Email *</label>
                                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="juan@ejemplo.com" />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block font-semibold mb-2">Teléfono</label>
                                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="300 123 4567" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block font-semibold mb-2">Asunto *</label>
                                    <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="input-field" placeholder="¿En qué podemos ayudarte?" />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block font-semibold mb-2">Mensaje *</label>
                                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows="5" className="input-field resize-none" placeholder="Escribe tu mensaje aquí..."></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary w-full flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                >
                                    <Send className="w-4 h-4" />
                                    Enviar Mensaje
                                </button>

                                {submitted && (
                                    <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg text-center font-semibold">
                                        ✓ ¡Mensaje enviado exitosamente! Te contactaremos pronto.
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Map & Additional Info */}
                        <div className="contact-map space-y-8">
                            <div className="card overflow-hidden h-[400px] bg-black flex items-center justify-center relative">
                                <LocationGlobe />
                                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20">
                                     Medellín, Colombia
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className="card p-8">
                                <h3 className="text-2xl font-bold mb-6">Preguntas Frecuentes</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold mb-2">¿Hacen envíos a toda Colombia?</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Sí, realizamos envíos a todo el territorio nacional. Envío gratis en compras superiores a $100.000.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2">¿Puedo visitar la tienda física?</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">¡Por supuesto! Estamos ubicados en Bogotá. Te recomendamos agendar una cita para una atención personalizada.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2">¿Ofrecen muestras de telas?</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">Sí, ofrecemos muestras de hasta 10x10 cm por un costo mínimo. Contáctanos para más información.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Media */}
                <section className="bg-gray-50 dark:bg-slate-800 py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-display font-bold mb-6">Síguenos en Redes Sociales</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Mantente al día con nuestras últimas novedades, promociones y tendencias</p>
                        <div className="flex justify-center gap-4">
                            {['Facebook', 'Instagram', 'Twitter', 'Pinterest'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl hover:scale-110 active:scale-90 transition-all"
                                >
                                    {social[0]}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            </AnimatedPage>

            <Footer />
        </div>
    );
}

export default Contact;
