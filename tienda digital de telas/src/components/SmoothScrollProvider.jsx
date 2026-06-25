/**
 * SmoothScrollProvider.jsx — Proveedor de Desplazamiento Suave (Lenis)
 *
 * Arquitectura de Interfaz Premium e Inmersiva:
 * Implementa @studio-freight/lenis (ahora 'lenis') para sobrescribir el scroll
 * nativo del navegador, proporcionando una experiencia de "Scroll Gomoso" (Inertia Scroll).
 *
 * Características Técnicas:
 * 1. Easing Matemático: Modifica la función de interpolación (easing) para 
 *    desacelerar el scroll progresivamente, aportando una sensación de peso y fluidez.
 * 2. RequestAnimationFrame (RAF): Sincroniza la posición del scroll con el 
 *    ciclo de pintado del navegador (60/120fps) eliminando los tirones o "jank" visual.
 * 3. Contexto Global: Al envolver toda la aplicación (en App.jsx), cualquier elemento
 *    con `position: sticky`, animaciones atadas al scroll (Parallax), o el flujo 
 *    general de navegación se benefician de la inercia controlada.
 *
 * @module SmoothScrollProvider
 * @requires @studio-freight/lenis (o lenis) - Librería principal de gestión de inercia
 */

import React, { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

/**
 * Componente Wrapper para inicializar Lenis en el ciclo de vida de React.
 * @param {React.ReactNode} children - Componentes hijos (típicamente AppRoutes)
 */
export function SmoothScrollProvider({ children }) {
    useEffect(() => {
        /**
         * Inicialización de la instancia de Lenis con parámetros customizados
         * para lograr el estilo "Luxury" o "Premium".
         */
        const lenis = new Lenis({
            duration: 1.2, // Tiempo en segundos para llegar de punto A a B, más alto = más inercia
            
            // Función de easing personalizada (OutExpo) para frenado suave al final del recorrido
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
            
            direction: 'vertical',        // Aplica inercia al eje Y
            gestureDirection: 'vertical', // Capta gestos verticales de trackpads y ratones mágicos
            smooth: true,                 // Activa el suavizado general
            smoothTouch: false,           // Usualmente desactivado en móviles para mantener la experiencia nativa de iOS/Android
            touchMultiplier: 2,           // Multiplica la velocidad base al deslizar con trackpad
        });

        /**
         * Loop de animación propio del navegador.
         * 'lenis.raf(time)' le dice a Lenis que calcule la nueva posición basándose en el timestamp actual.
         * @param {DOMHighResTimeStamp} time 
         */
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf); // Pide el próximo frame
        }

        // Iniciar el loop de animación
        requestAnimationFrame(raf);

        /**
         * Función de limpieza (Cleanup) del useEffect.
         * Es crítico destruir la instancia cuando el componente se desmonta 
         * para evitar memory leaks o listeners huérfanos.
         */
        return () => {
            lenis.destroy();
        };
    }, []); // El array vacío asegura que esto corra solo una vez (al montar)

    // Se renderizan los componentes hijos inalterados; Lenis actúa a nivel de la ventana (Window)
    return <>{children}</>;
}
