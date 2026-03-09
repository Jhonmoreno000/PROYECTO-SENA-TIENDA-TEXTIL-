import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCreditCard, FiDollarSign, FiArrowLeft } from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CardPreview from './CardPreview';
import PaymentForm from './PaymentForm';
import PSEForm from './PSEForm';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function Payment() {
    const navigate = useNavigate();
    const { getCartTotal, clearCart } = useCart();
    const { showNotification } = useNotification();

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCVVFocused, setIsCVVFocused] = useState(false);

    const [cardData, setCardData] = useState({
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });

    const total = getCartTotal();

    const detectCardType = (number) => {
        const cleaned = number.replace(/\s/g, '');
        if (/^4/.test(cleaned)) return 'visa';
        if (/^5[1-5]/.test(cleaned)) return 'mastercard';
        return 'unknown';
    };

    const handleCardDataChange = useCallback((data) => {
        setCardData({
            cardholderName: data.cardholderName || '',
            cardNumber: data.cardNumber || '',
            expiryDate: data.expiryDate || '',
            cvv: data.cvv || '',
        });
    }, []);

    const simulatePayment = async (data, method) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    transactionId: 'TXN-' + Date.now(),
                    method: method,
                    amount: total,
                    data: data,
                });
            }, 2500);
        });
    };

    const handleCardPayment = async (data) => {
        setIsProcessing(true);
        try {
            const result = await simulatePayment(data, 'card');

            if (result.success) {
                localStorage.setItem('lastPayment', JSON.stringify({
                    ...result,
                    date: new Date().toISOString(),
                }));

                clearCart();
                showNotification('success', '¡Pago procesado exitosamente!');
                navigate('/confirmacion');
            }
        } catch (error) {
            showNotification('error', 'Error al procesar el pago. Intenta nuevamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePSEPayment = async (data) => {
        setIsProcessing(true);
        try {
            const result = await simulatePayment(data, 'pse');

            if (result.success) {
                localStorage.setItem('lastPayment', JSON.stringify({
                    ...result,
                    date: new Date().toISOString(),
                }));

                clearCart();
                showNotification('success', '¡Pago PSE procesado exitosamente!');
                navigate('/confirmacion');
            }
        } catch (error) {
            showNotification('error', 'Error al procesar el pago PSE. Intenta nuevamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-gray-50 dark:bg-slate-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <button
                        onClick={() => navigate('/checkout')}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Volver al checkout
                    </button>

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            Método de Pago
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Total a pagar: <span className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(total)}</span>
                        </p>
                    </div>

                    {/* Payment Method Tabs */}
                    <div className="max-w-md mx-auto mb-8">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'card'
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <FiCreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-400'
                                    }`} />
                                <span className={`text-sm font-medium ${paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                    Tarjeta Crédito/Débito
                                </span>
                            </button>

                            <button
                                onClick={() => setPaymentMethod('pse')}
                                className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'pse'
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <FiDollarSign className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'pse' ? 'text-primary-600' : 'text-gray-400'
                                    }`} />
                                <span className={`text-sm font-medium ${paymentMethod === 'pse' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                    PSE
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Payment Content */}
                    <motion.div
                        key={paymentMethod}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {paymentMethod === 'card' ? (
                            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
                                {/* Card Preview */}
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

                                {/* Card Form */}
                                <div className="card p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6">Datos de la Tarjeta</h2>
                                    <PaymentForm
                                        onSubmit={handleCardPayment}
                                        onCardDataChange={handleCardDataChange}
                                        onCVVFocus={() => setIsCVVFocused(true)}
                                        onCVVBlur={() => setIsCVVFocused(false)}
                                        isProcessing={isProcessing}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto">
                                <div className="card p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6">Pago con PSE</h2>
                                    <PSEForm
                                        onSubmit={handlePSEPayment}
                                        isProcessing={isProcessing}
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Security Badge */}
                    <div className="max-w-2xl mx-auto mt-12 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Pago 100% seguro y encriptado</span>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Payment;
