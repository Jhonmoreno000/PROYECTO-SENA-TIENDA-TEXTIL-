import React from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { FiTag } from 'react-icons/fi';

function OrderSummary({ formData }) {
    const { cartItems, getCartTotal, getCartItemCount, appliedCoupon } = useCart();

    const subtotal = getCartTotal();

    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discountType === 'percentage') {
            discountAmount = subtotal * (appliedCoupon.discountValue / 100);
        } else {
            discountAmount = appliedCoupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, subtotal);
    }

    const discountedSubtotal = subtotal - discountAmount;
    const shipping = discountedSubtotal >= 100000 ? 0 : 15000;
    const tax = discountedSubtotal * 0.19;
    const total = discountedSubtotal + shipping + tax;

    return (
        <div className="card p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Resumen del Pedido</h2>

            {/* Products */}
            <div className="mb-6 max-h-64 overflow-y-auto space-y-3">
                {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-200 dark:border-slate-700 last:border-0">
                        <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {item.quantity}m × {formatCurrency(item.price)}
                            </p>
                            <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                {formatCurrency(item.price * item.quantity)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({getCartItemCount()} items)</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>

                {appliedCoupon && (
                    <div className="flex flex-col gap-2 py-2 border-y border-gray-100 dark:border-slate-700 my-2">
                        <div className="flex justify-between items-center text-green-700 dark:text-green-400">
                            <div className="flex items-center gap-2">
                                <FiTag />
                                <span>Cupón <strong className="uppercase">{appliedCoupon.code}</strong></span>
                            </div>
                            <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                        </div>
                    </div>
                )}

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

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>IVA (19%)</span>
                    <span className="font-semibold">{formatCurrency(tax)}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                    <div className="flex justify-between items-baseline">
                        <span className="text-xl font-bold">Total</span>
                        <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Customer Info */}
            {formData.fullName && (
                <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                    <h3 className="font-bold mb-3">Información de Envío</h3>
                    <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        <p className="font-semibold text-gray-900 dark:text-white">{formData.fullName}</p>
                        <p>{formData.email}</p>
                        <p>{formData.phone}</p>
                        {formData.address && (
                            <>
                                <p className="mt-2">{formData.address}</p>
                                <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderSummary;
