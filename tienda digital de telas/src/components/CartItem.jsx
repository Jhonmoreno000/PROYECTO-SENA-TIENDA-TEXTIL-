import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import QuantitySelector from './QuantitySelector';

function CartItem({ item }) {
    const { updateQuantity, removeFromCart } = useCart();

    // Guardas para imagen segura
    const imageUrl = Array.isArray(item.images) && item.images.length > 0
        ? item.images[0]
        : null;

    return (
        <motion.div
            // Sin `layout` — evita el layout thrashing que distorsiona el carrito al cargar
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="card p-4 md:p-6"
        >
            <div className="flex gap-4">
                {/* Imagen */}
                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                            🧵
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 p-2 flex-shrink-0"
                            aria-label="Eliminar producto"
                        >
                            <FiTrash2 className="w-5 h-5" />
                        </motion.button>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Selector de cantidad */}
                        <QuantitySelector
                            quantity={item.quantity}
                            setQuantity={(newQuantity) => updateQuantity(item.id, newQuantity)}
                            max={item.stock ?? 99}
                        />

                        {/* Precio */}
                        <div className="text-right flex-shrink-0">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                {formatCurrency(item.price)} × {item.quantity}m
                            </div>
                            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {formatCurrency(item.price * item.quantity)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default CartItem;
