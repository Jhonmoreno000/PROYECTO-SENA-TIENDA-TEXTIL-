import React from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiUsers, FiDollarSign, FiShoppingBag, FiLayers, FiLayout, FiFileText, FiAlertCircle, FiTrendingUp, FiPackage } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import MetricCard from '../../components/dashboard/MetricCard';
import LineChart from '../../components/dashboard/LineChart';
import { formatCurrency } from '../../utils/formatters';
import { useMetrics } from '../../context/MetricsContext';
import { useProducts } from '../../context/ProductContext';
import { calculateTotalSales, calculateAverageTicket, getAllSellersMetrics, calculateQualityMetrics } from '../../utils/metricsUtils';

function AdminOverview() {
    const { users, orders, salesData, bugReports, products: metricsProducts, recentActivity } = useMetrics();
    const { products: apiProducts, refreshProducts } = useProducts();
    // Use API products if available, otherwise fall back to metrics products
    const products = apiProducts.length > 0 ? apiProducts : metricsProducts;

    const dashboardLinks = [
        { label: 'Resumen', path: '/admin', icon: FiGrid },
        {
            label: 'Usuarios', icon: FiUsers,
            children: [
                { label: 'Gestión de Usuarios', path: '/admin/usuarios', icon: FiUsers },
                { label: 'Vendedores', path: '/admin/vendedores', icon: FiTrendingUp },
                { label: 'Clientes', path: '/admin/clientes', icon: FiUsers },
            ],
        },
        {
            label: 'Catálogo', icon: FiShoppingBag,
            children: [
                { label: 'Productos', path: '/admin/productos', icon: FiShoppingBag },
                { label: 'Carrusel', path: '/admin/carrusel', icon: FiLayers },
                { label: 'Página Inicio', path: '/admin/home', icon: FiLayout },
            ],
        },
        {
            label: 'Inventario', icon: FiPackage,
            children: [
                { label: 'Control de Lotes', path: '/admin/inventario/lotes', icon: FiPackage },
                { label: 'Calculadora de Merma', path: '/admin/inventario/merma', icon: FiAlertCircle },
                { label: 'Alertas de Stock', path: '/admin/inventario/alertas', icon: FiAlertCircle },
                { label: 'Historial de Movimientos', path: '/admin/inventario/historial', icon: FiFileText },
            ],
        },
        {
            label: 'Moderación', icon: FiTrendingUp,
            children: [
                { label: 'Cola de Aprobación', path: '/admin/moderacion/aprobacion', icon: FiShoppingBag },
                { label: 'Rendimiento', path: '/admin/moderacion/vendedores', icon: FiTrendingUp },
            ],
        },
        {
            label: 'Analytics', icon: FiTrendingUp,
            children: [
                { label: 'Mapa de Ventas', path: '/admin/analytics/mapa-ventas', icon: FiGrid },
                { label: 'Rotación de Inventario', path: '/admin/analytics/rotacion', icon: FiPackage },
                { label: 'Análisis de Devoluciones', path: '/admin/analytics/devoluciones', icon: FiAlertCircle },
                { label: 'Proyección de Ingresos', path: '/admin/analytics/proyeccion', icon: FiDollarSign },
            ],
        },
        {
            label: 'Soporte', icon: FiFileText,
            children: [
                { label: 'Gestión de Tickets', path: '/admin/soporte/tickets', icon: FiFileText },
                { label: 'Crear Cupones', path: '/admin/soporte/cupones', icon: FiDollarSign },
            ],
        },
        { label: 'Reportes', path: '/admin/reportes', icon: FiFileText },
        { label: 'Configuración', path: '/admin/configuracion', icon: FiGrid },
    ];

    // Calcular métricas globales
    const totalSales = calculateTotalSales(orders);
    const totalUsers = users.length;
    const totalOrders = orders.length;
    const averageTicket = calculateAverageTicket(orders);
    const qualityMetrics = calculateQualityMetrics(bugReports);

    // Obtener vendedores
    const sellers = users.filter(u => u.role === 'seller');
    const sellersWithMetrics = getAllSellersMetrics(sellers, orders, bugReports);
    const topSellers = sellersWithMetrics.slice(0, 5);

    // Formatear datos para el gráfico
    const chartData = salesData.slice(-7).map(item => ({
        name: new Date(item.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
        value: item.sales
    }));

    return (
        <DashboardLayout title="Panel de Administración" links={dashboardLinks}>
            {/* Métricas Globales */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    label="Ventas Totales"
                    value={formatCurrency(totalSales)}
                    icon={FiDollarSign}
                    color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    trend="up"
                    trendValue="+12.5%"
                />
                <MetricCard
                    label="Total Usuarios"
                    value={totalUsers}
                    icon={FiUsers}
                    color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    subtitle={`${sellers.length} vendedores activos`}
                />
                <MetricCard
                    label="Pedidos"
                    value={totalOrders}
                    icon={FiShoppingBag}
                    color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                    subtitle={`Ticket promedio: ${formatCurrency(averageTicket)}`}
                />
                <MetricCard
                    label="Reportes Calidad"
                    value={bugReports.length}
                    subtitle={`${bugReports.filter(r => r.status === 'open').length} abiertos, ${bugReports.length - bugReports.filter(r => r.status === 'open').length} en rev/res`}
                    icon={FiAlertCircle}
                    color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                />
            </div>

            {/* Gráfico de Ventas */}
            <div className="card p-6 mb-8">
                <LineChart
                    data={chartData}
                    title="Ventas de los Últimos 7 Días"
                    height={300}
                    color="#8B5CF6"
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Top Vendedores */}
                <div className="card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Top Vendedores</h3>
                        <Link to="/admin/vendedores" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos →</Link>
                    </div>
                    {topSellers.length > 0 ? (
                        <div className="space-y-4">
                            {topSellers.map((seller, index) => (
                                <div key={seller.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-200 text-gray-700' :
                                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-primary-50 text-primary-700'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{seller.name}</p>
                                            <p className="text-xs text-gray-500">{seller.metrics.totalOrders} ventas</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">{formatCurrency(seller.metrics.totalSales)}</p>
                                        <p className="text-xs text-green-500 flex items-center justify-end gap-1">
                                            <FiTrendingUp /> +12%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No hay datos de vendedores suficientes</p>
                        </div>
                    )}
                </div>

                {/* Actividad Reciente */}
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4">Actividad Reciente</h3>
                    <ul className="space-y-4">
                        {recentActivity.slice(0, 6).map((activity) => (
                            <li key={activity.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
                                <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                                    <span className="font-bold text-gray-900 dark:text-white">{activity.userName}</span> {activity.action}
                                    {activity.amount && <span className="font-mono text-primary-600 dark:text-primary-400"> {formatCurrency(activity.amount)}</span>}
                                </p>
                                <span className="text-xs text-gray-400">{activity.time}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Módulos del Panel de Administración */}
            <div className="space-y-8">
                {/* Gestión de Inventario */}
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FiPackage className="w-5 h-5 text-primary-600" />
                        Gestión de Inventario
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/admin/inventario/lotes" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiPackage className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Control de Lotes</span>
                            <span className="text-xs text-gray-500 mt-1 block">Rollos y batches</span>
                        </Link>
                        <Link to="/admin/inventario/merma" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiAlertCircle className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Calculadora de Merma</span>
                            <span className="text-xs text-gray-500 mt-1 block">Análisis de desperdicios</span>
                        </Link>
                        <Link to="/admin/inventario/alertas" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiAlertCircle className="w-6 h-6 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Alertas de Stock</span>
                            <span className="text-xs text-gray-500 mt-1 block">Umbrales y notificaciones</span>
                        </Link>
                        <Link to="/admin/inventario/historial" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiFileText className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Historial de Movimientos</span>
                            <span className="text-xs text-gray-500 mt-1 block">Auditoría completa</span>
                        </Link>
                    </div>
                </div>

                {/* Moderación de Vendedores */}
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FiUsers className="w-5 h-5 text-primary-600" />
                        Moderación de Vendedores
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/admin/moderacion/aprobacion" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiShoppingBag className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Cola de Aprobación</span>
                            <span className="text-xs text-gray-500 mt-1 block">Productos pendientes</span>
                        </Link>
                        <Link to="/admin/moderacion/vendedores" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiTrendingUp className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Rendimiento</span>
                            <span className="text-xs text-gray-500 mt-1 block">Comisiones y suspensiones</span>
                        </Link>
                    </div>
                </div>

                {/* Business Intelligence */}
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FiTrendingUp className="w-5 h-5 text-primary-600" />
                        Business Intelligence
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/admin/analytics/mapa-ventas" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiGrid className="w-6 h-6 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Mapa de Ventas</span>
                            <span className="text-xs text-gray-500 mt-1 block">Análisis geográfico</span>
                        </Link>
                        <Link to="/admin/analytics/rotacion" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiPackage className="w-6 h-6 text-cyan-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Rotación de Inventario</span>
                            <span className="text-xs text-gray-500 mt-1 block">Bestsellers y stock muerto</span>
                        </Link>
                        <Link to="/admin/analytics/devoluciones" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiAlertCircle className="w-6 h-6 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Análisis de Devoluciones</span>
                            <span className="text-xs text-gray-500 mt-1 block">Tasa y patrones</span>
                        </Link>
                        <Link to="/admin/analytics/proyeccion" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiDollarSign className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Proyección de Ingresos</span>
                            <span className="text-xs text-gray-500 mt-1 block">Forecasting financiero</span>
                        </Link>
                    </div>
                </div>

                {/* Soporte al Cliente */}
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FiFileText className="w-5 h-5 text-primary-600" />
                        Soporte al Cliente
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/admin/soporte/tickets" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiFileText className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Gestión de Tickets</span>
                            <span className="text-xs text-gray-500 mt-1 block">Centro de soporte</span>
                        </Link>
                        <Link to="/admin/soporte/cupones" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left group">
                            <FiDollarSign className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Crear Cupones</span>
                            <span className="text-xs text-gray-500 mt-1 block">Códigos de descuento</span>
                        </Link>
                    </div>
                </div>

                {/* Acciones Rápidas (Existentes) */}
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4">Acciones Rápidas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/admin/usuarios" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-600 transition-all text-left group">
                            <FiUsers className="w-6 h-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Gestionar Usuarios</span>
                        </Link>
                        <Link to="/admin/productos" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-600 transition-all text-left group">
                            <FiPackage className="w-6 h-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Productos</span>
                        </Link>
                        <Link to="/admin/carrusel" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-600 transition-all text-left group">
                            <FiLayers className="w-6 h-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Editar Carrusel</span>
                        </Link>
                        <Link to="/admin/reportes" className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-600 transition-all text-left group">
                            <FiFileText className="w-6 h-6 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-bold block text-sm">Ver Reportes</span>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AdminOverview;
