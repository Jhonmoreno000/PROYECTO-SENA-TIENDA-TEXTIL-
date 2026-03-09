import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

function CartSummary() {
    const { getCartTotal, getCartItemCount } = useCart();

    const subtotal = getCartTotal();
    const shipping = subtotal >= 100000 ? 0 : 15000;
    const tax = subtotal * 0.19; // IVA 19%
    const total = subtotal + shipping + tax;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 sticky top-24"
        >
            <h2 className="text-2xl font-bold mb-6">Resumen del Pedido</h2>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({getCartItemCount()} items)</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Envío</span>
                    <span className="font-semibold">
                        {shipping === 0 ? (
                            <span className="text-green-600 dark:text-green-400">¡Gratis!</span>
                        ) : (
                            formatCurrency(shipping)
                        )}
                    </span>
                </div>

                {shipping > 0 && subtotal < 100000 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        Agrega {formatCurrency(100000 - subtotal)} más para envío gratis
                    </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>IVA (19%)</span>
                    <span className="font-semibold">{formatCurrency(tax)}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                    <div className="flex justify-between items-baseline">
                        <span className="text-xl font-bold">Total</span>
                        <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>
            </div>

            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
                Proceder al Pago
                <FiArrowRight />
            </Link>

            <Link
                to="/catalogo"
                className="block text-center text-primary-600 dark:text-primary-400 hover:underline mt-4"
            >
                Continuar Comprando
            </Link>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-green-500">✓</span>
                    <span>Pago 100% seguro</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-green-500">✓</span>
                    <span>Garantía de calidad</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-green-500">✓</span>
                    <span>Devoluciones fáciles</span>
                </div>
            </div>
        </motion.div>
    );
}

export default CartSummary;
