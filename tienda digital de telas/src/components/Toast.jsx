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

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

// Importación de íconos desde lucide-react
import {
    CheckCircle,
    AlertCircle,
    TriangleAlert,
    Info,
    X,
} from 'lucide-react';

// Mapa de íconos según el tipo de notificación
const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: TriangleAlert,
    info: Info,
};

// Estilos CSS según el tipo de notificación
const styles = {
    success: 'bg-white border-l-4 border-green-500 text-gray-800',
    error: 'bg-white border-l-4 border-red-500 text-gray-800',
    warning: 'bg-white border-l-4 border-orange-500 text-gray-800',
    info: 'bg-white border-l-4 border-blue-500 text-gray-800',
};

/**
 * Componente funcional Toast
 * @param {string} type - Tipo de toast: 'success', 'error', 'warning', 'info'
 * @param {string} message - Mensaje a mostrar en la notificación
 * @param {Function} onClose - Callback para cerrar el toast
 */
function Toast({ type, message, onClose }) {
    const Icon = icons[type];
    const styleClass = styles[type];
    const toastRef = useRef(null);

    useEffect(() => {
        if (toastRef.current) {
            gsap.fromTo(toastRef.current,
                { opacity: 0, y: 50, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
            );
        }
    }, []);

    const handleClose = () => {
        if (toastRef.current) {
            gsap.to(toastRef.current, {
                opacity: 0, scale: 0.9, duration: 0.2, ease: "power2.in",
                onComplete: onClose
            });
        } else {
            onClose();
        }
    };

    return (
        <div
            ref={toastRef}
            className={`${styleClass} shadow-lg rounded-r-lg p-4 mb-2 min-w-[300px] flex items-start gap-3 pointer-events-auto dark:bg-slate-800 dark:text-white`}
        >
            {/* Ícono del tipo de notificación con color semántico */}
            <Icon className={`w-5 h-5 mt-0.5 ${type === 'success' ? 'text-green-500' :
                    type === 'error' ? 'text-red-500' :
                        type === 'warning' ? 'text-orange-500' :
                            'text-blue-500'
                }`} />

            {/* Mensaje de la notificación */}
            <p className="flex-1 text-sm font-medium">{message}</p>

            {/* Botón para cerrar el toast */}
            <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default Toast;
