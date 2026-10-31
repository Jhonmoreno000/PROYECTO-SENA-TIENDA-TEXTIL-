import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    MapPin, Phone, Mail, Clock, Send, Navigation,
    ExternalLink, Store, Map as MapIcon, Satellite, Shuffle
} from 'lucide-react';
import Encabezado from '../componentes/Encabezado';
import PieDePagina from '../componentes/PieDePagina';
import PaginaAnimada from '../componentes/PaginaAnimada';
import { EASES, microPress, microRelease } from '../utilidades/animations';

gsap.registerPlugin(ScrollTrigger);

// Direcciones reales en el Centro de Medellín (Comuna 10 - La Candelaria)
const DIRECCIONES_CENTRO_MEDELLIN = [
    {
        address: 'Cra. 52 # 48-30 (Carabobo con Pichincha)',
        sector: 'Sector Textil El Hueco - Palacio Nacional',
        city: 'Centro de Medellín, Antioquia',
        lat: 6.2492,
        lng: -75.5694,
    },
    {
        address: 'Calle 50 # 51-24 (Colombia con Bolívar)',
        sector: 'Zona Comercial Parque Berrío',
        city: 'Centro de Medellín, Antioquia',
        lat: 6.2504,
        lng: -75.5681,
    },
    {
        address: 'Cra. 49 # 52-45 (Pasaje Comercial Junín)',
        sector: 'Sector Junín con Av. La Playa',
        city: 'Centro de Medellín, Antioquia',
        lat: 6.2518,
        lng: -75.5656,
    },
    {
        address: 'Calle 48 # 53-18 (Pichincha con Cúcuta)',
        sector: 'Distrito Mayorista de Telas El Hueco',
        city: 'Centro de Medellín, Antioquia',
        lat: 6.2485,
        lng: -75.5706,
    },
    {
        address: 'Calle 49 # 50-52 (Ayacucho con Palacé)',
        sector: 'Corredor Tranvía de Ayacucho - La Candelaria',
        city: 'Centro de Medellín, Antioquia',
        lat: 6.2497,
        lng: -75.5674,
    },
    {
        address: 'Cra. 54 # 46-15 (Cúcuta con Maturín)',
        sector: 'Sector Comercial Guayaquil - Cisneros',
        city: 'Centro de Medellín, Antioquia',
        lat: 6.2468,
        lng: -75.5714,
    },
];

const INFO_CONTACTO_BASE = {
    phone: '+57 302 705 8951',
    phone2: 'WhatsApp: 302 705 8951',
    email: 'dydtextil222medellin@gmail.com',
    email2: 'Atención comercial y cotizaciones',
    hours: 'Lun - Vie: 8:00 AM - 6:00 PM',
    hours2: 'Sáb: 9:00 AM - 3:00 PM',
};

const SOCIAL_LINKS = [
    {
        name: 'Instagram',
        url: 'https://www.instagram.com/',
        bg: 'from-pink-500 via-red-500 to-amber-500',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
        )
    },
    {
        name: 'Facebook',
        url: 'https://www.facebook.com/',
        bg: 'from-blue-600 to-blue-700',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
        )
    },
    {
        name: 'WhatsApp',
        url: 'https://wa.me/573027058951?text=Hola%20D%26D%20Textil,%20quiero%20cotizar%20telas',
        bg: 'from-emerald-500 to-green-600',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
        )
    },
    {
        name: 'X (Twitter)',
        url: 'https://x.com/',
        bg: 'from-slate-700 to-slate-900',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4.01c-1 .49-1.98.68-3 .99-1.12-1.26-2.7-1.5-4.18-1.14-1.46.36-2.61 1.51-2.97 2.97-.36 1.48.12 3.06 1.14 4.18-4.52-.22-8.58-2.39-11.23-5.96-.34.61-.51 1.3-.51 2.01 0 1.94 1 3.73 2.61 4.81-.92-.03-1.81-.28-2.59-.73v.03c0 2.05 1.46 3.86 3.47 4.26-.54.15-1.1.22-1.66.22-.44 0-.87-.04-1.3-.12.54 1.74 2.18 2.97 4 3.01-1.46 1.15-3.26 1.78-5.11 1.78-.44 0-.88-.03-1.32-.08 2 1.28 4.35 1.96 6.78 1.96 8.14 0 12.59-6.74 12.59-12.59 0-.19 0-.38-.01-.57 1.05-.76 1.96-1.72 2.69-2.83-.96.43-1.99.72-3.05.85 1.11-.66 1.96-1.71 2.36-2.96z"></path>
            </svg>
        )
    }
];

