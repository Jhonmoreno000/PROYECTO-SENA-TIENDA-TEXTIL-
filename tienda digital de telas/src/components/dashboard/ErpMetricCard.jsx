import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * ErpMetricCard.jsx — Tarjeta de Métrica de Alta Densidad (ERP)
 * 
 * Incorpora un Sparkline (Mini gráfico de área) en el fondo para
 * mostrar la tendencia histórica reciente sin ocupar espacio extra.
 *
 * @component
 * @param {Object} props
 * @param {string} props.title - Título de la métrica
 * @param {string|number} props.value - Valor principal a mostrar
 * @param {string} [props.subtitle] - Texto secundario descriptivo
 * @param {React.ElementType} props.icon - Componente de icono de lucide-react
 * @param {Array} [props.trendData] - Datos para el mini gráfico (sparkline)
 * @param {string} [props.trendValue] - Valor numérico o texto de tendencia (ej: "+5.2%")
 * @param {string} [props.trendDirection="up"] - Dirección de la tendencia ("up", "down", "neutral")
 * @param {string} [props.colorKey="blue"] - Tema de color ("blue", "green", "rose", "amber", "orange")
 * @returns {JSX.Element}
 */
export default function ErpMetricCard({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trendData, // Array de datos para el sparkline e.g. [{ value: 10 }, { value: 15 }]
    trendValue, // Porcentaje de crecimiento e.g. "+5.2%"
    trendDirection = "up", // "up", "down", "neutral"
    colorKey = "blue" // "blue", "green", "rose", "amber"
}) {
    
    // Mapeo de colores estandarizado para Data Analytics
    const colorMap = {
        blue: { stroke: "#3b82f6", fill: "#93c5fd" },
        green: { stroke: "#10b981", fill: "#6ee7b7" },
        rose: { stroke: "#f43f5e", fill: "#fda4af" },
        amber: { stroke: "#f59e0b", fill: "#fcd34d" },
        orange: { stroke: "#f97316", fill: "#fdba74" }
    };

    const currentColors = colorMap[colorKey] || colorMap.blue;

    return (
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-between min-h-[140px] group hover:shadow-md transition-shadow">
            
            {/* Contenido Principal (Z-Index alto para sobreponerse al Sparkline) */}
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <div className={`p-2 rounded-lg bg-${colorKey}-50 dark:bg-${colorKey}-900/20 text-${colorKey}-500`}>
                        {Icon && <Icon size={18} strokeWidth={2} />}
                    </div>
                </div>
                
                <div className="flex items-end gap-3 mt-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
                    
                    {/* Indicador de Tendencia Numérico */}
                    {trendValue && (
                        <span className={`flex items-center text-xs font-semibold mb-1 ${
                            trendDirection === 'up' ? 'text-green-500' : 
                            trendDirection === 'down' ? 'text-rose-500' : 'text-gray-500'
                        }`}>
                            {trendDirection === 'up' && <TrendingUp size={12} className="mr-1" />}
                            {trendDirection === 'down' && <TrendingDown size={12} className="mr-1" />}
                            {trendDirection === 'neutral' && <Minus size={12} className="mr-1" />}
                            {trendValue}
                        </span>
                    )}
                </div>
                
                {subtitle && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-1">{subtitle}</p>
                )}
            </div>

            {/* Sparkline Background (Gráfico de área minimalista) */}
            {trendData && trendData.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentColors.fill} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={currentColors.fill} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke={currentColors.stroke} 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill={`url(#color-${title})`} 
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
