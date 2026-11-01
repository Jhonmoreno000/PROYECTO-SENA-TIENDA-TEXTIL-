import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Zap, Truck } from 'lucide-react';
import Encabezado from '../componentes/Encabezado';
import PieDePagina from '../componentes/PieDePagina';
import CheckoutForm from '../componentes/CheckoutForm';
import ResumenPedido from '../componentes/ResumenPedido';
import { useCarrito } from '../contextos/ContextoCarrito';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';

gsap.registerPlugin(useGSAP);

function Pago() {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, appliedCoupon } = useCarrito();
    const { user } = useAutenticacion();
    const headerRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: user?.nombre || user?.name || '',
        email: user?.email || user?.correo || '',
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
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
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
        const shipping = discountedSubtotal >= 100000 ? 0 : 15000;
        const tax = discountedSubtotal * 0.19;
        const total = discountedSubtotal + shipping + tax;

        const orderData = {
            orderNumber, items: cartItems, customerInfo: formData,
            subtotal, discount: discountAmount,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            shipping, tax, total, date: new Date().toISOString(),
        };

        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        navigate('/pago');
    };

    if (cartItems.length === 0) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <Encabezado />

            <main className="flex-1 section-container">
                {/* Pestañas de navegación del flujo de compra */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md">
                        <Truck className="w-4 h-4" />
                        <span>1. Datos de Envío</span>
                    </div>
                    <button
                        type="button"
                        onClick={guardarOrdenYContinuar}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-bold text-sm hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        <Zap className="w-4 h-4" />
                        <span>2. Ir a Pagar (Wompi / Mercado Pago / Nequi / PSE) →</span>
                    </button>
                </div>

                <div ref={headerRef} className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        Datos de Envío y Facturación
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Verifica tu dirección en Medellín o el resto del país y continúa a la pasarela de pago Wompi
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="card p-6 md:p-8">
                            <CheckoutForm onSubmit={guardarOrdenYContinuar} formData={formData} setFormData={setFormData} />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <ResumenPedido formData={formData} />
                    </div>
                </div>
            </main>

            <PieDePagina />
        </div>
    );
}

export default Pago;
