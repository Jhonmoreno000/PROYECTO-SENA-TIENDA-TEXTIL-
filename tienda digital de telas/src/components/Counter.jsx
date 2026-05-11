import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function Counter({ value, suffix = "", delay = 0 }) {
    const ref = useRef(null);
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    useGSAP(() => {
        const obj = { val: 0 };
        gsap.to(obj, {
            val: numericValue,
            duration: 2,
            delay: delay,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ref.current,
                start: "top 90%",
                once: true
            },
            onUpdate: () => {
                if (ref.current) {
                    const currentVal = numericValue % 1 === 0 ? Math.floor(obj.val) : obj.val.toFixed(1);
                    ref.current.textContent = currentVal.toLocaleString() + suffix;
                }
            }
        });
    }, { scope: ref });

    return (
        <span ref={ref} className="tabular-nums inline-block">
            0{suffix}
        </span>
    );
}

export default Counter;
