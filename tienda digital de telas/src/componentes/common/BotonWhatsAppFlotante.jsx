import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';

export default function BotonWhatsAppFlotante() {
    const location = useLocation();
    const esRutaPago = ['/pago', '/payment', '/checkout'].some((p) =>
        location.pathname.startsWith(p)
    );

    // En pantallas de pago, se inicia minimizado para NO colisionar con botones de confirmación
    const [minimizado, setMinimizado] = useState(() => {
        try {
            const guardado = sessionStorage.getItem('whatsapp_minimizado');
            if (guardado !== null) return guardado === 'true';
        } catch {
            /* ignore */
        }
        return esRutaPago;
    });

    const [mostrarTooltip, setMostrarTooltip] = useState(false);

    // Si cambia de ruta hacia /pago o /checkout, minimizamos la pastilla para no tapar los formularios
    useEffect(() => {
        if (esRutaPago) {
            setMinimizado(true);
        }
    }, [location.pathname, esRutaPago]);

    // No mostrar en paneles internos de administración o vendedor para mantener limpia la interfaz ERP
    const ocultarEnRutas = ['/admin', '/vendedor', '/login', '/registro'];
    if (ocultarEnRutas.some((prefijo) => location.pathname.startsWith(prefijo))) {
        return null;
    }

    const urlWhatsApp =
        'https://wa.me/573027058951?text=Hola%20D%26D%20Textil%20Medell%C3%ADn%2C%20quisiera%20asesor%C3%ADa%20sobre%20telas%2C%20metrajes%20o%20pedidos';

    const handleCerrar = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMinimizado(true);
        try {
            sessionStorage.setItem('whatsapp_minimizado', 'true');
        } catch {
            /* ignore */
        }
    };

    return (
        <aside
            aria-label="Atención al cliente por WhatsApp"
            className={`fixed z-30 flex items-center gap-2.5 print:hidden transition-all duration-300 pointer-events-auto ${
                esRutaPago
                    ? 'bottom-6 right-6 sm:bottom-7 sm:right-7'
                    : 'bottom-5 right-5 sm:bottom-6 sm:right-6'
            }`}
        >
            {/* Pastilla con Glassmorfismo de Lujo (expandida en navegación normal o hover) */}
            {!minimizado && (
                <div
                    role="status"
                    className="hidden sm:flex items-center gap-2.5 bg-slate-900/80 dark:bg-slate-950/85 text-slate-100 text-xs font-medium px-4 py-2.5 rounded-full shadow-[0_10px_35px_-4px_rgba(0,0,0,0.35)] border border-white/15 dark:border-white/10 backdrop-blur-xl animate-fade-in ring-1 ring-white/5"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                    </span>
                    <span className="text-slate-200">
                        ¿Dudas con tu tela?{' '}
                        <strong className="text-white font-semibold tracking-wide">302 705 8951</strong>
                    </span>
                    <button
                        type="button"
                        onClick={handleCerrar}
                        className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors ml-0.5 cursor-pointer"
                        aria-label="Cerrar aviso de WhatsApp"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Tooltip flotante alternativo al estar minimizado y pasar el cursor */}
            {minimizado && mostrarTooltip && (
                <div
                    role="tooltip"
                    className="hidden sm:block absolute right-16 bg-slate-900/90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-md shadow-xl whitespace-nowrap animate-fade-in pointer-events-none"
                >
                    Asesoría WhatsApp D&amp;D (302 705 8951)
                </div>
            )}

            {/* Botón Circular con Glassmorfismo Esmeralda Satinado */}
            <a
                href={urlWhatsApp}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => setMostrarTooltip(true)}
                onMouseLeave={() => setMostrarTooltip(false)}
                aria-label="Contactar a D&D Textil por WhatsApp 302 705 8951"
                title="Asesoría directa WhatsApp D&D Textil (302 705 8951)"
                className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-emerald-600/90 hover:bg-emerald-500/95 text-white shadow-[0_8px_25px_rgba(5,150,105,0.35)] hover:shadow-[0_12px_30px_rgba(5,150,105,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/25 backdrop-blur-md"
            >
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-15 pointer-events-none" />
                <MessageCircle className="w-6 h-6 fill-current transition-transform duration-300 group-hover:rotate-6" />
            </a>
        </aside>
    );
}


