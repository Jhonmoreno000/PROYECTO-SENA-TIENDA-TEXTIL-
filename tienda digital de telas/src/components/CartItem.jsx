import React from 'react';
import { motion } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import QuantitySelector from './QuantitySelector';

function CartItem({ item }) {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="card p-4 md:p-6"
        >
            <div className="flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800">
                    <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
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
                            className="text-red-500 hover:text-red-600 p-2"
                            aria-label="Eliminar producto"
                        >
                            <FiTrash2 className="w-5 h-5" />
                        </motion.button>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Quantity */}
                        <div>
                            <QuantitySelector
                                quantity={item.quantity}
                                setQuantity={(newQuantity) => updateQuantity(item.id, newQuantity)}
                                max={item.stock}
                            />
                        </div>

                        {/* Price */}
                        <div className="text-right">
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
