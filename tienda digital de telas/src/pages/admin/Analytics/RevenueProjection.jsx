import React, { useState } from 'react';
import { FiTrendingUp, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function RevenueProjection() {
    const { orders, salesData } = useMetrics();
    const [months, setMonths] = useState(6);
    // Calculate current monthly revenue from orders
    const safeOrders = orders || [];
    const totalRevenue = safeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = safeOrders.length > 0 ? totalRevenue / safeOrders.length : 0;

    // Calculate growth from sales data
    const safeSalesData = salesData || [];
    const recentSales = safeSalesData.slice(-30);
    const avgDailySales = recentSales.length > 0
        ? recentSales.reduce((sum, d) => sum + (d.sales || 0), 0) / recentSales.length
        : 500000; // default fallback

    // Monthly averages
    const monthlyAvg = avgDailySales * 30;
    const growthRate = 8.5; // Assumed growth rate for demo

    // Generate projection data for the selected months
    const generateProjection = (numMonths) => {
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const currentMonth = new Date().getMonth();
        const projections = [];

        let baseValue = monthlyAvg;

        for (let i = 1; i <= numMonths; i++) {
            const monthIndex = (currentMonth + i) % 12;
            const projected = baseValue * Math.pow(1 + growthRate / 100, i);
            const conservative = projected * 0.85;
            const optimistic = projected * 1.2;

            projections.push({
                month: monthNames[monthIndex],
                projected: Math.round(projected),
                conservative: Math.round(conservative),
                optimistic: Math.round(optimistic)
            });
        }

        return projections;
    };

    const projection = generateProjection(months);

    // Data for chart (in millions)
    const projectionData = projection.map(p => ({
        month: p.month,
        projected: p.projected / 1000000,
        conservative: p.conservative / 1000000,
        optimistic: p.optimistic / 1000000
    }));

    // Get last projection values safely
    const lastProjection = projection.length > 0
        ? projection[projection.length - 1]
        : { projected: 0, conservative: 0, optimistic: 0 };

    return (
        <DashboardLayout title="Proyección de Ingresos" links={adminDashboardLinks}>
            <BackButton />
            {/* Config */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Proyecciones Financieras</h2>
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">Estimaciones basadas en tendencias históricas</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">Proyectar:</label>
                    <div className="relative">
                        <select
                            value={months}
                            onChange={(e) => setMonths(parseInt(e.target.value))}
                            className="pl-4 pr-10 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500 appearance-none outline-none cursor-pointer text-gray-900 dark:text-white"
                        >
                            <option value={3}>3 meses</option>
                            <option value={6}>6 meses</option>
                            <option value={12}>12 meses</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6 border-emerald-50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                            <FiTrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Crecimiento Esperado</span>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{growthRate.toFixed(1)}%</p>
                        <p className="text-xs font-bold text-emerald-500 mt-2 uppercase tracking-wide">Mensual Estable</p>
                    </div>
                </div>
                
                <div className="card p-6 border-indigo-50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                            <FiDollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Proyección {months} meses</span>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                            {formatCurrency(lastProjection.projected)}
                        </p>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-wide">Escenario Base</p>
                    </div>
                </div>

                <div className="card p-6 border-amber-50 dark:border-slate-700/50 rounded-2xl">
                    <div className="flex flex-col h-full justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Escenario Conservador</span>
                        <div>
                            <p className="text-xl font-black text-gray-900 dark:text-white leading-none">
                                {formatCurrency(lastProjection.conservative)}
                            </p>
                            <p className="text-[10px] font-bold text-amber-500 mt-2 uppercase tracking-widest">-15% del proyectado</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-emerald-50 dark:border-slate-700/50 rounded-2xl">
                    <div className="flex flex-col h-full justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Escenario Optimista</span>
                        <div>
                            <p className="text-xl font-black text-gray-900 dark:text-white leading-none">
                                {formatCurrency(lastProjection.optimistic)}
                            </p>
                            <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-widest">+20% del proyectado</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projection Chart */}
            <div className="card p-8 mb-8 border-indigo-50 dark:border-slate-800/50 shadow-xl shadow-indigo-500/5">
                <div className="flex flex-col mb-8">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">Curva de Proyección</h3>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">Ingresos en Millones COP</p>
                </div>
                {projectionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={projectionData}>
                            <defs>
                                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}M`} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="conservative"
                                stroke="#F59E0B"
                                fillOpacity={1}
                                fill="url(#colorConservative)"
                                name="Conservador"
                            />
                            <Area
                                type="monotone"
                                dataKey="projected"
                                stroke="#8B5CF6"
                                fillOpacity={1}
                                fill="url(#colorProjected)"
                                name="Proyectado"
                            />
                            <Area
                                type="monotone"
                                dataKey="optimistic"
                                stroke="#10B981"
                                fillOpacity={1}
                                fill="url(#colorOptimistic)"
                                name="Optimista"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        No hay datos suficientes para proyectar
                    </div>
                )}
            </div>

            {/* Projected Table */}
            <div className="card border-blue-50 dark:border-slate-800/50 overflow-hidden shadow-xl shadow-blue-500/5">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-blue-50/10 dark:bg-blue-900/10">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <FiCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white tracking-tight leading-none">Detalle Mensual</h3>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">Desglose de proyecciones por mes</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/30 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Mes</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Conservador</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Proyectado</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Optimista</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Rango (±)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {projection.map((data, index) => {
                                const range = data.optimistic - data.conservative;
                                return (
                                    <tr key={index} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500">
                                                    <FiCalendar className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white">{data.month}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-500 dark:text-gray-400">
                                            {formatCurrency(data.conservative)}
                                        </td>
                                        <td className="p-4 text-right font-black text-indigo-600 dark:text-indigo-400">
                                            {formatCurrency(data.projected)}
                                        </td>
                                        <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(data.optimistic)}
                                        </td>
                                        <td className="p-4 text-right text-xs font-bold text-gray-400">
                                            {formatCurrency(range / 2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default RevenueProjection;

