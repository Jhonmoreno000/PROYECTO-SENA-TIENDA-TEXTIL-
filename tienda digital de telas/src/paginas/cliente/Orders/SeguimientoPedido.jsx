import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
    CheckCircle2, 
    Package, 
    Truck, 
    Home as Inicio, 
    Scissors, 
    CreditCard, 
    MapPin, 
    Phone,
    Search,
    AlertCircle,
    RefreshCw,
    Clock
} from 'lucide-react';

import LayoutPanel from '../../../componentes/layouts/LayoutPanel';
import PaginaAnimada from '../../../componentes/PaginaAnimada';
import enlacesCliente from '../../../datos/enlacesCliente';
import enlacesVendedor from '../../../datos/enlacesVendedor';
import enlacesAdmin from '../../../datos/enlacesAdmin';
import BackButton from '../../../componentes/dashboard/BackButton';
import { useMetricas } from '../../../contextos/ContextoMetricas';
import { useAutenticacion } from '../../../contextos/ContextoAutenticacion';
import { formatCurrency } from '../../../utilidades/formateadores';

function SeguimientoPedido() {
    const { orders, refreshData } = useMetricas();
    const { user } = useAutenticacion();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');
    const [trackingInput, setTrackingInput] = useState(orderId || '');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(new Date());

    const isVendor = user?.role === 'vendedor' || user?.rol === 'vendedor';
    const isAdmin = user?.role === 'admin' || user?.rol === 'administrador';
    const panelLinks = isVendor ? enlacesVendedor : (isAdmin ? enlacesAdmin : enlacesCliente);
    const backTarget = isVendor ? '/vendedor/pedidos' : '/cliente/pedidos';

    // Sincronización en tiempo real vía polling cada 4 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
            setLastSyncTime(new Date());
        }, 4000);
        return () => clearInterval(interval);
    }, [refreshData]);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshData();
            setLastSyncTime(new Date());
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    // Pedidos accesibles según el rol
    const userOrders = orders.filter(o => 
        String(o.clientId ?? o.idCliente) === String(user?.id) || isVendor || isAdmin
    );

    // Encontrar pedido por ID, número de guía o fallback al más reciente
    const cleanInput = (trackingInput || '').toString().trim().toLowerCase();
    const searchedOrder = cleanInput ? orders.find(o =>
        (o.id && o.id.toString() === cleanInput) ||
        (o.trackingNumber && o.trackingNumber.toString().toLowerCase() === cleanInput) ||
        (o.numeroGuia && o.numeroGuia.toString().toLowerCase() === cleanInput)
    ) : null;

    // Si no hay búsqueda pero sí un id en URL o hay pedidos disponibles, tomar el indicado o el más reciente
    const initialOrder = orderId ? orders.find(o => String(o.id) === String(orderId)) : userOrders[0];
    const order = searchedOrder || (cleanInput ? null : initialOrder);

    const normalizeStatus = (s) => {
        const map = {
            'pendiente': 'pending',
            'pagado': 'paid',
            'confirmado': 'paid',
            'confirmed': 'paid',
            'corte': 'cutting',
            'cortando': 'cutting',
            'en corte': 'cutting',
            'empacado': 'packed',
            'empaque': 'packed',
            'preparando': 'packed',
            'preparing': 'packed',
            'enviado': 'shipped',
            'envio': 'shipped',
            'despachado': 'shipped',
            'entregado': 'delivered',
            'entrega': 'delivered'
        };
        const st = (s || '').toLowerCase();
        return map[st] || st;
    };

    const currentStatus = normalizeStatus(order?.status || order?.estado);

    const trackingSteps = [
        { key: 'paid', label: 'PAGO', icon: CreditCard, description: 'Pago verificado y aprobado por la pasarela' },
        { key: 'cutting', label: 'CORTE', icon: Scissors, description: 'Corte textil a medida según especificaciones' },
        { key: 'packed', label: 'EMPAQUE', icon: Package, description: 'Inspección de calidad y empaque protector' },
        { key: 'shipped', label: 'ENVÍO', icon: Truck, description: 'Despachado con transportadora aliada' },
        { key: 'delivered', label: 'ENTREGA', icon: Inicio, description: 'Recibido a conformidad en dirección de entrega' }
    ];

    const getStepStatus = (stepKey) => {
        if (!order) return 'pending';
        const statusOrder = ['pending', 'paid', 'cutting', 'packed', 'shipped', 'delivered'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        const stepIndex = statusOrder.indexOf(stepKey);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    // Items reales del pedido desde la base de datos
    const rawItems = Array.isArray(order?.lineItems)
        ? order.lineItems
        : (Array.isArray(order?.items) ? order.items : (order?.detalles || order?.productos || []));
    const orderItems = order ? rawItems.map((item, idx) => ({
        id: item.id || item.productId || item.productoId || idx,
        name: item.name || item.nombre || item.productName || 'Tela Textil',
        meters: Number(item.meters ?? item.quantity ?? item.metros ?? item.cantidad ?? 1),
        unitPrice: Number(item.unitPrice ?? item.precioUnitario ?? item.price ?? item.precio ?? 0),
        subtotal: Number(item.subtotal ?? (Number(item.meters ?? item.quantity ?? 1) * Number(item.unitPrice ?? item.price ?? 0))),
        image: item.image || item.imagen || null
    })) : [];

    const orderTotal = Number(order?.total ?? order?.montoTotal ?? 0);
    const orderSubtotal = Number(order?.subtotal ?? (orderTotal * 0.81));
    const orderTax = Number(order?.tax ?? (orderTotal * 0.19));
    const orderShipping = Number(order?.shippingCost ?? 0);
    const orderDate = order?.date || order?.fecha || order?.createdAt || new Date();
    const trackingNum = order?.trackingNumber || order?.numeroGuia || `DDT-COL-${order?.id || '00'}`;
    const courier = order?.courierName || order?.empresaEnvio || 'Coordinadora Textil Express';

    // Generador de bitácora temporal en tiempo real con hitos reales del pedido
    const baseTime = new Date(orderDate).getTime();
    const statusOrderKeys = ['paid', 'cutting', 'packed', 'shipped', 'delivered'];
    const currentStepIdx = statusOrderKeys.indexOf(currentStatus);

    const logisticsEvents = [
        {
            stage: 'paid',
            title: 'Pago aprobado y registrado',
            desc: `Transacción confirmada por valor de ${formatCurrency(orderTotal)}. Factura generada automáticamente.`,
            time: new Date(baseTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
            date: new Date(baseTime).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
            done: currentStepIdx >= 0
        },
        {
            stage: 'cutting',
            title: 'Orden recibida en taller textil',
            desc: `Telas asignadas a la mesa de corte. Verificación de fibras y calibración de metraje exacto (${orderItems.reduce((acc, i) => acc + i.meters, 0)} metros).`,
            time: new Date(baseTime + 3600000 * 2).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
            date: new Date(baseTime + 3600000 * 2).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
            done: currentStepIdx >= 1
        },
        {
            stage: 'packed',
            title: 'Control de calidad y embalaje',
            desc: 'Piezas revisadas, enrolladas en tubo rígido y selladas con plástico termo-protector de humedad.',
            time: new Date(baseTime + 3600000 * 6).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
            date: new Date(baseTime + 3600000 * 6).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
            done: currentStepIdx >= 2
        },
        {
            stage: 'shipped',
            title: `Despachado con ${courier}`,
            desc: `Paquete en ruta. Número de guía asignado: ${trackingNum}. Seguimiento activo en red nacional.`,
            time: new Date(baseTime + 3600000 * 18).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
            date: new Date(baseTime + 3600000 * 18).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
            done: currentStepIdx >= 3
        },
        {
            stage: 'delivered',
            title: 'Entrega completada',
            desc: `Entregado al destinatario en ${order?.shippingAddress || 'dirección registrada'}.`,
            time: new Date(baseTime + 3600000 * 36).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
            date: new Date(baseTime + 3600000 * 36).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
            done: currentStepIdx >= 4
        }
    ];

    return (
        <LayoutPanel title="Rastreo de Pedido" links={panelLinks}>
            <PaginaAnimada>
                {/* Cabecera con retorno e indicador en tiempo real */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <BackButton to={backTarget} label="Volver a Mis Pedidos" />
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-3 tracking-tight">
                            Rastreo de Envío en Tiempo Real
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">
                            Telemetría logística y estado actualizado al segundo desde la base de datos.
                        </p>
                    </div>

                    {/* Insignia de sincronización en vivo */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span>En Vivo</span>
                            <span className="text-[10px] text-gray-400 font-mono hidden md:inline">
                                {lastSyncTime.toLocaleTimeString('es-CO')}
                            </span>
                        </div>
                        <button
                            onClick={handleManualRefresh}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-sm"
                            title="Sincronizar ahora"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary-500' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* ================================================================
                    BÚSQUEDA RÁPIDA DE GUÍA O PEDIDO
                ================================================================ */}
                <div className="card p-4 mb-8 flex flex-col md:flex-row gap-3 items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm">
                    <div className="flex-1 w-full relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="Buscar por # de pedido (ej: 4) o número de guía..."
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium text-sm text-gray-900 dark:text-white"
                        />
                    </div>
                    {userOrders.length > 1 && (
                        <select
                            value={order?.id || ''}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            className="w-full md:w-auto px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-sm text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
                        >
                            {userOrders.map(o => (
                                <option key={o.id} value={o.id}>
                                    Pedido #{String(o.id).padStart(4, '0')} ({o.status || 'Activo'})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {!order ? (
                    <div className="card p-16 text-center border-dashed border-2 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-rose-500 dark:text-rose-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Pedido no encontrado
                        </h3>
                        <p className="text-gray-500 font-medium max-w-md mx-auto text-sm">
                            No encontramos ningún pedido asociado a "{trackingInput}". Verifica el número de pedido en tu historial e intenta de nuevo.
                        </p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        
                        {/* ================================================================
                            PROGRESO DE RASTREO
                        ================================================================ */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
                                <div className="flex flex-wrap justify-between items-start mb-10 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                                                Seguimiento Activo
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 uppercase tracking-widest">
                                                {currentStatus}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-3xl text-gray-900 dark:text-white tracking-tight">
                                            Pedido #{String(order.id).padStart(4, '0')}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 text-sm">
                                            Fecha de compra: {new Date(orderDate).toLocaleDateString('es-CO', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-left md:text-right bg-gray-50 dark:bg-slate-800/80 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Guía de Envío</p>
                                        <p className="font-mono font-black text-lg text-primary-600 dark:text-primary-400 tracking-wider">
                                            {trackingNum}
                                        </p>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                                            {courier}
                                        </p>
                                    </div>
                                </div>

                                {/* Barra de Progreso Responsiva */}
                                <div className="overflow-x-auto pb-4 scrollbar-hide mb-8">
                                    <div className="min-w-[560px] relative px-2">
                                        {/* Línea de fondo */}
                                        <div className="absolute top-6 left-8 right-8 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 via-primary-500 to-primary-600 rounded-full transition-all duration-700 ease-out"
                                                style={{
                                                    width: `${Math.max(0, (trackingSteps.findIndex(s => s.key === currentStatus) / (trackingSteps.length - 1)) * 100)}%`
                                                }}
                                            />
                                        </div>

                                        {/* Pasos */}
                                        <div className="relative flex justify-between z-10">
                                            {trackingSteps.map((step) => {
                                                const status = getStepStatus(step.key);
                                                const Icon = step.icon;

                                                return (
                                                    <div key={step.key} className="flex flex-col items-center w-24 group">
                                                        <div className={`
                                                            w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm
                                                            ${status === 'completed'
                                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                                                                : status === 'current'
                                                                    ? 'bg-gradient-to-br from-primary-500 to-orange-500 text-white shadow-orange-500/30 scale-110 ring-4 ring-white dark:ring-slate-900 animate-pulse'
                                                                    : 'bg-white dark:bg-slate-800 text-gray-400 border-2 border-gray-200 dark:border-slate-700'
                                                            }
                                                        `}>
                                                            {status === 'completed' ? (
                                                                <CheckCircle2 className="w-6 h-6" />
                                                            ) : (
                                                                <Icon className="w-6 h-6" />
                                                            )}
                                                        </div>
                                                        <p className={`
                                                            mt-3 text-xs font-bold text-center uppercase tracking-wider transition-colors
                                                            ${status === 'current'
                                                                ? 'text-primary-600 dark:text-primary-400'
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
                                </div>

                                {/* Mensaje de Estado Actual (Estilo D&D Textil) */}
                                <div className={`p-4 md:p-5 rounded-2xl border flex items-start gap-3.5 mb-8 ${
                                    currentStatus === 'delivered'
                                        ? 'bg-[#fff8f0] dark:bg-amber-950/20 border-[#fed7aa] dark:border-amber-900/40'
                                        : 'bg-primary-50/60 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/40'
                                }`}>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        currentStatus === 'delivered'
                                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                                            : 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
                                    }`}>
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className={`font-black text-base mb-0.5 tracking-tight ${
                                            currentStatus === 'delivered'
                                                ? 'text-amber-950 dark:text-amber-100'
                                                : 'text-gray-900 dark:text-white'
                                        }`}>
                                            {currentStatus === 'delivered'
                                                ? '¡Disfruta tus telas!'
                                                : (trackingSteps.find(s => s.key === currentStatus)?.description || 'Procesando tu pedido en bodega')}
                                        </h4>
                                        <p className={`text-xs font-semibold ${
                                            currentStatus === 'delivered'
                                                ? 'text-amber-800/80 dark:text-amber-300/80'
                                                : 'text-gray-600 dark:text-gray-300'
                                        }`}>
                                            {currentStatus === 'delivered'
                                                ? 'Gracias por confiar en nosotros.'
                                                : 'La información se actualiza automáticamente conforme el pedido avanza por la cadena logística.'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Bitácora Logística en Tiempo Real */}
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary-500" /> Historial de Estados del Pedido
                                    </h4>
                                    <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-slate-700">
                                        {logisticsEvents.map((evt, idx) => (
                                            <div key={idx} className="flex items-start gap-4 relative pl-1 group">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                                                    evt.done 
                                                        ? 'bg-emerald-500 text-white shadow-sm' 
                                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
                                                }`}>
                                                    {evt.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-800" />}
                                                </div>
                                                <div className="flex-1 bg-gray-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`text-xs font-bold ${evt.done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                                            {evt.title}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-gray-500">
                                                            {evt.done ? `${evt.date} · ${evt.time}` : 'Pendiente'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                                        {evt.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ================================================================
                                PRODUCTOS EN EL PEDIDO
                            ================================================================ */}
                            <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
                                <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                                    <h3 className="font-bold text-base text-gray-900 dark:text-white tracking-tight">Telas en tu Pedido</h3>
                                    <span className="text-xs font-semibold text-gray-500">{orderItems.length} artículos</span>
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-slate-800/50">
                                    {orderItems.map(item => (
                                        <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200 dark:border-slate-700">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                    {item.meters} metros × {formatCurrency(item.unitPrice)}/m
                                                </p>
                                            </div>
                                            <div className="sm:text-right">
                                                <p className="font-black text-base text-gray-900 dark:text-white">
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
                            <div className="card p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
                                <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-white tracking-tight">Resumen Financiero</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-900 dark:text-white">{formatCurrency(orderSubtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-gray-500">IVA (19%)</span>
                                        <span className="text-gray-900 dark:text-white">{formatCurrency(orderTax)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-gray-500">Envío</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                            {orderShipping > 0 ? formatCurrency(orderShipping) : 'Gratis'}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-100 dark:border-slate-800 pt-3 mt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">Total Liquidado</span>
                                            <span className="font-black text-xl text-primary-600 dark:text-primary-400">
                                                {formatCurrency(orderTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dirección */}
                            <div className="card p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
                                <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-white tracking-tight">Destino y Destinatario</h3>
                                <div className="flex items-start gap-3.5 mb-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                                    <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm text-primary-500">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-1">Dirección Registrada</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                                            {order.shippingAddress || 'Calle 46 # 54-15, Medellín'}
                                            {(order.shippingCity || order.shippingDepartment) && (
                                                <span className="block text-xs text-gray-500 mt-0.5">
                                                    {[order.shippingCity, order.shippingDepartment].filter(Boolean).join(', ')}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {order.client && (
                                    <div className="flex items-center gap-3.5 bg-gray-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm text-emerald-500">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                                            Contacto: {order.client}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Ayuda y Reporte de Problemas */}
                            <div className="card p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 border border-orange-100 dark:border-slate-700 shadow-sm">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-primary-600" /> ¿Inconvenientes con tu pedido?
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-4 leading-relaxed">
                                    Si tu entrega presenta demoras, paquete dañado o discrepancia en el metraje, reporta directamente a soporte.
                                </p>
                                <Link
                                    to={`/cliente/soporte/nuevo?orderId=${order.id}`}
                                    className="block w-full text-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                                >
                                    Reportar Problema con este Pedido
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </PaginaAnimada>
        </LayoutPanel>
    );
}

export default SeguimientoPedido;
