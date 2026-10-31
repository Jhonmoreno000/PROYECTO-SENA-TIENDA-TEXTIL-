import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';

export default function BotonWhatsAppFlotante() {
    const location = useLocation();
    const [minimizado, setMinimizado] = useState(false);

    // No mostrar en paneles internos de administración o vendedor para mantener limpia la interfaz ERP
    const ocultarEnRutas = ['/admin', '/vendedor', '/login', '/registro'];
    if (ocultarEnRutas.some((prefijo) => location.pathname.startsWith(prefijo))) {
        return null;
    }

    const urlWhatsApp =
        'https://wa.me/573027058951?text=Hola%20D%26D%20Textil%20Medell%C3%ADn%2C%20quisiera%20asesor%C3%ADa%20sobre%20telas%2C%20metrajes%20o%20pedidos';

    return (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 print:hidden">
            {!minimizado && (
                <div className="hidden sm:flex items-center gap-2 bg-slate-900/95 text-white text-xs font-medium px-3.5 py-2 rounded-full shadow-lg border border-slate-700/80 backdrop-blur-md animate-fade-in">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>¿Dudas con tu tela? <strong>302 705 8951</strong></span>
                    <button
                        type="button"
                        onClick={() => setMinimizado(true)}
                        className="text-slate-400 hover:text-white p-0.5 rounded-full transition-colors"
                        aria-label="Cerrar aviso de WhatsApp"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <a
                href={urlWhatsApp}
                target="_blank"
                rel="noreferrer"
                aria-label="Contactar a D&D Textil por WhatsApp 302 705 8951"
                title="Asesoría directa WhatsApp D&D Textil (302 705 8951)"
                className="group relative flex items-center justify-center w-13 h-13 p-3.5 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow-xl shadow-emerald-600/30 hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/20"
            >
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20 pointer-events-none" />
                <MessageCircle className="w-6 h-6 fill-current" />
            </a>
        </div>
    );
}

