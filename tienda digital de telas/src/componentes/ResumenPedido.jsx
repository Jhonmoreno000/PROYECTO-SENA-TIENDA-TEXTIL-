import React from 'react';
import { useCarrito } from '../contextos/ContextoCarrito';
import { formatCurrency } from '../utilidades/formateadores';
import { Tag, ShieldCheck, Truck, MapPin, Phone, User, ArrowRight } from 'lucide-react';

function ResumenPedido({ formData = {}, onContinuar }) {
    const { cartItems, getCartItemCount, appliedCoupon, getOrderCalculations } = useCarrito();
    const { subtotal, discount: discountAmount, tax, shipping, total } = getOrderCalculations();

    return (
        <div className="bg-white/85 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xl shadow-slate-900/5 rounded-3xl p-6 sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Resumen del Pedido
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'}
                </span>
            </div>

            {/* Listado de Telas */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {cartItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80 last:border-0 items-center"
                    >
                        <img
                            src={item.images?.[0] || '/images/hero-telas-premium.webp'}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200/80 dark:border-white/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                {item.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.quantity}m corte continuo × {formatCurrency(item.price)}
                            </p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {formatCurrency(item.price * item.quantity)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desglose de Valores */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200/80 dark:border-white/10 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(subtotal)}
                    </span>
                </div>

                {appliedCoupon && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50">
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <Tag className="w-3.5 h-3.5" />
                            <span>Cupón {appliedCoupon.code}</span>
                        </div>
                        <span className="font-bold text-xs">-{formatCurrency(discountAmount)}</span>
                    </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Envío nacional</span>
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {shipping === 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">¡Gratis!</span>
                        ) : (
                            formatCurrency(shipping)
                        )}
                    </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>IVA (19%)</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(tax)}
                    </span>
                </div>

                {/* Total alineado al estándar de la tienda */}
                <div className="border-t border-slate-200/80 dark:border-white/10 pt-4 mt-3">
                    <div className="flex justify-between items-baseline">
                        <div>
                            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                                Total a Pagar
                            </span>
                            <span className="text-xs text-slate-400">Impuestos incluidos</span>
                        </div>
                        <span className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400 tracking-tight">
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Botón CTA Sticky alineado con el botón principal de la tienda */}
            {onContinuar && (
                <button
                    type="button"
                    onClick={onContinuar}
                    className="w-full py-3.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md shadow-primary-600/20 hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                    <span>Ir a Pasarela de Pago</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            )}

            {/* Vista previa de dirección de despacho */}
            {formData.fullName && (
                <div className="pt-4 border-t border-slate-200/80 dark:border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                        Destino de Entrega
                    </h3>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-white/5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{formData.fullName}</span>
                        </div>
                        {formData.phone && (
                            <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{formData.phone}</span>
                            </div>
                        )}
                        {formData.address && (
                            <div className="flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">
                                    {formData.address}, {formData.city || ''} {formData.state || ''}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Garantía de Metraje y Pago 100% Seguro</span>
            </div>
        </div>
    );
}

export default ResumenPedido;
