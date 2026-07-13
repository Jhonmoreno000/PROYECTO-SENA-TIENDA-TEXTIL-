import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    ShoppingBag, 
    Download, 
    Eye, 
    Calendar, 
    Package, 
    Search, 
    Filter,
    ArrowRight,
    Truck,
    CheckCircle2
} from 'lucide-react';

import DashboardLayout from '../../../components/layouts/DashboardLayout';
import AnimatedPage from '../../../components/AnimatedPage';
import clientDashboardLinks from '../../../data/clientDashboardLinks';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { useAuth } from '../../../context/AuthContext';
import { useProducts } from '../../../context/ProductContext';
import { formatCurrency } from '../../../utils/formatters';

// ---------------------------------------------------------------------------
// Funciones Auxiliares para Estados
// ---------------------------------------------------------------------------
function getStatusBadge(status) {
    const styles = {
        pending:    'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50',
        paid:       'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50',
        cutting:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
        packed:     'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50',
        shipped:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50',
        delivered:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
        cancelled:  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
    };
    
    const labels = {
        pending: 'Pendiente',
        paid: 'Pagado',
        cutting: 'En Corte',
        packed: 'Empacado',
        shipped: 'Enviado',
        delivered: 'Entregado',
        cancelled: 'Cancelado'
    };

    return (
        <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
            {labels[status] || status}
        </span>
    );
}

function OrderHistory() {
    const { orders } = useMetrics();
    const { products } = useProducts();
    const { user } = useAuth();
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar pedidos para el cliente actual
    const clientOrders = orders
        .filter(order => order.clientId === user?.id || true) // Show all for demo
        .filter(order => filterStatus === 'all' || order.status === filterStatus)
        .filter(order =>
            searchTerm === '' ||
            order.id.toString().includes(searchTerm) ||
            (order.trackingNumber && order.trackingNumber.includes(searchTerm))
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalOrders = orders.filter(order => order.clientId === user?.id || true).length;
    const activeOrders = orders.filter(o => (o.clientId === user?.id || true) && ['paid', 'cutting', 'packed', 'shipped'].includes(o.status)).length;
    const deliveredOrders = orders.filter(o => (o.clientId === user?.id || true) && o.status === 'delivered').length;

    const handleDownloadInvoice = (orderId) => {
        // Mock download - en una app real generaría PDF
        alert(`Descargando factura del pedido #${orderId}`);
    };

    return (
        <DashboardLayout title="Historial de Pedidos" links={clientDashboardLinks}>
            <AnimatedPage>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <BackButton to="/cliente" label="Volver a Mi Panel" />
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4 tracking-tight">
                            Mis Pedidos
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                            Rastrea, administra y revisa el historial de tus compras.
                        </p>
                    </div>
                </div>

                {/* ================================================================
                    TARJETAS DE RESUMEN
                ================================================================ */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6 flex items-center gap-5 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Total Pedidos</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{totalOrders}</p>
                        </div>
                    </div>

                    <div className="card p-6 flex items-center gap-5 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-900/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                            <Truck className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">En Proceso</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{activeOrders}</p>
                        </div>
                    </div>

                    <div className="card p-6 flex items-center gap-5 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Entregados</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{deliveredOrders}</p>
                        </div>
                    </div>
                </div>

                {/* ================================================================
                    FILTROS Y BÚSQUEDA
                ================================================================ */}
                <div className="card p-4 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por # de pedido o número de guía..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-medium"
                        />
                    </div>
                    <div className="relative min-w-[220px]">
                        <Filter className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-medium appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendiente</option>
                            <option value="paid">Pagado</option>
                            <option value="cutting">En Corte</option>
                            <option value="packed">Empacado</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* ================================================================
                    LISTA DE PEDIDOS
                ================================================================ */}
                {clientOrders.length === 0 ? (
                    <div className="card p-16 text-center flex flex-col items-center justify-center border-dashed border-2">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            No se encontraron pedidos
                        </h3>
                        <p className="text-gray-500 font-medium mb-6 max-w-md">
                            {searchTerm || filterStatus !== 'all' 
                                ? 'Intenta ajustando los filtros de búsqueda para encontrar lo que necesitas.'
                                : 'Aún no has realizado ninguna compra en nuestra tienda.'}
                        </p>
                        {!(searchTerm || filterStatus !== 'all') && (
                            <Link
                                to="/catalogo"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Explorar Catálogo <ArrowRight className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {clientOrders.map(order => (
                            <div key={order.id} className="card overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 group">
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                        
                                        {/* Info Principal del Pedido */}
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-4 mb-3">
                                                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                                    Pedido #{String(order.id).padStart(4, '0')}
                                                </h3>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                                <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {new Date(order.date).toLocaleDateString('es-CO', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                                {order.trackingNumber && (
                                                    <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 font-mono text-xs">
                                                        <Truck className="w-3.5 h-3.5 text-gray-400" />
                                                        Guía: {order.trackingNumber}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="md:text-right bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Pagado</p>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">
                                                {formatCurrency(order.total)}
                                            </p>
                                            <p className="text-xs font-medium text-gray-500 mt-1">{order.items || 1} producto(s)</p>
                                        </div>
                                    </div>

                                    {/* Preview de Productos */}
                                    <div className="flex items-center gap-4 p-4 bg-gray-50/80 dark:bg-slate-800/30 rounded-xl border border-gray-100 dark:border-slate-700/50 mb-6 group-hover:bg-gray-50 dark:group-hover:bg-slate-800/50 transition-colors">
                                        <div className="flex -space-x-3">
                                            {(order.productIds ? order.productIds.slice(0, 3) : [null, null, null].slice(0, order.items || 1)).map((id, i) => {
                                                const productItem = id ? (products?.find(p => p.id === id)) : null;
                                                return (
                                                    <div key={i} className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white dark:border-slate-800 bg-white shadow-sm">
                                                        {productItem?.images?.[0] ? (
                                                            <img
                                                                src={productItem.images[0]}
                                                                alt="Producto"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                                <Package className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {order.items > 3 && (
                                                <div className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm z-10">
                                                    +{order.items - 3}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white truncate">
                                                {order.productNames || 'Telas variadas'}
                                            </p>
                                            <p className="text-sm font-medium text-gray-500">
                                                {order.totalMeters || '5.0'} metros totales
                                            </p>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        <Link
                                            to={`/cliente/pedidos/rastreo?id=${order.id}`}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg shadow-gray-900/10 dark:shadow-white/10"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Ver Detalles
                                        </Link>
                                        
                                        <button
                                            onClick={() => handleDownloadInvoice(order.id)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <Download className="w-4 h-4 text-gray-400" />
                                            Factura
                                        </button>

                                        {order.status === 'delivered' && (
                                            <Link
                                                to={`/cliente/soporte/nuevo?orderId=${order.id}`}
                                                className="ml-auto flex items-center gap-2 px-5 py-2.5 text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                                            >
                                                Reportar Problema
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default OrderHistory;
