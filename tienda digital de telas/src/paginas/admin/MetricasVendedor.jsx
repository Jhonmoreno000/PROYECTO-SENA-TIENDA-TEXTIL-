import React, { useState, useRef } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, AlertCircle, Package, ChevronDown, ChevronUp } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import LayoutPanel from '../../componentes/layouts/LayoutPanel';
import BackButton from '../../componentes/dashboard/BackButton';
import BarChart from '../../componentes/dashboard/BarChart';
import { useMetricas } from '../../contextos/ContextoMetricas';
import { useProductos } from '../../contextos/ContextoProducto';
import { getAllSellersMetrics } from '../../utilidades/metricsUtils';
import { formatCurrency } from '../../utilidades/formateadores';
import enlacesAdmin from '../../datos/enlacesAdmin';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";

const colorVariants = {
    indigo: { icon: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-500/20", value: "text-indigo-600 dark:text-indigo-400" },
    emerald: { icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-500/20", value: "text-emerald-600 dark:text-emerald-400" },
    rose: { icon: "text-rose-600 dark:text-rose-400", border: "border-rose-100 dark:border-rose-500/20", value: "text-rose-600 dark:text-rose-400" },
    slate: { icon: "text-slate-600 dark:text-slate-400", border: "border-slate-100 dark:border-slate-500/20", value: "text-slate-600 dark:text-slate-400" },
    blue: { icon: "text-blue-600 dark:text-blue-400", border: "border-blue-100 dark:border-blue-500/20", value: "text-blue-600 dark:text-blue-400" },
};

function MetricasVendedor() {
    const { users, orders, bugReports } = useMetricas();
    const { refreshProducts } = useProductos();
    const [selectedSeller, setSelectedSeller] = useState(null);
    const sellers = users.filter(u => u.role === 'vendedor' || u.role === 'vendedor');
    const sellersWithMetrics = getAllSellersMetrics(sellers, orders, bugReports);

    const containerRef = useRef(null);
    const detailRefs = useRef({});

    const chartData = sellersWithMetrics.map(s => ({ name: s.name.split(' ')[0], value: s.metrics.totalSales }));
    
    const handleSellerClick = (vendedor) => {
        const isOpening = selectedSeller?.id !== vendedor.id;

        // Close current if any
        if (selectedSeller) {
            const currentRef = detailRefs.current[selectedSeller.id];
            if (currentRef) {
                gsap.to(currentRef, { height: 0, opacity: 0, duration: 0.3, ease: "power2.inOut" });
            }
        }

        if (isOpening) {
            setSelectedSeller(vendedor);
            const targetRef = detailRefs.current[vendedor.id];
            if (targetRef) {
                gsap.fromTo(targetRef, 
                    { height: 0, opacity: 0 }, 
                    { height: 'auto', opacity: 1, duration: 0.4, ease: "power2.out" }
                );
            }
        } else {
            setSelectedSeller(null);
        }
    };

    useGSAP(() => {
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
        );
        gsap.fromTo('.chart-container', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: "power2.out" }
        );
        gsap.fromTo('.table-container', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: "power2.out" }
        );
    }, { scope: containerRef });

    const totalVentas = sellersWithMetrics.reduce((s, v) => s + v.metrics.totalSales, 0);
    const avgVentas = totalVentas / (sellersWithMetrics.length || 1);
    const totalReportes = sellersWithMetrics.reduce((s, v) => s + v.metrics.bugReportsCount, 0);

    return (
        <LayoutPanel title="" links={enlacesAdmin}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Métricas de Vendedores</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Comparativa de ventas, pedidos y reportes por vendedor.</p>
                    </div>

                    {/* Resumen KPI */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {[
                            { label: 'Mejor Vendedor', value: sellersWithMetrics[0]?.name || 'N/A', sub: sellersWithMetrics[0] ? formatCurrency(sellersWithMetrics[0].metrics.totalSales) : formatCurrency(0), icon: TrendingUp, color: 'indigo' },
                            { label: 'Ventas Promedio', value: formatCurrency(avgVentas), sub: 'por vendedor', icon: DollarSign, color: 'emerald' },
                            { label: 'Total Reportes', value: totalReportes, sub: 'en todos los vendedores', icon: AlertCircle, color: totalReportes > 5 ? 'rose' : 'slate' },
                        ].map(({ label, value, sub, icon: Icon, color }) => (
                            <div key={label} className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-50 rounded-full opacity-40 group-hover:scale-150 transition-transform duration-500`} />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
                                    <div className={`p-2.5 bg-white shadow-sm rounded-xl ${colorVariants[color]?.border || ''} ${colorVariants[color]?.icon || ''}`}><Icon size={18} /></div>
                                </div>
                                <p className="text-2xl font-black text-slate-900 dark:text-white truncate relative z-10">{value}</p>
                                {sub && <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 relative z-10">{sub}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Gráfico */}
                    <div className={`chart-container ${glassCard} p-6 mb-8`}>
                        <BarChart datos={chartData} title="Comparación de Ventas por Vendedor" height={300} color="#6366f1" />
                    </div>

                    {/* Tabla vendedores */}
                    <div className={`table-container ${glassCard} overflow-hidden`}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Desempeño de Vendedores</h2>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Haz clic en un vendedor para ver detalles</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                    <tr>{['Vendedor', 'Ventas Totales', 'Pedidos', 'Ticket Prom.', 'Reportes', 'Estado', ''].map(h => <th key={h} className="px-6 py-5">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {sellersWithMetrics.map(vendedor => (
                                        <React.Fragment key={vendedor.id}>
                                            <tr onClick={() => handleSellerClick(vendedor)} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 shadow-sm">{vendedor.name.charAt(0)}</div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#f97316] transition-colors">{vendedor.name}</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500">{vendedor.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-black text-slate-900 dark:text-white">{formatCurrency(vendedor.metrics.totalSales)}</td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900 dark:text-white">{vendedor.metrics.totalOrders}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">{vendedor.metrics.completedOrders} complet.</p>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(vendedor.metrics.averageTicket)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border w-fit ${vendedor.metrics.bugReportsCount === 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : vendedor.metrics.bugReportsCount <= 2 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${vendedor.metrics.bugReportsCount === 0 ? 'bg-emerald-500' : vendedor.metrics.bugReportsCount <= 2 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`} />
                                                        {vendedor.metrics.bugReportsCount} reps
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border w-fit ${vendedor.active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${vendedor.active ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]' : 'bg-slate-400'}`} />
                                                        {vendedor.active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 dark:text-slate-500">{selectedSeller?.id === vendedor.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</td>
                                            </tr>
                                            {/* Fila expandida */}
                                            <tr>
                                                <td colSpan={7} className="p-0 border-none">
                                                    <div 
                                                        ref={el => detailRefs.current[vendedor.id] = el}
                                                        className="overflow-hidden"
                                                        style={{ height: 0, opacity: 0 }}
                                                    >
                                                        <div className="px-6 py-6 bg-slate-50 dark:bg-slate-800/50 grid md:grid-cols-4 gap-4">
                                                            {[
                                                                { label: 'Ingresos Generados', value: formatCurrency(vendedor.metrics.totalSales), icon: DollarSign, color: 'emerald' },
                                                                { label: 'Pedidos Completados', value: vendedor.metrics.completedOrders, sub: `${vendedor.metrics.pendingOrders} pendientes`, icon: ShoppingBag, color: 'blue' },
                                                                { label: 'Ticket Promedio', value: formatCurrency(vendedor.metrics.averageTicket), icon: Package, color: 'indigo' },
                                                                { label: 'Reportes Recibidos', value: vendedor.metrics.bugReportsCount, sub: `Tasa: ${vendedor.metrics.totalOrders > 0 ? ((vendedor.metrics.bugReportsCount / vendedor.metrics.totalOrders) * 100).toFixed(1) : 0}%`, icon: AlertCircle, color: 'rose' },
                                                            ].map(({ label, value, sub, icon: Icon, color }) => (
                                                                <div key={label} className={`${glassCard} p-5`}>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className={`p-2 bg-white shadow-sm rounded-xl ${colorVariants[color]?.border || ''} ${colorVariants[color]?.icon || ''}`}><Icon size={15} /></div>
                                                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
                                                                    </div>
                                                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
                                                                    {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutPanel>
    );
}

export default MetricasVendedor;
