import React, { useRef } from 'react';
import { Users, DollarSign, ShoppingBag, TrendingUp, Award } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useMetrics } from '../../context/MetricsContext';
import { getAllClientsMetrics, segmentClients } from '../../utils/metricsUtils';
import { formatCurrency } from '../../utils/formatters';
import adminDashboardLinks from '../../data/adminDashboardLinks';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
const MEDAL = ['bg-amber-100 text-amber-600 dark:text-amber-400 border-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.4)]', 'bg-slate-200 text-slate-600 dark:text-slate-400 dark:text-slate-500 border-slate-300', 'bg-orange-100 text-orange-600 dark:text-orange-400 border-orange-200', 'bg-white text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'];

function ClientMetrics() {
    const { users, orders } = useMetrics();
    const clients = users.filter(u => u.role === 'client' || u.role === 'cliente');
    const clientsWithMetrics = getAllClientsMetrics(clients, orders);
    const segments = segmentClients(clients, orders);
    const topClients = clientsWithMetrics.slice(0, 10);

    const containerRef = useRef(null);

    const avgSpent = clientsWithMetrics.reduce((s, c) => s + c.metrics.totalSpent, 0) / (clientsWithMetrics.length || 1);
    const avgPurchases = clientsWithMetrics.reduce((s, c) => s + c.metrics.totalPurchases, 0) / (clientsWithMetrics.length || 1);
    const avgTicket = clientsWithMetrics.reduce((s, c) => s + c.metrics.averageOrderValue, 0) / (clientsWithMetrics.length || 1);

    useGSAP(() => {
        gsap.fromTo('.segment-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
        );
        gsap.fromTo('.table-container', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: "power2.out" }
        );
        gsap.fromTo('.stats-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.5, ease: "power2.out" }
        );
    }, { scope: containerRef });

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Métricas de Clientes</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Segmentación y análisis del comportamiento de compra de tus clientes.</p>
                    </div>

                    {/* Segmentos */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {[
                            { label: 'Clientes VIP', count: segments.vip.length, sub: 'Más de $1.000.000', total: segments.vip.reduce((s, c) => s + c.metrics.totalSpent, 0), icon: Award, color: 'indigo', top: 'border-t-4 border-t-indigo-500' },
                            { label: 'Clientes Regulares', count: segments.regular.length, sub: '$300k – $1.000.000', total: segments.regular.reduce((s, c) => s + c.metrics.totalSpent, 0), icon: Users, color: 'blue', top: 'border-t-4 border-t-blue-500' },
                            { label: 'Clientes Nuevos', count: segments.new.length, sub: 'Menos de $300.000', total: segments.new.reduce((s, c) => s + c.metrics.totalSpent, 0), icon: TrendingUp, color: 'emerald', top: 'border-t-4 border-t-emerald-500' },
                        ].map(({ label, count, sub, total, icon: Icon, color, top }) => (
                            <div key={label} className={`segment-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300 ${top}`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-50 rounded-full opacity-40 group-hover:scale-150 transition-transform duration-500`} />
                                <div className="flex items-center justify-between mb-5 relative z-10">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                                        <h3 className="text-4xl font-black text-slate-900 dark:text-white">{count}</h3>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
                                    </div>
                                    <div className={`p-3 bg-white shadow-sm rounded-xl border border-${color}-100 text-${color}-600`}><Icon size={22} /></div>
                                </div>
                                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 relative z-10">
                                    Valor total: <span className={`font-black text-${color}-600`}>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Top 10 Clientes */}
                    <div className={`table-container ${glassCard} overflow-hidden mb-8`}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Top 10 Clientes</h2>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Ordenados por valor total de compras</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                    <tr>{['#', 'Cliente', 'Total Gastado', 'Compras', 'Val. Promedio', 'Frecuencia', 'Última Compra'].map(h => <th key={h} className="px-6 py-5">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {topClients.map((client, i) => (
                                        <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${MEDAL[Math.min(i, 3)]}`}>{i + 1}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-sm">{client.name.charAt(0)}</div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#f97316] transition-colors">{client.name}</p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500">{client.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-900 dark:text-white">{formatCurrency(client.metrics.totalSpent)}</td>
                                            <td className="px-6 py-4"><span className="px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400">{client.metrics.totalPurchases} ped.</span></td>
                                            <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(client.metrics.averageOrderValue)}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">{client.metrics.purchaseFrequency > 0 ? `Cada ${Math.round(client.metrics.purchaseFrequency)}d` : 'Primera'}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{client.metrics.lastPurchaseDate ? new Date(client.metrics.lastPurchaseDate).toLocaleDateString('es-CO') : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Stats generales */}
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { label: 'Valor Promedio Cliente', value: formatCurrency(avgSpent), icon: DollarSign, color: 'amber' },
                            { label: 'Compras Promedio', value: avgPurchases.toFixed(1), sub: 'por cliente', icon: ShoppingBag, color: 'blue' },
                            { label: 'Mejor Cliente', value: topClients[0]?.name || 'N/A', sub: topClients[0] ? formatCurrency(topClients[0].metrics.totalSpent) : '$0', icon: Award, color: 'indigo' },
                            { label: 'Ticket Promedio', value: formatCurrency(avgTicket), icon: TrendingUp, color: 'emerald' },
                        ].map(({ label, value, sub, icon: Icon, color }) => (
                            <div key={label} className={`stats-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                                <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${color}-50 rounded-full opacity-40 group-hover:scale-150 transition-transform duration-500`} />
                                <div className="flex items-center gap-2 mb-3 relative z-10">
                                    <div className={`p-2 bg-white shadow-sm rounded-xl border border-${color}-100 text-${color}-600`}><Icon size={16} /></div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
                                </div>
                                <p className="text-xl font-black text-slate-900 dark:text-white truncate relative z-10">{value}</p>
                                {sub && <p className="text-xs text-[#f97316] font-bold mt-0.5 relative z-10">{sub}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ClientMetrics;

