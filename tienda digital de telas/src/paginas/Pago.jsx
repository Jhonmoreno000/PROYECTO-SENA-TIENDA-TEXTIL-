import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Zap, Truck, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import Encabezado from '../componentes/Encabezado';
import PieDePagina from '../componentes/PieDePagina';
import CheckoutForm from '../componentes/CheckoutForm';
import ResumenPedido from '../componentes/ResumenPedido';
import { useCarrito } from '../contextos/ContextoCarrito';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { useMetricas } from '../contextos/ContextoMetricas';
import { useNotificacion } from '../contextos/ContextoNotificacion';

gsap.registerPlugin(useGSAP);

function Pago() {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, appliedCoupon } = useCarrito();
    const { user } = useAutenticacion();
    const { systemConfig } = useMetricas();
    const { showNotification } = useNotificacion();
    const headerRef = useRef(null);

    // Los datos iniciales provienen del usuario si está autenticado; de lo contrario inician vacíos para obligar a diligenciar
    const [formData, setFormData] = useState({
        fullName: user?.nombre || user?.name || '',
        email: user?.email || user?.correo || '',
        phone: user?.telefono || '',
        address: user?.direccion || user?.address || '',
        city: user?.ciudad || user?.city || '',
        state: user?.departamento || user?.state || '',
        zipCode: user?.codigoPostal || user?.zipCode || '',
        notes: '',
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/carrito');
        }
    }, [cartItems, navigate]);

    useGSAP(() => {
        if (headerRef.current) {
            gsap.fromTo(headerRef.current,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.28, ease: 'power3.out', force3D: true, clearProps: 'transform' }
            );
        }
    }, { scope: headerRef });

    // Validación rigurosa de datos de contacto y entrega
    const validarFormularioCompleto = () => {
        const errores = {};
        const fn = String(formData.fullName || '').trim();
        if (!fn) {
            errores.fullName = 'El nombre completo es requerido';
        } else if (fn.length < 3) {
            errores.fullName = 'El nombre debe tener al menos 3 caracteres';
        }

        const em = String(formData.email || '').trim();
        if (!em) {
            errores.email = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
            errores.email = 'Correo electrónico inválido';
        }

        const ph = String(formData.phone || '').trim().replace(/\s/g, '');
        if (!ph) {
            errores.phone = 'El teléfono móvil es requerido';
        } else if (!/^\d{10}$/.test(ph)) {
            errores.phone = 'Teléfono inválido (debe tener 10 dígitos)';
        }

        const addr = String(formData.address || '').trim();
        if (!addr) {
            errores.address = 'La dirección de entrega es requerida';
        } else if (addr.length < 5) {
            errores.address = 'Ingresa una dirección completa (mínimo 5 caracteres)';
        }

        const city = String(formData.city || '').trim();
        if (!city) {
            errores.city = 'La ciudad o municipio es requerida';
        }

        const state = String(formData.state || '').trim();
        if (!state) {
            errores.state = 'El departamento es requerido';
        }

        const zip = String(formData.zipCode || '').trim();
        if (!zip) {
            errores.zipCode = 'El código postal es requerido';
        }

        setFormErrors(errores);
        return Object.keys(errores).length === 0;
    };

    const guardarOrdenYContinuar = () => {
        const esValido = validarFormularioCompleto();
        if (!esValido) {
            showNotification(
                'error',
                'Debes completar todos los campos obligatorios de envío antes de seleccionar el método de pago.'
            );
            const el = document.getElementById('checkout-shipping-form');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

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

    const formularioIncompleto =
        !formData.fullName ||
        !formData.email ||
        !formData.phone ||
        !formData.address ||
        !formData.city;

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
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-md font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer group ${
                            formularioIncompleto
                                ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                                : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-primary-500/50 hover:text-primary-600 dark:hover:text-primary-400'
                        }`}
                        title={
                            formularioIncompleto
                                ? 'Completa el formulario para habilitar el paso 2'
                                : 'Ir a selección de pasarela'
                        }
                    >
                        {formularioIncompleto ? (
                            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                            <Zap className="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform shrink-0" />
                        )}
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
                        Diligencia la dirección de entrega de tu tela en Medellín o cualquier municipio de Colombia para continuar al pago.
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
                                errors={formErrors}
                                setErrors={setFormErrors}
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
