import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useNavigationType } from 'react-router-dom';
import { EASES, DURATIONS } from '../utilidades/animations';

function PaginaAnimada({ children, className = "" }) {
    const containerRef = useRef(null);
    const navType = useNavigationType();

    useGSAP(() => {
        // Garantizar que la página siempre inicie arriba al montarse o cambiar de ruta
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;

        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 10, scale: 0.995 },
            { 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                duration: DURATIONS.normal, 
                ease: EASES.smooth, 
                force3D: true, 
                clearProps: 'transform' 
            }
        );
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className={`w-full ${className}`}>
            {children}
        </div>
    );
}

export default PaginaAnimada;
