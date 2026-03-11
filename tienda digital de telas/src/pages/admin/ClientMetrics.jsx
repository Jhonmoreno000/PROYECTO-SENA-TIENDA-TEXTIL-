import React from 'react';
import { FiUsers, FiDollarSign, FiShoppingBag, FiTrendingUp, FiAward } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useMetrics } from '../../context/MetricsContext';
import { getAllClientsMetrics, segmentClients } from '../../utils/metricsUtils';
import { formatCurrency } from '../../utils/formatters';
import adminDashboardLinks from '../../data/adminDashboardLinks';

function ClientMetrics() {
    const { users, orders } = useMetrics();
    const clients = users.filter(u => u.role === 'client');
    const clientsWithMetrics = getAllClientsMetrics(clients, orders);
    const segments = segmentClients(clients, orders);

    // Top clientes
    const topClients = clientsWithMetrics.slice(0, 10);

    return (
        <DashboardLayout title="Métricas por Cliente" links={adminDashboardLinks}>
            <BackButton />
            {/* Segmentación de clientes */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase mb-1">Clientes VIP</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {segments.vip.length}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Más de $1.000.000</p>
                        </div>
                        <div className="p-4 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            <FiAward className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Valor total: {formatCurrency(segments.vip.reduce((sum, c) => sum + c.metrics.totalSpent, 0))}
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase mb-1">Clientes Regulares</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {segments.regular.length}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">$300.000 - $1.000.000</p>
                        </div>
                        <div className="p-4 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <FiUsers className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Valor total: {formatCurrency(segments.regular.reduce((sum, c) => sum + c.metrics.totalSpent, 0))}
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase mb-1">Clientes Nuevos</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {segments.new.length}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Menos de $300.000</p>
                        </div>
                        <div className="p-4 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <FiTrendingUp className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Valor total: {formatCurrency(segments.new.reduce((sum, c) => sum + c.metrics.totalSpent, 0))}
                    </div>
                </div>
            </div>

            {/* Top 10 Clientes */}
            <div className="card">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">Top 10 Clientes</h2>
                    <p className="text-sm text-gray-500 mt-1">Ordenados por valor total de compras</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold text-left">
                            <tr>
                                <th className="px-6 py-4">Posición</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Total Gastado</th>
                                <th className="px-6 py-4">Compras</th>
                                <th className="px-6 py-4">Valor Promedio</th>
                                <th className="px-6 py-4">Frecuencia</th>
                                <th className="px-6 py-4">Última Compra</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {topClients.map((client, index) => (
                                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0
                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            : index === 1
                                                ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                : index === 2
                                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                                            <div className="text-sm text-gray-500">{client.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(client.metrics.totalSpent)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            {client.metrics.totalPurchases} pedidos
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm">
                                        {formatCurrency(client.metrics.averageOrderValue)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {client.metrics.purchaseFrequency > 0
                                            ? `Cada ${Math.round(client.metrics.purchaseFrequency)} días`
                                            : 'Primera compra'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {client.metrics.lastPurchaseDate
                                            ? new Date(client.metrics.lastPurchaseDate).toLocaleDateString('es-CO')
                                            : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Estadísticas generales */}
            <div className="grid md:grid-cols-4 gap-6 mt-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiDollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-500">Valor Promedio Cliente</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                            clientsWithMetrics.reduce((sum, c) => sum + c.metrics.totalSpent, 0) / clientsWithMetrics.length || 0
                        )}
                    </p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiShoppingBag className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-500">Compras Promedio</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(clientsWithMetrics.reduce((sum, c) => sum + c.metrics.totalPurchases, 0) / clientsWithMetrics.length || 0).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">por cliente</p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiAward className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-500">Mejor Cliente</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {topClients[0]?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                        {topClients[0] ? formatCurrency(topClients[0].metrics.totalSpent) : '$0'}
                    </p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiTrendingUp className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-gray-500">Ticket Promedio</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                            clientsWithMetrics.reduce((sum, c) => sum + c.metrics.averageOrderValue, 0) / clientsWithMetrics.length || 0
                        )}
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ClientMetrics;

