import React, { useState } from 'react';
import { FiZap, FiClock } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { identifyDeadStock, identifyBestsellers } from '../../../utils/analyticsUtils';
import { formatCurrency } from '../../../utils/formatters';

function RotationRanking() {
    const { products, orders } = useMetrics();
    const [deadStockThreshold, setDeadStockThreshold] = useState(30);

    const dashboardLinks = [
        { label: 'Mapa de Ventas', path: '/admin/analytics/mapa-ventas' },
        { label: 'Rotación', path: '/admin/analytics/rotacion' },
        { label: 'Devoluciones', path: '/admin/analytics/devoluciones' },
        { label: 'Proyección', path: '/admin/analytics/proyeccion' },
    ];

    const deadStock = identifyDeadStock(products, orders, deadStockThreshold);
    const bestsellers = identifyBestsellers(products, orders, 10);

    return (
        <DashboardLayout title="Análisis de Rotación de Inventario" links={dashboardLinks}>
            <BackButton />
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiZap className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-500">Bestsellers</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{bestsellers.length}</p>
                </div>
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiClock className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-gray-500">Stock Muerto</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{deadStock.length}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Total Productos</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{products.length}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Umbral Actual</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={deadStockThreshold}
                            onChange={(e) => setDeadStockThreshold(parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border rounded text-center"
                        />
                        <span className="text-sm">días</span>
                    </div>
                </div>
            </div>

            {/* Bestsellers */}
            <div className="card mb-8">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-green-600">⚡ Top 10 Bestsellers</h3>
                    <p className="text-sm text-gray-500 mt-1">Productos con mejor rotación</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Ranking</th>
                                <th className="px-6 py-4 text-left">Producto</th>
                                <th className="px-6 py-4 text-right">Ventas</th>
                                <th className="px-6 py-4 text-right">Ingresos</th>
                                <th className="px-6 py-4 text-right">Velocidad</th>
                                <th className="px-6 py-4 text-left">Categoría</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {bestsellers.map((product, index) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index < 3
                                            ? index === 0
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                : index === 1
                                                    ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                                        <p className="text-xs text-gray-500">ID: {product.id}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            {product.salesCount} unidades
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(product.revenue)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-green-600">
                                        {product.velocity.toFixed(2)} /día
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            {product.category}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dead Stock */}
            <div className="card">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-red-50 dark:bg-red-900/10">
                    <h3 className="font-bold text-lg text-red-600">⚠️ Stock Muerto (Sin ventas en {deadStockThreshold} días)</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">Productos que requieren atención inmediata</p>
                </div>

                {deadStock.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiZap className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">¡Excelente rotación!</p>
                        <p className="text-gray-500">No hay productos con stock muerto</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-left">Producto</th>
                                    <th className="px-6 py-4 text-left">Categoría</th>
                                    <th className="px-6 py-4 text-right">Días Sin Venta</th>
                                    <th className="px-6 py-4 text-right">Precio</th>
                                    <th className="px-6 py-4 text-left">Recomendación</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {deadStock.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                                            <p className="text-xs text-gray-500">ID: {product.id}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-red-600">
                                                {product.daysWithoutSale} días
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">
                                            {formatCurrency(product.price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                💡 {product.recommendation}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default RotationRanking;
