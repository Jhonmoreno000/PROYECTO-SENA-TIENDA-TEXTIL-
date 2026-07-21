<<<<<<< HEAD
import React, { useState, useRef, useCallback } from 'react';
=======
import React, { useState, useRef } from 'react';
>>>>>>> e42fdc7 (Sync: Otros cambios en el repositorio)
import { Link, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
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
    Home,
    Store,
    Info,
    Phone,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAuth } from '../context/AuthContext';
import { microPress, microRelease, EASES } from '../utils/animations';

const isNative = Capacitor.isNativePlatform();

const bottomNavLinks = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Catálogo', path: '/catalogo', icon: Store },
    { name: 'Nosotros', path: '/nosotros', icon: Info },
    { name: 'Contacto', path: '/contacto', icon: Phone },
];

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { getCartItemCount } = useCart();
    const [darkMode, toggleDarkMode] = useDarkMode();
    const { user, logout } = useAuth();
    const cartCount = getCartItemCount();
<<<<<<< HEAD
    const containerRef = useRef(null);
=======
    const navRef = useRef(null);
    const location = useLocation();
>>>>>>> e42fdc7 (Sync: Otros cambios en el repositorio)

    const navLinks = [
        { name: 'Inicio', path: '/' },
        { name: 'Catálogo', path: '/catalogo' },
        { name: 'Nosotros', path: '/nosotros' },
        { name: 'Contacto', path: '/contacto' },
    ];

