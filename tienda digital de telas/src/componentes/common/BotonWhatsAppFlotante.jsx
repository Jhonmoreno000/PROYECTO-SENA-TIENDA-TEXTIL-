import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, Sparkles, ArrowUpRight } from 'lucide-react';

/**
 * BotonWhatsAppFlotante — Botón de atención al cliente compacto y dinámico.
 *
 * En reposo: Se mantiene como un elegante botón circular de cristal esmeralda,
 * ocupando el mínimo espacio en pantalla y sin obstruir el contenido.
 *
 * Al señalarlo (Hover / Focus): Se despliega suavemente hacia la izquierda
 * una cápsula interactiva con información del asesor en línea y el número de contacto.
 */
export default function BotonWhatsAppFlotante() {
    const location = useLocation();
    const esRutaPago = ['/pago', '/payment', '/checkout'].some((p) =>
        location.pathname.startsWith(p)
    );

    const [hovered, setHovered] = useState(false);
    const [asomoInicial, setAsomoInicial] = useState(false);

    // Asomo sutil de 3.5 segundos en la primera visita de la sesión para dar a conocer el canal
    useEffect(() => {
        if (esRutaPago) return;
        try {
            const yaVisto = sessionStorage.getItem('whatsapp_asomo_visto');
            if (!yaVisto) {
                // Pequeña espera para no competir con las animaciones de entrada de la página
                const timerInicio = setTimeout(() => {
                    setAsomoInicial(true);
                    const timerCierre = setTimeout(() => {
                        setAsomoInicial(false);
                        sessionStorage.setItem('whatsapp_asomo_visto', 'true');
                    }, 3500);
                    return () => clearTimeout(timerCierre);
                }, 1200);

                return () => clearTimeout(timerInicio);
            }
        } catch {
            /* ignore storage errors */
        }
    }, [esRutaPago]);

    // Ocultar en paneles administrativos o de autenticación para no distraer en tareas operativas
    const ocultarEnRutas = ['/admin', '/vendedor', '/login', '/registro'];
    if (ocultarEnRutas.some((prefijo) => location.pathname.startsWith(prefijo))) {
        return null;
    }

    const urlWhatsApp =
        'https://wa.me/573027058951?text=Hola%20D%26D%20Textil%20Medell%C3%ADn%2C%20quisiera%20asesor%C3%ADa%20sobre%20telas%2C%20metrajes%20o%20pedidos';

    const visiblePill = hovered || asomoInicial;

    return (
        <aside
            aria-label="Atención al cliente por WhatsApp"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            className={`fixed z-40 flex items-center gap-2.5 print:hidden pointer-events-auto transition-all duration-300 ${
                esRutaPago
                    ? 'bottom-6 right-6'
                    : 'bottom-5 right-5 sm:bottom-6 sm:right-6'
            }`}
        >
            {/* Cápsula flotante que emerge al señalar el botón (Hover / Focus) */}
            <a
                href={urlWhatsApp}
                target="_blank"
                rel="noreferrer"
                tabIndex={visiblePill ? 0 : -1}
                aria-hidden={!visiblePill}
                className={`group/pill hidden sm:flex items-center gap-3 bg-slate-900/90 dark:bg-slate-950/95 text-white pl-4 pr-3.5 py-2.5 rounded-full shadow-[0_12px_35px_-4px_rgba(0,0,0,0.45)] border border-white/15 dark:border-white/10 backdrop-blur-2xl ring-1 ring-white/10 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-slate-800/95 hover:border-emerald-400/40 hover:scale-[1.02] active:scale-95 ${
                    visiblePill
                        ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto'
                        : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
                }`}
            >
                {/* Indicador de estado en vivo */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                            Asesor en línea
                            <Sparkles className="w-2.5 h-2.5 text-amber-300 inline-block animate-pulse" />
                        </span>
                    </div>

                    {/* Mensaje y número de contacto */}
                    <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                        <span>¿Dudas con tu tela?</span>
                        <span className="font-extrabold text-white tracking-wide bg-white/10 px-1.5 py-0.5 rounded-md text-[11px] border border-white/10 group-hover/pill:border-emerald-400/50 group-hover/pill:text-emerald-200 transition-colors">
                            302 705 8951
                        </span>
                    </div>
                </div>

                {/* Micro flecha de llamada a la acción */}
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover/pill:bg-emerald-500 group-hover/pill:text-white transition-all duration-200">
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/pill:translate-x-0.5 group-hover/pill:-translate-y-0.5 transition-transform" />
                </div>
            </a>

            {/* Botón Circular Principal Compacto */}
            <a
                href={urlWhatsApp}
                target="_blank"
                rel="noreferrer"
                aria-label="Abrir chat de WhatsApp con asesor de D&D Textil (302 705 8951)"
                title="¿Dudas con tu tela? Escríbenos al 302 705 8951"
                className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 hover:from-emerald-500 hover:to-teal-300 text-white shadow-[0_8px_25px_rgba(5,150,105,0.4)] hover:shadow-[0_14px_35px_rgba(5,150,105,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/30 backdrop-blur-md"
            >
                {/* Onda de respiración sutil */}
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />

                {/* Punto verde de notificación en la esquina superior cuando está en reposo */}
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-[0_0_6px_#34d399]" />
                </span>

                {/* Ícono de WhatsApp */}
                <MessageCircle className="w-6 h-6 fill-current transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105" />
            </a>
        </aside>
    );
}
