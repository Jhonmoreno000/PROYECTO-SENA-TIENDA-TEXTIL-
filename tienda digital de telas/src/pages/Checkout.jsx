import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import { useCart } from '../context/CartContext';

gsap.registerPlugin(useGSAP);

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, appliedCoupon } = useCart();
    const headerRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', notes: '',
    });

    React.useEffect(() => {
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

    const handleSubmit = () => {
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
            <Header />

            <main className="flex-1 section-container">
                <div ref={headerRef} className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        Finalizar Compra
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Completa tu información para procesar el pedido
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="card p-6 md:p-8">
                            <CheckoutForm onSubmit={handleSubmit} formData={formData} setFormData={setFormData} />
                        </div>
                    </div>
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
