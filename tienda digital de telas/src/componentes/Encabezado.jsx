import React, { useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import {
    ShoppingCart,
    Heart,
    Menu,
    X,
    Sun,
    Moon,
    User,
    LogOut,
    LayoutDashboard,
    Home as Inicio,
    Store,
    Info,
    Phone,
} from 'lucide-react';

import { useCarrito } from '../contextos/ContextoCarrito';
import { useMetricas } from '../contextos/ContextoMetricas';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { microPress, microRelease, EASES } from '../utilidades/animations';

const isNative = Capacitor.isNativePlatform();

const bottomNavLinks = [
    { name: 'Inicio', path: '/', icon: Inicio },
    { name: 'Catálogo', path: '/catalogo', icon: Store },
    { name: 'Nosotros', path: '/nosotros', icon: Info },
    { name: 'Contacto', path: '/contacto', icon: Phone },
];

function Encabezado() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const { getCartItemCount } = useCarrito();
    const { wishlistItems, globalBanner } = useMetricas();
    const [darkMode, toggleDarkMode] = useDarkMode();
    const { user, logout } = useAutenticacion();
    const rawRole = String(user?.role || user?.rol || 'cliente').toLowerCase();
    const esAdmin = rawRole === 'admin' || rawRole === 'administrador';
    const esVendedor = rawRole === 'vendedor';
    const rutaDashboard = esAdmin ? '/admin' : (esVendedor ? '/vendedor' : '/cliente');
    const etiquetaRol = esAdmin ? 'Administrador' : (esVendedor ? 'Vendedor' : 'Cliente');
    const cartCount = getCartItemCount();
    const wishlistCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;
    const containerRef = useRef(null);

    const navLinks = [
        { name: 'Inicio', path: '/' },
        { name: 'Catálogo', path: '/catalogo' },
        { name: 'Nosotros', path: '/nosotros' },
        { name: 'Contacto', path: '/contacto' },
    ];

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
                y: -8,
                opacity: 0,
                stagger: 0.025,
                duration: 0.28,
                ease: "power2.out",
                delay: 0.05,
                force3D: true,
                clearProps: "all"
            });
        }
    }, { scope: containerRef });

    useGSAP(() => {
        if (mobileMenuOpen && mobileMenuRef.current) {
            gsap.from(mobileMenuRef.current.children, {
                x: -12,
                opacity: 0,
                stagger: 0.02,
                duration: 0.22,
                ease: "power2.out",
                force3D: true,
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
                    {globalBanner?.enabled && globalBanner?.message && !bannerDismissed && (
                        <div className={`px-3 py-1.5 text-xs font-semibold flex items-center justify-between border-b backdrop-blur-md transition-all ${
                            globalBanner.type === 'success'
                                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30'
                                : globalBanner.type === 'warning'
                                    ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30'
                                    : 'bg-primary-500/15 text-primary-900 dark:text-primary-200 border-primary-500/30'
                        }`}>
                            <div className="flex items-center gap-1.5 flex-1 pr-2 truncate">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-primary-600 text-white shrink-0">
                                    Oferta
                                </span>
                                <span className="truncate">{globalBanner.message}</span>
                            </div>
                            <button
                                onClick={() => setBannerDismissed(true)}
                                className="p-0.5 text-slate-500 hover:text-slate-800 dark:hover:text-white shrink-0"
                                aria-label="Cerrar aviso"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
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

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={toggleDarkMode}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-slate-800 active:scale-90 transition-all duration-100"
                                    aria-label="Cambiar tema visual"
                                >
                                    {darkMode ? (
                                        <Sun className="w-5 h-5 text-yellow-500" />
                                    ) : (
                                        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                    )}
                                </button>

                                <Link to="/favoritos" className="relative w-9 h-9 flex items-center justify-center rounded-xl active:bg-gray-100 dark:active:bg-slate-800 active:scale-90 transition-all duration-100" aria-label="Favoritos" title="Mis telas favoritas">
                                    <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-700 dark:text-gray-300'}`} />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>

                                <Link to="/carrito" className="relative w-9 h-9 flex items-center justify-center rounded-xl active:bg-gray-100 dark:active:bg-slate-800 active:scale-90 transition-all duration-100">
                                    <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                <div className="h-5 w-px bg-gray-200 dark:bg-slate-700 mx-0.5" aria-hidden="true" />

                                {user ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                            className="p-1.5 rounded-xl active:bg-gray-100 dark:active:bg-slate-800 active:scale-90 transition-all duration-100"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 font-bold text-xs border border-primary-200 dark:border-primary-800">
                                                {(user.name || user.nombre || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        </button>

                                        {mobileMenuOpen && (
                                            <div className="absolute right-0 top-full mt-1 w-48 z-50">
                                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                                                    <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                                                        <p className="font-bold text-gray-900 dark:text-white truncate text-sm">{user.name || user.nombre || 'Usuario'}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{etiquetaRol}</p>
                                                    </div>
                                                    <div className="p-1">
                                                        <Link
                                                            to={rutaDashboard}
                                                            onClick={() => setMobileMenuOpen(false)}
                                                            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 active:bg-gray-50 dark:active:bg-slate-700 rounded-lg"
                                                        >
                                                            <LayoutDashboard className="w-4 h-4" />
                                                            Panel de Control
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
                                    <Link to="/login" className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-slate-800/80 border border-gray-200/70 dark:border-slate-700 active:scale-90 transition-all duration-100">
                                        <User className="w-4 h-4" />
                                    </Link>
                                )}
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
            {globalBanner?.enabled && globalBanner?.message && !bannerDismissed && (
                <div className={`px-4 py-2 text-xs md:text-sm font-semibold flex items-center justify-between border-b backdrop-blur-md transition-all ${
                    globalBanner.type === 'success'
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30'
                        : globalBanner.type === 'warning'
                            ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30'
                            : 'bg-primary-500/15 text-primary-900 dark:text-primary-200 border-primary-500/30'
                }`}>
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center flex-1 pr-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary-600 text-white shadow-sm">
                            Oferta Exclusiva
                        </span>
                        <span>{globalBanner.message}</span>
                    </div>
                    <button
                        onClick={() => setBannerDismissed(true)}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                        aria-label="Cerrar aviso de oferta"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
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

                    {/* ===== NAVEGACIÓN DE ESCRITORIO ===== */}
                    <div ref={navRef} className="hidden md:flex items-center space-x-8">
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

                    <div className="flex items-center gap-2 md:gap-2.5">
                        {/* Grupo de acciones rápidas e iconos de compra (Tema, Favoritos, Carrito) */}
                        <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-100/60 dark:bg-slate-800/60 p-1 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
                            <button
                                onClick={toggleDarkMode}
                                onMouseDown={handleBtnDown}
                                onMouseUp={handleBtnUp}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700/80 hover:shadow-sm transition-all duration-200"
                                aria-label="Cambiar modo de color"
                                title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                            >
                                {darkMode ? (
                                    <Sun className="w-[18px] h-[18px] text-amber-500" />
                                ) : (
                                    <Moon className="w-[18px] h-[18px] text-gray-700 dark:text-gray-300" />
                                )}
                            </button>

                            <Link
                                to="/favoritos"
                                className="relative group"
                                aria-label="Mis telas favoritas"
                                title={wishlistCount > 0 ? `${wishlistCount} tela(s) en favoritos` : 'Mis telas favoritas'}
                            >
                                <div className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700/80 hover:shadow-sm transition-all duration-200 group-hover:scale-105 active:scale-95">
                                    <Heart
                                        className={`w-[18px] h-[18px] transition-colors ${
                                            wishlistCount > 0
                                                ? 'text-red-500 fill-red-500'
                                                : 'text-gray-700 dark:text-gray-300 group-hover:text-red-500'
                                        }`}
                                    />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </div>
                            </Link>

                            <Link
                                to="/carrito"
                                className="relative group"
                                aria-label="Carrito de compras"
                                title={cartCount > 0 ? `${cartCount} producto(s) en el carrito` : 'Carrito de compras'}
                            >
                                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/80 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all duration-200 group-hover:scale-105 active:scale-95">
                                    <ShoppingCart className="w-[18px] h-[18px] text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />

                                    {cartCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-primary-600 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        </div>

                        <div className="hidden sm:block h-6 w-px bg-gray-200/80 dark:bg-slate-700/80" aria-hidden="true" />

                        {/* Acción de Cuenta / Perfil de Usuario */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    onMouseDown={handleBtnDown}
                                    onMouseUp={handleBtnUp}
                                    className="px-2.5 py-1.5 rounded-2xl bg-gray-100/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60 hover:shadow-sm transition-all duration-200 flex items-center gap-2"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 font-bold text-sm border border-primary-200 dark:border-primary-800">
                                        {(user.name || user.nombre || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden lg:block text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[110px] truncate pr-1">
                                        {(user.name || user.nombre || 'Mi Cuenta').split(' ')[0]}
                                    </span>
                                </button>

                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full mt-2 w-52 transform origin-top-right z-50">
                                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                                                <div className="p-3.5 border-b border-gray-100 dark:border-slate-700">
                                                    <p className="font-bold text-gray-900 dark:text-white truncate">{user.name || user.nombre || 'Usuario'}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{etiquetaRol}</p>
                                                </div>

                                                <div className="p-1.5">
                                                    <Link
                                                        to={rutaDashboard}
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/70 rounded-xl transition-colors"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 text-primary-600" />
                                                        Panel de Control
                                                    </Link>

                                                    <button
                                                        onClick={() => { logout(); setUserMenuOpen(false); }}
                                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
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
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100/70 dark:bg-slate-800/70 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white border border-gray-200/70 dark:border-slate-700/70 hover:border-primary-600 shadow-sm transition-all duration-200 active:scale-95"
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden md:block">Ingresar</span>
                            </Link>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            onMouseDown={handleBtnDown}
                            onMouseUp={handleBtnUp}
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
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

export default Encabezado;
