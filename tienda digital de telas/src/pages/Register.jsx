import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

gsap.registerPlugin(useGSAP);

const registerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().min(1, 'El correo es requerido').email('Formato de correo inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

function Register() {
    const { register: registerUser } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [authError, setAuthError] = useState('');
    const panelLeftRef = useRef(null);
    const formCardRef = useRef(null);
    const errorRef = useRef(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(registerSchema)
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
            // Stagger fields
            const fields = formCardRef.current.querySelectorAll('.form-field');
            gsap.fromTo(fields, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: "power2.out", delay: 0.2 });
        }
    });

    useEffect(() => {
        if (authError && errorRef.current) {
            gsap.fromTo(errorRef.current, { opacity: 0, height: 0 }, { opacity: 1, height: 'auto', duration: 0.3, ease: "power2.out" });
        }
    }, [authError]);

    // Shake for validation errors
    useEffect(() => {
        ['name', 'email', 'password', 'confirmPassword'].forEach(field => {
            if (errors[field]) {
                const el = document.querySelector(`.${field}-field-wrapper`);
                if (el) gsap.fromTo(el, { x: -10 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
            }
        });
    }, [errors.name, errors.email, errors.password, errors.confirmPassword]);

    const onSubmit = async (data) => {
        setAuthError('');
        const result = await registerUser({
            name: data.name,
            email: data.email,
            password: data.password
        });

        if (result.success) {
            showNotification('success', '¡Cuenta creada! Bienvenido a D&D Textil');
            navigate('/');
        } else {
            setAuthError(result.message || 'No se pudo crear la cuenta. Intenta de nuevo.');
        }
    };

    const inputClass = (hasError) => `
        w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-slate-800/80 border rounded-xl outline-none
        transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-500
        focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white
        ${hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:border-red-500/50'
            : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
        }
    `;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <Header />

            <main className="flex-1 flex w-full">
                <div className="flex w-full">

                    {/* ===== PANEL IZQUIERDO ===== */}
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
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

                        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
                            <div className="panel-text">
                                <Sparkles className="w-12 h-12 text-primary-400 mb-6 opacity-80" />
                                <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                                    Tu historia con las <span className="text-primary-400">telas</span> comienza aquí.
                                </h2>
                                <p className="text-lg text-slate-300 max-w-md font-light leading-relaxed">
                                    Únete a miles de diseñadores y creadores que confían en D&D Textil para transformar su visión en realidad.
                                </p>
                            </div>

                            <div className="mt-16 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border border-primary-500/30 flex items-center justify-center backdrop-blur-md bg-black/40 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                                    <span className="text-primary-400 text-xl font-bold">✦</span>
                                </div>
                                <span className="text-sm tracking-widest uppercase font-bold text-slate-300">
                                    Comunidad de creadores
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ===== PANEL DERECHO (Formulario) ===== */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">

                        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

                        <div
                            ref={formCardRef}
                            className="w-full max-w-md relative z-10"
                        >
                            <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-600/50 p-8 sm:p-10 rounded-3xl shadow-2xl dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_20px_40px_rgba(0,0,0,0.5)]">

                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                        Crear Cuenta
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Únete a D&D Textil y empieza a explorar
                                    </p>
                                </div>

                                {authError && (
                                    <div
                                        ref={errorRef}
                                        className="mb-5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800/50 text-center"
                                    >
                                        {authError}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                                    {/* Campo: Nombre */}
                                    <div className="form-field name-field-wrapper">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nombre Completo</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className={`w-5 h-5 transition-colors duration-300 ${errors.name ? 'text-red-500' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                                            </div>
                                            <input type="text" {...register('name')} className={inputClass(errors.name)} placeholder="Tu nombre completo" />
                                        </div>
                                        {errors.name && <p className="text-red-500 text-xs font-bold mt-1.5 pl-1">{errors.name.message}</p>}
                                    </div>

                                    {/* Campo: Correo */}
                                    <div className="form-field email-field-wrapper">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Correo Electrónico</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className={`w-5 h-5 transition-colors duration-300 ${errors.email ? 'text-red-500' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                                            </div>
                                            <input type="email" {...register('email')} className={inputClass(errors.email)} placeholder="tu@correo.com" />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs font-bold mt-1.5 pl-1">{errors.email.message}</p>}
                                    </div>

                                    {/* Campo: Contraseña */}
                                    <div className="form-field password-field-wrapper">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Contraseña</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className={`w-5 h-5 transition-colors duration-300 ${errors.password ? 'text-red-500' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                                            </div>
                                            <input type={showPassword ? 'text' : 'password'} {...register('password')} className={`${inputClass(errors.password)} pr-12`} placeholder="••••••••" />
                                            <button type="button" tabIndex="-1" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary-500 transition-colors">
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-500 text-xs font-bold mt-1.5 pl-1">{errors.password.message}</p>}
                                    </div>

                                    {/* Campo: Confirmar Contraseña */}
                                    <div className="form-field confirmPassword-field-wrapper">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirmar Contraseña</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className={`w-5 h-5 transition-colors duration-300 ${errors.confirmPassword ? 'text-red-500' : 'text-slate-400 group-focus-within:text-primary-500'}`} />
                                            </div>
                                            <input type={showConfirm ? 'text' : 'password'} {...register('confirmPassword')} className={`${inputClass(errors.confirmPassword)} pr-12`} placeholder="••••••••" />
                                            <button type="button" tabIndex="-1" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary-500 transition-colors">
                                                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-500 text-xs font-bold mt-1.5 pl-1">{errors.confirmPassword.message}</p>}
                                    </div>

                                    {/* Botón de Submit */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full relative overflow-hidden group bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(234,88,12,0.25)] hover:shadow-[0_12px_25px_rgba(234,88,12,0.35)] transition-all duration-300 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98]"
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Creando cuenta...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Crear Cuenta</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <p className="text-center text-sm text-slate-500 mt-6">
                                    ¿Ya tienes una cuenta?{' '}
                                    <Link to="/login" className="text-primary-600 font-bold hover:underline">
                                        Iniciar Sesión
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="relative z-10 py-4 px-6 flex items-center justify-center">
                <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/30 dark:border-slate-700/40 shadow-sm">
                    <span className="text-xs text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} D&D Textil</span>
                    <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
                    <a href="/contacto" className="text-xs text-slate-400 dark:text-slate-500 hover:text-primary-500 transition-colors">Contacto</a>
                    <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
                    <a href="#" className="text-xs text-slate-400 dark:text-slate-500 hover:text-primary-500 transition-colors">Privacidad</a>
                </div>
            </div>
        </div>
    );
}

export default Register;
