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
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
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
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Ventas Totales</p>
                    <p className="text-3xl font-bold text-primary-600">{formatCurrency(totalSales)}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Mejor Región</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{topRegions[0]?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(topRegions[0]?.value || 0)}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Departamentos</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{safeRegionSales.length}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Promedio/Región</p>
                    <p className="text-xl font-bold text-green-600">
                        {formatCurrency(safeRegionSales.length > 0 ? totalSales / safeRegionSales.length : 0)}
                    </p>
                </div>
            </div>

            {/* Heat Map */}
            <div className="card p-6 mb-8">
                <h3 className="font-bold text-lg mb-4">Mapa de Calor - Colombia por Departamentos</h3>
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
                    <div key={region.name} className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl ${index === 0
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : index === 1
                                    ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{region.name}</h4>
                                <p className="text-sm text-gray-500">{region.orders} pedidos</p>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-primary-600 mb-2">{formatCurrency(region.value)}</p>
                        <p className="text-sm text-gray-500">
                            Promedio: {formatCurrency(region.avgOrderValue)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Full Table */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg">Todas las Regiones</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Departamento</th>
                                <th className="px-6 py-4 text-right">Ventas</th>
                                <th className="px-6 py-4 text-right">Pedidos</th>
                                <th className="px-6 py-4 text-right">Valor Promedio</th>
                                <th className="px-6 py-4">% del Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {heatMapData.map(region => {
                                const percentage = ((region.value / totalSales) * 100).toFixed(1);
                                return (
                                    <tr key={region.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium">{region.name}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(region.value)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {region.orders}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">
                                            {formatCurrency(region.avgOrderValue)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className="bg-primary-600 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
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

