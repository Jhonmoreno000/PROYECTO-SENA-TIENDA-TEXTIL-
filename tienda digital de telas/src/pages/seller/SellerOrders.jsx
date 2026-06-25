import React, { useState } from 'react';
import { ShoppingBag, Truck, Check, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import sellerDashboardLinks from '../../data/sellerDashboardLinks';
import BackButton from '../../components/dashboard/BackButton';
import { useMetrics } from '../../context/MetricsContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function SellerOrders() {
    const { user } = useAuth();
    const { orders, getOrdersBySeller, updateOrderStatus, users } = useMetrics();
    const { showNotification } = useNotification();
    const [filterStatus, setFilterStatus] = useState('all');

    

    // Obtener solo pedidos del vendedor actual
    const sellerOrders = getOrdersBySeller(user?.id);

    // Filtrar por estado
    const filteredOrders = filterStatus === 'all'
        ? sellerOrders
        : sellerOrders.filter(order => order.status === filterStatus);

    const handleStatusChange = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus);
        showNotification('success', `Estado del pedido actualizado a ${getStatusLabel(newStatus)}`);
    };

    const getStatusLabel = (status) => {
        const labels = {
            preparing: 'Preparando',
            shipped: 'Enviado',
            delivered: 'Entregado'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            preparing: 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400',
            shipped: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/10 dark:text-blue-400',
            delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400'
        };
        return colors[status] || 'bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400';
    };

    const getStatusIcon = (status) => {
        const icons = {
            preparing: Clock,
            shipped: Truck,
            delivered: Check
        };
        return icons[status] || ShoppingBag;
    };

    const getClientName = (clientId) => {
        const client = users.find(u => u.id === clientId);
        return client?.name || 'Cliente Desconocido';
    };

    return (
        <DashboardLayout title="Gestión de Pedidos" links={sellerDashboardLinks}>
            <BackButton to="/vendedor/productos" label="Volver a Mi Panel" />
            {/* Estadísticas rápidas */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold mb-1">Total Pedidos</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {sellerOrders.length}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 dark:bg-slate-800 dark:border-slate-700">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold mb-1">Preparando</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {sellerOrders.filter(o => o.status === 'preparing').length}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-yellow-50 border border-yellow-100 flex items-center justify-center text-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-800">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold mb-1">Enviados</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {sellerOrders.filter(o => o.status === 'shipped').length}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 dark:bg-blue-900/20 dark:border-blue-800">
                            <Truck className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold mb-1">Entregados</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {sellerOrders.filter(o => o.status === 'delivered').length}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 dark:bg-emerald-900/20 dark:border-emerald-800">
                            <Check className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de pedidos */}
            <div className="card">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold">Mis Pedidos</h2>
                            <p className="text-sm text-gray-500 mt-1">{filteredOrders.length} pedidos</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${filterStatus === 'all'
                                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilterStatus('preparing')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${filterStatus === 'preparing'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Preparando
                            </button>
                            <button
                                onClick={() => setFilterStatus('shipped')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${filterStatus === 'shipped'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Enviados
                            </button>
                            <button
                                onClick={() => setFilterStatus('delivered')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${filterStatus === 'delivered'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Entregados
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs text-slate-500 font-semibold uppercase tracking-wider text-left border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Pedido</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredOrders.map((order) => {
                                const StatusIcon = getStatusIcon(order.status);
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">#{order.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {getClientName(order.clientId)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.date).toLocaleDateString('es-CO', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300">
                                                {order.items} items
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <StatusIcon className={`w-4 h-4 ${order.status === 'preparing' ? 'text-yellow-600' : order.status === 'shipped' ? 'text-blue-600' : 'text-emerald-600'}`} />
                                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {order.status === 'preparing' && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'shipped')}
                                                        className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                                                    >
                                                        Marcar Enviado
                                                    </button>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'delivered')}
                                                        className="px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors"
                                                    >
                                                        Marcar Entregado
                                                    </button>
                                                )}
                                                {order.status === 'delivered' && (
                                                    <span className="px-3 py-1 text-sm text-gray-400">
                                                        Completado
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="p-12 text-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {filterStatus === 'all'
                                ? 'No tienes pedidos aún'
                                : `No hay pedidos en estado "${getStatusLabel(filterStatus)}"`}
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default SellerOrders;
