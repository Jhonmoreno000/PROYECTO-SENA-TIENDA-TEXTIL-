import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, ArrowRight, Loader2, Quote, Eye, EyeOff } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

gsap.registerPlugin(useGSAP);

const loginSchema = z.object({
    email: z.string().min(1, "El correo es requerido").email("Formato de correo inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (() => {
        const path = location.state?.from?.pathname || '/';
        const allowedPrefixes = ['/', '/cliente', '/vendedor', '/admin', '/catalogo', '/carrito', '/checkout', '/perfil'];
        if (allowedPrefixes.some(p => path.startsWith(p)) && !path.includes('://') && !path.startsWith('//')) {
            return path;
        }
        return '/';
    })();

    const [authError, setAuthError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const panelLeftRef = useRef(null);
    const formCardRef = useRef(null);
    const errorRef = useRef(null);

    const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm({
        resolver: zodResolver(loginSchema)
    });

    useGSAP(() => {
        if (panelLeftRef.current) {
            gsap.fromTo(panelLeftRef.current, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" });
            const textInner = panelLeftRef.current.querySelector('.panel-text');
            if (textInner) {
                gsap.fromTo(textInner, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.4 });
            }
        }
        if (formCardRef.current) {
            gsap.fromTo(formCardRef.current, { opacity: 0, y: -20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" });
        }
    });

    // Shake animation on error
    useEffect(() => {
        if (authError && errorRef.current) {
            gsap.fromTo(errorRef.current,
                { opacity: 0, height: 0 },
                { opacity: 1, height: 'auto', duration: 0.3, ease: "power2.out" }
            );
        }
    }, [authError]);

    // Shake for validation errors
    useEffect(() => {
        if (errors.email) {
            const el = document.querySelector('.email-field-wrapper');
            if (el) gsap.fromTo(el, { x: -10 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
        }
        if (errors.password) {
            const el = document.querySelector('.password-field-wrapper');
            if (el) gsap.fromTo(el, { x: -10 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
        }
    }, [errors.email, errors.password]);

    const onSubmit = async (data) => {
        setAuthError('');
        const result = await login(data.email, data.password);

        if (result.success) {
            const user = JSON.parse(localStorage.getItem('authUser'));
            const roleRedirects = {
                admin: '/admin',
                administrador: '/admin',
                seller: '/vendedor',
                vendedor: '/vendedor',
                client: '/cliente',
                cliente: '/cliente',
            };
            const destination = roleRedirects[user?.role] || from;
            navigate(destination, { replace: true });
        } else {
            setAuthError(result.message || 'Credenciales incorrectas. Intenta de nuevo.');
        }
    };

    const setDemoCredentials = (role) => {
        const creds = {
            admin: { email: 'admin@ddtextil.com', password: 'admin123' },
            seller: { email: 'vendedor@ddtextil.com', password: 'vendedor123' },
            client: { email: 'cliente@ddtextil.com', password: 'cliente123' }
        };
        if (creds[role]) {
            setValue('email', creds[role].email);
            setValue('password', creds[role].password);
        }
        setAuthError('');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <Header />

            <main className="flex-1 flex w-full">
                <div className="flex w-full">
                    
                    {/* ===== PANEL IZQUIERDO (Visual Inspiracional) ===== */}
                    <div 
                        ref={panelLeftRef}
                        className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900"
                    >
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay transition-transform duration-[20s] hover:scale-110"
                            style={{ backgroundImage: 'url("/images/hero-telas-premium.png")' }}
                        />
                        <div 
                            className="absolute inset-0 opacity-[0.2] mix-blend-overlay"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                        ></div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                        
                        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
                            <div className="panel-text">
                                <Quote className="w-12 h-12 text-primary-500 mb-6 opacity-80" />
                                <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                                    La materia prima de tus <span className="text-primary-400">grandes ideas.</span>
                                </h2>
                                <p className="text-lg text-slate-300 max-w-md font-light leading-relaxed">
                                    En D&D Textil no solo vendemos telas; proporcionamos el lienzo sobre el cual los diseñadores construyen el futuro de la moda.
                                </p>
                            </div>

                            <div className="mt-16 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border border-primary-500/30 flex items-center justify-center backdrop-blur-md bg-black/40 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                                    <span className="text-primary-400 text-xl font-bold">✦</span>
                                </div>
                                <span className="text-sm tracking-widest uppercase font-bold text-slate-300">Donde nace tu próxima gran creación</span>
                            </div>
                        </div>
                    </div>

                    {/* ===== PANEL DERECHO (Formulario de Login) ===== */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                        
                        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

                        <div 
                            ref={formCardRef}
                            className="w-full max-w-md relative z-10"
                        >
                            <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-600/50 p-8 sm:p-10 rounded-3xl shadow-2xl dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_20px_40px_rgba(0,0,0,0.5)]">
                                
                                <div className="text-center mb-10">
                                    <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                        Bienvenido de nuevo
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Ingresa a tu cuenta para continuar
                                    </p>
                                </div>

                                {/* Mensaje de Error General */}
                                {authError && (
                                    <div 
                                        ref={errorRef}
                                        className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800/50 text-center"
                                    >
                                        {authError}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    
                                    {/* Input: Correo Electrónico */}
                                    <div className="email-field-wrapper">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Correo Electrónico
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className={`w-5 h-5 transition-colors duration-300 ${errors.email ? 'text-red-500' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                                            </div>
                                            <input
                                                type="email"
                                                {...register('email')}
                                                className={`w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-slate-800/80 border rounded-xl outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white
                                                    ${errors.email 
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:border-red-500/50' 
                                                        : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                                                    }`}
                                                placeholder="tu@correo.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-xs font-bold mt-2 pl-1">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Input: Contraseña */}
                                    <div className="password-field-wrapper">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                                Contraseña
                                            </label>
                                            <a href="#" className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
                                                ¿Olvidaste tu contraseña?
                                            </a>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className={`w-5 h-5 transition-colors duration-300 ${errors.password ? 'text-red-500' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                {...register('password')}
                                                className={`w-full pl-11 pr-12 py-3.5 bg-white/50 dark:bg-slate-800/80 border rounded-xl outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white
                                                    ${errors.password 
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:border-red-500/50' 
                                                        : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                                                    }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary-500 transition-colors"
                                                tabIndex="-1"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-500 text-xs font-bold mt-2 pl-1">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Botón de Submit */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full relative overflow-hidden group bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(234,88,12,0.25)] hover:shadow-[0_12px_25px_rgba(234,88,12,0.35)] transition-all duration-300 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98]"
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Autenticando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Iniciar Sesión</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Separador O */}
                                <div className="mt-8 mb-6 flex items-center justify-center">
                                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                                    <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">O ingresa con</span>
                                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                                </div>

                                {/* Botón Google Login */}
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    Continuar con Google
                                </button>

                                {/* Credenciales Demo */}
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Acceso Rápido (Demo)</p>
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => setDemoCredentials('admin')} type="button" className="text-xs py-1.5 px-3 rounded-lg border border-transparent dark:border-slate-700 bg-slate-100 dark:bg-transparent text-slate-600 dark:text-slate-400 font-bold transition-all duration-300 hover:border-primary-500 hover:text-primary-500 hover:shadow-[0_0_12px_rgba(249,115,22,0.2)] dark:hover:bg-slate-800/50">Admin</button>
                                        <button onClick={() => setDemoCredentials('seller')} type="button" className="text-xs py-1.5 px-3 rounded-lg border border-transparent dark:border-slate-700 bg-slate-100 dark:bg-transparent text-slate-600 dark:text-slate-400 font-bold transition-all duration-300 hover:border-primary-500 hover:text-primary-500 hover:shadow-[0_0_12px_rgba(249,115,22,0.2)] dark:hover:bg-slate-800/50">Vendedor</button>
                                        <button onClick={() => setDemoCredentials('client')} type="button" className="text-xs py-1.5 px-3 rounded-lg border border-transparent dark:border-slate-700 bg-slate-100 dark:bg-transparent text-slate-600 dark:text-slate-400 font-bold transition-all duration-300 hover:border-primary-500 hover:text-primary-500 hover:shadow-[0_0_12px_rgba(249,115,22,0.2)] dark:hover:bg-slate-800/50">Cliente</button>
                                    </div>
                                </div>

                                <p className="text-center text-sm text-slate-500 mt-6">
                                    ¿No tienes una cuenta? <Link to="/registro" className="text-primary-600 font-bold hover:underline">Regístrate</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="relative z-10 py-4 px-6 flex items-center justify-center">
                <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/30 dark:border-slate-700/40 shadow-sm">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        © {new Date().getFullYear()} D&D Textil
                    </span>
                    <span className="w-px h-3 bg-slate-300 dark:bg-slate-700"></span>
                    <a href="/contacto" className="text-xs text-slate-400 dark:text-slate-500 hover:text-primary-500 transition-colors">Contacto</a>
                    <span className="w-px h-3 bg-slate-300 dark:bg-slate-700"></span>
                    <a href="#" className="text-xs text-slate-400 dark:text-slate-500 hover:text-primary-500 transition-colors">Privacidad</a>
                </div>
            </div>
        </div>
    );
}

export default Login;
