import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import {
    ShoppingCart,
    Menu,
    X,
    Sun,
    Moon,
    User,
    LogOut,
    LayoutDashboard,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuth } from '../context/AuthContext';

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { getCartItemCount } = useCart();
    const [darkMode, toggleDarkMode] = useDarkMode();
    const { user, logout } = useAuth();
    const cartCount = getCartItemCount();

    const navLinks = [
        { name: 'Inicio', path: '/' },
        { name: 'Catálogo', path: '/catalogo' },
        { name: 'Nosotros', path: '/nosotros' },
        { name: 'Contacto', path: '/contacto' },
    ];

    const location = useLocation();
    useGSAP(() => {
        // Animación del logo
        gsap.to('.logo-gradient-anim', {
            backgroundPosition: '200% center',
            duration: 3,
            ease: "linear",
            repeat: -1
        });

        // Entrada escalonada de los links de navegación (Escritorio)
        gsap.from('.nav-link-item', {
            y: -10,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.2
        });
    });

    // Animación escalonada del menú móvil
    useGSAP(() => {
        if (mobileMenuOpen) {
            gsap.from(".mobile-menu-item", {
                x: -30,
                opacity: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: "power2.out",
                clearProps: "all"
            });
        }
    }, { dependencies: [mobileMenuOpen] });

    return (
        <header className="sticky top-0 z-50 bg-white/25 dark:bg-slate-900/25 backdrop-blur-2xl border-b border-gray-200/20 dark:border-slate-700/20 shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">

                    {/* ===== LOGO DE LA MARCA ===== */}
                    <Link to="/" className="flex items-center group">
                        <div className="relative">
                            <span
                                className="logo-gradient-anim text-3xl md:text-4xl font-black tracking-tighter inline-block group-hover:scale-105 transition-transform duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, var(--theme-primary, #f97316) 0%, var(--theme-accent, #ea580c) 50%, var(--theme-primary, #fb923c) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                                    backgroundSize: '200% auto'
                                }}
                            >
                                D&D
                            </span>

                            <div
                                className="logo-gradient-anim absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                                style={{ backgroundSize: '200% auto' }}
                            />
                        </div>
                        <span className="ml-2 text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">
                            Textil
                        </span>
                    </Link>

                    {/* ===== NAVEGACIÓN DE ESCRITORIO ===== */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200 relative group nav-link-item"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        ))}
                    </div>

                    {/* ===== BOTONES DE ACCIÓN ===== */}
                    <div className="flex items-center space-x-4">

                        {/* Botón de toggle para modo oscuro/claro */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700" />
                            )}
                        </button>

                        {/* ===== MENÚ DE USUARIO ===== */}
                        {user ? (
                            <div className="relative group/user">
                                <button
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 active:scale-95"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 font-bold border border-primary-200 dark:border-primary-800">
                                        {user.name.charAt(0)}
                                    </div>
                                </button>

                                <div className="absolute right-0 top-full mt-0 pt-2 w-48 hidden group-hover/user:block transform origin-top-right z-50">
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                                        <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                                            <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                        </div>

                                        <div className="p-1">
                                            <Link
                                                to={(user.role === 'client' || user.role === 'cliente') ? '/cliente' : (user.role === 'admin' || user.role === 'administrador') ? '/admin' : '/vendedor/productos'}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg"
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                Dashboard
                                            </Link>

                                            <button
                                                onClick={logout}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-primary-600 font-medium transition-colors">
                                <User className="w-5 h-5" />
                                <span className="hidden md:block">Ingresar</span>
                            </Link>
                        )}

                        {/* ===== CARRITO DE COMPRAS ===== */}
                        <Link to="/carrito" className="relative group">
                            <div
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group-hover:scale-105 active:scale-95"
                            >
                                <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />

                                {cartCount > 0 && (
                                    <span
                                        className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce"
                                    >
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* ===== BOTÓN MENÚ MÓVIL ===== */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* ===== MENÚ MÓVIL (Animado con GSAP) ===== */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                        mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="py-4 space-y-2 mobile-menu-items">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium transition-colors mobile-menu-item"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
