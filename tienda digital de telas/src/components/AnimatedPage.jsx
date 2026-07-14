import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useNavigationType } from 'react-router-dom';
import { EASES, DURATIONS } from '../utils/animations';

function AnimatedPage({ children, className = "" }) {
    const containerRef = useRef(null);
    const navType = useNavigationType();

    useGSAP(() => {
        const dir = navType === 'POP' ? -1 : 1;

        gsap.fromTo(containerRef.current,
            { opacity: 0, x: dir * 40, scale: 0.98 },
            { opacity: 1, x: 0, scale: 1, duration: DURATIONS.slower, ease: EASES.smoother, force3D: true }
        );
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className={`w-full ${className}`}>
            {children}
        </div>
    );
}

export default AnimatedPage;
