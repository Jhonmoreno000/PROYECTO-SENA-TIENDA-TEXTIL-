import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Zap, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import Encabezado from '../componentes/Encabezado';
import PieDePagina from '../componentes/PieDePagina';
import CheckoutForm from '../componentes/CheckoutForm';
import ResumenPedido from '../componentes/ResumenPedido';
import { useCarrito } from '../contextos/ContextoCarrito';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { useMetricas } from '../contextos/ContextoMetricas';

gsap.registerPlugin(useGSAP);

function Pago() {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, appliedCoupon } = useCarrito();
    const { user } = useAutenticacion();
    const { systemConfig } = useMetricas();
    const headerRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: user?.nombre || user?.name || 'Cliente Demo',
        email: user?.email || user?.correo || 'cliente@ddtextil.com',
        phone: user?.telefono || '3027058951',
        address: 'Cra. 52 (Carabobo) # 48-30',
        city: 'Medellín',
        state: 'Antioquia',
        zipCode: '050012',
        notes: '',
    });

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/carrito');
        }
    }, [cartItems, navigate]);

    useGSAP(() => {
        if (headerRef.current) {
            gsap.fromTo(headerRef.current,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );
        }
    }, { scope: headerRef });

    const guardarOrdenYContinuar = () => {
        const orderNumber = `DD${Date.now().toString().slice(-8)}`;
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
        const freeShippingThreshold = Number(systemConfig?.freeShippingThreshold || 200000);
        const shippingCost = Number(systemConfig?.shippingCost || 15000);
        const shipping = discountedSubtotal >= freeShippingThreshold ? 0 : shippingCost;
        const tax = discountedSubtotal * 0.19;
        const total = discountedSubtotal + shipping + tax;

        const orderData = {
            orderNumber,
            items: cartItems,
            customerInfo: formData,
            subtotal,
            discount: discountAmount,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            shipping,
            tax,
            total,
            date: new Date().toISOString(),
        };

        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        navigate('/pago');
    };

    if (cartItems.length === 0) return null;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
            <Encabezado />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-36 sm:pb-40">
                {/* Stepper Glassmórfico de navegación del Checkout */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-600/25">
                        <Truck className="w-4 h-4 text-white" />
                        <span>1. Datos de Envío y Facturación</span>
                    </div>

                    <div className="hidden sm:block text-slate-400">
                        <ArrowRight className="w-4 h-4" />
                    </div>

                    <button
                        type="button"
                        onClick={guardarOrdenYContinuar}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-white dark:hover:bg-slate-800 hover:border-primary-500/50 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-xs cursor-pointer group"
                    >
                        <Zap className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                        <span>2. Pasarela de Pago (Wompi / Nequi / PSE) →</span>
                    </button>
                </div>

                {/* Encabezado Principal */}
                <div ref={headerRef} className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-white/10 shadow-xs mb-3">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Checkout Seguro • Encriptación SSL 256 bits</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                        Datos de Envío y Facturación
                    </h1>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                        Verifica la dirección de entrega de tu tela en Medellín o cualquier municipio de Colombia para continuar al pago.
                    </p>
                </div>

                {/* Layout Principal en 2 Columnas */}
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <div className="bg-white/85 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xl shadow-slate-900/5 rounded-3xl p-6 md:p-8">
                            <CheckoutForm
                                onSubmit={guardarOrdenYContinuar}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <ResumenPedido
                            formData={formData}
                            onContinuar={guardarOrdenYContinuar}
                        />
                    </div>
                </div>
            </main>

            <PieDePagina />
        </div>
    );
}

export default Pago;
