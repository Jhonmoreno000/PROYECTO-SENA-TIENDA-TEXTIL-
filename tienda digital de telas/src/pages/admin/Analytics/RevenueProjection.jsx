import React, { useState, useMemo } from 'react';
import { Calendar, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function RevenueProjection() {
    const { salesData } = useMetrics();
    const [months, setMonths] = useState(6);
    
    const [growthRate, setGrowthRate] = useState(8.5);
    const [visibleScenarios, setVisibleScenarios] = useState({
        projected: true,
        conservative: true,
        optimistic: true
    });

    const avgDailySales = useMemo(() => {
        const safeSalesData = salesData || [];
        const recentSales = safeSalesData.slice(-30);
        return recentSales.length > 0
            ? recentSales.reduce((sum, d) => sum + (d.value || d.totalSales || 0), 0) / recentSales.length
            : 500000;
    }, [salesData]);
    
    const monthlyAvg = avgDailySales * 30;

    const projection = useMemo(() => {
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const currentMonth = new Date().getMonth();
        const projections = [];
        let baseValue = monthlyAvg;

        for (let i = 1; i <= months; i++) {
            const monthIndex = (currentMonth + i) % 12;
            const projected = baseValue * Math.pow(1 + growthRate / 100, i);
            const conservative = projected * 0.85;
            const optimistic = projected * 1.20;

            projections.push({
                month: monthNames[monthIndex],
                projected: Math.round(projected),
                conservative: Math.round(conservative),
                optimistic: Math.round(optimistic)
            });
        }
        return projections;
    }, [months, growthRate, monthlyAvg]);

    const projectionData = projection.map(p => ({
        month: p.month,
        projected: p.projected / 1000000,
        conservative: p.conservative / 1000000,
        optimistic: p.optimistic / 1000000
    }));

    const lastProjection = projection.length > 0
        ? projection[projection.length - 1]
        : { projected: 0, conservative: 0, optimistic: 0 };

    const handleLegendClick = (e) => {
        const { dataKey } = e;
        setVisibleScenarios(prev => ({
            ...prev,
            [dataKey]: !prev[dataKey]
        }));
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <p className="font-bold mb-2 text-slate-600 dark:text-slate-400 dark:text-slate-500">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value * 1000000)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    
    const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
    const cleanInput = "bg-slate-50 dark:bg-slate-900  border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all";

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div className="-m-6 p-6 min-h-screen">
                
                <div className="mb-8">
                    <BackButton />
                    
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mt-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Business Intelligence: Proyección</h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Modelado dinámico de escenarios financieros y simulación de ingresos.</p>
                        </div>

                        <div className={`flex flex-col sm:flex-row items-center gap-6 p-4 w-full lg:w-auto ${glassCard}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                                    <Calendar className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <select
                                    value={months}
                                    onChange={(e) => setMonths(parseInt(e.target.value))}
                                    className={`rounded-lg text-sm font-bold cursor-pointer px-3 py-2 ${cleanInput}`}
                                >
                                    <option value={3}>3 meses</option>
                                    <option value={6}>6 meses</option>
                                    <option value={12}>12 meses</option>
                                </select>
                            </div>
                            
                            <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

                            <div className="flex items-center gap-4 w-full sm:w-72">
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                                    <Activity className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Crecimiento Mensual</span>
                                        <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400">{growthRate.toFixed(1)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-5"
                                        max="25"
                                        step="0.5"
                                        value={growthRate}
                                        onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className={`${glassCard} p-6 border-t-4 border-t-amber-500 transition-opacity ${!visibleScenarios.conservative ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Escenario Conservador</span>
                            <div className="px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 rounded-md text-[10px] font-bold uppercase tracking-wider">-15% Riesgo</div>
                        </div>
                        <p className="text-4xl font-black text-amber-600 dark:text-amber-400">
                            {formatCurrency(lastProjection.conservative)}
                        </p>
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400/80 mt-2">Cierre esperado al mes {months}</p>
                    </div>
                    
                    <div className={`${glassCard} p-6 border-t-4 border-t-indigo-500 transition-opacity ${!visibleScenarios.projected ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Escenario Base</span>
                            <div className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 rounded-md text-[10px] font-bold uppercase tracking-wider">🎯 Objetivo</div>
                        </div>
                        <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(lastProjection.projected)}
                        </p>
                        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400/80 mt-2">Manteniendo {growthRate}% de growth</p>
                    </div>

                    <div className={`${glassCard} p-6 border-t-4 border-t-emerald-500 transition-opacity ${!visibleScenarios.optimistic ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Escenario Optimista</span>
                            <div className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 rounded-md text-[10px] font-bold uppercase tracking-wider">+20% Upside</div>
                        </div>
                        <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(lastProjection.optimistic)}
                        </p>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400/80 mt-2">Superando expectativas</p>
                    </div>
                </div>

                <div className={`${glassCard} p-6 mb-8`}>
                    <div className="mb-6">
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">Curva Dinámica de Proyección</h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">💡 Haz clic en la leyenda abajo para aislar escenarios.</p>
                    </div>
                    
                    {projectionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}M`} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, opacity: 0.5 }} />
                                <Legend 
                                    onClick={handleLegendClick} 
                                    wrapperStyle={{ cursor: 'pointer', paddingTop: '20px' }}
                                />
                                
                                {visibleScenarios.optimistic && (
                                    <Area type="monotone" dataKey="optimistic" name="Optimista" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorOptimistic)" activeDot={false} />
                                )}
                                
                                {visibleScenarios.projected && (
                                    <Area type="monotone" dataKey="projected" name="Base (Esperado)" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorProjected)" activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                                )}
                                
                                {visibleScenarios.conservative && (
                                    <Area type="monotone" dataKey="conservative" name="Conservador" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorConservative)" activeDot={false} />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400 dark:text-slate-500">
                            No hay datos suficientes para proyectar
                        </div>
                    )}
                </div>

                <div className={`${glassCard}`}>
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Desglose de Caja Proyectada</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-500/10 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-5">Mes</th>
                                    <th className="px-6 py-5 text-right">Conservador (-15%)</th>
                                    <th className="px-6 py-5 text-right text-indigo-600 dark:text-indigo-400">Escenario Base</th>
                                    <th className="px-6 py-5 text-right">Optimista (+20%)</th>
                                    <th className="px-6 py-5 text-right">Spread Riesgo (±)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {projection.map((data, index) => {
                                    const spread = data.optimistic - data.conservative;
                                    return (
                                        <tr key={index} className="hover:bg-slate-50 dark:bg-slate-500/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs">
                                                        M{index + 1}
                                                    </div>
                                                    <span className="font-bold text-slate-900 dark:text-white text-base">{data.month}</span>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold transition-opacity ${!visibleScenarios.conservative ? 'opacity-30' : 'text-amber-600 dark:text-amber-400'}`}>
                                                {formatCurrency(data.conservative)}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-black transition-opacity ${!visibleScenarios.projected ? 'opacity-30' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                {formatCurrency(data.projected)}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold transition-opacity ${!visibleScenarios.optimistic ? 'opacity-30' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {formatCurrency(data.optimistic)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">
                                                {formatCurrency(spread)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default RevenueProjection;
