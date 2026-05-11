import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * ErpAreaChart.jsx — Gráfico Compuesto Avanzado
 * 
 * Muestra una comparativa entre "Ventas Reales" y "Objetivos de Venta",
 * usando áreas superpuestas para una lectura rápida de cumplimiento.
 */
export default function ErpAreaChart({ data, title, subtitle }) {
    
    // Formateador de moneda para el tooltip
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            
            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            {/* Gradiente para Ventas Reales (Naranja/Primario) */}
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                            {/* Gradiente para Objetivos (Gris/Azulado translúcido) */}
                            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        
                        <XAxis 
                            dataKey="date" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                            dx={-10}
                        />
                        
                        <Tooltip 
                            formatter={(value, name) => [formatCurrency(value), name === 'actualSales' ? 'Ventas Reales' : 'Objetivo']}
                            labelFormatter={(label) => `Fecha: ${label}`}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                        />
                        
                        <Legend 
                            verticalAlign="top" 
                            height={36}
                            formatter={(value) => <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{value === 'actualSales' ? 'Ventas Reales' : 'Objetivo Proyectado'}</span>}
                        />
                        
                        {/* Área del Objetivo (De fondo) */}
                        <Area 
                            type="monotone" 
                            dataKey="targetSales" 
                            stroke="#94a3b8" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fillOpacity={1} 
                            fill="url(#colorTarget)" 
                            activeDot={false}
                        />
                        
                        {/* Área de Ventas Reales (Al frente) */}
                        <Area 
                            type="monotone" 
                            dataKey="actualSales" 
                            stroke="#f97316" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorActual)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
