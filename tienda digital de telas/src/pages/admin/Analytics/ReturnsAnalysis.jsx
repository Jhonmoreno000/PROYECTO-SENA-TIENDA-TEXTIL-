import React from 'react';
import { FiPackage, FiDollarSign, FiAlertCircle, FiShoppingBag } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import MetricCard from '../../../components/dashboard/MetricCard';
import { useMetrics } from '../../../context/MetricsContext';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function ReturnsAnalysis() {
    const { orders, bugReports, users } = useMetrics();
    // Calcular órdenes devueltas
    const returnedOrders = orders.filter(o => o.returned || o.status === 'returned');
    const returnRate = orders.length > 0 ? (returnedOrders.length / orders.length) * 100 : 0;
    const returnedValue = returnedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Calcular devoluciones por tipo de tela (basado en bugReports)
    const returnsByType = {};
    bugReports.forEach(report => {
        const category = report.productName?.split(' ')[0] || report.category || 'Otros';
        if (!returnsByType[category]) {
            returnsByType[category] = { name: category, count: 0 };
        }
        returnsByType[category].count++;
    });
    const returnsByTypeArray = Object.values(returnsByType);

    // Calcular devoluciones por vendedor
    const sellers = users.filter(u => u.role === 'seller');
    const returnsBySeller = sellers.map(seller => {
        const sellerReports = bugReports.filter(r => r.sellerId === seller.id);
        const sellerOrders = orders.filter(o => o.sellerId === seller.id);
        return {
            sellerId: seller.id,
            sellerName: seller.name,
            count: sellerReports.length,
            totalOrders: sellerOrders.length,
            rate: sellerOrders.length > 0 ? (sellerReports.length / sellerOrders.length) * 100 : 0
        };
    }).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

    const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

    return (
        <DashboardLayout title="Análisis de Devoluciones" links={adminDashboardLinks}>
            <BackButton />
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <MetricCard 
                    label="Tasa de Devolución"
                    value={`${returnRate.toFixed(2)}%`}
                    icon={FiPackage}
                    color="red"
                />
                <MetricCard 
                    label="Total Reportes"
                    value={bugReports.length}
                    icon={FiAlertCircle}
                    color="blue"
                />
                <MetricCard 
                    label="Total Pedidos"
                    value={orders.length}
                    icon={FiShoppingBag}
                    color="gray"
                />
                <MetricCard 
                    label="Valor Afectado"
                    value={formatCurrency(returnedValue)}
                    icon={FiDollarSign}
                    color="orange"
                />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Returns by Fabric Type */}
                <div className="card p-6 border-violet-50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                            <FiPackage className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">Reportes por Tipo de Tela</h3>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Distribución de devoluciones</p>
                        </div>
                    </div>
                    {returnsByTypeArray.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={returnsByTypeArray}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {returnsByTypeArray.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm font-bold uppercase tracking-widest">
                            No hay datos de reportes
                        </div>
                    )}
                </div>

                {/* Returns by Seller */}
                <div className="card p-6 border-red-50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                            <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">Top Vendedores con Reportes</h3>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Mayor incidencia primero</p>
                        </div>
                    </div>
                    {returnsBySeller.length > 0 ? (
                        <div className="space-y-4">
                            {returnsBySeller.slice(0, 5).map((seller, index) => (
                                <div key={seller.sellerId} className="flex items-center gap-4 group hover:bg-red-50/50 dark:hover:bg-red-900/10 p-2 -mx-2 rounded-xl transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-extrabold shadow-inner group-hover:scale-110 transition-transform">
                                        0{index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 dark:text-white">{seller.sellerName}</p>
                                        <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-lg h-1.5 mt-1 overflow-hidden">
                                            <div
                                                className="bg-red-500 h-full rounded-lg"
                                                style={{ width: `${Math.min((seller.count / (returnsBySeller[0]?.count || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-red-600">{seller.count}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{seller.rate.toFixed(1)}% tasa</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm font-bold uppercase tracking-widest">
                            No hay reportes de vendedores
                        </div>
                    )}
                </div>
            </div>

            {/* Bug Reports Table */}
            <div className="card border-blue-50 dark:border-slate-800/50 overflow-hidden shadow-xl shadow-blue-500/5">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-blue-50/10 dark:bg-blue-900/10">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white tracking-tight leading-none">Reportes de Calidad Recientes</h3>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">Seguimiento de incidencias en productos</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/30 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">ID</th>
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Producto</th>
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Cliente</th>
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Descripción</th>
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Prioridad</th>
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Estado</th>
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {bugReports.slice(0, 10).map(report => (
                                <tr key={report.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/5 transition-colors group">
                                    <td className="p-4 font-bold text-primary-600 dark:text-primary-400 text-xs">
                                        #{report.id.toString().padStart(4, '0')}
                                    </td>
                                    <td className="p-4 font-bold text-gray-900 dark:text-white text-sm">
                                        {report.productName || 'N/A'}
                                    </td>
                                    <td className="p-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                                        {report.clientName || `Cliente ${report.clientId}`}
                                    </td>
                                    <td className="p-4 text-xs font-medium text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={report.description}>
                                        {report.description}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                            report.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 
                                            report.priority === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 
                                            'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                        }`}>
                                            {report.priority === 'high' ? 'Alta' : report.priority === 'medium' ? 'Media' : 'Baja'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                report.status === 'open' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse' : 
                                                report.status === 'resolved' ? 'bg-emerald-500' : 'bg-gray-400'
                                            }`}></div>
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {report.status === 'open' ? 'Abierto' : report.status === 'resolved' ? 'Resuelto' : 'En revisión'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                        {new Date(report.date).toLocaleDateString('es-CO')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ReturnsAnalysis;

