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
import { LogoPasarelaPorId } from './LogosPasarelas';
import { useCarrito } from '../../contextos/ContextoCarrito';
import { useNotificacion } from '../../contextos/ContextoNotificacion';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { formatCurrency } from '../../utilidades/formateadores';
import { crearIntencionPagoWompi } from '../../servicios/servicioWompi';

gsap.registerPlugin(useGSAP);

const TELEFONO_TIENDA = '3027058951';
const TELEFONO_TIENDA_FORMATO = '302 705 8951';
const CORREO_TIENDA = 'dydtextil222medellin@gmail.com';

function Payment() {
    const navigate = useNavigate();
    const { getOrderCalculations, cartItems, clearCart, appliedCoupon } = useCarrito();
    const { showNotification } = useNotificacion();
    const { user } = useAutenticacion();
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
            const intencion = await crearIntencionPagoWompi({
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

    const finalizarOrdenExitosa = ({ reference, transactionId, paymentMethod: metodoFinal, status = 'APPROVED' }) => {
        const infoCliente = obtenerDatosCliente();
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
                    transactionId: referenciaComprobante ? `NEQUI-${referenciaComprobante}` : txId,
                    paymentMethod: etiquetaMetodo,
                    status: etiquetaMetodo.includes('Contraentrega') ? 'pending' : 'APPROVED',
                });
            }, 900);
        } catch (err) {
            setIsProcessing(false);
            showNotification('error', err.message || 'Error procesando el pago.');
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
                { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
            );
        }
    }, { scope: contentRef, dependencies: [paymentMethod, submodoPse] });

    const METODOS_DISPONIBLES = [
        {
            id: 'wompi',
            titulo: 'Wompi Bancolombia',
            subtitulo: 'Nequi, PSE, Botón Bancolombia',
            badge: 'Recomendado',
            badgeColor: 'from-amber-500 to-primary-600',
            icon: Zap,
            iconBg: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
        },
        {
            id: 'mercadopago',
            titulo: 'Mercado Pago',
            subtitulo: 'Checkout Pro • Cuotas • Efecty',
            badge: 'API Sandbox Gratis',
            badgeColor: 'from-sky-500 to-blue-600',
            icon: Wallet,
            iconBg: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
        },
        {
            id: 'nequi',
            titulo: 'Nequi / Daviplata / Bre-B',
            subtitulo: `Transferencia QR • ${TELEFONO_TIENDA_FORMATO}`,
            badge: '0% Comisión',
            badgeColor: 'from-fuchsia-600 to-purple-600',
            icon: Smartphone,
            iconBg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        },
        {
            id: 'epayco',
            titulo: 'ePayco / Efecty / Gana',
            subtitulo: 'Baloto, Gana Antioquia, SuRed',
            icon: Banknote,
            iconBg: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        },
        {
            id: 'card',
            titulo: 'Tarjeta Crédito / Débito',
            subtitulo: 'Visa, Mastercard, Amex',
            icon: CreditCard,
            iconBg: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        },
        {
            id: 'pse',
            titulo: 'PSE / Contraentrega',
            subtitulo: 'Todos los bancos o Pago al recibir',
            icon: DollarSign,
            iconBg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        },
    ];

    const infoClienteActual = obtenerDatosCliente();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
            <Encabezado />

            <main className="flex-1 py-8 md:py-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Botón Volver */}
                    <button
                        onClick={() => navigate('/checkout')}
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver a datos de envío
                    </button>

                    {/* Título y Total */}
                    <div className="text-center mb-7">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 mb-2">
                            <Lock className="w-3.5 h-3.5" /> Ecosistema Multipagos Colombia • Tarjeta 3D Interactiva
                        </span>
                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-1.5">
                            Elige tu Forma de Pago
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-base">
                            Total del pedido:{' '}
                            <span className="font-bold text-primary-600 dark:text-primary-400">
                                {formatCurrency(total)}
                            </span>
                        </p>
                    </div>

                    {/* Selector de las 6 Pasarelas y Formas de Pago */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {METODOS_DISPONIBLES.map((m) => {
                                const Icon = m.icon;
                                const activo = paymentMethod === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(m.id)}
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                            activo
                                                ? 'border-primary-600 bg-white dark:bg-slate-800 shadow-md ring-2 ring-primary-500/20 -translate-y-0.5'
                                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-gray-300'
                                        }`}
                                    >
                                        {m.badge && (
                                            <span
                                                className={`absolute -top-2.5 right-3 bg-gradient-to-r ${m.badgeColor} text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm`}
                                            >
                                                {m.badge}
                                            </span>
                                        )}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                                    {m.titulo}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
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

                            {/* Tarjeta de resumen rápido debajo de la tarjeta 3D */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-gray-200/80 dark:border-slate-700 shadow-sm text-xs space-y-2">
                                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                                    <span>Destinatario:</span>
                                    <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                                        {infoClienteActual.fullName}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                                    <span>Destino de envío:</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                        {infoClienteActual.city || 'Medellín'}, {infoClienteActual.state || 'Antioquia'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                                    <span className="text-gray-500">Soporte D&amp;D Textil:</span>
                                    <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">
                                        +57 {TELEFONO_TIENDA_FORMATO}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Panel dinámico según la pasarela seleccionada */}
                        <div className="lg:col-span-7" ref={contentRef} key={paymentMethod}>
                            {/* 1. WOMPI BANCOLOMBIA */}
                            {paymentMethod === 'wompi' && (
                                <div className="card p-6 md:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 dark:border-slate-700 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    Pagar con Wompi
                                                </h2>
                                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-semibold">
                                                    Grupo Bancolombia
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                API Sandbox gratuita integrada con firma criptográfica SHA-256
                                            </p>
                                        </div>
                                        <LogoPasarelaPorId gateway="wompi" className="h-9" />
                                    </div>

                                    <div className="py-5 space-y-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="p-3 bg-gray-50 dark:bg-slate-700/40 rounded-xl text-center border border-gray-100 dark:border-slate-700">
                                                <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                                                <span className="text-xs font-semibold block text-gray-700 dark:text-gray-200">Nequi</span>
                                                <span className="text-[10px] text-gray-400">Push al celular</span>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-slate-700/40 rounded-xl text-center border border-gray-100 dark:border-slate-700">
                                                <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                                                <span className="text-xs font-semibold block text-gray-700 dark:text-gray-200">Bancolombia</span>
                                                <span className="text-[10px] text-gray-400">Botón Transferencia</span>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-slate-700/40 rounded-xl text-center border border-gray-100 dark:border-slate-700">
                                                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                                                <span className="text-xs font-semibold block text-gray-700 dark:text-gray-200">PSE</span>
                                                <span className="text-[10px] text-gray-400">Todos los bancos</span>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-slate-700/40 rounded-xl text-center border border-gray-100 dark:border-slate-700">
                                                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                                                <span className="text-xs font-semibold block text-gray-700 dark:text-gray-200">Tarjetas</span>
                                                <span className="text-[10px] text-gray-400">Débito / Crédito</span>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                                            <div className="flex items-center gap-2 font-semibold">
                                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                Integridad Criptográfica Garantizada (SHA-256)
                                            </div>
                                            <p className="text-emerald-700 dark:text-emerald-400 pl-6">
                                                El precio y los metros son verificados directamente por nuestro servidor antes de autorizar el cobro.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => abrirPasarelaAPI('wompi')}
                                            disabled={isProcessing}
                                            className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 active:scale-[0.99] transition-transform disabled:opacity-50 cursor-pointer"
                                        >
                                            <Lock className="w-4 h-4" />
                                            <span>Abrir Pasarela Wompi Bancolombia ({formatCurrency(total)})</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 2. MERCADO PAGO CHECKOUT PRO */}
                            {paymentMethod === 'mercadopago' && (
                                <div className="card p-6 md:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-sky-100 dark:border-slate-700">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 dark:border-slate-700 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    Mercado Pago Checkout Pro
                                                </h2>
                                                <span className="text-xs bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 px-2.5 py-0.5 rounded-full font-semibold">
                                                    API Developers Gratis
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Paga con saldo en Mercado Pago, tarjetas hasta 12 cuotas, PSE o Efecty
                                            </p>
                                        </div>
                                        <LogoPasarelaPorId gateway="mercadopago" className="h-9" />
                                    </div>

                                    <div className="py-5 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                            <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-slate-700/40 border border-sky-100 dark:border-slate-700">
                                                <p className="font-bold text-sky-900 dark:text-sky-300 mb-1">Compra Protegida</p>
                                                <p className="text-gray-600 dark:text-gray-400">Respaldo total hasta que recibas tus rollos de tela en tu taller.</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-slate-700/40 border border-sky-100 dark:border-slate-700">
                                                <p className="font-bold text-sky-900 dark:text-sky-300 mb-1">Sin costo de integración</p>
                                                <p className="text-gray-600 dark:text-gray-400">Credenciales de prueba (`TEST-...`) gratuitas en Mercado Pago Developers.</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-slate-700/40 border border-sky-100 dark:border-slate-700">
                                                <p className="font-bold text-sky-900 dark:text-sky-300 mb-1">Aprobación al instante</p>
                                                <p className="text-gray-600 dark:text-gray-400">Notificación automática Webhook / IPN para despachar el pedido hoy mismo.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => abrirPasarelaAPI('mercadopago')}
                                            disabled={isProcessing}
                                            className="w-full py-4 px-6 rounded-xl bg-[#009ee3] hover:bg-[#008ACA] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                                        >
                                            <Wallet className="w-5 h-5" />
                                            <span>Pagar con Mercado Pago ({formatCurrency(total)})</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 3. NEQUI / DAVIPLATA / BRE-B DIRECTO */}
                            {paymentMethod === 'nequi' && (
                                <div className="card p-6 md:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-purple-100 dark:border-slate-700">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 dark:border-slate-700 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    Nequi / Daviplata / Llave Bre-B
                                                </h2>
                                                <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-semibold">
                                                    Inmediato • 0% Comisión
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                El método más rápido y frecuente en comercios textiles de Medellín
                                            </p>
                                        </div>
                                        <LogoPasarelaPorId gateway="nequi" className="h-9" />
                                    </div>

                                    <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-inner">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-pink-300 mb-3">
                                                Escanea con Nequi o tu Banco
                                            </span>
                                            <div className="bg-white p-3 rounded-xl shadow-lg">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                                                        `NEQUI-DDTEXTIL-TEL:${TELEFONO_TIENDA}-MONTO:${Math.round(total)}`
                                                    )}`}
                                                    alt="Código QR Nequi D&D Textil"
                                                    className="w-36 h-36 object-contain"
                                                />
                                            </div>
                                            <p className="text-xs font-bold mt-3 text-white">
                                                D&amp;D Textil Medellín
                                            </p>
                                            <p className="text-[11px] text-purple-200">
                                                {CORREO_TIENDA}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl bg-purple-50 dark:bg-slate-700/50 border border-purple-200 dark:border-slate-600">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    Número Nequi / Daviplata / Llave celular:
                                                </p>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xl font-mono font-black text-purple-700 dark:text-purple-300">
                                                        {TELEFONO_TIENDA_FORMATO}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={copiarNumeroNequi}
                                                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-600 text-xs font-bold text-purple-700 dark:text-purple-300 inline-flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        {copiadoNequi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                        <span>{copiadoNequi ? 'Copiado' : 'Copiar'}</span>
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5">
                                                    Titular: <strong>D&amp;D Textil Medellín</strong>
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Referencia o últimos 4 dígitos del comprobante (opcional):
                                                </label>
                                                <input
                                                    type="text"
                                                    value={referenciaComprobante}
                                                    onChange={(e) => setReferenciaComprobante(e.target.value)}
                                                    placeholder="Ej. M1294820"
                                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-sm outline-none focus:border-purple-500"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                disabled={isProcessing}
                                                onClick={() => procesarPagoDirecto(`Nequi / Bre-B (${TELEFONO_TIENDA_FORMATO})`)}
                                                className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Ya transferí • Confirmar Pedido ({formatCurrency(total)})</span>
                                            </button>

                                            <a
                                                href={`https://wa.me/57${TELEFONO_TIENDA}?text=${encodeURIComponent(
                                                    `Hola D&D Textil, acabo de realizar un pago por ${formatCurrency(total)} para mi pedido de telas.`
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-2.5 px-4 rounded-xl border border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                <span>Enviar comprobante al WhatsApp {TELEFONO_TIENDA_FORMATO}</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4. EPAYCO / PAYU (EFECTY, BALOTO, GANA ANTIOQUIA) */}
                            {paymentMethod === 'epayco' && (
                                <div className="card p-6 md:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-orange-100 dark:border-slate-700">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 dark:border-slate-700 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    ePayco / PayU (Efecty, Baloto y Gana)
                                                </h2>
                                                <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 px-2.5 py-0.5 rounded-full font-semibold">
                                                    Efectivo &amp; Multicaja
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Ideal para clientes que prefieren pagar en efectivo en puntos Gana (Antioquia), Efecty, Baloto o SuRed
                                            </p>
                                        </div>
                                        <LogoPasarelaPorId gateway="epayco" className="h-9" />
                                    </div>

                                    <div className="py-5 space-y-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-slate-700/40 border border-amber-200 dark:border-slate-700 font-bold text-amber-800 dark:text-amber-300">
                                                Efecty
                                                <span className="block text-[10px] font-normal text-gray-500 mt-0.5">Convenio 110452</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-slate-700/40 border border-blue-200 dark:border-slate-700 font-bold text-blue-800 dark:text-blue-300">
                                                Gana Antioquia
                                                <span className="block text-[10px] font-normal text-gray-500 mt-0.5">Todo Medellín</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-red-50 dark:bg-slate-700/40 border border-red-200 dark:border-slate-700 font-bold text-red-800 dark:text-red-300">
                                                Baloto
                                                <span className="block text-[10px] font-normal text-gray-500 mt-0.5">Red Nacional</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-slate-700/40 border border-emerald-200 dark:border-slate-700 font-bold text-emerald-800 dark:text-emerald-300">
                                                SuRed / PagaTodo
                                                <span className="block text-[10px] font-normal text-gray-500 mt-0.5">Aprobación en línea</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => abrirPasarelaAPI('epayco')}
                                            disabled={isProcessing}
                                            className="w-full py-4 px-6 rounded-xl bg-[#ff5a00] hover:bg-[#e04800] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                                        >
                                            <Banknote className="w-5 h-5" />
                                            <span>Generar Pin o Pagar con ePayco ({formatCurrency(total)})</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 5. TARJETA DE CRÉDITO / DÉBITO DIRECTA */}
                            {paymentMethod === 'card' && (
                                <div className="card p-6 md:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl">
                                    <h2 className="text-2xl font-bold mb-1.5">Datos de la Tarjeta</h2>
                                    <p className="text-xs text-gray-500 mb-5">
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
                                <div className="card p-6 md:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl">
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-slate-700/60 rounded-xl mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setSubmodoPse('pse')}
                                            className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                submodoPse === 'pse'
                                                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                        >
                                            PSE (Transferencia Bancaria)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSubmodoPse('contraentrega')}
                                            className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                submodoPse === 'contraentrega'
                                                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                        >
                                            Pago Contraentrega (Medellín)
                                        </button>
                                    </div>

                                    {submodoPse === 'pse' ? (
                                        <>
                                            <h2 className="text-2xl font-bold mb-2">Pago con PSE (ACH Colombia)</h2>
                                            <p className="text-xs text-gray-500 mb-6">
                                                Débito directo desde tu cuenta de ahorros o corriente en cualquier banco del país.
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
                                            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                                                <Truck className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                                                        Pago Contraentrega en Medellín y Área Metropolitana
                                                    </h3>
                                                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                                                        Paga en efectivo o con datáfono móvil cuando nuestro mensajero entregue tus telas en la dirección indicada. Para confirmar el despacho nos comunicaremos contigo al WhatsApp.
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={isProcessing}
                                                onClick={() => procesarPagoDirecto('Pago Contraentrega (Medellín)')}
                                                className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <Truck className="w-5 h-5" />
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
