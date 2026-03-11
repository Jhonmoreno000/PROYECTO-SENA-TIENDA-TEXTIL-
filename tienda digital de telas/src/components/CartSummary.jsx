import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiTag, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useMetrics } from '../context/MetricsContext';
import { formatCurrency } from '../utils/formatters';

function CartSummary() {
    const { getCartTotal, getCartItemCount, appliedCoupon, setAppliedCoupon } = useCart();
    const { coupons } = useMetrics();
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');

    const subtotal = getCartTotal();
    
    // Cálculo de descuento
    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discountType === 'percentage') {
            discountAmount = subtotal * (appliedCoupon.discountValue / 100);
        } else {
            discountAmount = appliedCoupon.discountValue;
        }
        // Limit discount to not exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal);
    }

    const discountedSubtotal = subtotal - discountAmount;
    const shipping = discountedSubtotal >= 100000 ? 0 : 15000;
    const tax = discountedSubtotal * 0.19; // IVA 19%
    const total = discountedSubtotal + shipping + tax;

    const handleApplyCoupon = () => {
        setCouponError('');
        if (!couponCode.trim()) return;

        const code = couponCode.trim().toUpperCase();
        const foundCoupon = coupons.find(c => c.code === code && c.active);

        if (!foundCoupon) {
            setCouponError('Cupón inválido o inactivo');
            return;
        }

        // Validate expiration
        const isExpired = new Date(foundCoupon.expiresAt) < new Date();
        if (isExpired) {
            setCouponError('Este cupón ha expirado');
            return;
        }

        // Validate min purchase
        if (foundCoupon.rules.minPurchase && subtotal < foundCoupon.rules.minPurchase) {
            setCouponError(`Requiere compra mínima de ${formatCurrency(foundCoupon.rules.minPurchase)}`);
            return;
        }

        setAppliedCoupon(foundCoupon);
        setCouponCode('');
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
    };

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

                {/* Seción de Cupón */}
                <div className="border-t border-b border-gray-100 dark:border-slate-700 py-4 my-2">
                    {appliedCoupon ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <FiTag />
                                    <span className="font-bold">{appliedCoupon.code}</span>
                                </div>
                                <button 
                                    onClick={handleRemoveCoupon}
                                    className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded-full text-green-600 transition-colors"
                                >
                                    <FiX />
                                </button>
                            </div>
                            <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                                <span>Descuento</span>
                                <span>-{formatCurrency(discountAmount)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                ¿Tienes un cupón de descuento?
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Ingresa tu código"
                                    className="input-field flex-1 uppercase"
                                />
                                <button 
                                    onClick={handleApplyCoupon}
                                    className="px-4 py-2 bg-gray-900 text-white dark:bg-primary-600 rounded-lg hover:bg-gray-800 dark:hover:bg-primary-700 transition-colors whitespace-nowrap font-medium"
                                >
                                    Aplicar
                                </button>
                            </div>
                            {couponError && (
                                <p className="text-sm text-red-500 mt-1">{couponError}</p>
                            )}
                        </div>
                    )}
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
