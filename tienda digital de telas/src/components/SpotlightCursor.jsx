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
    const rafRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });

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
            mouseRef.current = { x: e.clientX, y: e.clientY };
            if (!rafRef.current) {
                rafRef.current = requestAnimationFrame(() => {
                    const { x, y } = mouseRef.current;
                    el.style.background = `radial-gradient(
                        circle 600px at ${x}px ${y}px,
                        rgba(255, 255, 255, 0.06) 0%,
                        rgba(0, 0, 0, 0.3) 100%
                    )`;
                    rafRef.current = null;
                });
            }
        };

        window.addEventListener('mousemove', updateCursor, { passive: true });
        return () => {
            window.removeEventListener('mousemove', updateCursor);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
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
