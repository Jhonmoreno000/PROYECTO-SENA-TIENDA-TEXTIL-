import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdShoppingBag, MdDelete, MdAdd, MdRemove,
    MdLocalOffer, MdClose, MdArrowForward, MdArrowBack,
    MdLocalShipping, MdSecurity, MdAutorenew, MdImageNotSupported
} from 'react-icons/md';
import AnimatedPage from '../components/AnimatedPage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useMetrics } from '../context/MetricsContext';
import { formatCurrency } from '../utils/formatters';

/* ──────────────────────────────────────────────
   Fila de producto dentro del carrito
────────────────────────────────────────────── */
function CartRow({ item, onRemove, onQuantity }) {
    const imageUrl = Array.isArray(item.images) && item.images[0] ? item.images[0] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -60, transition: { duration: 0.18 } }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex gap-4 p-4 md:p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700"
        >
            {/* Imagen */}
            <div className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <MdImageNotSupported size={32} />
                    </div>
                )}
            </div>

            {/* Detalle */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                        <h3 className="font-bold text-base md:text-lg leading-tight truncate">{item.name}</h3>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.category}</p>
                        {item.material && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 hidden md:block">{item.material}</p>
                        )}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemove(item.id)}
                        className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Eliminar"
                    >
                        <MdDelete size={18} />
                    </motion.button>
                </div>

                {/* Cantidad + precio en una fila */}
                <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                    {/* Selector +/- */}
                    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => onQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <MdRemove size={16} />
                        </motion.button>
                        <span className="w-8 text-center font-bold text-sm tabular-nums">{item.quantity}</span>
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => onQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.stock ?? 99)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <MdAdd size={16} />
                        </motion.button>
                    </div>
                    <span className="text-xs text-gray-400">
                        {formatCurrency(item.price)}/m
                    </span>
                    <span className="font-bold text-lg text-primary-600 dark:text-primary-400 ml-auto">
                        {formatCurrency(item.price * item.quantity)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

/* ──────────────────────────────────────────────
   Página principal del carrito
────────────────────────────────────────────── */
export default function Cart() {
    const { cartItems, updateQuantity, removeFromCart, clearCart,
        getCartTotal, getCartItemCount, appliedCoupon, setAppliedCoupon } = useCart();
    const { coupons } = useMetrics();
    const navigate = useNavigate();

    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');

    /* ── Cálculos ── */
    const subtotal = getCartTotal();

    let discount = 0;
    if (appliedCoupon) {
        discount = appliedCoupon.discountType === 'percentage'
            ? subtotal * (appliedCoupon.discountValue / 100)
            : appliedCoupon.discountValue;
        discount = Math.min(discount, subtotal);
    }

    const afterDiscount = subtotal - discount;
    const shipping = afterDiscount >= 100000 ? 0 : 15000;
    const tax = afterDiscount * 0.19;
    const total = afterDiscount + shipping + tax;

    /* ── Cupón ── */
    const applyCoupon = () => {
        setCouponError('');
        const code = couponCode.trim().toUpperCase();
        if (!code) return;
        const found = coupons?.find(c => c.code === code && c.active);
        if (!found) { setCouponError('Cupón inválido o inactivo'); return; }
        if (new Date(found.expiresAt) < new Date()) { setCouponError('Este cupón ha expirado'); return; }
        if (found.rules?.minPurchase && subtotal < found.rules.minPurchase) {
            setCouponError(`Compra mínima: ${formatCurrency(found.rules.minPurchase)}`);
            return;
        }
        setAppliedCoupon(found);
        setCouponCode('');
    };

    /* ── Carrito vacío ── */
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <AnimatedPage className="flex-1 flex items-center justify-center section-container">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="text-center max-w-sm py-16"
                    >
                        <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
                            <MdShoppingBag className="w-14 h-14 text-primary-400" />
                        </div>
                        <h2 className="text-3xl font-bold mb-3">Tu carrito está vacío</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            Todavía no has agregado telas a tu carrito.
                            ¡Explora el catálogo y encuentra algo que te guste!
                        </p>
                        <Link to="/catalogo" className="btn-primary inline-flex items-center gap-2">
                            <MdArrowBack size={18} />
                            Ver Catálogo
                        </Link>
                    </motion.div>
                </AnimatedPage>
                <Footer />
            </div>
        );
    }

    /* ── Carrito con items ── */
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
            <Header />

            {/* Hero mínimo */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Carrito de Compras
                    </h1>
                    <p className="text-white/80 mt-1 text-sm">
                        {getCartItemCount()} {getCartItemCount() === 1 ? 'metro' : 'metros'} en {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'}
                    </p>
                </div>
            </div>

            <AnimatedPage className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-5 gap-6 xl:gap-8 items-start">

                    {/* ── Lista de productos ───────── */}
                    <section className="lg:col-span-3 space-y-3">
                        {/* Encabezado */}
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-semibold text-gray-700 dark:text-gray-300">
                                Productos ({cartItems.length})
                            </h2>
                            <button
                                onClick={clearCart}
                                className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                            >
                                <MdDelete size={16} />
                                Vaciar carrito
                            </button>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {cartItems.map(item => (
                                <CartRow
                                    key={item.id}
                                    item={item}
                                    onRemove={removeFromCart}
                                    onQuantity={updateQuantity}
                                />
                            ))}
                        </AnimatePresence>

                        {/* Seguir comprando */}
                        <Link
                            to="/catalogo"
                            className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2"
                        >
                            <MdArrowBack size={18} />
                            Seguir comprando
                        </Link>
                    </section>

                    {/* ── Resumen de pedido ─────────── */}
                    <aside className="lg:col-span-2 lg:sticky lg:top-24">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-5 py-4">
                                <h2 className="font-bold text-lg">Resumen del pedido</h2>
                            </div>

                            <div className="p-5 space-y-4">
                                {/* Subtotal */}
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                </div>

                                {/* Cupón */}
                                <div className="border-t border-b border-gray-100 dark:border-slate-700 py-4">
                                    {appliedCoupon ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2 border border-green-100 dark:border-green-800">
                                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-bold">
                                                    <MdLocalOffer size={16} />
                                                    {appliedCoupon.code}
                                                </div>
                                                <button
                                                    onClick={() => setAppliedCoupon(null)}
                                                    className="text-green-600 hover:bg-green-100 dark:hover:bg-green-800 p-1 rounded-full transition-colors"
                                                >
                                                    <MdClose size={16} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
                                                <span>Descuento</span>
                                                <span>−{formatCurrency(discount)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                ¿Tienes un cupón?
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                                                    placeholder="CÓDIGO"
                                                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-300 uppercase tracking-widest"
                                                />
                                                <button
                                                    onClick={applyCoupon}
                                                    className="px-4 py-2 text-sm font-semibold bg-gray-900 dark:bg-primary-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-primary-700 transition-colors whitespace-nowrap"
                                                >
                                                    Aplicar
                                                </button>
                                            </div>
                                            {couponError && (
                                                <p className="text-xs text-red-500">{couponError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Envío */}
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-1.5">
                                        <MdLocalShipping size={16} />
                                        Envío
                                    </span>
                                    {shipping === 0 ? (
                                        <span className="text-green-600 dark:text-green-400 font-semibold">¡Gratis!</span>
                                    ) : (
                                        <span className="font-semibold">{formatCurrency(shipping)}</span>
                                    )}
                                </div>

                                {shipping > 0 && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                                        Agrega {formatCurrency(100000 - subtotal)} más para envío gratis
                                    </p>
                                )}

                                {/* IVA */}
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>IVA (19%)</span>
                                    <span className="font-semibold">{formatCurrency(tax)}</span>
                                </div>

                                {/* Total */}
                                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>

                                {/* Botón checkout */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate('/checkout')}
                                    className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base"
                                >
                                    Proceder al Pago
                                    <MdArrowForward size={20} />
                                </motion.button>

                                {/* Badges de confianza */}
                                <div className="pt-2 space-y-2 border-t border-gray-100 dark:border-slate-700">
                                    {[
                                        { icon: MdSecurity, label: 'Pago 100% seguro' },
                                        { icon: MdLocalShipping,  label: 'Envío gratis desde $100.000' },
                                        { icon: MdAutorenew, label: 'Devoluciones fáciles' },
                                    ].map(({ icon: Icon, label }) => (
                                        <div key={label} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Icon size={16} className="text-green-500 flex-shrink-0" />
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </AnimatedPage>

            <Footer />
        </div>
    );
}
