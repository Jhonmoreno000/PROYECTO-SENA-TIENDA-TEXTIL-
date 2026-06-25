/**
 * Footer.jsx — Componente del pie de página de la tienda D&D Textil
 *
 * Este componente renderiza el footer de la aplicación, que incluye:
 * - Información de la empresa y logo
 * - Íconos de redes sociales (Facebook, Instagram, Twitter)
 * - Enlaces rápidos de navegación
 * - Lista de categorías de productos
 * - Información de contacto (dirección, teléfono, correo)
 * - Formulario de suscripción al boletín
 * - Copyright con año dinámico
 *
 * Dependencias de íconos:
 * - "lucide-react" para íconos funcionales y logos.
 */

import React from 'react';
import { Link } from 'react-router-dom';

// Importación de íconos funcionales y logos desde lucide-react
import {
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

/**
 * Componente funcional Footer
 * Pie de página con información de contacto, navegación y suscripción.
 * Diseñado con fondo oscuro (bg-gray-900) para contraste visual.
 */
function Footer() {
    // Obtener el año actual dinámicamente para el copyright
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

                    {/* ===== INFORMACIÓN DE LA EMPRESA ===== */}
                    <div>
                        {/* Logo de la marca con gradiente naranja */}
                        <div className="flex items-center mb-4">
                            <span
                                className="text-3xl font-black tracking-tighter"
                                style={{
                                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #fb923c 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                D&D
                            </span>
                            <span className="ml-2 text-lg font-semibold text-white">
                                Textil
                            </span>
                        </div>

                        {/* Descripción breve de la empresa */}
                        <p className="text-gray-400 mb-4">
                            Tu tienda de confianza para telas de calidad premium. Transformamos tus ideas en realidad.
                        </p>

                        {/* ===== ÍCONOS DE REDES SOCIALES ===== */}
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-primary-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            </a>
                            <a href="#" className="hover:text-primary-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                            <a href="#" className="hover:text-primary-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4.01c-1 .49-1.98.68-3 .99-1.12-1.26-2.7-1.5-4.18-1.14-1.46.36-2.61 1.51-2.97 2.97-.36 1.48.12 3.06 1.14 4.18-4.52-.22-8.58-2.39-11.23-5.96-.34.61-.51 1.3-.51 2.01 0 1.94 1 3.73 2.61 4.81-.92-.03-1.81-.28-2.59-.73v.03c0 2.05 1.46 3.86 3.47 4.26-.54.15-1.1.22-1.66.22-.44 0-.87-.04-1.3-.12.54 1.74 2.18 2.97 4 3.01-1.46 1.15-3.26 1.78-5.11 1.78-.44 0-.88-.03-1.32-.08 2 1.28 4.35 1.96 6.78 1.96 8.14 0 12.59-6.74 12.59-12.59 0-.19 0-.38-.01-.57 1.05-.76 1.96-1.72 2.69-2.83-.96.43-1.99.72-3.05.85 1.11-.66 1.96-1.71 2.36-2.96z"></path></svg>
                            </a>
                        </div>
                    </div>

                    {/* ===== ENLACES RÁPIDOS DE NAVEGACIÓN ===== */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Enlaces Rápidos</h3>
                        <ul className="space-y-2">
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
                                    Contacto
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* ===== CATEGORÍAS DE PRODUCTOS ===== */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Categorías</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="hover:text-primary-400 transition-colors">
                                    Algodón
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary-400 transition-colors">
                                    Seda
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary-400 transition-colors">
                                    Lino
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-primary-400 transition-colors">
                                    Terciopelo
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* ===== INFORMACIÓN DE CONTACTO ===== */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Contacto</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                                <span>Calle 123 #45-67, medellin-antioquia, Colombia</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-5 h-5 flex-shrink-0" />
                                <span>+57 300 123 4567</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-5 h-5 flex-shrink-0" />
                                <span>info@ddtextil.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ===== SECCIÓN DE SUSCRIPCIÓN AL BOLETÍN ===== */}
                <div className="border-t border-gray-800 pt-8 mb-8">
                    <div className="max-w-md mx-auto text-center">
                        <h3 className="text-white font-bold mb-2">Suscríbete a nuestro boletín</h3>
                        <p className="text-gray-400 mb-4">Recibe ofertas exclusivas y novedades</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Tu correo electrónico"
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-primary-500 focus:outline-none text-white"
                            />
                            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                                Suscribir
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===== COPYRIGHT ===== */}
                <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                    <p>&copy; {currentYear} D&D Textil. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

