import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import { useCart } from '../context/CartContext';

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, getCartTotal } = useCart();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        notes: '',
    });

    // Redirigir si el carrito está vacío
    React.useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/carrito');
        }
    }, [cartItems, navigate]);

    const handleSubmit = () => {
        // Generar número de orden
        const orderNumber = `DD${Date.now().toString().slice(-8)}`;

        // Guardar datos del pedido en localStorage
        const orderData = {
            orderNumber,
            items: cartItems,
            customerInfo: formData,
            subtotal: getCartTotal(),
            shipping: getCartTotal() >= 100000 ? 0 : 15000,
            tax: getCartTotal() * 0.19,
            total: getCartTotal() + (getCartTotal() >= 100000 ? 0 : 15000) + (getCartTotal() * 0.19),
            date: new Date().toISOString(),
        };

        localStorage.setItem('lastOrder', JSON.stringify(orderData));

        // Redirigir a página de pago
        navigate('/pago');
    };

    if (cartItems.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 section-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        Finalizar Compra
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Completa tu información para procesar el pedido
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="card p-6 md:p-8">
                            <CheckoutForm
                                onSubmit={handleSubmit}
                                formData={formData}
                                setFormData={setFormData}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <OrderSummary formData={formData} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Checkout;
