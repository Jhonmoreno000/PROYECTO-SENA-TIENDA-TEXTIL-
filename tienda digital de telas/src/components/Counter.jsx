import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

function Counter({ value, suffix = "", delay = 0 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    const spring = useSpring(0, {
        stiffness: 40,
        damping: 20,
        restDelta: 0.001
    });
    
    const display = useTransform(spring, (current) => {
        const val = numericValue % 1 === 0 ? Math.floor(current) : current.toFixed(1);
        return val.toLocaleString() + suffix;
    });

    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => {
                spring.set(numericValue);
            }, delay * 1000);
            return () => clearTimeout(timer);
        }
    }, [isInView, spring, numericValue, delay]);

    return (
        <motion.span ref={ref} className="tabular-nums inline-block">
            {display}
        </motion.span>
    );
}

export default Counter;
