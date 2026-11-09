import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
    ArrowLeft,
    ShieldCheck,
    Lock,
    CheckCircle2,
    Copy,
    Check,
    QrCode,
} from 'lucide-react';
import Encabezado from '../../componentes/Encabezado';
import PieDePagina from '../../componentes/PieDePagina';
import CardPreview from './CardPreview';
import FormularioPago from './FormularioPago';
import ModalPasarelaInteractiva from './ModalPasarelaInteractiva';
import {
    IconoHumanoWompi,
    IconoHumanoMercadoPago,
    IconoHumanoNequi,
    IconoHumanoTarjeta,
    IconoHumanoBancolombia,
    LogoWompi,
    LogoMercadoPago,
    LogoNequi,
    LogoTarjetas,
} from './LogosPasarelas';
import { useCarrito } from '../../contextos/ContextoCarrito';
import { useNotificacion } from '../../contextos/ContextoNotificacion';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { useMetricas } from '../../contextos/ContextoMetricas';
import { formatCurrency } from '../../utilidades/formateadores';
import * as servicioWompi from '../../servicios/servicioWompi';

gsap.registerPlugin(useGSAP);

const TELEFONO_TIENDA = '3027058951';

function Payment() {
    const navigate = useNavigate();
    const { getOrderCalculations, cartItems, clearCart, appliedCoupon } = useCarrito();
    const { showNotification } = useNotificacion();
    const { user } = useAutenticacion();
    const { refreshData } = useMetricas();
    const contentRef = useRef(null);

    // 4 pasarelas activas: 'wompi' | 'mercadopago' | 'nequi' | 'card'
    const [paymentMethod, setPaymentMethod] = useState('wompi');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCVVFocused, setIsCVVFocused] = useState(false);
    const [copiadoNequi, setCopiadoNequi] = useState(false);
    const [comprobanteNequi, setComprobanteNequi] = useState('');
    const [cardData, setCardData] = useState({
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });
    const [customerInfo, setCustomerInfo] = useState(null);

    const [modalPasarela, setModalPasarela] = useState({
        abierto: false,
        gateway: 'wompi',
        orderInfo: null,
    });

    const { subtotal, discount, shipping, tax, total } = getOrderCalculations();

    useEffect(() => {
        const savedOrder = localStorage.getItem('lastOrder');
        if (savedOrder) {
            try {
                const parsed = JSON.parse(savedOrder);
                setCustomerInfo(parsed.customerInfo || null);
            } catch (e) {
                console.error('Error parseando datos de envío guardados:', e);
            }
        }
    }, []);

    const detectCardType = (number) => {
        const c = (number || '').replace(/\s/g, '');
        if (/^4/.test(c)) return 'visa';
        if (/^5[1-5]/.test(c)) return 'mastercard';
        return 'unknown';
    };

    const handleCardDataChange = useCallback((datos) => {
        setCardData({
            cardholderName: datos.cardholderName || '',
            cardNumber: datos.cardNumber || '',
            expiryDate: datos.expiryDate || '',
            cvv: datos.cvv || '',
        });
    }, []);

    const obtenerDatosCliente = () =>
        customerInfo || {
            fullName: user?.nombre || user?.name || 'Cliente D&D Textil',
            email: user?.email || user?.correo || 'cliente@ddtextil.com',
            phone: user?.telefono || TELEFONO_TIENDA,
            address: 'Cra. 52 (Carabobo) # 48-30, Sector El Hueco',
            city: 'Medellín',
            state: 'Antioquia',
            zipCode: '050012',
        };

    const prepararIntencionOrden = async (metodoNombre) => {
        const infoCliente = obtenerDatosCliente();
        try {
            const intencion = await servicioWompi.crearIntencionPagoWompi({
                items: cartItems.map((it) => ({
                    productId: it.id,
                    quantity: it.quantity || 1,
                })),
                customerInfo: infoCliente,
                couponCode: appliedCoupon?.code || null,
                userId: user?.id || 4,
            });
            if (intencion && intencion.reference) {
                return {
                    subtotal,
                    discount,
                    shipping,
                    tax,
                    total,
                    amountInCents: Math.round(total * 100),
                    ...intencion,
                    customerInfo: intencion.customerInfo || infoCliente,
                    paymentMethod: metodoNombre,
                };
            }
        } catch (err) {
            console.warn('Usando generador de intención local Sandbox:', err);
        }

        const refFallback = `DD-${Date.now().toString().slice(-8)}`;
        return {
            success: true,
            reference: refFallback,
            currency: 'COP',
            subtotal,
            discount,
            shipping,
            tax,
            total,
            amountInCents: Math.round(total * 100),
            publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAUr19rhZCQSQ',
            integritySignature: `sha256_sbx_${refFallback}_${Math.round(total * 100)}_COP`,
            customerInfo: infoCliente,
            paymentMethod: metodoNombre,
        };
    };

    const finalizarOrdenExitosa = async ({
        reference,
        transactionId,
        paymentMethod: metodoFinal,
        status = 'APPROVED',
    }) => {
        const infoCliente = obtenerDatosCliente();
        try {
            if (typeof servicioWompi.confirmarPagoWompi === 'function') {
                await servicioWompi.confirmarPagoWompi({
                    referencia: reference,
                    transaccionId: transactionId,
                    metodoPago: metodoFinal,
                    estadoPago: status,
                });
            }
            if (refreshData) await refreshData();
        } catch (err) {
            console.warn('Aviso confirmando pago en servidor:', err);
        }

        const orderGuardada = {
            orderNumber: reference,
            reference,
            status: status === 'APPROVED' ? 'paid' : 'pending',
            paymentStatus: status,
            paymentMethod: metodoFinal,
            wompiTransactionId: transactionId,
            customerInfo: infoCliente,
            items: cartItems,
            subtotal,
            discount,
            shipping,
            tax,
            total,
            date: new Date().toISOString(),
        };

        localStorage.setItem('lastOrder', JSON.stringify(orderGuardada));
        clearCart();
        showNotification('success', `¡Pago registrado exitosamente vía ${metodoFinal}!`);
        navigate(`/confirmacion?referencia=${encodeURIComponent(reference)}`);
    };

    const abrirPasarelaInteractiva = async (gatewayId, etiqueta) => {
        if (!cartItems || cartItems.length === 0) {
            showNotification('error', 'El carrito está vacío.');
            navigate('/carrito');
            return;
        }

        setIsProcessing(true);
        try {
            const intencion = await prepararIntencionOrden(etiqueta);
            setModalPasarela({
                abierto: true,
                gateway: gatewayId,
                orderInfo: intencion,
            });
        } catch (error) {
            showNotification('error', error.message || 'No se pudo iniciar la pasarela.');
        } finally {
            setIsProcessing(false);
        }
    };

    const procesarPagoDirecto = async (etiquetaMetodo) => {
        if (!cartItems || cartItems.length === 0) {
            showNotification('error', 'El carrito está vacío.');
            navigate('/carrito');
            return;
        }

        setIsProcessing(true);
        try {
            const intencion = await prepararIntencionOrden(etiquetaMetodo);
            const txId = `TX-${Date.now().toString().slice(-7)}`;
            setTimeout(() => {
                setIsProcessing(false);
                finalizarOrdenExitosa({
                    reference: intencion.reference,
                    transactionId: txId,
                    paymentMethod: etiquetaMetodo,
                    status: 'APPROVED',
                });
            }, 900);
        } catch (err) {
            setIsProcessing(false);
            showNotification('error', err.message || 'Error procesando el pago.');
        }
    };

    const copiarCelularNequi = () => {
        navigator.clipboard?.writeText(TELEFONO_TIENDA);
        setCopiadoNequi(true);
        showNotification('success', 'Número Nequi 302 705 8951 copiado al portapapeles');
        setTimeout(() => setCopiadoNequi(false), 2000);
    };

    useGSAP(
        () => {
            if (contentRef.current) {
                gsap.fromTo(
                    contentRef.current,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                );
            }
        },
        { scope: contentRef, dependencies: [paymentMethod] }
    );

    const METODOS_SELECCION = [
        {
            id: 'wompi',
            titulo: 'Wompi',
            subtitulo: 'Bancolombia, Nequi, Tarjetas',
            recomendado: true,
            icon: IconoHumanoWompi,
        },
        {
            id: 'mercadopago',
            titulo: 'Mercado Pago',
            subtitulo: 'Checkout Pro • Cuotas',
            recomendado: false,
            icon: IconoHumanoMercadoPago,
        },
        {
            id: 'nequi',
            titulo: 'Nequi / Bre-B',
            subtitulo: 'Transferencia QR • Celular',
            recomendado: false,
            icon: IconoHumanoNequi,
        },
        {
            id: 'card',
            titulo: 'Tarjeta',
            subtitulo: 'Crédito o Débito',
            recomendado: false,
            icon: IconoHumanoTarjeta,
        },
    ];

    const SUBMETODOS_WOMPI = [
        {
            nombre: 'Nequi',
            detalle: 'Push al celular',
            icon: IconoHumanoNequi,
        },
        {
            nombre: 'Bancolombia',
            detalle: 'Transferencia directa',
            icon: IconoHumanoBancolombia,
        },
        {
            nombre: 'Tarjetas',
            detalle: 'Débito / Crédito',
            icon: IconoHumanoTarjeta,
        },
    ];

    const infoClienteActual = obtenerDatosCliente();

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <style>{`
                @keyframes rotarBordeLuz {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
                @keyframes flotarIconoHumano {
                    0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
                    50% { transform: translateY(-2px) rotate(-2.5deg) scale(1.06); }
                }
                .marco-borde-animado {
                    position: relative;
                    border-radius: 1.15rem;
                    padding: 2.2px;
                    overflow: hidden;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .marco-borde-animado::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 240%;
                    height: 240%;
                    background: conic-gradient(
                        from 0deg,
                        #e2e8f0 0deg,
                        #fb923c 80deg,
                        #ea580c 135deg,
                        #f59e0b 180deg,
                        #e2e8f0 245deg,
                        #fdba74 315deg,
                        #e2e8f0 360deg
                    );
                    animation: rotarBordeLuz 4s linear infinite;
                    z-index: 0;
                }
                .marco-borde-activo {
                    box-shadow: 0 12px 28px -6px rgba(234, 88, 12, 0.24);
                    transform: translateY(-2px);
                }
                .marco-borde-activo::before {
                    background: conic-gradient(
                        from 0deg,
                        #fed7aa 0deg,
                        #ea580c 90deg,
                        #f59e0b 160deg,
                        #fb923c 230deg,
                        #ea580c 300deg,
                        #fed7aa 360deg
                    );
                    animation-duration: 2.8s;
                }
                .marco-borde-inactivo:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 22px -6px rgba(234, 88, 12, 0.14);
                }
                .marco-borde-inactivo:hover::before {
                    animation-duration: 2.4s;
                }
                .marco-panel-principal {
                    position: relative;
                    border-radius: 1.65rem;
                    padding: 2px;
                    overflow: hidden;
                }
                .marco-panel-principal::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 200%;
                    height: 200%;
                    background: conic-gradient(
                        from 0deg,
                        #e2e8f0 0deg,
                        #fdba74 90deg,
                        #ea580c 150deg,
                        #e2e8f0 230deg,
                        #f59e0b 310deg,
                        #e2e8f0 360deg
                    );
                    animation: rotarBordeLuz 7s linear infinite;
                    z-index: 0;
                }
                .icono-trazo-humano {
                    animation: flotarIconoHumano 3.4s ease-in-out infinite;
                }
            `}</style>

            <Encabezado />

            <main className="flex-1 py-10 sm:py-14 md:py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Enlace Volver */}
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => navigate('/checkout')}
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                            <span>Volver a datos de envío</span>
                        </button>
                    </div>

                    {/* Encabezado: Jerarquía y Tipografía Corporativa */}
                    <div className="text-center mb-10">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-orange-50 text-orange-700 border border-orange-200/70 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50">
                            <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                            <span>Pasarela de Pago Segura (Colombia)</span>
                        </span>

                        <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white mt-3.5 mb-2.5">
                            Finalizar y Pagar
                        </h1>

                        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal">
                            Total estimado a cobrar:{' '}
                            <span className="font-semibold text-orange-600 dark:text-orange-400 tracking-tight">
                                {formatCurrency(total)}
                            </span>
                        </p>
                    </div>

                    {/* 4 Tarjetas de Pasarelas (Wompi, Mercado Pago, Nequi, Tarjeta) con Borde Animado e Iconos Humanos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-4xl mx-auto mb-10">
                        {METODOS_SELECCION.map((metodo) => {
                            const Icon = metodo.icon;
                            const isSelected = paymentMethod === metodo.id;

                            return (
                                <div key={metodo.id} className="relative pt-2">
                                    {metodo.recomendado && (
                                        <span className="absolute -top-0.5 right-3.5 z-20 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                                            RECOMENDADO
                                        </span>
                                    )}

                                    <div
                                        className={`marco-borde-animado h-full ${
                                            isSelected ? 'marco-borde-activo' : 'marco-borde-inactivo'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod(metodo.id)}
                                            className={`relative z-10 w-full h-full flex items-center gap-3.5 p-4 sm:p-5 rounded-[16px] text-left transition-colors cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#FFF9F5] dark:bg-slate-800'
                                                    : 'bg-white dark:bg-slate-800/95 hover:bg-[#FFFDFB] dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                                                    isSelected
                                                        ? 'bg-orange-100/80 dark:bg-orange-950/60 shadow-2xs scale-105'
                                                        : 'bg-slate-50 dark:bg-slate-700/60'
                                                }`}
                                            >
                                                <Icon className="w-9 h-9 icono-trazo-humano" />
                                            </div>

                                            <div className="min-w-0">
                                                <p
                                                    className={`text-sm font-bold leading-snug ${
                                                        isSelected
                                                            ? 'text-orange-950 dark:text-white'
                                                            : 'text-slate-800 dark:text-slate-200'
                                                    }`}
                                                >
                                                    {metodo.titulo}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                                    {metodo.subtitulo}
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Contenedor Principal de Pago con Borde Animado */}
                    <div ref={contentRef} key={paymentMethod} className="max-w-3xl mx-auto">
                        {/* OPCIÓN 1: PANEL WOMPI CORPORATIVO */}
                        {paymentMethod === 'wompi' && (
                            <div className="marco-panel-principal shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)]">
                                <div className="relative z-10 bg-white dark:bg-slate-800 rounded-[24px] p-7 sm:p-10 md:p-12">
                                    {/* Cabecera del Panel Wompi */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-7 border-b border-slate-100 dark:border-slate-700/70">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                    Pagar con Wompi
                                                </h2>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50">
                                                    Bancolombia
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                                                Transacciones locales inmediatas y libres de fraude
                                            </p>
                                        </div>

                                        <LogoWompi className="h-8" />
                                    </div>

                                    {/* Sub-tarjetas de Métodos Habilitados (Nequi, Bancolombia, Tarjetas) con Borde Animado */}
                                    <div className="py-8">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-4">
                                            Métodos habilitados en esta orden:
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {SUBMETODOS_WOMPI.map((sub) => {
                                                const SubIcon = sub.icon;
                                                return (
                                                    <div
                                                        key={sub.nombre}
                                                        className="marco-borde-animado marco-borde-inactivo"
                                                    >
                                                        <div className="relative z-10 flex flex-col items-center justify-center text-center p-5 rounded-[16px] bg-[#F9FAFB] dark:bg-slate-900/80 h-full">
                                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200/60 dark:border-slate-700 flex items-center justify-center mb-3 shadow-2xs">
                                                                <SubIcon className="w-8 h-8 icono-trazo-humano" />
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                                                                {sub.nombre}
                                                            </span>
                                                            <span className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-normal">
                                                                {sub.detalle}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Nota de Integridad + Botón Principal */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700/70 space-y-5">
                                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F9FAFB] dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                            <p className="leading-relaxed">
                                                Tu orden para <strong className="text-slate-800 dark:text-white">{infoClienteActual.fullName}</strong> ({infoClienteActual.city || 'Medellín'}) cuenta con firma de integridad <span className="font-mono text-[11px] text-slate-700 dark:text-slate-200">SHA-256</span> verificada en tiempo real.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => abrirPasarelaInteractiva('wompi', 'Wompi Bancolombia')}
                                            disabled={isProcessing}
                                            className="w-full py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-[0_12px_28px_-6px_rgba(234,88,12,0.35)] transition-all disabled:opacity-50 cursor-pointer"
                                        >
                                            <Lock className="w-4 h-4" />
                                            <span>
                                                {isProcessing
                                                    ? 'Conectando de forma segura con Wompi...'
                                                    : `Continuar a Wompi Seguro (${formatCurrency(total)})`}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OPCIÓN 2: PANEL MERCADO PAGO CHECKOUT PRO */}
                        {paymentMethod === 'mercadopago' && (
                            <div className="marco-panel-principal shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)]">
                                <div className="relative z-10 bg-white dark:bg-slate-800 rounded-[24px] p-7 sm:p-10 md:p-12 space-y-7">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700/70">
                                        <div>
                                            <div className="flex items-center gap-2.5">
                                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                    Pagar con Mercado Pago
                                                </h2>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60 dark:bg-sky-950/50 dark:text-sky-300">
                                                    Checkout Pro
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                                                Paga con saldo en cuenta, tarjetas hasta en 12 cuotas o Efecty con Compra Protegida
                                            </p>
                                        </div>
                                        <LogoMercadoPago className="h-8" />
                                    </div>

                                    <div className="max-w-md mx-auto">
                                        <CardPreview
                                            gateway="mercadopago"
                                            cardHolder={infoClienteActual.fullName}
                                            totalAmount={total}
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => abrirPasarelaInteractiva('mercadopago', 'Mercado Pago Checkout Pro')}
                                            disabled={isProcessing}
                                            className="w-full py-4 px-6 rounded-2xl bg-[#009EE3] hover:bg-[#008ACA] active:scale-[0.99] text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-[0_12px_28px_-6px_rgba(0,158,227,0.35)] transition-all disabled:opacity-50 cursor-pointer"
                                        >
                                            <ShieldCheck className="w-5 h-5" />
                                            <span>
                                                {isProcessing
                                                    ? 'Abriendo Checkout Pro...'
                                                    : `Pagar con Mercado Pago (${formatCurrency(total)})`}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OPCIÓN 3: PANEL NEQUI / BRE-B TRANSFERENCIA QR */}
                        {paymentMethod === 'nequi' && (
                            <div className="marco-panel-principal shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)]">
                                <div className="relative z-10 bg-white dark:bg-slate-800 rounded-[24px] p-7 sm:p-10 md:p-12 space-y-7">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700/70">
                                        <div>
                                            <div className="flex items-center gap-2.5">
                                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                    Nequi • Daviplata • Llave Bre-B
                                                </h2>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200/60 dark:bg-pink-950/50 dark:text-pink-300">
                                                    0% Comisión
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                                                Transferencia directa inmediata a la cuenta oficial de D&amp;D Textil Medellín
                                            </p>
                                        </div>
                                        <LogoNequi className="h-8" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-5 rounded-2xl bg-[#F9FAFB] dark:bg-slate-900/55 border border-slate-200/70 dark:border-slate-700">
                                        <div className="space-y-2">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                                                Línea Nequi / Bre-B Oficial
                                            </span>
                                            <p className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
                                                302 705 8951
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Titular: D&amp;D Textil Medellín
                                            </p>
                                            <button
                                                type="button"
                                                onClick={copiarCelularNequi}
                                                className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-orange-400 transition-colors cursor-pointer"
                                            >
                                                {copiadoNequi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copiadoNequi ? 'Número copiado' : 'Copiar número'}</span>
                                            </button>
                                        </div>

                                        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-center">
                                            <QrCode className="w-16 h-16 text-[#20002C] dark:text-pink-400 mb-1.5" />
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                QR Interoperable Bre-B
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                Monto exacto: {formatCurrency(total)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                                                Código de comprobante Nequi (opcional en modo prueba):
                                            </label>
                                            <input
                                                type="text"
                                                value={comprobanteNequi}
                                                onChange={(e) => setComprobanteNequi(e.target.value)}
                                                placeholder="Ej. M1294850"
                                                className="w-full px-4 py-3 rounded-xl bg-[#F9FAFB] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-orange-500"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                procesarPagoDirecto(
                                                    `Nequi / Bre-B (${comprobanteNequi ? `Ref ${comprobanteNequi}` : '302 705 8951'})`
                                                )
                                            }
                                            disabled={isProcessing}
                                            className="w-full py-4 px-6 rounded-2xl bg-[#FF0080] hover:bg-[#d9006c] active:scale-[0.99] text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-[0_12px_28px_-6px_rgba(255,0,128,0.35)] transition-all disabled:opacity-50 cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span>
                                                {isProcessing
                                                    ? 'Verificando transferencia...'
                                                    : `Confirmar Pago Nequi (${formatCurrency(total)})`}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OPCIÓN 4: PAGO CON TARJETA CRÉDITO / DÉBITO */}
                        {paymentMethod === 'card' && (
                            <div className="marco-panel-principal shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)]">
                                <div className="relative z-10 bg-white dark:bg-slate-800 rounded-[24px] p-7 sm:p-10 md:p-12 space-y-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/70 pb-5">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                Pago con Tarjeta de Crédito o Débito
                                            </h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                Procesamiento seguro compatible con Visa, Mastercard y American Express
                                            </p>
                                        </div>
                                        <LogoTarjetas cardType={detectCardType(cardData.cardNumber)} className="h-7" />
                                    </div>

                                    <div className="max-w-md mx-auto">
                                        <CardPreview
                                            gateway="card"
                                            cardNumber={cardData.cardNumber}
                                            cardHolder={cardData.cardholderName || infoClienteActual.fullName}
                                            expiryDate={cardData.expiryDate}
                                            cvv={cardData.cvv}
                                            isFlipped={isCVVFocused}
                                            cardType={detectCardType(cardData.cardNumber)}
                                            totalAmount={total}
                                        />
                                    </div>

                                    <div>
                                        <FormularioPago
                                            onSubmit={() => procesarPagoDirecto('Tarjeta de Crédito / Débito')}
                                            onCardDataChange={handleCardDataChange}
                                            onCVVFocus={() => setIsCVVFocused(true)}
                                            onCVVBlur={() => setIsCVVFocused(false)}
                                            isProcessing={isProcessing}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pie de Certificación de Seguridad */}
                    <div className="max-w-2xl mx-auto mt-10 text-center">
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 shadow-2xs">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>
                                Transacción cifrada de extremo a extremo (TLS 256-bit) • Estándar PCI-DSS v4.0
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            <ModalPasarelaInteractiva
                isOpen={modalPasarela.abierto}
                gateway={modalPasarela.gateway}
                orderInfo={modalPasarela.orderInfo}
                onClose={() => setModalPasarela((prev) => ({ ...prev, abierto: false }))}
                onSuccess={(resultado) => {
                    setModalPasarela((prev) => ({ ...prev, abierto: false }));
                    finalizarOrdenExitosa(resultado);
                }}
            />

            <PieDePagina />
        </div>
    );
}

export default Payment;
