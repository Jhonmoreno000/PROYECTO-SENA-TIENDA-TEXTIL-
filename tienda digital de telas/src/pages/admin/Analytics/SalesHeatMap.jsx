import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { prepareColombiaHeatMapData } from '../../../utils/analyticsUtils';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function SalesHeatMap() {
    const { regionSales } = useMetrics();
    // Safety check for empty data
    const safeRegionSales = regionSales || [];
    const heatMapData = prepareColombiaHeatMapData(safeRegionSales);
    const topRegions = heatMapData.slice(0, 3);
    const totalSales = safeRegionSales.reduce((sum, r) => sum + (r.sales || 0), 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-none shadow-lg border border-gray-200 dark:border-slate-700">
                    <p className="font-bold text-gray-900 dark:text-white">{data.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ventas: {formatCurrency(data.value)}
                    </p>
                    <p className="text-xs text-gray-500">Pedidos: {data.orders}</p>
                    <p className="text-xs text-gray-500">
                        Promedio: {formatCurrency(data.avgOrderValue)}
                    </p>
                </div>
            );
        }
        return null;
    };

    // If no data, show empty state
    if (safeRegionSales.length === 0) {
        return (
            <DashboardLayout title="Mapa de Calor de Ventas por Región" links={adminDashboardLinks}>
                <BackButton />
                <div className="card p-12 text-center">
                    <p className="text-gray-500">No hay datos de ventas regionales disponibles</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mapa de Calor de Ventas por Región" links={adminDashboardLinks}>
            <BackButton />
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6 border-indigo-50 dark:border-slate-700/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Ventas Totales</p>
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(totalSales)}</p>
                </div>
                <div className="card p-6 border-emerald-50 dark:border-slate-700/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Mejor Región</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white leading-tight">{topRegions[0]?.name || 'N/A'}</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{formatCurrency(topRegions[0]?.value || 0)}</p>
                </div>
                <div className="card p-6 border-amber-50 dark:border-slate-700/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Departamentos</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{safeRegionSales.length}</p>
                </div>
                <div className="card p-6 border-violet-50 dark:border-slate-700/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Promedio por Región</p>
                    <p className="text-xl font-black text-gray-800 dark:text-gray-200">
                        {formatCurrency(safeRegionSales.length > 0 ? totalSales / safeRegionSales.length : 0)}
                    </p>
                </div>
            </div>

            {/* Heat Map */}
            <div className="card p-8 mb-8 shadow-xl shadow-violet-500/5">
                <div className="flex flex-col mb-8">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">Distribución Geográfica</h3>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">Mapa de calor por volumen de ventas</p>
                </div>
                <ResponsiveContainer width="100%" height={500}>
                    <Treemap
                        data={heatMapData}
                        dataKey="value"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill="#8B5CF6"
                        content={<CustomizedContent />}
                    >
                        <Tooltip content={<CustomTooltip />} />
                    </Treemap>
                </ResponsiveContainer>
            </div>

            {/* Top Regions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {topRegions.map((region, index) => (
                    <div key={region.name} className="card p-6 border-indigo-50 dark:border-slate-800/50 rounded-2xl group hover:border-indigo-100 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-105 transition-transform ${index === 0
                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
                                : index === 1
                                    ? 'bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-gray-300'
                                    : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'
                                }`}>
                                0{index + 1}
                            </div>
                            <div>
                                <h4 className="font-black text-lg text-gray-900 dark:text-white">{region.name}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{region.orders} pedidos</p>
                            </div>
                        </div>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-2">{formatCurrency(region.value)}</p>
                        <p className="text-xs font-bold text-gray-500">
                            Ticket prom: {formatCurrency(region.avgOrderValue)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Full Table */}
            <div className="card overflow-hidden shadow-xl shadow-blue-500/5">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-blue-50/10 dark:bg-blue-900/10">
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white tracking-tight leading-none">Desglose por Región</h3>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">Todas las regiones ordenadas por volumen</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/30 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Departamento</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Ventas</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Pedidos</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Ticket Promedio</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Cuota (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {heatMapData.map(region => {
                                const percentage = ((region.value / totalSales) * 100).toFixed(1);
                                return (
                                    <tr key={region.name} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/5 transition-colors group">
                                        <td className="p-4 font-bold text-gray-900 dark:text-white">{region.name}</td>
                                        <td className="p-4 text-right font-black text-indigo-600 dark:text-indigo-400">
                                            {formatCurrency(region.value)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                                {region.orders} UND
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-500 dark:text-gray-400">
                                            {formatCurrency(region.avgOrderValue)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3 justify-end">
                                                <div className="w-24 bg-gray-100 dark:bg-slate-800 rounded-lg h-2 overflow-hidden">
                                                    <div
                                                        className="bg-indigo-500 h-full rounded-lg"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black w-8 text-right text-gray-500">{percentage}%</span>
                                            </div>
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

// Custom Treemap Content
const CustomizedContent = (props) => {
    const { x, y, width, height, name, value } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: `rgba(139, 92, 246, ${Math.min(value / 20000000, 1)})`,
                    stroke: '#fff',
                    strokeWidth: 2,
                    strokeOpacity: 1,
                }}
            />
            {width > 60 && height > 40 && (
                <>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 - 5}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={width > 100 ? 14 : 10}
                        fontWeight="bold"
                    >
                        {name}
                    </text>
                    {width > 100 && (
                        <text
                            x={x + width / 2}
                            y={y + height / 2 + 15}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={12}
                        >
                            ${(value / 1000000).toFixed(1)}M
                        </text>
                    )}
                </>
            )}
        </g>
    );
};

export default SalesHeatMap;

