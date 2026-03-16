import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { MdMail, MdPhone, MdLocationOn } from 'react-icons/md';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div>
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
                        <p className="text-gray-400 mb-4">
                            Tu tienda de confianza para telas de calidad premium. Transformamos tus ideas en realidad.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-primary-400 transition-colors">
                                <FaFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-primary-400 transition-colors">
                                <FaInstagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-primary-400 transition-colors">
                                <FaTwitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
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

                    {/* Categories */}
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

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold mb-4">Contacto</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <MdLocationOn className="w-5 h-5 mt-1 flex-shrink-0" />
                                <span>Calle 123 #45-67, medellin-antioquia, Colombia</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MdPhone className="w-5 h-5 flex-shrink-0" />
                                <span>+57 300 123 4567</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MdMail className="w-5 h-5 flex-shrink-0" />
                                <span>info@ddtextil.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Newsletter */}
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

                {/* Copyright */}
                <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                    <p>&copy; {currentYear} D&D Textil. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
