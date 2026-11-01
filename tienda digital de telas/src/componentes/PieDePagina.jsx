/**
 * PieDePagina.jsx — Componente compacto y optimizado del pie de página de D&D Textil
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CheckCircle2, Send } from 'lucide-react';

function PieDePagina() {
    const currentYear = new Date().getFullYear();
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!newsletterEmail.trim()) return;
        setSubscribed(true);
        setNewsletterEmail('');
        setTimeout(() => setSubscribed(false), 4000);
    };

    return (
        <footer className="bg-gray-900 text-gray-300 border-t border-gray-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 md:py-8">
                {/* Grid principal compacto de 12 columnas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 pb-6">

                    {/* ===== 1. MARCA Y REDES SOCIALES (3 cols) ===== */}
                    <div className="lg:col-span-3 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center mb-2">
                                <span
                                    className="text-2xl font-black tracking-tighter"
                                    style={{
                                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #fb923c 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    D&D
                                </span>
                                <span className="ml-1.5 text-base font-semibold text-white">
                                    Textil
                                </span>
                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed mb-3">
                                Tu aliado en el Centro de Medellín para telas de calidad premium. Transformamos tus ideas en realidad.
                            </p>
                        </div>

                        {/* Íconos de redes sociales compactos */}
                        <div className="flex items-center space-x-2">
                            <a
                                href="https://www.facebook.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Visitar Facebook de D&D Textil"
                                title="Facebook"
                                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-blue-600 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>

                            <a
                                href="https://www.instagram.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Visitar Instagram de D&D Textil"
                                title="Instagram"
                                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-pink-600 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>

                            <a
                                href="https://wa.me/573027058951?text=Hola%20D%26D%20Textil,%20quiero%20informaci%C3%B3n%20sobre%20sus%20telas"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Contactar por WhatsApp"
                                title="WhatsApp"
                                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-emerald-600 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                            </a>

                            <a
                                href="https://x.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Visitar X (Twitter) de D&D Textil"
                                title="X (Twitter)"
                                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary-600 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 4.01c-1 .49-1.98.68-3 .99-1.12-1.26-2.7-1.5-4.18-1.14-1.46.36-2.61 1.51-2.97 2.97-.36 1.48.12 3.06 1.14 4.18-4.52-.22-8.58-2.39-11.23-5.96-.34.61-.51 1.3-.51 2.01 0 1.94 1 3.73 2.61 4.81-.92-.03-1.81-.28-2.59-.73v.03c0 2.05 1.46 3.86 3.47 4.26-.54.15-1.1.22-1.66.22-.44 0-.87-.04-1.3-.12.54 1.74 2.18 2.97 4 3.01-1.46 1.15-3.26 1.78-5.11 1.78-.44 0-.88-.03-1.32-.08 2 1.28 4.35 1.96 6.78 1.96 8.14 0 12.59-6.74 12.59-12.59 0-.19 0-.38-.01-.57 1.05-.76 1.96-1.72 2.69-2.83-.96.43-1.99.72-3.05.85 1.11-.66 1.96-1.71 2.36-2.96z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* ===== 2. ENLACES Y CATEGORÍAS EN PARALELO (3 cols) ===== */}
                    <div className="lg:col-span-3 grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-2.5">Navegación</h3>
                            <ul className="space-y-1.5 text-xs">
                                <li>
                                    <Link to="/" className="hover:text-primary-400 transition-colors">
                                        Inicio
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/catalogo" className="hover:text-primary-400 transition-colors">
                                        Catálogo
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/nosotros" className="hover:text-primary-400 transition-colors">
                                        Nosotros
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contacto" className="hover:text-primary-400 transition-colors">
                                        Contacto y Mapa
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-2.5">Categorías</h3>
                            <ul className="space-y-1.5 text-xs">
                                <li>
                                    <Link to="/catalogo?categoria=Algodón" className="hover:text-primary-400 transition-colors">
                                        Algodón
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/catalogo?categoria=Seda" className="hover:text-primary-400 transition-colors">
                                        Seda
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/catalogo?categoria=Lino" className="hover:text-primary-400 transition-colors">
                                        Lino
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/catalogo?categoria=Terciopelo" className="hover:text-primary-400 transition-colors">
                                        Terciopelo
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* ===== 3. CONTACTO DIRECTO (3 cols) ===== */}
                    <div className="lg:col-span-3">
                        <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-2.5">Contacto</h3>
                        <ul className="space-y-2 text-xs">
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-400" />
                                <a
                                    href="https://www.google.com/maps/dir/?api=1&destination=6.2492,-75.5694"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-400 transition-colors leading-snug"
                                >
                                    Cra. 52 (Carabobo) # 48-30, Sector El Hueco, Centro de Medellín
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 flex-shrink-0 text-primary-400" />
                                <a href="tel:+573027058951" className="hover:text-primary-400 transition-colors">
                                    +57 302 705 8951
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 flex-shrink-0 text-primary-400" />
                                <a href="mailto:dydtextil222medellin@gmail.com" className="hover:text-primary-400 transition-colors break-all">
                                    dydtextil222medellin@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* ===== 4. BOLETÍN INTEGRADO EN LA MISMA FILA (3 cols) ===== */}
                    <div className="lg:col-span-3">
                        <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Boletín de Ofertas</h3>
                        <p className="text-gray-400 text-xs mb-2.5 leading-snug">
                            Recibe descuentos y nuevas colecciones en tu correo.
                        </p>
                        <form onSubmit={handleSubscribe} className="flex gap-1.5">
                            <input
                                type="email"
                                required
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                placeholder="Tu correo..."
                                className="min-w-0 flex-1 px-3 py-1.5 text-xs rounded-lg bg-gray-800 border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
                            />
                            <button
                                type="submit"
                                title="Suscribirse"
                                className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 shrink-0"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Unirme</span>
                            </button>
                        </form>
                        {subscribed && (
                            <p className="text-emerald-400 text-[11px] mt-1.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> ¡Suscrito con éxito!
                            </p>
                        )}
                    </div>
                </div>

                {/* ===== BARRA INFERIOR COMPACTA DE COPYRIGHT ===== */}
                <div className="border-t border-gray-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                    <p>&copy; {currentYear} D&D Textil. Todos los derechos reservados.</p>
                    <p className="text-[11px] text-gray-500">Medellín, Antioquia — Colombia</p>
                </div>
            </div>
        </footer>
    );
}

export default PieDePagina;
