import React from 'react';
import { motion } from 'framer-motion';
import { FiMinus, FiPlus } from 'react-icons/fi';

function QuantitySelector({ quantity, setQuantity, max = 100, min = 1 }) {
    const increment = () => {
        if (quantity < max) {
            setQuantity(quantity + 1);
        }
    };

    const decrement = () => {
        if (quantity > min) {
            setQuantity(quantity - 1);
        }
    };

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= min && value <= max) {
            setQuantity(value);
        } else if (e.target.value === '') {
            setQuantity(min);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={decrement}
                disabled={quantity <= min}
                className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                aria-label="Disminuir cantidad"
            >
                <FiMinus className="w-5 h-5" />
            </motion.button>

            <input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                min={min}
                max={max}
                className="w-20 h-10 text-center text-lg font-bold rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />

            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={increment}
                disabled={quantity >= max}
                className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                aria-label="Aumentar cantidad"
            >
                <FiPlus className="w-5 h-5" />
            </motion.button>

            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                metros (máx: {max})
            </span>
        </div>
    );
}

export default QuantitySelector;
