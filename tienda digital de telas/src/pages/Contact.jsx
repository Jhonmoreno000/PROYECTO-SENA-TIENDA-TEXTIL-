import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, Send, Navigation, ExternalLink, Store } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedPage from '../components/AnimatedPage';
import { EASES, microPress, microRelease } from '../utils/animations';

gsap.registerPlugin(ScrollTrigger);

const STORE_LOCATION = {
    lat: 4.7110,
    lng: -74.0721,
    address: 'Calle 123 #45-67',
    city: 'Bogotá, Colombia',
    phone: '+57 (1) 234 5678',
    phone2: '+57 300 123 4567',
    email: 'info@ddtextil.com',
    email2: 'ventas@ddtextil.com',
    hours: 'Lun - Vie: 8:00 AM - 6:00 PM',
    hours2: 'Sáb: 9:00 AM - 2:00 PM',
    mapsQuery: 'Cra.+7+%2372-01,+Bogot%C3%A1',
};

function InteractiveMap() {
    const iframeRef = useRef(null);
    const [mapMode, setMapMode] = useState('roadmap');

    const src = `https://www.google.com/maps/embed?q=${STORE_LOCATION.lat},${STORE_LOCATION.lng}&z=16${mapMode === 'satellite' ? '&t=k' : ''}`;

    const openDirections = () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${STORE_LOCATION.lat},${STORE_LOCATION.lng}`, '_blank');
    };

    return (
        <div className="relative w-full h-full">
            <iframe
                ref={iframeRef}
                title="Ubicación D&D Textil"
                src={src}
                className="w-full h-full"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-4 left-4 flex gap-2 pointer-events-auto">
                    <button onClick={() => setMapMode('roadmap')}
                        onMouseDown={(e) => microPress(e.currentTarget)}
                        onMouseUp={(e) => microRelease(e.currentTarget)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md border transition-all duration-200 ${
                            mapMode === 'roadmap'
                            ? 'bg-primary-600 text-white border-primary-500 shadow-lg'
                            : 'bg-black/50 text-white/80 border-white/20 hover:bg-black/70'}`}>
                        Mapa
                    </button>
                    <button onClick={() => setMapMode('satellite')}
                        onMouseDown={(e) => microPress(e.currentTarget)}
                        onMouseUp={(e) => microRelease(e.currentTarget)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md border transition-all duration-200 ${
                            mapMode === 'satellite'
                            ? 'bg-primary-600 text-white border-primary-500 shadow-lg'
                            : 'bg-black/50 text-white/80 border-white/20 hover:bg-black/70'}`}>
                        Satélite
                    </button>
                </div>
                <button onClick={openDirections}
                    onMouseDown={(e) => microPress(e.currentTarget)}
                    onMouseUp={(e) => microRelease(e.currentTarget)}
                    className="absolute bottom-4 right-4 pointer-events-auto flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all duration-200">
                    <Navigation className="w-4 h-4" />
                    Cómo Llegar
                </button>
            </div>
        </div>
    );
}

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
        { icon: MapPin, title: 'Dirección', info: STORE_LOCATION.address, info2: STORE_LOCATION.city, color: 'from-blue-500 to-cyan-500' },
        { icon: Phone, title: 'Teléfono', info: STORE_LOCATION.phone, info2: STORE_LOCATION.phone2, color: 'from-green-500 to-emerald-500' },
        { icon: Mail, title: 'Email', info: STORE_LOCATION.email, info2: STORE_LOCATION.email2, color: 'from-purple-500 to-pink-500' },
        { icon: Clock, title: 'Horario', info: STORE_LOCATION.hours, info2: STORE_LOCATION.hours2, color: 'from-orange-500 to-red-500' },
    ];

    useGSAP(() => {
        gsap.fromTo('.contact-hero-text', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: EASES.smooth });

        gsap.fromTo('.contact-card',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: EASES.springGentle,
                scrollTrigger: { trigger: '.contact-cards', start: "top 80%", once: true } }
        );

        gsap.fromTo('.contact-form', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: EASES.smooth,
            scrollTrigger: { trigger: '.contact-form-section', start: "top 80%", once: true } });
        gsap.fromTo('.contact-map', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.6, ease: EASES.smooth,
            scrollTrigger: { trigger: '.contact-form-section', start: "top 80%", once: true } });
    }, { scope: containerRef });

    return (
        <div className="min-h-screen flex flex-col" ref={containerRef}>
            <Header />

            <AnimatedPage className="flex-1">
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

                <section className="section-container contact-form-section">
                    <div className="grid lg:grid-cols-2 gap-12">
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

                                <button type="submit"
                                    onMouseDown={(e) => microPress(e.currentTarget)}
                                    onMouseUp={(e) => microRelease(e.currentTarget)}
                                    className="btn-primary w-full flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Enviar Mensaje
                                </button>

                                {submitted && (
                                    <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg text-center font-semibold">
                                        ¡Mensaje enviado exitosamente! Te contactaremos pronto.
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="contact-map space-y-8">
                            <div className="card overflow-hidden h-[450px] relative group">
                                <InteractiveMap />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold border border-white/20 flex items-center gap-1.5 z-20">
                                    <Store className="w-3.5 h-3.5" />
                                    {STORE_LOCATION.city}
                                </div>
                            </div>

                            <div className="card p-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                        <Store className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">Visítanos</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Te esperamos en nuestra tienda física</p>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300">{STORE_LOCATION.address}, {STORE_LOCATION.city}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300">{STORE_LOCATION.hours}</p>
                                            <p className="text-gray-700 dark:text-gray-300">{STORE_LOCATION.hours2}</p>
                                        </div>
                                    </div>
                                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${STORE_LOCATION.lat},${STORE_LOCATION.lng}`}
                                        target="_blank"
                                        onMouseDown={(e) => microPress(e.currentTarget)}
                                        onMouseUp={(e) => microRelease(e.currentTarget)}
                                        className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all duration-200">
                                        <ExternalLink className="w-4 h-4" />
                                        Abrir en Google Maps
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-50 dark:bg-slate-800 py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-display font-bold mb-6">Síguenos en Redes Sociales</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Mantente al día con nuestras últimas novedades, promociones y tendencias</p>
                        <div className="flex justify-center gap-4">
                            {['Facebook', 'Instagram', 'Twitter', 'Pinterest'].map((social) => (
                                <a key={social} href="#"
                                    onMouseDown={(e) => microPress(e.currentTarget)}
                                    onMouseUp={(e) => microRelease(e.currentTarget)}
                                    className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl hover:scale-110 active:scale-90 transition-all">
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
