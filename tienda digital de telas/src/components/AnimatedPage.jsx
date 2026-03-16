import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: { 
        opacity: 0, 
        y: 15,
        scale: 0.99,
        filter: 'blur(4px)'
    },
    in: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        filter: 'blur(0px)'
    },
    out: { 
        opacity: 0, 
        y: -15,
        scale: 1.01,
        filter: 'blur(4px)'
    }
};

const pageTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1
};

function AnimatedPage({ children, className = "" }) {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className={`w-full ${className}`}
        >
            {children}
        </motion.div>
    );
}

export default AnimatedPage;
