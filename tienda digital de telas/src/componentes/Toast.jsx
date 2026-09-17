/**
 * Toast.jsx — Componente de notificaciones toast
 *
 * Muestra mensajes emergentes temporales en la parte inferior de la pantalla.
 * Soporta 4 tipos de notificación: success, error, warning e info.
 * Cada tipo tiene su propio ícono, color de borde y estilo visual.
 *
 * Dependencias de íconos (lucide-react):
 * - CheckCircle    → toast de éxito
 * - AlertCircle    → toast de error
 * - TriangleAlert  → toast de advertencia
 * - Info           → toast informativo
 * - X              → botón cerrar
 */

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { CheckCircle, AlertCircle, TriangleAlert, Info, X } from 'lucide-react';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: TriangleAlert,
    info: Info,
};

const styles = {
    success: 'border-green-500',
    error: 'border-red-500',
    warning: 'border-orange-500',
    info: 'border-blue-500',
};

const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-orange-500',
    info: 'bg-blue-500',
};

const textColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-orange-500',
    info: 'text-blue-500',
};

function Toast({ type, message, onClose }) {
    const Icon = icons[type];
    const styleClass = styles[type];
    const textColorClass = textColors[type];
    const bgColorClass = bgColors[type];
    
    const toastRef = useRef(null);
    const progressRef = useRef(null);

    useGSAP(() => {
        // Animación de entrada
        gsap.from(toastRef.current, { 
            opacity: 0, 
            y: 50, 
            scale: 0.9, 
            duration: 0.5, 
            ease: "back.out(1.5)",
            clearProps: "all" 
        });

        // Animación de la barra de progreso (4 segundos)
        gsap.to(progressRef.current, {
            width: '0%',
            duration: 4,
            ease: "none"
        });
    }, { scope: toastRef });

    const handleClose = () => {
        if (toastRef.current) {
            gsap.to(toastRef.current, {
                opacity: 0, 
                scale: 0.8, 
                x: 100,
                duration: 0.3, 
                ease: "power3.in",
                onComplete: onClose
            });
        } else {
            onClose();
        }
    };

    return (
        <div
            ref={toastRef}
            className={`relative bg-white dark:bg-slate-800 border-l-4 ${styleClass} shadow-xl rounded-r-lg min-w-[300px] max-w-sm pointer-events-auto overflow-hidden gpu-accelerated`}
        >
            <div className="p-4 flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 ${textColorClass}`} />
                <p className="flex-1 text-sm font-medium text-slate-800 dark:text-white leading-relaxed">{message}</p>
                <button
                    onClick={handleClose}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            {/* Barra de progreso */}
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 absolute bottom-0 left-0">
                <div ref={progressRef} className={`h-full w-full ${bgColorClass}`} />
            </div>
        </div>
    );
}

export default Toast;