<<<<<<< HEAD
    const location = useLocation();
    const logoRef = useRef(null);
    const navRef = useRef(null);
    const mobileMenuRef = useRef(null);

    useGSAP(() => {
        if (logoRef.current) {
            gsap.to(logoRef.current, {
                backgroundPosition: '200% center',
                duration: 3,
                ease: "linear",
                repeat: -1
            });
        }

        if (navRef.current) {
            gsap.from(navRef.current.children, {
                y: -10,
=======
    useGSAP(() => {
        gsap.to('.logo-gradient-anim', {
            backgroundPosition: '200% center',
            duration: 3,
            ease: "linear",
            repeat: -1
        });

        if (!isNative) {
            gsap.from('.nav-link-item', {
                y: -10,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.2
            });
        }
    });

    useGSAP(() => {
        if (mobileMenuOpen && !isNative) {
            gsap.from(".mobile-menu-item", {
                x: -30,
>>>>>>> e42fdc7 (Sync: Otros cambios en el repositorio)
                opacity: 0,
                stagger: 0.08,
                duration: 0.6,
                ease: "power3.out",
                delay: 0.2
            });
        }
    }, { scope: containerRef });

    useGSAP(() => {
        if (mobileMenuOpen && mobileMenuRef.current) {
            gsap.from(mobileMenuRef.current.children, {
                x: -16,
                opacity: 0,
                stagger: 0.04,
                duration: 0.35,
                ease: EASES.springGentle,
                clearProps: "all"
            });
        }
    }, { dependencies: [mobileMenuOpen], scope: containerRef });

    const handleBtnDown = useCallback((e) => microPress(e.currentTarget), []);
    const handleBtnUp = useCallback((e) => microRelease(e.currentTarget), []);

    if (isNative) {
        return (
            <>
                <header ref={navRef} className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-slate-700/20 shadow-sm select-none">
                    <nav className="px-3">
                        <div className="flex justify-between items-center h-14">

                            <Link to="/" className="flex items-center active:scale-95 transition-transform duration-100">
                                <span
                                    className="logo-gradient-anim text-2xl font-black tracking-tighter"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--theme-primary, #f97316) 0%, var(--theme-accent, #ea580c) 50%, var(--theme-primary, #fb923c) 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        backgroundSize: '200% auto'
                                    }}
                                >
                                    D&D
                                </span>
                                <span className="ml-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Textil
                                </span>
                            </Link>

                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 rounded-lg active:bg-gray-100 dark:active:bg-slate-800 active:scale-90 transition-all duration-100"
                                    aria-label="Toggle dark mode"
                                >
                                    {darkMode ? (
                                        <Sun className="w-5 h-5 text-yellow-500" />
                                    ) : (
                                        <Moon className="w-5 h-5 text-gray-700" />
                                    )}
                                </button>

                                {user ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                            className="p-2 rounded-lg active:bg-gray-100 dark:active:bg-slate-800 active:scale-90 transition-all duration-100"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 font-bold text-xs border border-primary-200 dark:border-primary-800">
                                                {user.name.charAt(0)}
                                            </div>
                                        </button>

                                        {mobileMenuOpen && (
                                            <div className="absolute right-0 top-full mt-1 w-48 z-50">
                                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                                                    <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                                                        <p className="font-bold text-gray-900 dark:text-white truncate text-sm">{user.name}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                                    </div>
                                                    <div className="p-1">
                                                        <Link
                                                            to={(user.role === 'client' || user.role === 'cliente') ? '/cliente' : (user.role === 'admin' || user.role === 'administrador') ? '/admin' : '/vendedor/productos'}
                                                            onClick={() => setMobileMenuOpen(false)}
                                                            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 active:bg-gray-50 dark:active:bg-slate-700 rounded-lg"
                                                        >
                                                            <LayoutDashboard className="w-4 h-4" />
                                                            Dashboard
                                                        </Link>
                                                        <button
                                                            onClick={() => { setMobileMenuOpen(false); logout(); }}
                                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 active:bg-red-50 dark:active:bg-red-900/10 rounded-lg"
                                                        >
                                                            <LogOut className="w-4 h-4" />
                                                            Cerrar Sesión
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link to="/login" className="flex items-center gap-1 p-2 rounded-lg text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-slate-800 active:scale-90 transition-all duration-100">
                                        <User className="w-5 h-5" />
                                    </Link>
                                )}

                                <Link to="/carrito" className="relative p-2 rounded-lg active:bg-gray-100 dark:active:bg-slate-800 active:scale-90 transition-all duration-100 block">
                                    <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>
                    </nav>
                </header>

                <div className="pb-16 select-none" />

                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/20 dark:border-slate-700/20 shadow-lg select-none">
                    <div className="flex justify-around items-center h-16 px-2">
                        {bottomNavLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg active:scale-90 transition-all duration-100 ${
                                        isActive
                                            ? 'text-primary-600'
                                            : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-[10px] mt-0.5 font-medium">{link.name}</span>
                                </Link>
                            );
                        })}

                        <Link
                            to="/carrito"
                            className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg active:scale-90 transition-all duration-100 relative ${
                                location.pathname === '/carrito'
                                    ? 'text-primary-600'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span className="text-[10px] mt-0.5 font-medium">Carrito</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 right-1 bg-primary-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </nav>
            </>
        );
    }

    return (
        <header ref={containerRef} className="sticky top-0 z-50 bg-white/25 dark:bg-slate-900/25 backdrop-blur-2xl border-b border-gray-200/20 dark:border-slate-700/20 shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">

                    <Link to="/" className="flex items-center group">
                        <div className="relative">
                    <span
                            ref={logoRef}
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

<<<<<<< HEAD
                    {/* ===== NAVEGACIÓN DE ESCRITORIO ===== */}
                    <div ref={navRef} className="hidden md:flex items-center space-x-8">
=======
                    <div className="hidden md:flex items-center space-x-8">
>>>>>>> e42fdc7 (Sync: Otros cambios en el repositorio)
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200 relative group"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-4">

                        <button
                            onClick={toggleDarkMode}
                            onMouseDown={handleBtnDown}
                            onMouseUp={handleBtnUp}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700" />
                            )}
                        </button>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    onMouseDown={handleBtnDown}
                                    onMouseUp={handleBtnUp}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 font-bold border border-primary-200 dark:border-primary-800">
                                        {user.name.charAt(0)}
                                    </div>
                                </button>

                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-2 w-48 transform origin-top-right z-50">
                                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                                                <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                                                    <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                                </div>

                                                <div className="p-1">
                                                    <Link
                                                        to={(user.role === 'client' || user.role === 'cliente') ? '/cliente' : (user.role === 'admin' || user.role === 'administrador') ? '/admin' : '/vendedor/productos'}
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        Dashboard
                                                    </Link>

                                                    <button
                                                        onClick={() => { logout(); setUserMenuOpen(false); }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Cerrar Sesión
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-primary-600 font-medium transition-colors">
                                <User className="w-5 h-5" />
                                <span className="hidden md:block">Ingresar</span>
                            </Link>
                        )}

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

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            onMouseDown={handleBtnDown}
                            onMouseUp={handleBtnUp}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
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

                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                        mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div ref={mobileMenuRef} className="py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium transition-colors"
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
