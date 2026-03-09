import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDarkMode } from '../../hooks/useDarkMode';

function BarChart({ data, dataKey = 'value', xKey = 'name', title, height = 300, color = '#8B5CF6' }) {
    const [darkMode] = useDarkMode();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-bold">
                        {typeof payload[0].value === 'number' && payload[0].value > 1000
                            ? `$${payload[0].value.toLocaleString('es-CO')}`
                            : payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full">
            {title && (
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
            )}
            <ResponsiveContainer width="100%" height={height}>
                <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={darkMode ? '#334155' : '#E5E7EB'}
                    />
                    <XAxis
                        dataKey={xKey}
                        stroke={darkMode ? '#94A3B8' : '#6B7280'}
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke={darkMode ? '#94A3B8' : '#6B7280'}
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey={dataKey}
                        fill={color}
                        radius={[8, 8, 0, 0]}
                    />
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default BarChart;
