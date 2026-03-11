import React, { useState } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiAlertCircle, FiPackage } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import BarChart from '../../components/dashboard/BarChart';
import { useMetrics } from '../../context/MetricsContext';
import { getAllSellersMetrics } from '../../utils/metricsUtils';
import { formatCurrency } from '../../utils/formatters';
import adminDashboardLinks from '../../data/adminDashboardLinks';

function SellerMetrics() {
    const { users, orders, bugReports } = useMetrics();
    const [selectedSeller, setSelectedSeller] = useState(null);
    const sellers = users.filter(u => u.role === 'seller');
    const sellersWithMetrics = getAllSellersMetrics(sellers, orders, bugReports);

    // Datos para el gráfico de comparación
    const chartData = sellersWithMetrics.map(seller => ({
        name: seller.name.split(' ')[0], // Solo primer nombre
        value: seller.metrics.totalSales
    }));

    const handleSellerClick = (seller) => {
        setSelectedSeller(selectedSeller?.id === seller.id ? null : seller);
    };

    return (
        <DashboardLayout title="Métricas por Vendedor" links={adminDashboardLinks}>
            <BackButton />
            {/* Gráfico de comparación */}
            <div className="card p-6 mb-8">
                <BarChart
                    data={chartData}
                    title="Comparación de Ventas por Vendedor"
                    height={300}
                    color="#3B82F6"
                />
            </div>

            {/* Tabla de vendedores */}
            <div className="card">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">Desempeño de Vendedores</h2>
                    <p className="text-sm text-gray-500 mt-1">Haz clic en un vendedor para ver detalles</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold text-left">
                            <tr>
                                <th className="px-6 py-4">Vendedor</th>
                                <th className="px-6 py-4">Ventas Totales</th>
                                <th className="px-6 py-4">Pedidos</th>
                                <th className="px-6 py-4">Ticket Promedio</th>
                                <th className="px-6 py-4">Reportes</th>
                                <th className="px-6 py-4">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {sellersWithMetrics.map((seller) => (
                                <React.Fragment key={seller.id}>
                                    <tr
                                        onClick={() => handleSellerClick(seller)}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                                                    {seller.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{seller.name}</div>
                                                    <div className="text-sm text-gray-500">{seller.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(seller.metrics.totalSales)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 dark:text-white">
                                                {seller.metrics.totalOrders}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {seller.metrics.completedOrders} completados
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm">
                                            {formatCurrency(seller.metrics.averageTicket)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${seller.metrics.bugReportsCount === 0
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : seller.metrics.bugReportsCount <= 2
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {seller.metrics.bugReportsCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${seller.active
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                }`}>
                                                {seller.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* Detalles expandidos */}
                                    {selectedSeller?.id === seller.id && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-6 bg-gray-50 dark:bg-slate-800/30">
                                                <div className="grid md:grid-cols-4 gap-4">
                                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <FiDollarSign className="w-5 h-5 text-green-600" />
                                                            <span className="text-sm font-medium text-gray-500">Ingresos Generados</span>
                                                        </div>
                                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                            {formatCurrency(seller.metrics.totalSales)}
                                                        </p>
                                                    </div>

                                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <FiShoppingBag className="w-5 h-5 text-blue-600" />
                                                            <span className="text-sm font-medium text-gray-500">Pedidos Completados</span>
                                                        </div>
                                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                            {seller.metrics.completedOrders}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {seller.metrics.pendingOrders} pendientes
                                                        </p>
                                                    </div>

                                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <FiPackage className="w-5 h-5 text-orange-600" />
                                                            <span className="text-sm font-medium text-gray-500">Ticket Promedio</span>
                                                        </div>
                                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                            {formatCurrency(seller.metrics.averageTicket)}
                                                        </p>
                                                    </div>

                                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <FiAlertCircle className="w-5 h-5 text-red-600" />
                                                            <span className="text-sm font-medium text-gray-500">Reportes Recibidos</span>
                                                        </div>
                                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                            {seller.metrics.bugReportsCount}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Tasa: {seller.metrics.totalOrders > 0
                                                                ? ((seller.metrics.bugReportsCount / seller.metrics.totalOrders) * 100).toFixed(1)
                                                                : 0}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resumen general */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="card p-6">
                    <p className="text-gray-500 text-sm font-bold uppercase mb-2">Mejor Vendedor</p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {sellersWithMetrics[0]?.name || 'N/A'}
                    </h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                        {sellersWithMetrics[0] ? formatCurrency(sellersWithMetrics[0].metrics.totalSales) : '$0'}
                    </p>
                </div>

                <div className="card p-6">
                    <p className="text-gray-500 text-sm font-bold uppercase mb-2">Ventas Promedio</p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                            sellersWithMetrics.reduce((sum, s) => sum + s.metrics.totalSales, 0) / sellersWithMetrics.length || 0
                        )}
                    </h3>
                    <p className="text-sm text-gray-500">por vendedor</p>
                </div>

                <div className="card p-6">
                    <p className="text-gray-500 text-sm font-bold uppercase mb-2">Total Reportes</p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {sellersWithMetrics.reduce((sum, s) => sum + s.metrics.bugReportsCount, 0)}
                    </h3>
                    <p className="text-sm text-gray-500">en todos los vendedores</p>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default SellerMetrics;

