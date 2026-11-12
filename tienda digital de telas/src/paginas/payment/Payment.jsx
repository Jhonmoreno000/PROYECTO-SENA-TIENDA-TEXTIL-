import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
    CreditCard,
    DollarSign,
    ArrowLeft,
    ShieldCheck,
    Zap,
    Lock,
    Building2,
    Smartphone,
    Wallet,
    Banknote,
    Truck,
    Copy,
    Check,
    MessageCircle,
    CheckCircle2,
} from 'lucide-react';
import Encabezado from '../../componentes/Encabezado';
import PieDePagina from '../../componentes/PieDePagina';
import CardPreview from './CardPreview';
import FormularioPago from './FormularioPago';
import PSEForm from './PSEForm';
import ModalPasarelaInteractiva from './ModalPasarelaInteractiva';
import CodigoQRTextil from './CodigoQRTextil';
import { LogoPasarelaPorId } from './LogosPasarelas';
import { useCarrito } from '../../contextos/ContextoCarrito';
import { useNotificacion } from '../../contextos/ContextoNotificacion';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { useMetricas } from '../../contextos/ContextoMetricas';
import { formatCurrency } from '../../utilidades/formateadores';
import { crearIntencionPagoWompi, confirmarPagoWompi } from '../../servicios/servicioWompi';

gsap.registerPlugin(useGSAP);

const TELEFONO_TIENDA = '3027058951';
const TELEFONO_TIENDA_FORMATO = '302 705 8951';
const CORREO_TIENDA = 'dydtextil222medellin@gmail.com';

