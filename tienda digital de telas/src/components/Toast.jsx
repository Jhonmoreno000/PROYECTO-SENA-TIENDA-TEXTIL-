import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const toastVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const icons = {
    success: FiCheckCircle,
    error: FiAlertCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
};

const styles = {
    success: 'bg-white border-l-4 border-green-500 text-gray-800',
    error: 'bg-white border-l-4 border-red-500 text-gray-800',
    warning: 'bg-white border-l-4 border-orange-500 text-gray-800',
    info: 'bg-white border-l-4 border-blue-500 text-gray-800',
};

// Override colors to match Orange/Black/White theme preference where possible
// Warning is naturally Orange, so it fits perfectly.
// For others, we assume standard semantic colors are still needed for clarity, 
// but we keep the background white/clean.

function Toast({ type, message, onClose }) {
    const Icon = icons[type];
    const styleClass = styles[type];

    return (
        <motion.div
            layout
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`${styleClass} shadow-lg rounded-r-lg p-4 mb-2 min-w-[300px] flex items-start gap-3 pointer-events-auto dark:bg-slate-800 dark:text-white`}
        >
            <Icon className={`w-5 h-5 mt-0.5 ${type === 'success' ? 'text-green-500' :
                    type === 'error' ? 'text-red-500' :
                        type === 'warning' ? 'text-orange-500' :
                            'text-blue-500'
                }`} />

            <p className="flex-1 text-sm font-medium">{message}</p>

            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
                <FiX className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

export default Toast;
