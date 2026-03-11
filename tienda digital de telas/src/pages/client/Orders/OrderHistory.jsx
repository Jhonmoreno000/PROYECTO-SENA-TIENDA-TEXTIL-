import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiDownload, FiEye, FiFilter, FiCalendar } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import clientDashboardLinks from '../../../data/clientDashboardLinks';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../utils/formatters';

function OrderHistory() {
    const { orders } = useMetrics();
    const { user } = useAuth();
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    

    // Filter orders for current client
    const clientOrders = orders
        .filter(order => order.clientId === user?.id || true) // Show all for demo
        .filter(order => filterStatus === 'all' || order.status === filterStatus)
        .filter(order =>
            searchTerm === '' ||
            order.id.toString().includes(searchTerm) ||
            (order.trackingNumber && order.trackingNumber.includes(searchTerm))
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            cutting: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            packed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
            shipped: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
            delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    const handleDownloadInvoice = (orderId) => {
        // Mock download - in real app would generate PDF
        alert(`Descargando factura del pedido #${orderId}`);
    };

    return (
        <DashboardLayout title="Historial de Pedidos" links={clientDashboardLinks}>
            <BackButton to="/cliente" label="Volver a Mi Panel" />
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiPackage className="w-5 h-5 text-primary-600" />
                        <span className="text-sm font-medium text-gray-500">Total Pedidos</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{clientOrders.length}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">En Proceso</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {clientOrders.filter(o => ['paid', 'cutting', 'packed'].includes(o.status)).length}
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Enviados</p>
                    <p className="text-3xl font-bold text-cyan-600">
                        {clientOrders.filter(o => o.status === 'shipped').length}
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Entregados</p>
                    <p className="text-3xl font-bold text-green-600">
                        {clientOrders.filter(o => o.status === 'delivered').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Buscar por # de pedido o guía..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="cutting">En Corte</option>
                    <option value="packed">Empacado</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                </select>
            </div>

            {/* Orders List */}
            {clientOrders.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No hay pedidos
                    </h3>
                    <p className="text-gray-500 mb-4">Aún no has realizado ninguna compra</p>
                    <Link
                        to="/catalogo"
                        className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Explorar Catálogo
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {clientOrders.map(order => (
                        <div key={order.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-primary-600 dark:text-primary-400">
                                                Pedido #{order.id}
                                            </h3>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <FiCalendar className="w-4 h-4" />
                                                {new Date(order.date).toLocaleDateString('es-CO', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            {order.trackingNumber && (
                                                <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                    Guía: {order.trackingNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(order.total)}
                                        </p>
                                        <p className="text-sm text-gray-500">{order.items || 1} producto(s)</p>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].slice(0, order.items || 1).map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white dark:border-slate-800"
                                            />
                                        ))}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {order.productNames || 'Telas variadas'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {order.totalMeters || '5.0'}m total
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        to={`/cliente/pedidos/rastreo?id=${order.id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        <FiEye className="w-4 h-4" />
                                        Ver Detalles
                                    </Link>
                                    <button
                                        onClick={() => handleDownloadInvoice(order.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        <FiDownload className="w-4 h-4" />
                                        Factura
                                    </button>
                                    {order.status === 'delivered' && (
                                        <Link
                                            to={`/cliente/soporte/nuevo?orderId=${order.id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 transition-colors"
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
        </DashboardLayout>
    );
}

export default OrderHistory;
