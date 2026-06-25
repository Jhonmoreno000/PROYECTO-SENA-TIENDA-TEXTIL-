import React, { useState, useRef } from 'react';
import { Clock, Download, Filter, Search, Package, TrendingDown, ShoppingBag } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { generateMovementHistory } from '../../../utils/inventoryUtils';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
const glassInput = "bg-slate-50 dark:bg-slate-900  border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400";

function MovementHistory() {
    const { inventoryBatches, wasteEvents, orders } = useMetrics();
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const movements = generateMovementHistory(inventoryBatches, wasteEvents, orders);
    const containerRef = useRef(null);

    const filteredMovements = movements.filter(m => {
        const mt = filterType === 'all' || m.type === filterType;
        const ms = searchTerm === '' || m.rollId.toLowerCase().includes(searchTerm.toLowerCase()) || m.user.toLowerCase().includes(searchTerm.toLowerCase()) || m.fabricType.toLowerCase().includes(searchTerm.toLowerCase());
        return mt && ms;
    });

    const exportToCSV = () => {
        const headers = ['Fecha', 'Tipo', 'Usuario', 'Rollo', 'Tela', 'Metros', 'Razón', 'Estado'];
        const rows = filteredMovements.map(m => [m.date, m.type, m.user, m.rollId, m.fabricType, m.metersChanged, m.reason, m.status]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `historial_inventario_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    };

    const wasteCount = movements.filter(m => m.type === 'waste').length;
    const saleCount = movements.filter(m => m.type === 'sale').length;

    const TABS = [
        { id: 'all', label: 'Todos', count: movements.length },
        { id: 'waste', label: 'Merma', count: wasteCount, activeClass: 'bg-rose-600 text-white border-rose-600' },
        { id: 'sale', label: 'Ventas', count: saleCount, activeClass: 'bg-emerald-600 text-white border-emerald-600' },
    ];

    useGSAP(() => {
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
        );
        gsap.fromTo('.table-panel', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
        );
    }, { scope: containerRef });

    useGSAP(() => {
        gsap.fromTo('.table-row', 
            { opacity: 0, x: -10 }, 
            { opacity: 1, x: 0, duration: 0.3, stagger: 0.02, ease: "power2.out" }
        );
    }, { scope: containerRef, dependencies: [filterType, searchTerm] });

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Historial de Movimientos</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Trazabilidad completa de entradas, salidas y mermas del inventario.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {[
                            { label: 'Total Movimientos', value: movements.length, icon: Clock, color: 'slate' },
                            { label: 'Eventos de Merma', value: wasteCount, icon: TrendingDown, color: 'rose', top: wasteCount > 0 },
                            { label: 'Movimientos por Venta', value: saleCount, icon: ShoppingBag, color: 'emerald' },
                        ].map(({ label, value, icon: Icon, color, top }) => (
                            <div key={label} className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300 ${top ? 'border-t-4 border-t-rose-500' : ''}`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-50 rounded-full opacity-40 group-hover:scale-150 transition-transform duration-500`} />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
                                    <div className={`p-2.5 bg-white shadow-sm rounded-xl border border-${color}-100 text-${color}-600`}><Icon size={18} /></div>
                                </div>
                                <p className={`text-4xl font-black text-${color}-600 relative z-10`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className={`${glassCard} p-5 mb-6 flex flex-wrap gap-4 items-center`}>
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                            <input type="text" placeholder="Buscar por rollo, usuario o tela..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full pl-11 pr-4 py-3 ${glassInput}`} />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter size={16} className="text-slate-400 dark:text-slate-500" />
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => setFilterType(tab.id)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${filterType === tab.id ? (tab.activeClass || 'bg-slate-900 text-white border-slate-900') : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-white'}`}>
                                    {tab.label} <span className="ml-1 opacity-70">({tab.count})</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={exportToCSV}
                            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shrink-0">
                            <Download size={15} /> Exportar CSV
                        </button>
                    </div>

                    <div className={`table-panel ${glassCard} overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                    <tr>{['Fecha', 'Tipo', 'Usuario', 'Rollo', 'Tipo de Tela', 'Metros', 'Razón', 'Estado'].map(h => <th key={h} className="px-6 py-5">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredMovements.slice(0, 50).map((m) => (
                                        <tr key={m.id} className="table-row hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{new Date(m.date).toLocaleDateString('es-CO')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border w-fit ${m.type === 'waste' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${m.type === 'waste' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                                    {m.type === 'waste' ? 'Merma' : 'Venta'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{m.user}</td>
                                            <td className="px-6 py-4 font-mono font-black text-indigo-600 dark:text-indigo-400">{m.rollId}</td>
                                            <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500">{m.fabricType}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-mono font-black ${m.metersChanged < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                    {m.metersChanged > 0 ? '+' : ''}{m.metersChanged}m
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 max-w-[160px] truncate">{m.reason}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                                    {m.status === 'completed' ? 'Completado' : m.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredMovements.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-500">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-500/10 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-inner"><Package className="w-10 h-10 text-slate-300" /></div>
                                    <p className="font-bold text-slate-900 dark:text-white text-xl mb-2">Sin resultados</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Ajusta los filtros de búsqueda.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default MovementHistory;

