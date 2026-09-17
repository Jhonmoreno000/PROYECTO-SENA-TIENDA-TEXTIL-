import React, { createContext, useContext, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const LenisContext = createContext(null);

export function useLenis() {
    return useContext(LenisContext);
}

export function SmoothScrollProvider({ children }) {
    useEffect(() => {
        // Scroll nativo del navegador: máxima fluidez y cero lag.
        // No se intercepta la rueda con suavizado artificial (Lenis) porque
        // duplicaba el trabajo por frame (rAF extra) y daba sensación de
        // arrastre al bajar. Los triggers de ScrollTrigger siguen funcionando
        // sobre el scroll nativo.

        // Recalcula las posiciones de los triggers cuando las imágenes
        // terminan de cargar (cambian la altura del layout y las animaciones
        // de aparición se dispararían tarde = sensación de lag).
        let refreshTimer = null;
        const scheduleRefresh = () => {
            if (refreshTimer) return;
            refreshTimer = setTimeout(() => {
                refreshTimer = null;
                ScrollTrigger.refresh();
            }, 200);
        };

        const onImageLoad = (e) => {
            if (e.target && e.target.tagName === 'IMG' && e.target.complete) {
                scheduleRefresh();
            }
        };
        const onWindowLoad = () => scheduleRefresh();

        window.addEventListener('load', onWindowLoad);
        document.addEventListener('load', onImageLoad, true);

        return () => {
            window.removeEventListener('load', onWindowLoad);
            document.removeEventListener('load', onImageLoad, true);
            if (refreshTimer) clearTimeout(refreshTimer);
        };
    }, []);

    return <LenisContext.Provider value={null}>{children}</LenisContext.Provider>;
}