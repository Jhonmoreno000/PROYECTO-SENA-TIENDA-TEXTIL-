/**
 * AnimatedPage.jsx — Envoltorio de Animación de Entrada de Páginas
 * =================================================================
 * Este componente añade una animación suave de entrada cada vez que
 * el usuario navega a una nueva página. La pantalla aparece desde
 * abajo con un efecto de desenfoque que desaparece en 0.5 segundos.
 *
 * Efecto de animación:
 *  - La página empieza: invisible (opacity 0), ligeramente abajo (y: 15),
 *    casi sin zoom (scale 0.99) y con desenfoque (blur 4px)
 *  - Termina: completamente visible, en posición normal, nítida
 *
 * ¿Cómo se usa?
 *  Envuelve el contenido de cualquier página:
 *  <AnimatedPage>
 *    <div>Contenido de la página</div>
 *  </AnimatedPage>
 */

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * @param {React.ReactNode} children  - Contenido de la página a animar
 * @param {string}          className - Clases CSS adicionales (opcional)
 */
function AnimatedPage({ children, className = "" }) {
    // Referencia al contenedor para que GSAP pueda animarlo
    const containerRef = useRef(null);

    // useGSAP ejecuta la animación cuando el componente aparece en pantalla
    useGSAP(() => {
        gsap.fromTo(containerRef.current,
            // Estado inicial (antes de la animación)
            {
                opacity: 0,         // Completamente invisible
                y: 15,              // 15 píxeles hacia abajo
                scale: 0.99,        // Ligeramente más pequeño
                filter: 'blur(4px)' // Ligeramente desenfocado
            },
            // Estado final (después de la animación)
            {
                opacity: 1,          // Completamente visible
                y: 0,                // En su posición normal
                scale: 1,            // Tamaño original
                filter: 'blur(0px)', // Nítido
                duration: 0.5,       // La animación dura 0.5 segundos
                ease: "power2.out"   // Desaceleración suave al final
            }
        );
    }, { scope: containerRef }); // Solo animamos lo que está dentro de containerRef

    return (
        <div ref={containerRef} className={`w-full ${className}`}>
            {children}
        </div>
    );
}

export default AnimatedPage;
