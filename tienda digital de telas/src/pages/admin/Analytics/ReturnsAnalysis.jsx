import React, { useRef } from 'react';
import { Package, DollarSign, AlertCircle, ShoppingBag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

const colorVariants = {
    rose: { icon: "text-rose-600 dark:text-rose-400", border: "border-rose-100 dark:border-rose-500/20", value: "text-rose-600 dark:text-rose-400" },
    indigo: { icon: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-500/20", value: "text-indigo-600 dark:text-indigo-400" },
    slate: { icon: "text-slate-600 dark:text-slate-400", border: "border-slate-100 dark:border-slate-500/20", value: "text-slate-600 dark:text-slate-400" },
    amber: { icon: "text-amber-600 dark:text-amber-400", border: "border-amber-100 dark:border-amber-500/20", value: "text-amber-600 dark:text-amber-400" },
};

function ReturnsAnalysis() {
    const { orders, bugReports, users } = useMetrics();
    const returnedOrders = orders.filter(o => o.returned || o.status === 'returned');
    const returnRate = orders.length > 0 ? (returnedOrders.length / orders.length) * 100 : 0;
    const returnedValue = returnedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const containerRef = useRef(null);

    const returnsByType = {};
    bugReports.forEach(r => {
        const cat = r.productName?.split(' ')[0] || r.category || 'Otros';
        if (!returnsByType[cat]) returnsByType[cat] = { name: cat, count: 0 };
        returnsByType[cat].count++;
    });
    const returnsByTypeArray = Object.values(returnsByType);

    const returnsBySeller = users.filter(u => u.role === 'seller' || u.role === 'vendedor').map(seller => {
        const sr = bugReports.filter(r => r.sellerId === seller.id);
        const so = orders.filter(o => o.sellerId === seller.id);
        return { sellerId: seller.id, sellerName: seller.name, count: sr.length, rate: so.length > 0 ? (sr.length / so.length) * 100 : 0 };
    }).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

    const KPIs = [
        { label: 'Tasa Devolución', value: `${returnRate.toFixed(2)}%`, icon: Package, color: 'rose', top: true },
        { label: 'Total Reportes', value: bugReports.length, icon: AlertCircle, color: 'indigo' },
        { label: 'Total Pedidos', value: orders.length, icon: ShoppingBag, color: 'slate' },
        { label: 'Valor Afectado', value: formatCurrency(returnedValue), icon: DollarSign, color: 'amber' },
    ];

    useGSAP(() => {
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
        );
        gsap.fromTo('.chart-panel', 
            { opacity: 0, scale: 0.95 }, 
            { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.2)", delay: 0.3 }
        );
        gsap.fromTo('.table-container', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 0.5, delay: 0.6, ease: "power2.out" }
        );
    }, { scope: containerRef });

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Análisis de Reportes</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Trazabilidad de incidencias y su impacto en la operación comercial.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        {KPIs.map(({ label, value, icon: Icon, color, top }) => (
                            <div key={label} className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300 ${top ? 'border-t-4 border-t-rose-500' : ''}`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
                                    <div className={`p-2.5 bg-white shadow-sm rounded-xl ${colorVariants[color]?.border || ''} ${colorVariants[color]?.icon || ''}`}><Icon size={18} /></div>
                                </div>
                                <p className={`text-3xl font-black ${colorVariants[color]?.value || ''} relative z-10`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        <div className={`chart-panel ${glassCard} p-6`}>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Reportes por Tipo de Tela</h3>
                            {returnsByTypeArray.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={returnsByTypeArray} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                            {returnsByTypeArray.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest">Sin datos</div>}
                        </div>

                        <div className={`chart-panel ${glassCard} p-6`}>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Top Vendedores con Reportes</h3>
                            {returnsBySeller.length > 0 ? (
                                <div className="space-y-5">
                                    {returnsBySeller.slice(0, 5).map((seller, i) => (
                                        <div key={seller.sellerId} className="flex items-center gap-4 group hover:bg-rose-50 dark:hover:bg-rose-900/20 p-2 -mx-2 rounded-xl transition-colors">
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 font-black shadow-sm">0{i + 1}</div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 dark:text-white mb-1.5">{seller.sellerName}</p>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min((seller.count / (returnsBySeller[0]?.count || 1)) * 100, 100)}%` }} />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-rose-600 dark:text-rose-400">{seller.count}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{seller.rate.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest">Sin reportes</div>}
                        </div>
                    </div>

                    <div className={`table-container ${glassCard} overflow-hidden`}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-black text-slate-900 dark:text-white">Reportes de Calidad Recientes</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                    <tr>{['ID', 'Producto', 'Cliente', 'Descripción', 'Prioridad', 'Estado', 'Fecha'].map(h => <th key={h} className="px-6 py-5">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {bugReports.slice(0, 10).map(report => (
                                        <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">#{report.id.toString().padStart(4, '0')}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{report.productName || 'N/A'}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">{report.clientName || `Cliente ${report.clientId}`}</td>
                                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 max-w-[200px] truncate">{report.description}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${report.priority === 'high' ? 'bg-rose-500 animate-pulse' : report.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${report.priority === 'high' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' : report.priority === 'medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'}`}>
                                                        {report.priority === 'high' ? 'Alta' : report.priority === 'medium' ? 'Media' : 'Baja'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${report.status === 'open' ? 'bg-indigo-500 animate-pulse' : report.status === 'resolved' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{report.status === 'open' ? 'Abierto' : report.status === 'resolved' ? 'Resuelto' : 'En revisión'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500">{new Date(report.date).toLocaleDateString('es-CO')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ReturnsAnalysis;