function InteractiveMap({ location, onRandomizeLocation }) {
    const [mapMode, setMapMode] = useState('roadmap'); // 'roadmap' | 'satellite'
    const [isLoadingMap, setIsLoadingMap] = useState(false);

    // 'm' = Mapa estándar de calles, 'h' = Satélite híbrido con nombres de calles y carreras
    const tipoMapaGoogle = mapMode === 'satellite' ? 'h' : 'm';
    const src = `https://maps.google.com/maps?q=${location.lat},${location.lng}&hl=es&z=18&t=${tipoMapaGoogle}&ie=UTF8&iwloc=B&output=embed`;

    const cambiarModoMapa = (nuevoModo) => {
        if (nuevoModo === mapMode) return;
        setIsLoadingMap(true);
        setMapMode(nuevoModo);
    };

    const cambiarUbicacionAzar = () => {
        setIsLoadingMap(true);
        onRandomizeLocation();
    };

    const openDirections = () => {
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    return (
        <div className="flex flex-col w-full h-full bg-white dark:bg-slate-800">
            {/* Barra superior dedicada de controles del mapa (no tapa controles internos de Google) */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-900 text-white border-b border-slate-700/80">
                {/* Selector Mapa / Satélite */}
                <div className="inline-flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                        type="button"
                        onClick={() => cambiarModoMapa('roadmap')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                            mapMode === 'roadmap'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                        }`}
                    >
                        <MapIcon className="w-3.5 h-3.5" />
                        <span>Mapa</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => cambiarModoMapa('satellite')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                            mapMode === 'satellite'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                        }`}
                    >
                        <Satellite className="w-3.5 h-3.5" />
                        <span>Satélite</span>
                    </button>
                </div>

                {/* Botón para sortear otra dirección real en el Centro de Medellín */}
                <button
                    type="button"
                    onClick={cambiarUbicacionAzar}
                    title="Generar otra dirección exacta en el Centro de Medellín"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold transition-all active:scale-95"
                >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Otra sede en el Centro</span>
                </button>
            </div>

            {/* Contenedor del Mapa Interactivo */}
            <div className="relative flex-1 w-full min-h-[380px]">
                {isLoadingMap && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
                        <div className="px-4 py-2 rounded-xl bg-slate-900/90 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            <span>Actualizando vista ({mapMode === 'satellite' ? 'Satélite' : 'Mapa'})...</span>
                        </div>
                    </div>
                )}

                <iframe
                    key={`${location.lat}-${location.lng}-${mapMode}`}
                    title={`Ubicación D&D Textil - ${location.address}`}
                    src={src}
                    onLoad={() => setIsLoadingMap(false)}
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Etiqueta flotante con la dirección exacta activa */}
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl border border-white/15 shadow-xl z-10 pointer-events-none">
                    <div className="flex items-center gap-1.5 text-primary-400 text-[11px] font-bold uppercase tracking-wider">
                        <Store className="w-3.5 h-3.5 shrink-0" />
                        <span>{location.sector}</span>
                    </div>
                    <p className="text-xs font-semibold text-white mt-0.5 truncate">
                        {location.address}
                    </p>
                </div>

                {/* Botón Cómo Llegar */}
                <button
                    type="button"
                    onClick={openDirections}
                    onMouseDown={(e) => microPress(e.currentTarget)}
                    onMouseUp={(e) => microRelease(e.currentTarget)}
                    className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all duration-200"
                >
                    <Navigation className="w-4 h-4" />
                    Cómo Llegar
                </button>
            </div>
        </div>
    );
}

