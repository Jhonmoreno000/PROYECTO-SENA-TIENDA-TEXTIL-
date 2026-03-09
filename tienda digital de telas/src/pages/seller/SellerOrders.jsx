import React, { useState } from 'react';
import { FiShoppingBag, FiPackage, FiTruck, FiCheck, FiClock } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
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

    const dashboardLinks = [
        { label: 'Mis Productos', path: '/vendedor/productos', icon: FiPackage },
        { label: 'Pedidos', path: '/vendedor/pedidos', icon: FiShoppingBag },
    ];

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
            preparing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        const icons = {
            preparing: FiClock,
            shipped: FiTruck,
            delivered: FiCheck
        };
        return icons[status] || FiShoppingBag;
    };

    const getClientName = (clientId) => {
        const client = users.find(u => u.id === clientId);
        return client?.name || 'Cliente Desconocido';
    };

    return (
        <DashboardLayout title="Gestión de Pedidos" links={dashboardLinks}>
            <BackButton to="/vendedor/productos" label="Volver a Mi Panel" />
            {/* Estadísticas rápidas */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase mb-1">Total Pedidos</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {sellerOrders.length}
                            </h3>
                        </div>
                        <div className="p-4 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <FiShoppingBag className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase mb-1">Preparando</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {sellerOrders.filter(o => o.status === 'preparing').length}
                            </h3>
                        </div>
                        <div className="p-4 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <FiClock className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase mb-1">Enviados</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {sellerOrders.filter(o => o.status === 'shipped').length}
                            </h3>
                        </div>
                        <div className="p-4 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <FiTruck className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase mb-1">Entregados</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {sellerOrders.filter(o => o.status === 'delivered').length}
                            </h3>
                        </div>
                        <div className="p-4 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <FiCheck className="w-8 h-8" />
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

                        {/* Filtro por estado */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilterStatus('preparing')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'preparing'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Preparando
                            </button>
                            <button
                                onClick={() => setFilterStatus('shipped')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'shipped'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Enviados
                            </button>
                            <button
                                onClick={() => setFilterStatus('delivered')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'delivered'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                Entregados
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold text-left">
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
                                            <div className="flex items-center gap-2">
                                                <StatusIcon className="w-4 h-4" />
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {order.status === 'preparing' && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'shipped')}
                                                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        Marcar Enviado
                                                    </button>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'delivered')}
                                                        className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
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
                        <FiShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
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
