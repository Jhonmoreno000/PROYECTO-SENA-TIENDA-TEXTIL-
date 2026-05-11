import React, { useState, useMemo, useRef } from 'react';
import { DollarSign, AlertCircle, ToggleLeft, ToggleRight, Target, TrendingUp, Check } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';


const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
const cleanInput = "bg-slate-50 dark:bg-slate-900  border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all";

function VendorPerformance() {
    const { users, orders, updateSellerCommission, toggleSellerSuspension } = useMetrics();
    const [editingCommission, setEditingCommission] = useState(null);
    const [tempCommission, setTempCommission] = useState('');
    const [showSuspendModal, setShowSuspendModal] = useState(null);
    const [suspensionReason, setSuspensionReason] = useState('');
    
    const containerRef = useRef(null);
    const modalRef = useRef(null);
    const modalOverlayRef = useRef(null);

    const sellersRealBI = useMemo(() => {
        const sellers = users.filter(u => u.role === 'seller' || u.role === 'vendedor');
        return sellers.map((seller) => {
            const sellerOrders = orders.filter(o => String(o.sellerId) === String(seller.id));
            const grossSales = sellerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const totalOrders = sellerOrders.length;
            
            return {
                ...seller,
                biMetrics: {
                    grossSales,
                    profitMargin: seller.commissionRate || 15,
                    conversionRate: totalOrders > 0 ? Math.min(100, 2.5 + (totalOrders * 0.1)) : 0,
                    avgMonthlySales: grossSales > 0 ? grossSales / 3 : 0,
                    totalOrders,
                    returnsRate: totalOrders > 0 ? 1.5 : 0
                }
            };
        }).sort((a, b) => b.biMetrics.grossSales - a.biMetrics.grossSales);
    }, [users, orders]);

    const chartData = sellersRealBI.slice(0, 5).map(s => ({
        name: s.name.split(' ')[0],
        ventasBrutas: s.biMetrics.grossSales,
        margenUtilidad: s.biMetrics.profitMargin
    }));

    const totalVendedores = sellersRealBI.length;
    const activos = sellersRealBI.filter(s => !s.suspended).length;
    const conversionPromedio = (sellersRealBI.reduce((sum, s) => sum + s.biMetrics.conversionRate, 0) / (totalVendedores || 1)).toFixed(1);

    const handleUpdateCommission = (sellerId) => {
        if (tempCommission && !isNaN(tempCommission)) {
            updateSellerCommission(sellerId, parseFloat(tempCommission));
        }
        setEditingCommission(null);
        setTempCommission('');
    };

    const handleToggleSuspension = (seller) => {
        if (seller.suspended) {
            toggleSellerSuspension(seller.id);
            setShowSuspendModal(null);
        } else {
            setShowSuspendModal(seller);
        }
    };

    const confirmSuspension = (sellerId) => {
        if (suspensionReason.trim()) {
            toggleSellerSuspension(sellerId, suspensionReason);
            closeModal();
        }
    };

    const closeModal = () => {
        gsap.to(modalRef.current, { scale: 0.95, y: 20, opacity: 0, duration: 0.3, ease: "power2.in" });
        gsap.to(modalOverlayRef.current, { opacity: 0, duration: 0.3, onComplete: () => {
            setShowSuspendModal(null);
            setSuspensionReason('');
        }});
    };

    useGSAP(() => {
        if (showSuspendModal) {
            gsap.fromTo(modalOverlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(modalRef.current, { scale: 0.95, y: 20, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.4)" });
        }
    }, { dependencies: [showSuspendModal] });

    useGSAP(() => {
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
        );
        gsap.fromTo('.chart-container', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
        );
        gsap.fromTo('.table-container', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: "power2.out" }
        );
    }, { scope: containerRef });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <div className="bg-white dark:bg-slate-800  p-4 rounded-xl shadow-2xl border border-white text-slate-900 dark:text-white">
                    <p className="font-bold mb-2 text-slate-700 dark:text-slate-300">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
                            {p.name}: {p.dataKey === 'ventasBrutas' ? formatCurrency(p.value) : `${p.value}%`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">BI: Fuerza de Ventas</h2>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Evaluación de ROI, márgenes de utilidad y tasas de conversión por vendedor.</p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Fuerza Activa', value: `${activos} / ${totalVendedores}`, color: 'indigo', icon: Target, subColor: 'text-slate-400 dark:text-slate-500' },
                            { label: 'Conversión Prom.', value: `${conversionPromedio}%`, color: 'emerald', icon: TrendingUp },
                            { label: 'Comisión Prom.', value: `${(sellersRealBI.reduce((s, v) => s + (v.commissionRate || 0), 0) / (totalVendedores || 1)).toFixed(1)}%`, color: 'amber', icon: DollarSign },
                            { label: 'Suspendidos', value: sellersRealBI.filter(s => s.suspended).length, color: 'rose', icon: AlertCircle },
                        ].map(({ label, value, color, icon: Icon }) => (
                            <div key={label} className={`kpi-card ${glassCard} p-6 border-t-4 border-t-${color}-500 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-50 dark:bg-${color}-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
                                    <div className={`p-2.5 bg-white shadow-sm rounded-xl border border-${color}-100 dark:border-${color}-500/20 text-${color}-600 dark:text-${color}-400`}><Icon size={18} /></div>
                                </div>
                                <p className={`text-4xl font-black text-${color}-600 dark:text-${color}-400 relative z-10`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className={`chart-container ${glassCard} p-6 mb-8`}>
                        <div className="mb-6">
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Relación Ventas vs Utilidad (Top 5)</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Análisis comparativo entre volumen bruto y rentabilidad real de cada cuenta.</p>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} tick={{ fill: '#10b981', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.7)' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar yAxisId="left" dataKey="ventasBrutas" fill="#6366f1" name="Ventas Brutas (COP)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                <Line yAxisId="right" type="monotone" dataKey="margenUtilidad" stroke="#10b981" strokeWidth={3} name="Margen Utilidad (%)" dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 8 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Vendors Table */}
                    <div className={`table-container ${glassCard}`}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Rendimiento Detallado por Vendedor</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        {['Vendedor', 'Prom. Mensual', 'Tasa Conversión', 'Margen', 'Comisión', 'Estado', 'Control'].map(h => (
                                            <th key={h} className="px-6 py-5">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {sellersRealBI.map(seller => (
                                        <tr key={seller.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${seller.suspended ? 'opacity-40 grayscale' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 shadow-sm">
                                                        {seller.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{seller.name}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{seller.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900 dark:text-white text-base">{formatCurrency(seller.biMetrics.avgMonthlySales)}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500">Total: {formatCurrency(seller.biMetrics.grossSales)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                                                    {seller.biMetrics.conversionRate.toFixed(1)}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 text-base">
                                                {seller.biMetrics.profitMargin.toFixed(1)}%
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingCommission === seller.id ? (
                                                    <input
                                                        type="number"
                                                        value={tempCommission}
                                                        onChange={(e) => setTempCommission(e.target.value)}
                                                        onBlur={() => handleUpdateCommission(seller.id)}
                                                        onKeyPress={(e) => { if (e.key === 'Enter') handleUpdateCommission(seller.id); }}
                                                        className={`w-20 px-3 py-1.5 text-right font-mono ${cleanInput}`}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => { setEditingCommission(seller.id); setTempCommission(seller.commissionRate?.toString() || '0'); }}
                                                        className="font-mono font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:text-indigo-400 cursor-pointer border-b-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors text-base pb-0.5"
                                                    >
                                                        {seller.commissionRate || 0}%
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {seller.suspended ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 uppercase tracking-widest">Suspendido</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Activo</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleSuspension(seller)}
                                                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all border-2 ${seller.suspended
                                                        ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                        : 'text-rose-600 dark:text-rose-400 border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                                                    }`}
                                                    title={seller.suspended ? 'Reactivar' : 'Suspender'}
                                                >
                                                    {seller.suspended ? <><ToggleLeft className="inline w-4 h-4 mr-1" />Reactivar</> : <><ToggleRight className="inline w-4 h-4 mr-1" />Suspender</>}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Suspend Modal */}
            {showSuspendModal && (
                <div ref={modalOverlayRef} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div ref={modalRef} className="bg-white dark:bg-slate-800 backdrop-blur-3xl rounded-[2rem] shadow-2xl w-full max-w-md border border-white overflow-hidden p-8 relative">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shadow-inner">
                                <AlertCircle className="w-7 h-7 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Suspender Vendedor</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-6 leading-relaxed">
                            Vas a revocar acceso B2B de <strong className="text-slate-900 dark:text-white">{showSuspendModal.name}</strong>. Documenta la razón para auditoría:
                        </p>
                        <textarea value={suspensionReason} onChange={(e) => setSuspensionReason(e.target.value)} placeholder="Ej: Inconsistencias en reportes de calidad..." className={`w-full px-4 py-3 mb-8 resize-none ${cleanInput}`} rows="3" />
                        <div className="flex gap-4">
                            <button onClick={closeModal} className="flex-1 px-4 py-4 bg-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:bg-slate-500/10 font-bold transition-colors shadow-sm">Cancelar</button>
                            <button onClick={() => confirmSuspension(showSuspendModal.id)} disabled={!suspensionReason.trim()} className="flex-1 px-4 py-4 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-bold transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2">
                                <Check size={18} /> Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default VendorPerformance;