function Contact() {
    const containerRef = useRef(null);

    // Selecciona al azar una dirección exacta del Centro de Medellín al abrir la página
    const [locationIndex, setLocationIndex] = useState(() =>
        Math.floor(Math.random() * DIRECCIONES_CENTRO_MEDELLIN.length)
    );

    const currentLocation = DIRECCIONES_CENTRO_MEDELLIN[locationIndex];

    const randomizeLocation = () => {
        setLocationIndex((prev) => {
            if (DIRECCIONES_CENTRO_MEDELLIN.length <= 1) return 0;
            let next = prev;
            while (next === prev) {
                next = Math.floor(Math.random() * DIRECCIONES_CENTRO_MEDELLIN.length);
            }
            return next;
        });
    };

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
        { icon: MapPin, title: 'Dirección Exacta', info: currentLocation.address, info2: currentLocation.city, color: 'from-blue-500 to-cyan-500' },
        { icon: Phone, title: 'Teléfono', info: INFO_CONTACTO_BASE.phone, info2: INFO_CONTACTO_BASE.phone2, href: 'tel:+573027058951', color: 'from-green-500 to-emerald-500' },
        { icon: Mail, title: 'Email', info: INFO_CONTACTO_BASE.email, info2: INFO_CONTACTO_BASE.email2, href: 'mailto:dydtextil222medellin@gmail.com', color: 'from-purple-500 to-pink-500' },
        { icon: Clock, title: 'Horario', info: INFO_CONTACTO_BASE.hours, info2: INFO_CONTACTO_BASE.hours2, color: 'from-orange-500 to-red-500' },
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
            <Encabezado />

            <PaginaAnimada className="flex-1">
                <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="contact-hero-text text-center">
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                                Contáctanos
                            </h1>
                            <p className="text-xl text-white/90 max-w-3xl mx-auto">
                                Visítanos en el corazón textil del Centro de Medellín o escríbenos para asesoría personalizada.
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
                                        {item.href ? <a href={item.href} className="text-gray-600 dark:text-gray-400 hover:text-primary-500 text-sm font-medium block break-all transition-colors">{item.info}</a> : <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{item.info}</p>}
                                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{item.info2}</p>
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
                                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="302 705 8951" />
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
                            <div className="card overflow-hidden h-[460px] flex flex-col border border-gray-200 dark:border-slate-700 shadow-xl">
                                <InteractiveMap
                                    location={currentLocation}
                                    onRandomizeLocation={randomizeLocation}
                                />
                            </div>

                            <div className="card p-6 border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center justify-between gap-3 mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                            <Store className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">Punto de Atención en el Centro de Medellín</h3>
                                            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{currentLocation.sector}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={randomizeLocation}
                                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 inline-flex items-center gap-1.5 transition-colors"
                                    >
                                        <Shuffle className="w-3.5 h-3.5 text-primary-500" />
                                        Cambiar dirección
                                    </button>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{currentLocation.address}</p>
                                            <p className="text-gray-600 dark:text-gray-400">{currentLocation.city} (Coordenadas: {currentLocation.lat}, {currentLocation.lng})</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-gray-700 dark:text-gray-300">{INFO_CONTACTO_BASE.hours}</p>
                                            <p className="text-gray-700 dark:text-gray-300">{INFO_CONTACTO_BASE.hours2}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${currentLocation.lat},${currentLocation.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onMouseDown={(e) => microPress(e.currentTarget)}
                                            onMouseUp={(e) => microRelease(e.currentTarget)}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-md"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Abrir en Google Maps
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-50 dark:bg-slate-800 py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-display font-bold mb-4">Síguenos en Redes Sociales</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Conéctate con nosotros en Instagram, Facebook y WhatsApp para conocer las últimas colecciones textiles
                        </p>
                        <div className="flex flex-wrap justify-center gap-5">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`Ir a nuestro ${social.name}`}
                                    aria-label={social.name}
                                    onMouseDown={(e) => microPress(e.currentTarget)}
                                    onMouseUp={(e) => microRelease(e.currentTarget)}
                                    className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-br ${social.bg} text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all`}
                                >
                                    {social.icon}
                                    <span>{social.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            </PaginaAnimada>

            <PieDePagina />
        </div>
    );
}

export default Contact;