function Payment() {
    const navigate = useNavigate();
    const { getOrderCalculations, cartItems, clearCart, appliedCoupon } = useCarrito();
    const { showNotification } = useNotificacion();
    const { user } = useAutenticacion();
    const { refreshData } = useMetricas();
    const contentRef = useRef(null);

    // 'wompi' | 'mercadopago' | 'nequi' | 'epayco' | 'card' | 'pse'
    const [paymentMethod, setPaymentMethod] = useState('wompi');
    const [submodoPse, setSubmodoPse] = useState('pse'); // 'pse' | 'contraentrega'
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCVVFocused, setIsCVVFocused] = useState(false);
    const [cardData, setCardData] = useState({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });
    const [customerInfo, setCustomerInfo] = useState(null);
    const [copiadoNequi, setCopiadoNequi] = useState(false);
    const [referenciaComprobante, setReferenciaComprobante] = useState('');

    // Estado del modal interactivo de pasarela (Wompi / Mercado Pago / ePayco)
    const [modalPasarela, setModalPasarela] = useState({
        abierto: false,
        gateway: 'wompi',
        orderInfo: null,
    });

    const { subtotal, discount, shipping, tax, total } = getOrderCalculations();

    useEffect(() => {
        const savedOrder = localStorage.getItem('lastOrder');
        let valido = false;
        if (savedOrder) {
            try {
                const parsed = JSON.parse(savedOrder);
                const info = parsed.customerInfo;
                if (
                    info &&
                    typeof info.fullName === 'string' && info.fullName.trim().length >= 3 &&
                    typeof info.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email.trim()) &&
                    typeof info.phone === 'string' && info.phone.trim().length >= 7 &&
                    typeof info.address === 'string' && info.address.trim().length >= 5 &&
                    typeof info.city === 'string' && info.city.trim().length >= 2
                ) {
                    setCustomerInfo(info);
                    valido = true;
                }
            } catch (e) {
                console.error('Error parseando datos de envío guardados:', e);
            }
        }

        // Si no ha llenado el formulario de contacto y entrega, NO se permite ingresar a los métodos de pago
        if (!valido) {
            showNotification('error', 'Debes completar tus datos de contacto y entrega antes de seleccionar el método de pago.');
            navigate('/checkout');
        }
    }, [navigate, showNotification]);

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
        const intencion = await crearIntencionPagoWompi({
            items: cartItems.map((it) => ({
                productId: it.id,
                quantity: it.quantity || 1,
            })),
            customerInfo: infoCliente,
            couponCode: appliedCoupon?.code || null,
            userId: user?.id || 4,
        });
        if (!intencion || !intencion.reference) {
            throw new Error('No se pudo crear la intención de pago en el servidor.');
        }
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
    };

    const finalizarOrdenExitosa = async ({ reference, transactionId, paymentMethod: metodoFinal, status = 'APPROVED' }) => {
        const infoCliente = obtenerDatosCliente();
        try {
            await confirmarPagoWompi({
                referencia: reference,
                transaccionId: transactionId,
                metodoPago: metodoFinal,
                estadoPago: status
            });
            if (refreshData) await refreshData();
        } catch (err) {
            console.error('Error confirmando pago en servidor:', err);
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

    const abrirPasarelaAPI = async (gatewayKey) => {
        if (!cartItems || cartItems.length === 0) {
            showNotification('error', 'El carrito está vacío.');
            navigate('/carrito');
            return;
        }

        const infoCliente = obtenerDatosCliente();

        setIsProcessing(true);
        try {
            const nombres = {
                wompi: 'Wompi Bancolombia',
                mercadopago: 'Mercado Pago Checkout Pro',
                epayco: 'ePayco / PayU Colombia',
            };
            const intencion = await prepararIntencionOrden(nombres[gatewayKey] || 'Wompi Bancolombia');
            setModalPasarela({
                abierto: true,
                gateway: gatewayKey,
                orderInfo: {
                    ...intencion,
                    customerInfo: infoCliente,
                },
            });
        } catch (error) {
            console.error('Error al iniciar pasarela:', error);
            showNotification('error', error.message || 'No se pudo iniciar la pasarela de pago.');
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
            const refLimpia = (referenciaComprobante || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
            const txId = refLimpia ? `REF-${refLimpia}` : `TX-${Date.now().toString().slice(-7)}`;
            
            setTimeout(() => {
                setIsProcessing(false);
                finalizarOrdenExitosa({
                    reference: intencion.reference,
                    transactionId: txId,
                    paymentMethod: etiquetaMetodo,
                    status: etiquetaMetodo.includes('Contraentrega') ? 'pending' : 'APPROVED',
                });
            }, 800);
        } catch (err) {
            console.error('Error al procesar pago directo:', err);
            setIsProcessing(false);
            showNotification('error', err.message || 'Error procesando el pago. Intenta de nuevo.');
        }
    };

    const copiarNumeroNequi = () => {
        navigator.clipboard?.writeText(TELEFONO_TIENDA);
        setCopiadoNequi(true);
        setTimeout(() => setCopiadoNequi(false), 2000);
    };

    useGSAP(() => {
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', force3D: true, clearProps: 'transform' }
            );
        }
    }, { scope: contentRef, dependencies: [paymentMethod, submodoPse] });

    const METODOS_DISPONIBLES = [
        {
            id: 'wompi',
            titulo: 'Wompi Bancolombia',
            subtitulo: 'Nequi, PSE, Botón Bancolombia',
            badge: 'Recomendado',
            badgeClass: 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border-primary-300/60 dark:border-primary-700/50',
            icon: Zap,
        },
        {
            id: 'mercadopago',
            titulo: 'Mercado Pago',
            subtitulo: 'Checkout Pro • Cuotas • Efecty',
            badge: 'Sandbox Gratis',
            badgeClass: 'bg-sky-950/80 text-sky-200 border-sky-500/30',
            icon: Wallet,
        },
        {
            id: 'nequi',
            titulo: 'Nequi / Daviplata / Bre-B',
            subtitulo: `Transferencia QR • ${TELEFONO_TIENDA_FORMATO}`,
            badge: '0% Comisión',
            badgeClass: 'bg-purple-950/80 text-purple-200 border-purple-400/30',
            icon: Smartphone,
        },
        {
            id: 'epayco',
            titulo: 'ePayco / Efecty / Gana',
            subtitulo: 'Baloto, Gana Antioquia, SuRed',
            icon: Banknote,
        },
        {
            id: 'card',
            titulo: 'Tarjeta Crédito / Débito',
            subtitulo: 'Visa, Mastercard, Amex',
            icon: CreditCard,
        },
        {
            id: 'pse',
            titulo: 'PSE / Contraentrega',
            subtitulo: 'Todos los bancos o Pago al recibir',
            icon: DollarSign,
        },
    ];

    const infoClienteActual = obtenerDatosCliente();

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Encabezado />

            {/* main con espacio inferior anti-colisión para no quedar tapado por el botón flotante */}
            <main className="flex-1 py-8 md:py-12 pb-32 sm:pb-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Botón Volver con Glassmorphism */}
                    <button
                        onClick={() => navigate('/checkout')}
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3.5 py-1.5 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-white/10 hover:border-slate-300 mb-5 transition-all cursor-pointer text-xs font-semibold shadow-xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Volver a datos de envío
                    </button>

                    {/* Título y Total */}
                    <div className="text-center mb-8">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 backdrop-blur-md mb-2.5">
                            <Lock className="w-3.5 h-3.5 text-emerald-500" /> Ecosistema Multipagos Colombia • Tarjeta 3D Interactiva
                        </span>
                        <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight mb-2">
                            Elige tu Forma de Pago
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
                            Total a transferir o cobrar:{' '}
                            <span className="font-extrabold text-primary-600 dark:text-primary-400 font-mono text-base md:text-lg">
                                {formatCurrency(total)}
                            </span>
                        </p>
                    </div>

                    {/* Selector de las 6 Pasarelas y Formas de Pago con Glassmorfismo */}
                    <div className="mb-9">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {METODOS_DISPONIBLES.map((m) => {
                                const activo = paymentMethod === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(m.id)}
                                        className={`relative p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer backdrop-blur-xl ${
                                            activo
                                                ? 'border-primary-500 dark:border-primary-400 bg-primary-50/40 dark:bg-primary-950/20 shadow-md ring-2 ring-primary-500/25 -translate-y-0.5'
                                                : 'border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 hover:bg-white/90 dark:hover:bg-slate-800/60 hover:border-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                                        }`}
                                    >
                                        {m.badge && (
                                            <span
                                                className={`absolute -top-2.5 right-3 ${m.badgeClass} border text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-md`}
                                            >
                                                {m.badge}
                                            </span>
                                        )}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                                    {m.titulo}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                    {m.subtitulo}
                                                </p>
                                            </div>
                                            <div className="shrink-0">
                                                <LogoPasarelaPorId gateway={m.id} className="h-7" />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Layout de 2 columnas: Tarjeta 3D Interactiva (Izquierda) + Pasarela Activa (Derecha) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* COLUMNA IZQUIERDA: Tarjeta de Crédito / Pasarela 3D Animada */}
                        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                            <CardPreview
                                gateway={paymentMethod}
                                cardNumber={cardData.cardNumber}
                                cardHolder={cardData.cardholderName || infoClienteActual.fullName}
                                expiryDate={cardData.expiryDate}
                                cvv={cardData.cvv}
                                isFlipped={isCVVFocused}
                                cardType={detectCardType(cardData.cardNumber)}
                                totalAmount={total}
                            />

                            {/* Tarjeta de resumen rápido debajo de la tarjeta 3D con Glassmorfismo */}
                            <div className="p-5 rounded-2xl bg-white/85 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-sm text-xs space-y-3">
                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                    <span className="font-medium text-slate-500 dark:text-slate-400">Destinatario:</span>
                                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                                        {infoClienteActual.fullName || 'Cliente D&D Textil'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                    <span className="font-medium text-slate-500 dark:text-slate-400">Destino de envío:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {infoClienteActual.city || 'Medellín'}, {infoClienteActual.state || 'Antioquia'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 dark:border-white/10 text-slate-500">
                                    <span>Soporte D&amp;D Textil:</span>
                                    <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                                        +57 {TELEFONO_TIENDA_FORMATO}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Panel dinámico según la pasarela seleccionada */}
                        <div className="lg:col-span-7" ref={contentRef} key={paymentMethod}>
                            {/* 1. WOMPI BANCOLOMBIA */}
                            {paymentMethod === 'wompi' && (
                                <div className="p-6 md:p-8 bg-white/80 dark:bg-slate-900/75 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/80 dark:border-white/10 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    Pagar con Wompi
                                                </h2>
                                                <span className="text-[11px] bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 px-2.5 py-0.5 rounded-full font-semibold backdrop-blur-md">
                                                    Grupo Bancolombia
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                API Sandbox integrada con firma criptográfica segura SHA-256
                                            </p>
                                        </div>
                                        <LogoPasarelaPorId gateway="wompi" className="h-8" />
                                    </div>

                                    <div className="py-6 space-y-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-200/60 dark:border-white/5 backdrop-blur-sm">
                                                <Smartphone className="w-5 h-5 text-purple-500 dark:text-purple-400 mx-auto mb-1" />
                                                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200">Nequi</span>
                                                <span className="text-[10px] text-slate-400">Push al celular</span>
                                            </div>
                                            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-200/60 dark:border-white/5 backdrop-blur-sm">
                                                <Building2 className="w-5 h-5 text-amber-500 dark:text-amber-400 mx-auto mb-1" />
                                                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200">Bancolombia</span>
                                                <span className="text-[10px] text-slate-400">Botón Transferencia</span>
                                            </div>
                                            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-200/60 dark:border-white/5 backdrop-blur-sm">
                                                <DollarSign className="w-5 h-5 text-blue-500 dark:text-blue-400 mx-auto mb-1" />
                                                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200">PSE</span>
                                                <span className="text-[10px] text-slate-400">Todos los bancos</span>
                                            </div>
                                            <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl text-center border border-slate-200/60 dark:border-white/5 backdrop-blur-sm">
                                                <CreditCard className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mx-auto mb-1" />
                                                <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200">Tarjetas</span>
                                                <span className="text-[10px] text-slate-400">Débito / Crédito</span>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-950/10 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-900 dark:text-emerald-300 space-y-1 backdrop-blur-sm">
                                            <div className="flex items-center gap-2 font-semibold">
                                                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                Integridad Criptográfica Garantizada (SHA-256)
                                            </div>
                                            <p className="text-emerald-800/80 dark:text-emerald-400/90 pl-6 leading-relaxed">
                                                El importe y los metros son validados matemáticamente por el servidor antes de autorizar la transacción.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => abrirPasarelaAPI('wompi')}
                                            disabled={isProcessing}
                                            className="w-full py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/35 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                                        >
                                            <Lock className="w-4 h-4 opacity-90" />
                                            <span>Abrir Pasarela Wompi Bancolombia ({formatCurrency(total)})</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 2. MERCADO PAGO CHECKOUT PRO */}
                            {paymentMethod === 'mercadopago' && (
                                <div className="p-6 md:p-8 bg-white/80 dark:bg-slate-900/75 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/80 dark:border-white/10 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    Mercado Pago Checkout Pro
                                                </h2>
                                                <span className="text-[11px] bg-sky-950/80 text-sky-200 border border-sky-500/30 px-2.5 py-0.5 rounded-full font-semibold backdrop-blur-md">
                                                    API Developers Gratis
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Paga con saldo de cuenta, tarjetas hasta 12 cuotas, PSE o Efecty
                                            </p>
                                        </div>
                                        <LogoPasarelaPorId gateway="mercadopago" className="h-8" />
                                    </div>

                                    <div className="py-6 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 backdrop-blur-sm">
                                                <p className="font-bold text-sky-700 dark:text-sky-300 mb-1">Compra Protegida</p>
                                                <p className="text-slate-600 dark:text-slate-400">Respaldo total hasta recibir tus rollos de tela en tu taller.</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 backdrop-blur-sm">
                                                <p className="font-bold text-sky-700 dark:text-sky-300 mb-1">Sin costo de integración</p>
                                                <p className="text-slate-600 dark:text-slate-400">Entorno Sandbox gratuito con credenciales de prueba Mercado Pago.</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 backdrop-blur-sm">
                                                <p className="font-bold text-sky-700 dark:text-sky-300 mb-1">Aprobación al instante</p>
                                                <p className="text-slate-600 dark:text-slate-400">Confirmación automatizada para programar corte y despacho hoy.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => abrirPasarelaAPI('mercadopago')}
                                            disabled={isProcessing}
                                            className="w-full py-4 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all cursor-pointer border border-sky-400/25"
                                        >
                                            <Wallet className="w-5 h-5" />
                                            <span>Pagar con Mercado Pago ({formatCurrency(total)})</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 3. NEQUI / DAVIPLATA / BRE-B DIRECTO */}
                            {paymentMethod === 'nequi' && (
                                <div className="p-6 md:p-8 bg-white/80 dark:bg-slate-900/75 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/80 dark:border-white/10 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    Nequi / Daviplata / Llave Bre-B
                                                </h2>
                                                <span className="text-[11px] bg-purple-950/80 text-purple-200 border border-purple-400/30 px-2.5 py-0.5 rounded-full font-semibold backdrop-blur-md">
                                                    Inmediato • 0% Comisión
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Transferencia directa sin intermediarios con comprobante fotográfico
                                            </p>
                                        </div>
                                        <LogoPasarelaPorId gateway="nequi" className="h-8" />
                                    </div>

                                    <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                        {/* Subtarjeta QR con Glassmorfismo Oscuro */}
                                        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/85 dark:bg-slate-950/90 text-white shadow-xl border border-white/10 backdrop-blur-xl">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-3.5">
                                                Escanea con Nequi o tu Banco
                                            </span>
                                            
                                            {/* Componente QR con fallback SVG anti-roturas */}
                                            <CodigoQRTextil
                                                telefono={TELEFONO_TIENDA}
                                                monto={total}
                                                nombreComercio="D&D Textil Medellín"
                                            />

                                            <p className="text-xs font-bold mt-3 text-white">
                                                D&amp;D Textil Medellín
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {CORREO_TIENDA}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Caja de número Nequi y Copiar */}
                                            <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/90 dark:border-white/10 shadow-xs">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                                                    Número Nequi / Daviplata / Llave celular:
                                                </p>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xl font-mono font-extrabold text-slate-900 dark:text-white tracking-wider">
                                                        {TELEFONO_TIENDA_FORMATO}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={copiarNumeroNequi}
                                                        className="px-3.5 py-1.5 rounded-xl bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15 border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                                                    >
                                                        {copiadoNequi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                        <span>{copiadoNequi ? 'Copiado' : 'Copiar'}</span>
                                                    </button>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                                                    Titular: <strong className="text-slate-900 dark:text-white">D&amp;D Textil Medellín</strong>
                                                </p>
                                            </div>

                                            {/* Input de comprobante */}
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                                    Referencia o últimos 4 dígitos del comprobante (opcional):
                                                </label>
                                                <input
                                                    type="text"
                                                    value={referenciaComprobante}
                                                    onChange={(e) => setReferenciaComprobante(e.target.value)}
                                                    placeholder="Ej. M1294820"
                                                    className="w-full px-4 py-3 rounded-xl bg-white/70 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 backdrop-blur-xs transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                                />
                                            </div>

                                            {/* Botón Confirmar alineado a la marca D&D Textil */}
                                            <button
                                                type="button"
                                                disabled={isProcessing}
                                                onClick={() => procesarPagoDirecto(`Nequi / Bre-B (${TELEFONO_TIENDA_FORMATO})`)}
                                                className="w-full py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/35 active:scale-[0.99] transition-all cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                                <span>Ya transferí • Confirmar Pedido ({formatCurrency(total)})</span>
                                            </button>

                                            {/* Botón WhatsApp Comprobante */}
                                            <a
                                                href={`https://wa.me/57${TELEFONO_TIENDA}?text=${encodeURIComponent(
                                                    `Hola D&D Textil, acabo de realizar la transferencia por ${formatCurrency(total)} para mi pedido. Adjunto comprobante:`
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-3 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors backdrop-blur-sm"
                                            >
                                                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Enviar foto del comprobante al WhatsApp {TELEFONO_TIENDA_FORMATO}</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4. EPAYCO / PAYU (EFECTY, BALOTO, GANA ANTIOQUIA) */}
                            {paymentMethod === 'epayco' && (
                                <div className="p-6 md:p-8 bg-white/80 dark:bg-slate-900/75 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/80 dark:border-white/10 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    ePayco / PayU (Efecty, Baloto y Gana)
                                                </h2>
                                                <span className="text-[11px] bg-amber-950/80 text-amber-200 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold backdrop-blur-md">
                                                    Efectivo &amp; Multicaja
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Puntos de pago en efectivo Gana (Antioquia), Efecty, Baloto o SuRed
                                            </p>
                                        </div>
                                        <LogoPasarelaPorId gateway="epayco" className="h-8" />
                                    </div>

                                    <div className="py-6 space-y-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                                            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 font-bold text-slate-800 dark:text-slate-200 backdrop-blur-sm">
                                                Efecty
                                                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Convenio 110452</span>
                                            </div>
                                            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 font-bold text-slate-800 dark:text-slate-200 backdrop-blur-sm">
                                                Gana Antioquia
                                                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Todo Medellín</span>
                                            </div>
                                            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 font-bold text-slate-800 dark:text-slate-200 backdrop-blur-sm">
                                                Baloto
                                                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Red Nacional</span>
                                            </div>
                                            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 font-bold text-slate-800 dark:text-slate-200 backdrop-blur-sm">
                                                SuRed / PagaTodo
                                                <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Aprobación en línea</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => abrirPasarelaAPI('epayco')}
                                            disabled={isProcessing}
                                            className="w-full py-4 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all cursor-pointer border border-amber-400/25"
                                        >
                                            <Banknote className="w-5 h-5" />
                                            <span>Generar Pin o Pagar con ePayco ({formatCurrency(total)})</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 5. TARJETA DE CRÉDITO / DÉBITO DIRECTA */}
                            {paymentMethod === 'card' && (
                                <div className="p-6 md:p-8 bg-white/80 dark:bg-slate-900/75 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                                    <h2 className="text-2xl font-bold mb-1.5 text-slate-900 dark:text-white">Datos de la Tarjeta</h2>
                                    <p className="text-xs text-slate-500 mb-6">
                                        Observa cómo la tarjeta 3D a la izquierda refleja tus datos en tiempo real y gira automáticamente al ingresar el CVV.
                                    </p>
                                    <FormularioPago
                                        onSubmit={() => procesarPagoDirecto('Tarjeta de Crédito / Débito')}
                                        onCardDataChange={handleCardDataChange}
                                        onCVVFocus={() => setIsCVVFocused(true)}
                                        onCVVBlur={() => setIsCVVFocused(false)}
                                        isProcessing={isProcessing}
                                    />
                                </div>
                            )}

                            {/* 6. PSE DÉBITO BANCARIO O CONTRAENTREGA MEDELLÍN */}
                            {paymentMethod === 'pse' && (
                                <div className="p-6 md:p-8 bg-white/80 dark:bg-slate-900/75 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl mb-6 backdrop-blur-md">
                                        <button
                                            type="button"
                                            onClick={() => setSubmodoPse('pse')}
                                            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                submodoPse === 'pse'
                                                    ? 'bg-white dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                            }`}
                                        >
                                            PSE (Transferencia Bancaria)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSubmodoPse('contraentrega')}
                                            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                submodoPse === 'contraentrega'
                                                    ? 'bg-white dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                            }`}
                                        >
                                            Pago Contraentrega (Medellín)
                                        </button>
                                    </div>

                                    {submodoPse === 'pse' ? (
                                        <>
                                            <h2 className="text-2xl font-bold mb-1.5 text-slate-900 dark:text-white">Pago con PSE (ACH Colombia)</h2>
                                            <p className="text-xs text-slate-500 mb-6">
                                                Débito directo desde tu cuenta de ahorros o corriente en cualquier entidad bancaria de Colombia.
                                            </p>
                                            <PSEForm
                                                onSubmit={(datosPse) =>
                                                    procesarPagoDirecto(`PSE (${datosPse?.bank || 'Banco Nacional'})`)
                                                }
                                                isProcessing={isProcessing}
                                            />
                                        </>
                                    ) : (
                                        <div className="space-y-5">
                                            <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-amber-950/10 dark:bg-amber-950/30 border border-amber-500/20 backdrop-blur-sm">
                                                <Truck className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                                                        Pago Contraentrega en Medellín y Área Metropolitana
                                                    </h3>
                                                    <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1.5 leading-relaxed">
                                                        Paga en efectivo o con datáfono móvil cuando nuestro mensajero entregue tus telas en la dirección indicada. Para confirmar el despacho nos comunicaremos contigo al WhatsApp.
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={isProcessing}
                                                onClick={() => procesarPagoDirecto('Pago Contraentrega (Medellín)')}
                                                className="w-full py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/35 active:scale-[0.99] transition-all cursor-pointer"
                                            >
                                                <Truck className="w-5 h-5 text-white" />
                                                <span>Confirmar Pedido Contraentrega ({formatCurrency(total)})</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Badges de Seguridad al pie */}
                    <div className="max-w-3xl mx-auto mt-10 text-center">
                        <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>
                                Pasarelas verificadas: Wompi Bancolombia • Mercado Pago • Nequi / Bre-B • ePayco • PSE ACH • Cifrado TLS 256-bit
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
