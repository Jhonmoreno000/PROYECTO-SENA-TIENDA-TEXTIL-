import React, { useState } from 'react';
import { FiZap, FiClock } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { useProducts } from '../../../context/ProductContext';
import { identifyDeadStock, identifyBestsellers } from '../../../utils/analyticsUtils';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function RotationRanking() {
    const { products: metricsProducts, orders } = useMetrics();
    const { products: apiProducts } = useProducts();
    const products = apiProducts.length > 0 ? apiProducts : metricsProducts;
    const [deadStockThreshold, setDeadStockThreshold] = useState(30);
    const deadStock = identifyDeadStock(products, orders, deadStockThreshold);
    const bestsellers = identifyBestsellers(products, orders, 10);

    return (
        <DashboardLayout title="Análisis de Rotación de Inventario" links={adminDashboardLinks}>
            <BackButton />
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6 border-amber-50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                            <FiZap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bestsellers</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{bestsellers.length}</p>
                </div>
                <div className="card p-6 border-red-50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                            <FiClock className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stock Muerto</span>
                    </div>
                    <p className="text-3xl font-black text-red-600 dark:text-red-400 leading-none">{deadStock.length}</p>
                </div>
                <div className="card p-6 border-indigo-50 dark:border-slate-700/50 rounded-2xl">
                    <div className="flex flex-col h-full justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Total Productos</span>
                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{products.length}</p>
                    </div>
                </div>
                <div className="card p-6 border-gray-100 dark:border-slate-700/50 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Umbral Actual</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={deadStockThreshold}
                            onChange={(e) => setDeadStockThreshold(parseInt(e.target.value))}
                            className="w-16 px-2 py-1.5 border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg text-center font-bold font-mono focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">días</span>
                    </div>
                </div>
            </div>

            {/* Bestsellers */}
            <div className="card border-amber-50 dark:border-slate-800/50 overflow-hidden shadow-xl shadow-amber-500/5 mb-8">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-amber-50/10 dark:bg-amber-900/10">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                        <FiZap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white tracking-tight leading-none">Top 10 Bestsellers</h3>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">Productos con mejor rotación</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/30 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Ranking</th>
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Producto</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Ventas</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Ingresos</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Velocidad</th>
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Categoría</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {bestsellers.map((product, index) => (
                                <tr key={product.id} className="hover:bg-amber-50/20 dark:hover:bg-amber-900/5 transition-colors group">
                                    <td className="p-4">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${index < 3
                                            ? index === 0
                                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                                                : index === 1
                                                    ? 'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-gray-300'
                                                    : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                                            : 'bg-gray-50 text-gray-400 dark:bg-slate-800/50'
                                            }`}>
                                            0{index + 1}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-gray-900 dark:text-white leading-tight">{product.name}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">ID: {String(product.id).padStart(4, '0')}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                            {product.salesCount} UND
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-black text-indigo-600 dark:text-indigo-400">
                                        {formatCurrency(product.revenue)}
                                    </td>
                                    <td className="p-4 text-right font-bold text-gray-500 dark:text-gray-400">
                                        {product.velocity.toFixed(2)} /DÍA
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                                            {product.category || 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dead Stock */}
            <div className="card border-red-50 dark:border-slate-800/50 overflow-hidden shadow-xl shadow-red-500/5">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-red-50/20 dark:bg-red-900/10">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                        <FiClock className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white tracking-tight leading-none">Alerta de Stock Muerto</h3>
                        <p className="text-[11px] font-bold text-red-500 dark:text-red-400 mt-1 uppercase tracking-widest">Sin ventas en {deadStockThreshold} días</p>
                    </div>
                </div>

                {deadStock.length === 0 ? (
                    <div className="p-16 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                            <FiZap className="w-8 h-8 text-emerald-500" />
                        </div>
                        <p className="text-xl font-black text-gray-900 dark:text-white">¡Rotación Saludable!</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">No hay inventario estancado detectado</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/30 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                                    <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Producto</th>
                                    <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Categoría</th>
                                    <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Inactividad</th>
                                    <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Precio</th>
                                    <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Acción Sugerida</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                {deadStock.map(product => (
                                    <tr key={product.id} className="hover:bg-red-50/20 dark:hover:bg-red-900/5 transition-colors group">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900 dark:text-white leading-tight">{product.name}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">ID: {String(product.id).padStart(4, '0')}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                                                {product.category || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="font-black text-red-600 dark:text-red-400">
                                                {product.daysWithoutSale} DÍAS
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-black text-gray-900 dark:text-white">
                                            {formatCurrency(product.price)}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                                 {product.recommendation}
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

