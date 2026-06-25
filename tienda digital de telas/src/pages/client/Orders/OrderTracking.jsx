import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
    CheckCircle2, 
    Package, 
    Truck, 
    Home, 
    Scissors, 
    CreditCard, 
    MapPin, 
    Phone,
    Search,
    AlertCircle
} from 'lucide-react';

import DashboardLayout from '../../../components/layouts/DashboardLayout';
import AnimatedPage from '../../../components/AnimatedPage';
import clientDashboardLinks from '../../../data/clientDashboardLinks';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { formatCurrency } from '../../../utils/formatters';

function OrderTracking() {
    const { orders } = useMetrics();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');
    const [trackingInput, setTrackingInput] = useState(orderId || '');

    // Encontrar pedido por ID o número de guía
    const order = orders.find(o =>
        o.id.toString() === trackingInput ||
        o.trackingNumber === trackingInput
    );

    const trackingSteps = [
        { key: 'paid', label: 'Pago', icon: CreditCard, description: 'Tu pago ha sido confirmado' },
        { key: 'cutting', label: 'Corte', icon: Scissors, description: 'Estamos cortando tu tela' },
        { key: 'packed', label: 'Empaque', icon: Package, description: 'Tu pedido está listo para envío' },
        { key: 'shipped', label: 'Envío', icon: Truck, description: 'En camino a tu dirección' },
        { key: 'delivered', label: 'Entrega', icon: Home, description: '¡Disfruta tus telas!' }
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
        <DashboardLayout title="Rastreo de Pedido" links={clientDashboardLinks}>
            <AnimatedPage>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <BackButton to="/cliente/pedidos" label="Volver a Mis Pedidos" />
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4 tracking-tight">
                            Rastreo de Envío
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                            Sigue el progreso de tu pedido en tiempo real.
                        </p>
                    </div>
                </div>

                {/* ================================================================
                    BÚSQUEDA
                ================================================================ */}
                <div className="card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/10 dark:to-rose-900/10 border-orange-100 dark:border-orange-900/30">
                    <div className="flex-1 w-full relative">
                        <Search className="w-5 h-5 text-orange-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="Ingresa el número de pedido o guía de envío..."
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-orange-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                        />
                    </div>
                    <button className="w-full md:w-auto px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-bold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5">
                        Buscar
                    </button>
                </div>

                {!order && trackingInput ? (
                    <div className="card p-16 text-center border-dashed border-2 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-rose-500 dark:text-rose-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Pedido no encontrado
                        </h3>
                        <p className="text-gray-500 font-medium">
                            No encontramos ningún pedido o guía asociada al número "{trackingInput}". Verifica e intenta de nuevo.
                        </p>
                    </div>
                ) : order ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                        
                        {/* ================================================================
                            PROGRESO DE RASTREO
                        ================================================================ */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="card p-6 md:p-8">
                                <div className="flex flex-wrap justify-between items-start mb-10 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
                                            Estado Actual
                                        </p>
                                        <h3 className="font-black text-3xl text-gray-900 dark:text-white tracking-tight">
                                            Pedido #{String(order.id).padStart(4, '0')}
                                        </h3>
                                        <p className="text-gray-500 font-medium mt-2">
                                            Fecha de compra: {new Date(order.date).toLocaleDateString('es-CO', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    {order.trackingNumber && (
                                        <div className="text-left md:text-right bg-orange-50 dark:bg-slate-800/80 p-4 rounded-xl border border-orange-100 dark:border-slate-700">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Guía de Envío</p>
                                            <p className="font-mono font-black text-xl text-orange-600 dark:text-orange-400 tracking-wider">
                                                {order.trackingNumber}
                                            </p>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                                                {order.courierName || 'Servientrega'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Barra de Progreso */}
                                <div className="relative mb-12">
                                    {/* Línea de fondo */}
                                    <div className="absolute top-6 left-6 right-6 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${(trackingSteps.findIndex(s => s.key === order.status) / (trackingSteps.length - 1)) * 100}%`
                                            }}
                                        />
                                    </div>

                                    {/* Pasos */}
                                    <div className="relative flex justify-between z-10">
                                        {trackingSteps.map((step, index) => {
                                            const status = getStepStatus(step.key);
                                            const Icon = step.icon;

                                            return (
                                                <div key={step.key} className="flex flex-col items-center w-20 md:w-24 group">
                                                    <div className={`
                                                        w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm
                                                        ${status === 'completed'
                                                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30'
                                                            : status === 'current'
                                                                ? 'bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-orange-500/40 scale-110 ring-4 ring-white dark:ring-slate-900'
                                                                : 'bg-white dark:bg-slate-800 text-gray-400 border-2 border-gray-100 dark:border-slate-700'
                                                        }
                                                    `}>
                                                        {status === 'completed' ? (
                                                            <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7" />
                                                        ) : (
                                                            <Icon className="w-6 h-6" />
                                                        )}
                                                    </div>
                                                    <p className={`
                                                        mt-4 text-xs font-bold text-center uppercase tracking-wider transition-colors
                                                        ${status === 'current'
                                                            ? 'text-orange-600 dark:text-orange-400'
                                                            : status === 'completed'
                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                : 'text-gray-400 dark:text-gray-500'
                                                        }
                                                    `}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Mensaje de Estado Actual */}
                                <div className="p-5 md:p-6 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-orange-800 dark:text-orange-300 font-bold text-lg mb-1 tracking-tight">
                                            {trackingSteps.find(s => s.key === order.status)?.description || 'Procesando tu pedido'}
                                        </h4>
                                        {order.estimatedDelivery && order.status !== 'delivered' ? (
                                            <p className="text-sm text-orange-600/80 dark:text-orange-400/80 font-medium">
                                                Fecha estimada de entrega: {new Date(order.estimatedDelivery).toLocaleDateString('es-CO', {
                                                    weekday: 'long', day: 'numeric', month: 'long'
                                                })}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-orange-600/80 dark:text-orange-400/80 font-medium">
                                                Gracias por confiar en nosotros.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ================================================================
                                PRODUCTOS EN EL PEDIDO
                            ================================================================ */}
                            <div className="card overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">Productos en tu Pedido</h3>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-slate-800/50">
                                    {orderItems.map(item => (
                                        <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                                    {item.name}
                                                </h4>
                                                <p className="text-sm text-gray-500 font-medium">
                                                    {item.meters} metros × {formatCurrency(item.unitPrice)}/m
                                                </p>
                                            </div>
                                            <div className="sm:text-right">
                                                <p className="font-black text-lg text-gray-900 dark:text-white">
                                                    {formatCurrency(item.meters * item.unitPrice)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ================================================================
                            SIDEBAR: RESUMEN Y DIRECCIÓN
                        ================================================================ */}
                        <div className="space-y-6">
                            {/* Resumen Monetario */}
                            <div className="card p-6">
                                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white tracking-tight">Resumen de Compra</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-900 dark:text-white">{formatCurrency(order.total * 0.81)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-gray-500">IVA (19%)</span>
                                        <span className="text-gray-900 dark:text-white">{formatCurrency(order.total * 0.19)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-gray-500">Envío</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Gratis</span>
                                    </div>
                                    <div className="border-t border-gray-100 dark:border-slate-800 pt-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">Total Pagado</span>
                                            <span className="font-black text-2xl text-orange-600 dark:text-orange-400">
                                                {formatCurrency(order.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dirección */}
                            <div className="card p-6">
                                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white tracking-tight">Detalles de Entrega</h3>
                                <div className="flex items-start gap-4 mb-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <MapPin className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">Mi Casa</p>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                            Cra 7 #45-23, Apto 502<br />
                                            Chapinero, Bogotá<br />
                                            Cundinamarca
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <Phone className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">300 123 4567</span>
                                </div>
                            </div>

                            {/* Ayuda */}
                            {order.status === 'delivered' && (
                                <Link
                                    to={`/cliente/soporte/nuevo?orderId=${order.id}`}
                                    className="block w-full text-center px-4 py-4 bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold transition-all shadow-sm"
                                >
                                    ¿Problema con tu pedido? Repórtalo
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="card p-16 text-center border-dashed border-2 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                            <Truck className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Rastrea tu Pedido
                        </h3>
                        <p className="text-gray-500 font-medium">
                            Ingresa tu número de pedido o guía de envío en el buscador superior para ver en qué estado se encuentra tu compra.
                        </p>
                    </div>
                )}
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default OrderTracking;
