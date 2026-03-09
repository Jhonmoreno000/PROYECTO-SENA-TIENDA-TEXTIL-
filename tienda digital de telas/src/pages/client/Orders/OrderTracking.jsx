import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiCheck, FiPackage, FiTruck, FiHome, FiScissors, FiCreditCard, FiMapPin, FiPhone } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { formatCurrency } from '../../../utils/formatters';

function OrderTracking() {
    const { orders } = useMetrics();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');
    const [trackingInput, setTrackingInput] = useState(orderId || '');

    const dashboardLinks = [
        { label: 'Historial', path: '/cliente/pedidos' },
        { label: 'Rastrear Envío', path: '/cliente/pedidos/rastreo' },
    ];

    // Find order by ID or tracking number
    const order = orders.find(o =>
        o.id.toString() === trackingInput ||
        o.trackingNumber === trackingInput
    );

    const trackingSteps = [
        { key: 'paid', label: 'Pago Recibido', icon: FiCreditCard, description: 'Tu pago ha sido confirmado' },
        { key: 'cutting', label: 'En Corte', icon: FiScissors, description: 'Estamos cortando tu tela' },
        { key: 'packed', label: 'Empacado', icon: FiPackage, description: 'Tu pedido está listo para envío' },
        { key: 'shipped', label: 'Enviado', icon: FiTruck, description: 'En camino a tu dirección' },
        { key: 'delivered', label: 'Entregado', icon: FiHome, description: '¡Disfruta tus telas!' }
    ];

    const getStepStatus = (stepKey) => {
        if (!order) return 'pending';
        const statusOrder = ['pending', 'paid', 'cutting', 'packed', 'shipped', 'delivered'];
        const currentIndex = statusOrder.indexOf(order.status);
        const stepIndex = statusOrder.indexOf(stepKey);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    // Mock order items for demo
    const orderItems = order ? [
        { id: 1, name: 'Lino Blanco Premium', meters: 3.5, unitPrice: 45000, image: null },
        { id: 2, name: 'Algodón Estampado Flores', meters: 2.0, unitPrice: 32000, image: null }
    ] : [];

    return (
        <DashboardLayout title="Rastrear Envío" links={dashboardLinks}>
            <BackButton to="/cliente" label="Volver a Mi Panel" />
            {/* Search Box */}
            <div className="card p-6 mb-8">
                <h3 className="font-bold text-lg mb-4">Buscar Pedido</h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="Número de pedido o guía de envío..."
                        className="flex-1 px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-lg"
                    />
                    <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                        Buscar
                    </button>
                </div>
            </div>

            {!order && trackingInput ? (
                <div className="card p-12 text-center">
                    <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Pedido no encontrado
                    </h3>
                    <p className="text-gray-500">
                        No encontramos un pedido con el número "{trackingInput}"
                    </p>
                </div>
            ) : order ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Tracking Progress */}
                    <div className="lg:col-span-2">
                        <div className="card p-6 mb-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-bold text-2xl text-gray-900 dark:text-white">
                                        Pedido #{order.id}
                                    </h3>
                                    <p className="text-gray-500 mt-1">
                                        Fecha: {new Date(order.date).toLocaleDateString('es-CO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                {order.trackingNumber && (
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Número de Guía</p>
                                        <p className="font-mono font-bold text-lg text-primary-600">
                                            {order.trackingNumber}
                                        </p>
                                        <p className="text-xs text-gray-400">{order.courierName || 'Servientrega'}</p>
                                    </div>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="relative">
                                {/* Line */}
                                <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 dark:bg-slate-700 rounded-full">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(trackingSteps.findIndex(s => s.key === order.status) / (trackingSteps.length - 1)) * 100}%`
                                        }}
                                    />
                                </div>

                                {/* Steps */}
                                <div className="relative flex justify-between">
                                    {trackingSteps.map((step, index) => {
                                        const status = getStepStatus(step.key);
                                        const Icon = step.icon;

                                        return (
                                            <div key={step.key} className="flex flex-col items-center w-24">
                                                <div className={`
                                                    w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all
                                                    ${status === 'completed'
                                                        ? 'bg-green-500 text-white'
                                                        : status === 'current'
                                                            ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900'
                                                            : 'bg-gray-200 text-gray-400 dark:bg-slate-700'
                                                    }
                                                `}>
                                                    {status === 'completed' ? (
                                                        <FiCheck className="w-6 h-6" />
                                                    ) : (
                                                        <Icon className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <p className={`
                                                    mt-3 text-xs font-medium text-center
                                                    ${status === 'current'
                                                        ? 'text-primary-600 dark:text-primary-400'
                                                        : 'text-gray-500'
                                                    }
                                                `}>
                                                    {step.label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Current Status Message */}
                            <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                <p className="text-primary-800 dark:text-primary-200 font-medium">
                                    {trackingSteps.find(s => s.key === order.status)?.description || 'Procesando tu pedido'}
                                </p>
                                {order.estimatedDelivery && order.status !== 'delivered' && (
                                    <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                                        Entrega estimada: {new Date(order.estimatedDelivery).toLocaleDateString('es-CO', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="card overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                                <h3 className="font-bold text-lg">Productos en tu Pedido</h3>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-slate-700">
                                {orderItems.map(item => (
                                    <div key={item.id} className="p-6 flex gap-4">
                                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {item.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {item.meters} metros × {formatCurrency(item.unitPrice)}/m
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(item.meters * item.unitPrice)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="space-y-6">
                        <div className="card p-6">
                            <h3 className="font-bold text-lg mb-4">Resumen</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>{formatCurrency(order.total * 0.81)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">IVA (19%)</span>
                                    <span>{formatCurrency(order.total * 0.19)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Envío</span>
                                    <span className="text-green-600">Gratis</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mt-3">
                                    <div className="flex justify-between">
                                        <span className="font-bold">Total</span>
                                        <span className="font-bold text-xl text-primary-600">
                                            {formatCurrency(order.total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card p-6">
                            <h3 className="font-bold text-lg mb-4">Dirección de Envío</h3>
                            <div className="flex items-start gap-3">
                                <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Casa</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Cra 7 #45-23, Apto 502<br />
                                        Chapinero, Bogotá<br />
                                        Cundinamarca
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                                <FiPhone className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">300 123 4567</span>
                            </div>
                        </div>

                        {order.status === 'delivered' && (
                            <Link
                                to={`/cliente/soporte/nuevo?orderId=${order.id}`}
                                className="block w-full text-center px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 font-medium transition-colors"
                            >
                                ¿Problema con tu pedido? Repórtalo
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card p-12 text-center">
                    <FiTruck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Rastrea tu Pedido
                    </h3>
                    <p className="text-gray-500">
                        Ingresa tu número de pedido o guía de envío para ver el estado
                    </p>
                </div>
            )}
        </DashboardLayout>
    );
}

export default OrderTracking;
