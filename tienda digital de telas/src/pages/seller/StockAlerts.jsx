import React from 'react';
import { FiPackage, FiAlertCircle, FiTrendingDown, FiArchive, FiShoppingBag } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import sellerDashboardLinks from '../../data/sellerDashboardLinks';
import BackButton from '../../components/dashboard/BackButton';
import { useMetrics } from '../../context/MetricsContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

function StockAlerts() {
    const { user } = useAuth();
    const { getProductsBySeller, getBugReportsBySeller, systemConfig } = useMetrics();



    // Obtener solo productos del vendedor actual
    const sellerProducts = getProductsBySeller(user?.id);
    const sellerBugReports = getBugReportsBySeller(user?.id);

    // Filtrar por niveles de stock
    const lowStockThreshold = systemConfig?.lowStockThreshold || 20;
    const criticalStockItems = sellerProducts.filter(p => p.stock < 10);
    const lowStockItems = sellerProducts.filter(p => p.stock >= 10 && p.stock < lowStockThreshold);
    const outOfStockItems = sellerProducts.filter(p => p.stock === 0);

    // Reportes abiertos
    const openReports = sellerBugReports.filter(r => r.status === 'open');

    return (
        <DashboardLayout title="Alertas de Stock" links={sellerDashboardLinks}>
            <BackButton to="/vendedor/productos" label="Volver a Mi Panel" />
            {/* Tarjetas de resumen */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card p-6 border-l-4 border-red-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase">Stock Crítico</p>
                            <h3 className="text-3xl font-bold mt-1 text-red-600 dark:text-red-400">{criticalStockItems.length}</h3>
                            <p className="text-xs text-gray-400 mt-2">Menos de 10m</p>
                        </div>
                        <div className="p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <FiTrendingDown className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-orange-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase">Stock Bajo</p>
                            <h3 className="text-3xl font-bold mt-1 text-orange-600 dark:text-orange-400">{lowStockItems.length}</h3>
                            <p className="text-xs text-gray-400 mt-2">Menos de {lowStockThreshold}m</p>
                        </div>
                        <div className="p-3 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                            <FiArchive className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-gray-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase">Agotados</p>
                            <h3 className="text-3xl font-bold mt-1 text-gray-600 dark:text-gray-400">{outOfStockItems.length}</h3>
                            <p className="text-xs text-gray-400 mt-2">Sin stock</p>
                        </div>
                        <div className="p-3 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400">
                            <FiPackage className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-yellow-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase">Reportes Abiertos</p>
                            <h3 className="text-3xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{openReports.length}</h3>
                            <p className="text-xs text-gray-400 mt-2">Requieren atención</p>
                        </div>
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <FiAlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Productos con stock crítico */}
            {criticalStockItems.length > 0 && (
                <div className="card mb-6">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-red-50 dark:bg-red-900/10">
                        <div className="flex items-center gap-2">
                            <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <h2 className="font-bold text-lg text-red-900 dark:text-red-300">Stock Crítico - Acción Urgente</h2>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">Estos productos tienen menos de 10 metros en stock</p>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                        {criticalStockItems.map(item => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded bg-gray-100 dark:bg-slate-700 overflow-hidden">
                                        <img src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.png'} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                        <p className="text-xs text-gray-500">Ref: {item.id} • {formatCurrency(item.price)}/m</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg text-red-600 dark:text-red-400">
                                        {item.stock} m
                                    </div>
                                    <button className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline">
                                        Reponer Urgente
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Productos con stock bajo */}
            {lowStockItems.length > 0 && (
                <div className="card mb-6">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <h2 className="font-bold text-lg">Stock Bajo - Planificar Reposición</h2>
                        <p className="text-sm text-gray-500 mt-1">Productos con menos de {lowStockThreshold} metros</p>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                        {lowStockItems.map(item => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded bg-gray-100 dark:bg-slate-700 overflow-hidden">
                                        <img src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.png'} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                        <p className="text-xs text-gray-500">Ref: {item.id} • {formatCurrency(item.price)}/m</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg text-orange-600 dark:text-orange-400">
                                        {item.stock} m
                                    </div>
                                    <button className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline">
                                        Reponer Stock
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Productos agotados */}
            {outOfStockItems.length > 0 && (
                <div className="card mb-6">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <h2 className="font-bold text-lg">Productos Agotados</h2>
                        <p className="text-sm text-gray-500 mt-1">Sin stock disponible</p>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                        {outOfStockItems.map(item => (
                            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 opacity-60">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded bg-gray-100 dark:bg-slate-700 overflow-hidden">
                                        <img src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.png'} alt="" className="w-full h-full object-cover grayscale" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                        <p className="text-xs text-gray-500">Ref: {item.id} • {formatCurrency(item.price)}/m</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg text-gray-500">
                                        AGOTADO
                                    </div>
                                    <button className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline">
                                        Reponer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reportes abiertos */}
            {openReports.length > 0 && (
                <div className="card">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <h2 className="font-bold text-lg">Reportes de Calidad Pendientes</h2>
                        <p className="text-sm text-gray-500 mt-1">Reportes que requieren tu atención</p>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                        {openReports.map(report => (
                            <div key={report.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{report.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{report.description}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        report.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {report.priority === 'high' ? 'Alta' : report.priority === 'medium' ? 'Media' : 'Baja'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>Producto: {report.productName}</span>
                                    <span>•</span>
                                    <span>Cliente: {report.clientName}</span>
                                    <span>•</span>
                                    <span>{new Date(report.createdAt).toLocaleDateString('es-CO')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mensaje cuando todo está bien */}
            {criticalStockItems.length === 0 && lowStockItems.length === 0 && outOfStockItems.length === 0 && openReports.length === 0 && (
                <div className="card p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                        <FiPackage className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Todo en Orden!</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        No tienes alertas de stock ni reportes pendientes en este momento.
                    </p>
                </div>
            )}
        </DashboardLayout>
    );
}

export default StockAlerts;

