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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Proyecciones Financieras</h2>
                    <p className="text-gray-500 mt-1">Estimaciones basadas en tendencias históricas</p>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Proyectar:</label>
                    <select
                        value={months}
                        onChange={(e) => setMonths(parseInt(e.target.value))}
                        className="px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                    >
                        <option value={3}>3 meses</option>
                        <option value={6}>6 meses</option>
                        <option value={12}>12 meses</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiTrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-500">Crecimiento Esperado</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{growthRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">mensual</p>
                </div>
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiDollarSign className="w-5 h-5 text-primary-600" />
                        <span className="text-sm font-medium text-gray-500">Proyección {months} meses</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-600">
                        {formatCurrency(lastProjection.projected)}
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Escenario Conservador</p>
                    <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(lastProjection.conservative)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">-15% del proyectado</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Escenario Optimista</p>
                    <p className="text-xl font-bold text-green-600">
                        {formatCurrency(lastProjection.optimistic)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">+20% del proyectado</p>
                </div>
            </div>

            {/* Projection Chart */}
            <div className="card p-6 mb-8">
                <h3 className="font-bold text-lg mb-4">Proyección de Ingresos (Millones COP)</h3>
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
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg">Detalle de Proyecciones Mensuales</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Mes</th>
                                <th className="px-6 py-4 text-right">Conservador</th>
                                <th className="px-6 py-4 text-right">Proyectado</th>
                                <th className="px-6 py-4 text-right">Optimista</th>
                                <th className="px-6 py-4 text-right">Rango</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {projection.map((data, index) => {
                                const range = data.optimistic - data.conservative;
                                return (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium">{data.month}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-orange-600">
                                            {formatCurrency(data.conservative)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-primary-600">
                                            {formatCurrency(data.projected)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-green-600">
                                            {formatCurrency(data.optimistic)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                                            ±{formatCurrency(range / 2)}
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

