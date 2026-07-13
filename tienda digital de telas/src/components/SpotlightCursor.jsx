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

import React, { useEffect, useRef, useState } from 'react';

export default function SpotlightCursor() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const cursorRef = useRef(null);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isDarkMode) return;

        const el = cursorRef.current;
        if (!el) return;

        const updateCursor = (e) => {
            el.style.background = `radial-gradient(
                circle 600px at ${e.clientX}px ${e.clientY}px,
                rgba(255, 255, 255, 0.05) 0%,
                rgba(0, 0, 0, 0.4) 100%
            )`;
        };

        window.addEventListener('mousemove', updateCursor, { passive: true });
        return () => window.removeEventListener('mousemove', updateCursor);
    }, [isDarkMode]);

    if (!isDarkMode) return null;

    return (
        <div
            ref={cursorRef}
            className="pointer-events-none fixed inset-0 z-[9999]"
            aria-hidden="true"
        />
    );
}
