import React, { useRef } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MapPin, TrendingUp, Map, BarChart2 } from 'lucide-react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { prepareColombiaHeatMapData } from '../../../utils/analyticsUtils';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';


const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";

const colorVariants = {
    indigo: { icon: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-500/20", value: "text-indigo-600 dark:text-indigo-400" },
    emerald: { icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-500/20", value: "text-emerald-600 dark:text-emerald-400" },
    amber: { icon: "text-amber-600 dark:text-amber-400", border: "border-amber-100 dark:border-amber-500/20", value: "text-amber-600 dark:text-amber-400" },
    violet: { icon: "text-violet-600 dark:text-violet-400", border: "border-violet-100 dark:border-violet-500/20", value: "text-violet-600 dark:text-violet-400" },
};

const CustomizedContent = ({ x, y, width, height, name, value }) => (
    <g>
        <rect x={x} y={y} width={width} height={height} style={{ fill: `rgba(99,102,241,${Math.min(value / 20000000, 1)})`, stroke: '#fff', strokeWidth: 2 }} />
        {width > 60 && height > 40 && (
            <>
                <text x={x + width / 2} y={y + height / 2 - 5} textAnchor="middle" fill="#fff" fontSize={width > 100 ? 14 : 10} fontWeight="bold">{name}</text>
                {width > 100 && <text x={x + width / 2} y={y + height / 2 + 15} textAnchor="middle" fill="#fff" fontSize={12}>${(value / 1000000).toFixed(1)}M</text>}
            </>
        )}
    </g>
);

function SalesHeatMap() {
    const { regionSales } = useMetrics();
    const safeRegionSales = regionSales || [];
    const heatMapData = prepareColombiaHeatMapData(safeRegionSales);
    const topRegions = heatMapData.slice(0, 3);
    const totalSales = safeRegionSales.reduce((sum, r) => sum + (r.sales || 0), 0);

    const containerRef = useRef(null);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload?.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-white dark:bg-slate-800  p-4 rounded-xl shadow-2xl border border-white text-slate-900 dark:text-white">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">{d.name}</p>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Ventas: {formatCurrency(d.value)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Pedidos: {d.orders}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Promedio: {formatCurrency(d.avgOrderValue)}</p>
                </div>
            );
        }
        return null;
    };

    const MEDAL = ['bg-amber-100 text-amber-600 dark:text-amber-400 border-amber-200', 'bg-slate-200 text-slate-600 dark:text-slate-400 dark:text-slate-500 border-slate-300', 'bg-orange-100 text-orange-600 dark:text-orange-400 border-orange-200'];

    const KPIs = [
        { label: 'Ventas Totales', value: formatCurrency(totalSales), color: 'indigo', icon: TrendingUp },
        { label: 'Mejor Región', value: topRegions[0]?.name || 'N/A', sub: formatCurrency(topRegions[0]?.value || 0), color: 'emerald', icon: MapPin },
        { label: 'Departamentos', value: safeRegionSales.length, color: 'amber', icon: Map },
        { label: 'Promedio/Región', value: formatCurrency(safeRegionSales.length > 0 ? totalSales / safeRegionSales.length : 0), color: 'violet', icon: BarChart2 },
    ];

    useGSAP(() => {
        if (safeRegionSales.length === 0) return;
        
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
        );
        gsap.fromTo('.chart-panel', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
        );
        gsap.fromTo('.region-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.5, ease: "power2.out" }
        );
        gsap.fromTo('.table-container', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, delay: 0.8, ease: "power2.out" }
        );
    }, { scope: containerRef });

    if (safeRegionSales.length === 0) {
        return (
            <DashboardLayout title="" links={adminDashboardLinks}>
                <div className="-m-6 p-6 min-h-screen">
                    <BackButton />
                    <div className={`${glassCard} p-12 text-center mt-8 flex flex-col items-center`}>
                        <Map className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold">No hay datos de ventas regionales disponibles</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Mapa de Ventas por Región</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Distribución geográfica del volumen de ventas en Colombia.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        {KPIs.map(({ label, value, sub, color, icon: Icon }) => (
                            <div key={label} className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
                                    <div className={`p-2.5 bg-white shadow-sm rounded-xl ${colorVariants[color]?.border || ''} ${colorVariants[color]?.icon || ''}`}><Icon size={18} /></div>
                                </div>
                                <p className={`text-2xl font-black ${colorVariants[color]?.value || ''} relative z-10 leading-tight`}>{value}</p>
                                {sub && <p className="text-xs font-bold text-emerald-500 mt-1 relative z-10">{sub}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Treemap */}
                    <div className={`chart-panel ${glassCard} p-6 mb-8`}>
                        <div className="mb-6">
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Distribución Geográfica</h3>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Mapa de calor por volumen de ventas</p>
                        </div>
                        <ResponsiveContainer width="100%" height={500}>
                            <Treemap data={heatMapData} dataKey="value" aspectRatio={4 / 3} stroke="#fff" fill="#6366f1" content={<CustomizedContent />}>
                                <Tooltip content={<CustomTooltip />} />
                            </Treemap>
                        </ResponsiveContainer>
                    </div>

                    {/* Top 3 Regions */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {topRegions.map((region, i) => (
                            <div key={region.name} className={`region-card ${glassCard} p-6 group hover:-translate-y-1 transition-all duration-300`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner border ${MEDAL[i]}`}>0{i + 1}</div>
                                    <div>
                                        <h4 className="font-black text-lg text-slate-900 dark:text-white">{region.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{region.orders} pedidos</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-2">{formatCurrency(region.value)}</p>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">Ticket prom: {formatCurrency(region.avgOrderValue)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Full Table */}
                    <div className={`table-container ${glassCard} overflow-hidden`}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-black text-slate-900 dark:text-white">Desglose por Región</h3>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Todas las regiones ordenadas por volumen</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        {['Departamento', 'Ventas', 'Pedidos', 'Ticket Promedio', 'Cuota (%)'].map(h => <th key={h} className="px-6 py-5">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {heatMapData.map(region => {
                                        const pct = ((region.value / totalSales) * 100).toFixed(1);
                                        return (
                                            <tr key={region.name} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{region.name}</td>
                                                <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(region.value)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">{region.orders} UND</span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500">{formatCurrency(region.avgOrderValue)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 dark:text-slate-500">{pct}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default SalesHeatMap;

