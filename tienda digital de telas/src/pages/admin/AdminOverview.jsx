import React from 'react';
import { Link } from 'react-router-dom';
import { MdGridView, MdGroup, MdAttachMoney, MdShoppingBag, MdLayers, MdDashboard, MdDescription, MdWarningAmber, MdTrendingUp, MdInventory2 } from 'react-icons/md';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AnimatedPage from '../../components/AnimatedPage';
import adminDashboardLinks from '../../data/adminDashboardLinks';
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
        <DashboardLayout title="Panel de Administración" links={adminDashboardLinks}>
            <AnimatedPage>
                {/* Métricas Globales */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        label="Ventas Totales"
                        value={formatCurrency(totalSales)}
                        icon={MdAttachMoney}
                        color="bg-emerald-100/50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                        trend="up"
                        trendValue="+12.5%"
                    />
                    <MetricCard
                        label="Total Usuarios"
                        value={totalUsers}
                        icon={MdGroup}
                        color="bg-blue-100/50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                        subtitle={`${sellers.length} vendedores activos`}
                    />
                    <MetricCard
                        label="Pedidos"
                        value={totalOrders}
                        icon={MdShoppingBag}
                        color="bg-purple-100/50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                        subtitle={`Ticket promedio: ${formatCurrency(averageTicket)}`}
                    />
                    <MetricCard
                        label="Reportes Calidad"
                        value={bugReports.length}
                        subtitle={`${bugReports.filter(r => r.status === 'open').length} abiertos, ${bugReports.length - bugReports.filter(r => r.status === 'open').length} en rev/res`}
                        icon={MdWarningAmber}
                        color="bg-orange-100/50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                    />
                </div>

                {/* Gráfico de Ventas */}
                <div className="card p-6 mb-8 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <LineChart
                        data={chartData}
                        title="Ventas de los Últimos 7 Días"
                        height={300}
                        color="#8B5CF6"
                    />
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Top Vendedores */}
                    <div className="card p-6 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Top Vendedores</h3>
                            <Link to="/admin/vendedores" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos →</Link>
                        </div>
                        {topSellers.length > 0 ? (
                            <div className="space-y-4">
                                {topSellers.map((seller, index) => (
                                    <div key={seller.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-gray-200 dark:hover:border-slate-700 hover:shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-yellow-500/30' :
                                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-gray-400/30' :
                                                    index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-orange-500/30' :
                                                        'bg-primary-50 text-primary-700'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white">{seller.name}</p>
                                                <p className="text-xs text-gray-500">{seller.metrics.totalOrders} ventas</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{formatCurrency(seller.metrics.totalSales)}</p>
                                            <p className="text-xs text-emerald-500 flex items-center justify-end gap-1 mt-0.5 font-medium">
                                                <MdTrendingUp /> +12%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                <MdGroup className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No hay datos de vendedores suficientes</p>
                            </div>
                        )}
                    </div>

                    {/* Actividad Reciente */}
                    <div className="card p-6 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-white">Actividad Reciente</h3>
                        <ul className="space-y-5">
                            {recentActivity.slice(0, 6).map((activity) => (
                                <li key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-slate-800/80 last:border-0 last:pb-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 mt-1.5 shadow-sm shadow-primary-500/50"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            <span className="font-bold text-gray-900 dark:text-white">{activity.userName}</span> {activity.action}
                                            {activity.amount && <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1 py-0.5 rounded ml-1"> {formatCurrency(activity.amount)}</span>}
                                        </p>
                                        <span className="text-xs font-medium text-gray-400 mt-1 block">{activity.time}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Módulos del Panel de Administración */}
                <div className="space-y-8">
                    {/* Gestión de Inventario */}
                    <div className="card p-6 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                            <MdInventory2 className="w-5 h-5 text-primary-600 shadow-sm" />
                            Gestión de Inventario
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link to="/admin/inventario/lotes" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdInventory2 className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Control de Lotes</span>
                                <span className="text-xs text-gray-500 mt-1 block">Rollos y batches</span>
                            </Link>
                            <Link to="/admin/inventario/merma" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdWarningAmber className="w-6 h-6 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Calculadora Merma</span>
                                <span className="text-xs text-gray-500 mt-1 block">Análisis desperdicios</span>
                            </Link>
                            <Link to="/admin/inventario/alertas" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdWarningAmber className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Alertas Stock</span>
                                <span className="text-xs text-gray-500 mt-1 block">Umbrales, avisos</span>
                            </Link>
                            <Link to="/admin/inventario/historial" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdDescription className="w-6 h-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Movimientos</span>
                                <span className="text-xs text-gray-500 mt-1 block">Auditoría completa</span>
                            </Link>
                        </div>
                    </div>

                    {/* Moderación de Vendedores */}
                    <div className="card p-6 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                            <MdGroup className="w-5 h-5 text-primary-600 shadow-sm" />
                            Moderación de Vendedores
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link to="/admin/moderacion/aprobacion" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdShoppingBag className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Aprobación</span>
                                <span className="text-xs text-gray-500 mt-1 block">Productos en cola</span>
                            </Link>
                            <Link to="/admin/moderacion/vendedores" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdTrendingUp className="w-6 h-6 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Rendimiento</span>
                                <span className="text-xs text-gray-500 mt-1 block">Comisiones y estado</span>
                            </Link>
                        </div>
                    </div>

                    {/* Business Intelligence */}
                    <div className="card p-6 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                            <MdTrendingUp className="w-5 h-5 text-primary-600 shadow-sm" />
                            Business Intelligence
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link to="/admin/analytics/mapa-ventas" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdGridView className="w-6 h-6 text-teal-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Mapa Ventas</span>
                                <span className="text-xs text-gray-500 mt-1 block">Análisis regional</span>
                            </Link>
                            <Link to="/admin/analytics/rotacion" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdInventory2 className="w-6 h-6 text-cyan-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Rotación Inv.</span>
                                <span className="text-xs text-gray-500 mt-1 block">Flujo de productos</span>
                            </Link>
                            <Link to="/admin/analytics/devoluciones" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdWarningAmber className="w-6 h-6 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Devoluciones</span>
                                <span className="text-xs text-gray-500 mt-1 block">Tasa de retornos</span>
                            </Link>
                            <Link to="/admin/analytics/proyeccion" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdAttachMoney className="w-6 h-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Proyección</span>
                                <span className="text-xs text-gray-500 mt-1 block">Ingresos a futuro</span>
                            </Link>
                        </div>
                    </div>

                    {/* Soporte al Cliente */}
                    <div className="card p-6 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                            <MdDescription className="w-5 h-5 text-primary-600 shadow-sm" />
                            Soporte al Cliente
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link to="/admin/soporte/tickets" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdDescription className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Tickets Soporte</span>
                                <span className="text-xs text-gray-500 mt-1 block">Casos activos</span>
                            </Link>
                            <Link to="/admin/soporte/cupones" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdAttachMoney className="w-6 h-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Crear Cupones</span>
                                <span className="text-xs text-gray-500 mt-1 block">Promociones web</span>
                            </Link>
                        </div>
                    </div>

                    {/* Acciones Rápidas (Existentes) */}
                    <div className="card p-6 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Acciones Rápidas</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link to="/admin/usuarios" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdGroup className="w-6 h-6 text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Usuarios</span>
                            </Link>
                            <Link to="/admin/productos" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdInventory2 className="w-6 h-6 text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Catálogo</span>
                            </Link>
                            <Link to="/admin/carrusel" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdLayers className="w-6 h-6 text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Carrusel</span>
                            </Link>
                            <Link to="/admin/reportes" className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800 dark:to-slate-800/50 hover:from-white hover:to-gray-50 hover:shadow-md border border-gray-200/60 dark:border-slate-700/60 transition-all text-left group">
                                <MdDescription className="w-6 h-6 text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold block text-sm text-gray-800 dark:text-white">Reportes</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default AdminOverview;
