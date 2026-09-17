/**
 * ContextoNotificacion.jsx — Sistema de Notificaciones
 * =====================================================
 * Este archivo controla los mensajes emergentes que aparecen en la esquina
 * inferior derecha de la pantalla (llamados "Toast" o "snackbars").
 *
 * Tipos de notificación disponibles:
 *  - 'success' → fondo verde  (Ej: "Producto guardado correctamente")
 *  - 'error'   → fondo rojo   (Ej: "No se pudo conectar con el servidor")
 *  - 'info'    → fondo azul   (Ej: "Datos sincronizados")
 *  - 'warning' → fondo amarillo (Ej: "Stock bajo")
 *
 * ¿Cómo se usa en otro componente?
 *  const { showNotification } = useNotificacion();
 *  showNotification('success', 'Producto eliminado exitosamente');
 *
 * Las notificaciones se eliminan solas después de 4 segundos (configurable).
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../componentes/Toast'; // Componente visual de la notificación

// Creamos el contexto para compartir la función showNotification con toda la app
const ContextoNotificacion = createContext();

/**
 * useNotificacion — Hook para mostrar notificaciones desde cualquier componente
 */
export function useNotificacion() {
    const contextos = useContext(ContextoNotificacion);
    if (!contextos) {
        throw new Error('useNotificacion debe usarse dentro de un NotificationProvider');
    }
    return contextos;
}

/**
 * NotificationProvider — Proveedor del sistema de notificaciones
 */
export function NotificationProvider({ children }) {
    // Lista de notificaciones activas en pantalla (puede haber varias al mismo tiempo)
    const [notifications, setNotifications] = useState([]);

    /**
     * showNotification — Muestra una notificación en pantalla
     * useCallback evita que esta función se recree en cada render (mejor rendimiento)
     * @param {string} type      - Tipo: 'success', 'error', 'info', 'warning'
     * @param {string} message   - Texto que se muestra al usuario
     * @param {number} duration  - Tiempo en milisegundos antes de desaparecer (por defecto 4 segundos)
     */
    const showNotification = useCallback((type, message, duration = 4000) => {
        // Usamos Date.now() como ID único para poder eliminar esta notificación específica
        const id = Date.now();
        // Agregamos la nueva notificación a la lista
        setNotifications((prev) => [...prev, { id, type, message }]);

        // Programamos la eliminación automática después del tiempo indicado
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
    }, []); // Sin dependencias: esta función nunca cambia

    /**
     * removeNotification — Elimina una notificación específica
     * Se llama cuando el usuario hace clic en la "X" de la notificación
     * @param {number} id - ID único de la notificación a eliminar
     */
    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <ContextoNotificacion.Provider value={{ showNotification }}>
            {children}

            {/* Contenedor fijo en la esquina inferior derecha de la pantalla */}
            {/* pointer-events-none: el contenedor no bloquea clics en el resto de la página */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {notifications.map((notification) => (
                    <Toast
                        key={notification.id}
                        {...notification}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
        </ContextoNotificacion.Provider>
    );
}
