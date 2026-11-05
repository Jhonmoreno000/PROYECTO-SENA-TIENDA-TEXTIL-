import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CreditCard, DollarSign, ArrowLeft, ShieldCheck, Zap, Lock, Building2, Smartphone } from 'lucide-react';
import Encabezado from '../../componentes/Encabezado';
import PieDePagina from '../../componentes/PieDePagina';
import CardPreview from './CardPreview';
import FormularioPago from './FormularioPago';
import PSEForm from './PSEForm';
import { useCarrito } from '../../contextos/ContextoCarrito';
import { useNotificacion } from '../../contextos/ContextoNotificacion';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { formatCurrency } from '../../utilidades/formateadores';
import { abrirWidgetWompi, crearIntencionPagoWompi } from '../../servicios/servicioWompi';

gsap.registerPlugin(useGSAP);

function Payment() {
    const navigate = useNavigate();
    const { getCartTotal, cartItems, clearCart, appliedCoupon } = useCarrito();
    const { showNotification } = useNotificacion();
    const { user } = useAutenticacion();
    const contentRef = useRef(null);

    const [paymentMethod, setPaymentMethod] = useState('wompi'); // 'wompi' | 'card' | 'pse'
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCVVFocused, setIsCVVFocused] = useState(false);
    const [cardData, setCardData] = useState({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });
    const [customerInfo, setCustomerInfo] = useState(null);

    const total = getCartTotal();

    useEffect(() => {
        // Cargar datos de envío guardados en el paso de checkout
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
        const c = number.replace(/\s/g, '');
        if (/^4/.test(c)) return 'visa';
        if (/^5[1-5]/.test(c)) return 'mastercard';
        return 'unknown';
    };

    const handleCardDataChange = useCallback((datos) => {
        setCardData({
            cardholderName: datos.cardholderName || '',
            cardNumber: datos.cardNumber || '',
            expiryDate: datos.expiryDate || '',
            cvv: datos.cvv || ''
        });
    }, []);

    /**
     * Inicia el flujo real de pago con Wompi (Bancolombia).
     * 1. React envía al backend en Java sólo los IDs de telas y metros.
     * 2. Java consulta PostgreSQL, calcula el total exacto y genera la firma SHA-256.
     * 3. Se despliega el Widget seguro de Wompi.
     */
    const handleWompiPayment = async () => {
        if (!cartItems || cartItems.length === 0) {
            showNotification('error', 'El carrito está vacío.');
            navigate('/carrito');
            return;
        }

        if (!user?.id) {
            showNotification('error', 'Debes iniciar sesión para procesar el pago.');
            navigate('/login');
            return;
        }

        if (!customerInfo || !customerInfo.address || !customerInfo.phone || !customerInfo.city) {
            showNotification('error', 'Completa primero los datos de envío en el checkout.');
            navigate('/checkout');
            return;
        }

        setIsProcessing(true);
        try {
            const intencion = await crearIntencionPagoWompi({
                items: cartItems.map(it => ({
                    productId: it.id,
                    quantity: it.quantity || 1
                })),
                customerInfo,
                couponCode: appliedCoupon?.code || null,
                userId: user.id
            });

            // Guardar para respaldo local
            localStorage.setItem('lastOrder', JSON.stringify({
                orderNumber: intencion.reference,
                items: cartItems,
                customerInfo: intencion.customerInfo || customerInfo,
                subtotal: intencion.subtotal,
                discount: intencion.discount,
                shipping: intencion.shipping,
                tax: intencion.tax,
                total: intencion.total,
                date: new Date().toISOString()
            }));

            // Abrir el Widget de Wompi
            await abrirWidgetWompi({
                currency: intencion.currency,
                amountInCents: intencion.amountInCents,
                reference: intencion.reference,
                publicKey: intencion.publicKey,
                integritySignature: intencion.integritySignature,
                customerInfo: intencion.customerInfo,
                onFinish: (resultado) => {
                    const transaccion = resultado?.transaction;
                    if (transaccion && (transaccion.status === 'APPROVED' || transaccion.status === 'PENDING')) {
                        clearCart();
                        showNotification('success', '¡Transacción registrada exitosamente!');
                        navigate(`/confirmacion?referencia=${encodeURIComponent(intencion.reference)}`);
                    } else if (transaccion && transaccion.status === 'DECLINED') {
                        showNotification('error', 'La transacción fue rechazada por tu entidad bancaria.');
                    }
                }
            });

        } catch (error) {
            console.error('Error procesando pago con Wompi:', error);
            showNotification('error', error.message || 'No se pudo iniciar la pasarela de Wompi.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Animación suave al cambiar pestaña
    useGSAP(() => {
        if (contentRef.current) {
            gsap.fromTo(contentRef.current,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
            );
        }
    }, { scope: contentRef, dependencies: [paymentMethod] });

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
            <Encabezado />

            <main className="flex-1 py-10 md:py-14">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Botón Volver */}
                    <button
                        onClick={() => navigate('/checkout')}
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver a datos de envío
                    </button>

                    {/* Título y Total */}
                    <div className="text-center mb-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 mb-3">
                            <Lock className="w-3.5 h-3.5" /> Pasarela de Pago Segura (Colombia)
                        </span>
                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
                            Finalizar y Pagar
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Total estimado a cobrar:{' '}
                            <span className="font-bold text-primary-600 dark:text-primary-400">
                                {formatCurrency(total)}
                            </span>
                        </p>
                    </div>

                    {/* Selector de Métodos de Pago */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Opción 1: Wompi Oficial */}
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('wompi')}
                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                                    paymentMethod === 'wompi'
                                        ? 'border-primary-600 bg-white dark:bg-slate-800 shadow-md ring-2 ring-primary-500/20'
                                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-gray-300'
                                }`}
                            >
                                <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-primary-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                                    Recomendado
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Wompi</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Bancolombia, Nequi, PSE</p>
                                    </div>
                                </div>
                            </button>

                            {/* Opción 2: Tarjeta Directa */}
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    paymentMethod === 'card'
                                        ? 'border-primary-600 bg-white dark:bg-slate-800 shadow-md ring-2 ring-primary-500/20'
                                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Tarjeta</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Crédito o Débito</p>
                                    </div>
                                </div>
                            </button>

                            {/* Opción 3: PSE Directo */}
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('pse')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    paymentMethod === 'pse'
                                        ? 'border-primary-600 bg-white dark:bg-slate-800 shadow-md ring-2 ring-primary-500/20'
                                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">PSE</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Transferencia Bancaria</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Contenido según método seleccionado */}
                    <div ref={contentRef} key={paymentMethod}>
                        {paymentMethod === 'wompi' ? (
                            <div className="max-w-2xl mx-auto">
                                <div className="card p-6 md:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-700">
                                    {/* Cabecera Wompi */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 dark:border-slate-700 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    Pagar con Wompi
                                                </h2>
                                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-semibold">
                                                    Bancolombia
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Transacciones locales inmediatas y libres de fraude
                                            </p>
                                        </div>
                                    </div>

                                    {/* Métodos soportados */}
                                    <div className="py-6 space-y-4">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Métodos habilitados en esta orden:
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <div className="p-3 bg-gray-50 dark:bg-slate-700/40 rounded-xl text-center border border-gray-100 dark:border-slate-700">
                                                <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                                                <span className="text-xs font-semibold block text-gray-700 dark:text-gray-200">Nequi</span>
                                                <span className="text-[10px] text-gray-400">Push al celular</span>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-slate-700/40 rounded-xl text-center border border-gray-100 dark:border-slate-700">
                                                <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                                                <span className="text-xs font-semibold block text-gray-700 dark:text-gray-200">Bancolombia</span>
                                                <span className="text-[10px] text-gray-400">Transferencia</span>
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

                                        {/* Garantías de seguridad */}
                                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                                            <div className="flex items-center gap-2 font-semibold">
                                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                Integridad Criptográfica Garantizada (SHA-256)
                                            </div>
                                            <p className="text-emerald-700 dark:text-emerald-400 pl-6">
                                                El precio y los metros son calculados y certificados directamente por nuestro backend en Java.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Botón Principal Wompi */}
                                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={handleWompiPayment}
                                            disabled={isProcessing}
                                            className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 active:scale-[0.99] transition-transform disabled:opacity-50"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Conectando con Wompi...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-4 h-4" />
                                                    <span>Abrir Pasarela Wompi Bancolombia</span>
                                                </>
                                            )}
                                        </button>
                                        <p className="text-center text-xs text-gray-400 mt-3">
                                            Al continuar, se desplegará el modal seguro de Wompi sin salir de la tienda.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : paymentMethod === 'card' ? (
                            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
                                <div className="flex items-center justify-center">
                                    <CardPreview
                                        cardNumber={cardData.cardNumber}
                                        cardHolder={cardData.cardholderName}
                                        expiryDate={cardData.expiryDate}
                                        cvv={cardData.cvv}
                                        isFlipped={isCVVFocused}
                                        cardType={detectCardType(cardData.cardNumber)}
                                    />
                                </div>
                                <div className="card p-6 md:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl">
                                    <h2 className="text-2xl font-bold mb-4">Datos de la Tarjeta</h2>
                                    <p className="text-xs text-gray-500 mb-6">
                                        Puedes ingresar tus datos o usar la pasarela oficial Wompi para mayor comodidad.
                                    </p>
                                    <FormularioPago
                                        onSubmit={handleWompiPayment}
                                        onCardDataChange={handleCardDataChange}
                                        onCVVFocus={() => setIsCVVFocused(true)}
                                        onCVVBlur={() => setIsCVVFocused(false)}
                                        isProcessing={isProcessing}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto">
                                <div className="card p-6 md:p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl">
                                    <h2 className="text-2xl font-bold mb-4">Pago con PSE</h2>
                                    <p className="text-xs text-gray-500 mb-6">
                                        Débito bancario seguro a través de Wompi PSE.
                                    </p>
                                    <PSEForm
                                        onSubmit={handleWompiPayment}
                                        isProcessing={isProcessing}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Badges de Seguridad al pie */}
                    <div className="max-w-2xl mx-auto mt-12 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span>Pasarela respaldada por Bancolombia • Cifrado TLS 256-bit • Certificación PCI-DSS</span>
                        </div>
                    </div>
                </div>
            </main>

            <PieDePagina />
        </div>
    );
}

export default Payment;
