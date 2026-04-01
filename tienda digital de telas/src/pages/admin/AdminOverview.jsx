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
                        color="emerald"
                        trend="up"
                        trendValue="+1.5%"
                        subtitle="Ventas totales"
                        link="/admin/pedidos"
                    />
                    <MetricCard
                        label="Total Usuarios"
                        value={totalUsers}
                        icon={MdGroup}
                        color="blue"
                        subtitle={`${sellers.length} vendedores activos`}
                        trend="up"
                        trendValue="+2.5%"
                        link="/admin/vendedores"
                    />
                    <MetricCard
                        label="Pedidos"
                        value={totalOrders}
                        icon={MdShoppingBag}
                        color="purple"
                        subtitle={`Ticket promedio: ${formatCurrency(averageTicket)}`}
                        trend="up"
                        trendValue="+12.5%"
                        link="/admin/pedidos"
                    />
                    <MetricCard
                        label="Reportes Calidad"
                        value={bugReports.length}
                        subtitle={`${bugReports.filter(r => r.status === 'open').length} abiertos, ${bugReports.length - bugReports.filter(r => r.status === 'open').length} en rev/res`}
                        icon={MdWarningAmber}
                        color="orange"
                        trend="down"
                        trendValue="-5.2%"
                        link="/admin/reportes-calidad"
                    />
                </div>

                {/* Gráfico de Ventas */}
                <div className="card p-6 mb-8 shadow-none">
                    <LineChart
                        data={chartData}
                        title="Ventas de los Últimos 7 Días"
                        height={300}
                        color="#8B5CF6"
                        subtitle="Ventas de los Últimos 7 Días"
                    />
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Top Vendedores */}
                    <div className="card p-6 shadow-none">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Top Vendedores</h3>
                            <Link to="/admin/vendedores" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos →</Link>
                        </div>
                        {topSellers.length > 0 ? (
                            <div className="space-y-4">
                                {topSellers.map((seller, index) => (
                                    <div key={seller.id} className="flex items-center justify-between p-3 rounded-none hover:bg-gray-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-gray-300 dark:hover:border-slate-700 hover:shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-none flex items-center justify-center font-bold text-sm bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-white border border-gray-300 dark:border-slate-700">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white">{seller.name}</p>
                                                <p className="text-xs text-gray-500">{seller.metrics.totalOrders} ventas</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{formatCurrency(seller.metrics.totalSales)}</p>
                                            <p className="text-xs text-gray-800 dark:text-gray-200 flex items-center justify-end gap-1 mt-0.5 font-medium">
                                                <MdTrendingUp /> +12%
                                                <span className="text-xs text-gray-500">{seller.metrics.totalOrders} ventas</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                <MdGroup className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No hay datos de vendedores suficientes</p>
                                <Link to="/admin/vendedores" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos →</Link>
                            </div>
                        )}
                    </div>

                    {/* Actividad Reciente */}
                    <div className="card p-6 shadow-none">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Actividad Reciente</h3>
                            <Link to="/admin/actividad" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos →</Link>
                        </div>
                        <ul className="space-y-5">
                            
                            {recentActivity.slice(0, 6).map((activity) => (
                                <li key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-slate-800/80 last:border-0 last:pb-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 mt-1.5 shadow-sm shadow-primary-500/50"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            <span className="font-bold text-gray-900 dark:text-white">{activity.userName}</span> {activity.action}
                                            {activity.amount && <span className="font-mono font-bold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-slate-700 px-1.5 py-0.5 rounded-none ml-1"> {formatCurrency(activity.amount)}</span>}
                                        </p>
                                        <span className="text-xs font-medium text-gray-400 mt-1 block">{activity.time}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Módulos del Panel de Administración */}
                <div className="space-y-5">
                    {/* Gestión de Inventario — Teal */}
                    <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-6 shadow-sm border border-teal-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                                <MdInventory2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">Gestión de Inventario</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Control de stock y trazabilidad</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Link to="/admin/inventario/lotes" className="group p-4 rounded-xl bg-teal-50/60 dark:bg-teal-900/10 hover:bg-teal-100/80 dark:hover:bg-teal-900/30 transition-all duration-200 text-left border border-transparent hover:border-teal-200/50">
                                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdInventory2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Control de Lotes</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Rollos y batches</span>
                            </Link>
                            <Link to="/admin/inventario/merma" className="group p-4 rounded-xl bg-teal-50/60 dark:bg-teal-900/10 hover:bg-teal-100/80 dark:hover:bg-teal-900/30 transition-all duration-200 text-left border border-transparent hover:border-teal-200/50">
                                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdWarningAmber className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Calculadora Merma</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Análisis desperdicios</span>
                            </Link>
                            <Link to="/admin/inventario/alertas" className="group p-4 rounded-xl bg-teal-50/60 dark:bg-teal-900/10 hover:bg-teal-100/80 dark:hover:bg-teal-900/30 transition-all duration-200 text-left border border-transparent hover:border-teal-200/50">
                                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdWarningAmber className="w-4 h-4 text-red-500 dark:text-red-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Alertas Stock</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Umbrales, avisos</span>
                            </Link>
                            <Link to="/admin/inventario/historial" className="group p-4 rounded-xl bg-teal-50/60 dark:bg-teal-900/10 hover:bg-teal-100/80 dark:hover:bg-teal-900/30 transition-all duration-200 text-left border border-transparent hover:border-teal-200/50">
                                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdDescription className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Movimientos</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Auditoría completa</span>
                            </Link>
                        </div>
                    </div>

                    {/* Moderación de Vendedores — Blue */}
                    <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-6 shadow-sm border border-blue-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                <MdGroup className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">Moderación de Vendedores</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Aprobación, rendimiento y comisiones</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Link to="/admin/moderacion/aprobacion" className="group p-4 rounded-xl bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-all duration-200 text-left border border-transparent hover:border-blue-200/50">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Aprobación</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Productos en cola</span>
                            </Link>
                            <Link to="/admin/moderacion/vendedores" className="group p-4 rounded-xl bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transition-all duration-200 text-left border border-transparent hover:border-blue-200/50">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdTrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Rendimiento</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Comisiones y estado</span>
                            </Link>
                        </div>
                    </div>

                    {/* Business Intelligence — Violet */}
                    <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-6 shadow-sm border border-violet-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                                <MdTrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">Business Intelligence</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Análisis, proyecciones y reportes</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Link to="/admin/analytics/mapa-ventas" className="group p-4 rounded-xl bg-violet-50/60 dark:bg-violet-900/10 hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-200 text-left border border-transparent hover:border-violet-200/50">
                                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdGridView className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Mapa Ventas</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Análisis regional</span>
                            </Link>
                            <Link to="/admin/analytics/rotacion" className="group p-4 rounded-xl bg-violet-50/60 dark:bg-violet-900/10 hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-200 text-left border border-transparent hover:border-violet-200/50">
                                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdInventory2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Rotación Inv.</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Flujo de productos</span>
                            </Link>
                            <Link to="/admin/analytics/devoluciones" className="group p-4 rounded-xl bg-violet-50/60 dark:bg-violet-900/10 hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-200 text-left border border-transparent hover:border-violet-200/50">
                                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdWarningAmber className="w-4 h-4 text-red-500 dark:text-red-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Devoluciones</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Tasa de retornos</span>
                            </Link>
                            <Link to="/admin/analytics/proyeccion" className="group p-4 rounded-xl bg-violet-50/60 dark:bg-violet-900/10 hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-200 text-left border border-transparent hover:border-violet-200/50">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdAttachMoney className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Proyección</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Ingresos a futuro</span>
                            </Link>
                        </div>
                    </div>

                    {/* Soporte al Cliente — Amber */}
                    <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-6 shadow-sm border border-amber-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                <MdDescription className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">Soporte al Cliente</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Tickets, cupones y atención</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Link to="/admin/soporte/tickets" className="group p-4 rounded-xl bg-amber-50/60 dark:bg-amber-900/10 hover:bg-amber-100/80 dark:hover:bg-amber-900/30 transition-all duration-200 text-left border border-transparent hover:border-amber-200/50">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdDescription className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Tickets Soporte</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Casos activos</span>
                            </Link>
                            <Link to="/admin/soporte/cupones" className="group p-4 rounded-xl bg-amber-50/60 dark:bg-amber-900/10 hover:bg-amber-100/80 dark:hover:bg-amber-900/30 transition-all duration-200 text-left border border-transparent hover:border-amber-200/50">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdAttachMoney className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Crear Cupones</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Promociones web</span>
                            </Link>
                        </div>
                    </div>

                    {/* Acciones Rápidas — Primary Orange */}
                    <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-6 shadow-sm border border-orange-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                                <MdDashboard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">Acciones Rápidas</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Accesos directos frecuentes</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Link to="/admin/usuarios" className="group p-4 rounded-xl bg-orange-50/60 dark:bg-orange-900/10 hover:bg-orange-100/80 dark:hover:bg-orange-900/30 transition-all duration-200 text-left border border-transparent hover:border-orange-200/50">
                                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdGroup className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Usuarios</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Gestión de cuentas</span>
                            </Link>
                            <Link to="/admin/productos" className="group p-4 rounded-xl bg-orange-50/60 dark:bg-orange-900/10 hover:bg-orange-100/80 dark:hover:bg-orange-900/30 transition-all duration-200 text-left border border-transparent hover:border-orange-200/50">
                                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdInventory2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Catálogo</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Todos los productos</span>
                            </Link>
                            <Link to="/admin/carrusel" className="group p-4 rounded-xl bg-orange-50/60 dark:bg-orange-900/10 hover:bg-orange-100/80 dark:hover:bg-orange-900/30 transition-all duration-200 text-left border border-transparent hover:border-orange-200/50">
                                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdLayers className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Carrusel</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Imágenes destacadas</span>
                            </Link>
                            <Link to="/admin/reportes" className="group p-4 rounded-xl bg-orange-50/60 dark:bg-orange-900/10 hover:bg-orange-100/80 dark:hover:bg-orange-900/30 transition-all duration-200 text-left border border-transparent hover:border-orange-200/50">
                                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <MdDescription className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                </div>
                                <span className="font-semibold block text-sm text-gray-800 dark:text-white">Reportes</span>
                                <span className="text-xs text-gray-400 mt-0.5 block">Exportar datos</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default AdminOverview;
