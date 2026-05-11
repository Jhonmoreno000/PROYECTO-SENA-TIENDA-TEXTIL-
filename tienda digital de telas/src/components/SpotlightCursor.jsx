/**
 * SpotlightCursor.jsx — Efecto de Linterna (Showroom Nocturno)
 *
 * Arquitectura Sensorial:
 * Este componente crea un "halo de luz" interactivo que sigue el puntero del mouse
 * exclusivamente cuando la plataforma está en Modo Oscuro (Dark Mode).
 * 
 * Funcionalidad de Diferenciación:
 * 1. Simulación de Foco: Utiliza un `radial-gradient` transparente que ilumina
 *    los elementos que toca, dejando el resto de la pantalla con una sutil penumbra.
 * 2. Rendimiento (Performance): Emplea `clientX` / `clientY` mediante eventos puros
 *    del navegador sin forzar renders innecesarios en React (manipula el DOM directo
 *    mediante estilos inline) para garantizar 60fps sin tirones.
 * 3. Z-Index Estratégico: Actúa con un `pointer-events-none` y z-index alto para
 *    estar siempre por encima del contenido sin bloquear los clicks.
 *
 * @module SpotlightCursor
 * @requires React - Hooks (useEffect, useState)
 */

import React, { useEffect, useState } from 'react';

export default function SpotlightCursor() {
    // Rastrea las coordenadas del mouse
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    // Rastrea si el dispositivo detecta que estamos en modo oscuro
    // Nota: Esto también podría leerse de un ThemeContext si el proyecto lo usa.
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        /**
         * Manejador altamente optimizado para capturar el movimiento del puntero.
         * Actualiza el estado con las coordenadas de la pantalla (Viewport).
         */
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        // Escuchamos el movimiento de forma global
        window.addEventListener('mousemove', updateMousePosition);

        // Detectar si el sistema o la aplicación tiene clase 'dark' activa en el elemento HTML
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        
        // Revisar modo oscuro al inicio
        checkDarkMode();
        
        // MutationObserver para detectar dinámicamente cuando el usuario cambia el tema
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Cleanup al desmontar el componente
        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            observer.disconnect();
        };
    }, []);

    // Si no estamos en modo oscuro, no renderizamos el halo de luz (ahorra recursos)
    if (!isDarkMode) return null;

    return (
        <div
            className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300"
            style={{
                // Creamos una linterna (radial-gradient) que es completamente transparente en el centro (iluminando lo de abajo)
                // y que se vuelve oscura (rgba(0,0,0, 0.4)) hacia los bordes, simulando una penumbra de showroom.
                background: `radial-gradient(
                    circle 600px at ${mousePosition.x}px ${mousePosition.y}px,
                    rgba(255, 255, 255, 0.05) 0%,
                    rgba(0, 0, 0, 0.4) 100%
                )`
            }}
            aria-hidden="true"
        />
    );
}
