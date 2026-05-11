import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CheckCircle, Package, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { formatCurrency, formatDate } from '../utils/formatters';

gsap.registerPlugin(useGSAP);

function OrderConfirmation() {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [orderData, setOrderData] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const savedOrder = localStorage.getItem('lastOrder');
        if (!savedOrder) { navigate('/'); return; }
        const order = JSON.parse(savedOrder);
        setOrderData(order);
        clearCart();
        return () => { localStorage.removeItem('lastOrder'); };
    }, [clearCart, navigate]);

    useGSAP(() => {
        if (!containerRef.current || !orderData) return;

        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        tl.fromTo(containerRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 });

        const icon = containerRef.current.querySelector('.success-icon');
        if (icon) tl.fromTo(icon, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)" }, "-=0.2");

        const sections = containerRef.current.querySelectorAll('.reveal-section');
        tl.fromTo(sections, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, "-=0.2");
    }, { scope: containerRef, dependencies: [orderData] });

    if (!orderData) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 section-container">
                <div ref={containerRef} className="max-w-3xl mx-auto text-center">
                    {/* Success Icon */}
                    <div className="success-icon w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>

                    {/* Title */}
                    <h1 className="reveal-section text-3xl md:text-4xl font-display font-bold mb-4">
                        ¡Pedido Confirmado!
                    </h1>

                    <p className="reveal-section text-xl text-gray-600 dark:text-gray-400 mb-8">
                        Gracias por tu compra, {orderData.customerInfo.fullName}
                    </p>

                    {/* Order Number */}
                    <div className="reveal-section card p-6 mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            <h2 className="text-2xl font-bold">Número de Orden</h2>
                        </div>
                        <div className="text-4xl font-mono font-bold text-primary-600 dark:text-primary-400 mb-2">
                            {orderData.orderNumber}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Fecha: {formatDate(orderData.date)}
                        </p>
                    </div>

                    {/* Order Details */}
                    <div className="reveal-section card p-6 text-left mb-8">
                        <h3 className="text-xl font-bold mb-4">Detalles del Pedido</h3>

                        <div className="space-y-3 mb-6">
                            {orderData.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700 last:border-0">
                                    <div className="flex gap-3">
                                        <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                        <div>
                                            <h4 className="font-semibold">{item.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Cantidad: {item.quantity}m</p>
                                        </div>
                                    </div>
                                    <div className="font-bold">{formatCurrency(item.price * item.quantity)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 border-t border-gray-200 dark:border-slate-700 pt-4">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>{formatCurrency(orderData.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Envío</span>
                                <span>{orderData.shipping === 0 ? <span className="text-green-600 dark:text-green-400">¡Gratis!</span> : formatCurrency(orderData.shipping)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>IVA (19%)</span>
                                <span>{formatCurrency(orderData.tax)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 dark:border-slate-700">
                                <span>Total</span>
                                <span className="text-primary-600 dark:text-primary-400">{formatCurrency(orderData.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="reveal-section card p-6 text-left mb-8">
                        <h3 className="text-xl font-bold mb-4">Información de Envío</h3>
                        <div className="space-y-1 text-gray-600 dark:text-gray-400">
                            <p className="font-semibold text-gray-900 dark:text-white">{orderData.customerInfo.fullName}</p>
                            <p>{orderData.customerInfo.email}</p>
                            <p>{orderData.customerInfo.phone}</p>
                            <p className="mt-2">{orderData.customerInfo.address}</p>
                            <p>{orderData.customerInfo.city}, {orderData.customerInfo.state} {orderData.customerInfo.zipCode}</p>
                            {orderData.customerInfo.notes && <p className="mt-2 italic">Notas: {orderData.customerInfo.notes}</p>}
                        </div>
                    </div>

                    {/* Email Confirmation */}
                    <div className="reveal-section bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <p className="font-semibold text-blue-900 dark:text-blue-300">Confirmación Enviada</p>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            Hemos enviado un correo de confirmación a {orderData.customerInfo.email} con todos los detalles de tu pedido.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="reveal-section flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/" className="btn-primary">Volver al Inicio</Link>
                        <Link to="/catalogo" className="btn-outline">Seguir Comprando</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default OrderConfirmation;
