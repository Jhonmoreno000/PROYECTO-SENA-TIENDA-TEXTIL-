/**
 * QuantitySelector.jsx — Selector de cantidad de producto
 *
 * Componente reutilizable para seleccionar la cantidad de metros de tela.
 * Incluye botones de incremento/decremento y un input numérico.
 *
 * Dependencias de íconos (lucide-react):
 * - Minus → botón decrementar
 * - Plus  → botón incrementar
 */

import React from 'react';
import { Minus, Plus } from 'lucide-react';

function QuantitySelector({ quantity, setQuantity, max = 100, min = 1 }) {
    const increment = () => { if (quantity < max) setQuantity(quantity + 1); };
    const decrement = () => { if (quantity > min) setQuantity(quantity - 1); };

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
            <button
                onClick={decrement}
                disabled={quantity <= min}
                className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors active:scale-90"
                aria-label="Disminuir cantidad"
            >
                <Minus className="w-5 h-5" />
            </button>

            <input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                min={min}
                max={max}
                className="w-20 h-10 text-center text-lg font-bold rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />

            <button
                onClick={increment}
                disabled={quantity >= max}
                className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors active:scale-90"
                aria-label="Aumentar cantidad"
            >
                <Plus className="w-5 h-5" />
            </button>

            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                metros (máx: {max})
            </span>
        </div>
    );
}

export default QuantitySelector;
