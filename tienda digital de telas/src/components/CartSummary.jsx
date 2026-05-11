import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Tag, X as XIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMetrics } from '../context/MetricsContext';
import { formatCurrency } from '../utils/formatters';

gsap.registerPlugin(useGSAP);

/**
 * Componente que muestra el resumen del carrito de compras.
 * Calcula subtotales, descuentos por cupones, impuestos y envío.
 * Permite a los usuarios aplicar cupones de descuento y proceder al pago.
 *
 * @component
 * @returns {JSX.Element} Interfaz del resumen del carrito
 */
function CartSummary() {
    const { getCartTotal, getCartItemCount, appliedCoupon, setAppliedCoupon } = useCart();
    const { coupons } = useMetrics();
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const containerRef = useRef(null);

    const subtotal = getCartTotal();
    let discountAmount = 0;
    if (appliedCoupon) {
        discountAmount = appliedCoupon.discountType === 'percentage'
            ? subtotal * (appliedCoupon.discountValue / 100) : appliedCoupon.discountValue;
        discountAmount = Math.min(discountAmount, subtotal);
    }
    const discountedSubtotal = subtotal - discountAmount;
    const shipping = discountedSubtotal >= 100000 ? 0 : 15000;
    const tax = discountedSubtotal * 0.19;
    const total = discountedSubtotal + shipping + tax;

    const handleApplyCoupon = () => {
        setCouponError('');
        if (!couponCode.trim()) return;
        const code = couponCode.trim().toUpperCase();
        const found = coupons.find(c => c.code === code && c.active);
        if (!found) { setCouponError('Cupón inválido o inactivo'); return; }
        if (new Date(found.expiresAt) < new Date()) { setCouponError('Este cupón ha expirado'); return; }
        if (found.rules.minPurchase && subtotal < found.rules.minPurchase) { setCouponError(`Requiere compra mínima de ${formatCurrency(found.rules.minPurchase)}`); return; }
        setAppliedCoupon(found);
        setCouponCode('');
    };

    useGSAP(() => {
        if (containerRef.current) gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="card p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Resumen del Pedido</h2>
            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({getCartItemCount()} items)</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="border-t border-b border-gray-100 dark:border-slate-700 py-4 my-2">
                    {appliedCoupon ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400"><Tag className="w-4 h-4" /><span className="font-bold">{appliedCoupon.code}</span></div>
                                <button onClick={() => setAppliedCoupon(null)} className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded-full text-green-600 transition-colors"><XIcon className="w-4 h-4" /></button>
                            </div>
                            <div className="flex justify-between text-green-600 dark:text-green-400 font-medium"><span>Descuento</span><span>-{formatCurrency(discountAmount)}</span></div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">¿Tienes un cupón?</label>
                            <div className="flex gap-2">
                                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Código" className="input-field flex-1 uppercase" />
                                <button onClick={handleApplyCoupon} className="px-4 py-2 bg-gray-900 text-white dark:bg-primary-600 rounded-lg hover:bg-gray-800 dark:hover:bg-primary-700 transition-colors font-medium">Aplicar</button>
                            </div>
                            {couponError && <p className="text-sm text-red-500 mt-1">{couponError}</p>}
                        </div>
                    )}
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Envío</span>
                    <span className="font-semibold">{shipping === 0 ? <span className="text-green-600 dark:text-green-400">¡Gratis!</span> : formatCurrency(shipping)}</span>
                </div>
                {shipping > 0 && subtotal < 100000 && (<div className="text-sm text-gray-500 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">Agrega {formatCurrency(100000 - subtotal)} más para envío gratis</div>)}
                <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>IVA (19%)</span><span className="font-semibold">{formatCurrency(tax)}</span></div>
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                    <div className="flex justify-between items-baseline"><span className="text-xl font-bold">Total</span><span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(total)}</span></div>
                </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">Proceder al Pago <ArrowRight className="w-5 h-5" /></Link>
            <Link to="/catalogo" className="block text-center text-primary-600 dark:text-primary-400 hover:underline mt-4">Continuar Comprando</Link>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 space-y-3">
                {['Pago 100% seguro', 'Garantía de calidad', 'Devoluciones fáciles'].map(l => (<div key={l} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400"><span className="text-green-500">✓</span><span>{l}</span></div>))}
            </div>
        </div>
    );
}

export default CartSummary;
