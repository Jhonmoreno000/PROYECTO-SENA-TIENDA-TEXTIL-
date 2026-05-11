/**
 * WasteCalculator.jsx — Análisis de Merma (Inmersivo Glassmorphism)
 */

import React, { useState, useMemo, useRef } from 'react';
import { AlertTriangle, Plus, DollarSign, X, TrendingDown, Beaker } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { calculateWasteStatsByReason } from '../../../utils/inventoryUtils';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';


const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
const cleanInput = "bg-slate-50 dark:bg-slate-900  border border-slate-200 dark:border-slate-700 focus:border-rose-500 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 transition-all placeholder-slate-400";

const REASON_LABELS = {
    factory_defect: 'Defecto Fábrica',
    cutting_error: 'Error Corte',
    damaged: 'Dañado',
    quality_control: 'Control Calidad'
};
const COLORS = ['#ef4444', '#f59e0b', '#6366f1', '#8b5cf6'];

function WasteCalculator() {
    const { inventoryBatches, wasteEvents, logWaste, users } = useMetrics();
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeReasonFilter, setActiveReasonFilter] = useState(null);
    const [formData, setFormData] = useState({
        rollId: '', meters: '', reason: 'factory_defect', description: '', responsible: ''
    });
    const containerRef = useRef(null);

    const wasteStats = calculateWasteStatsByReason(wasteEvents);
    const totalWasteMeters = wasteEvents.reduce((sum, e) => sum + e.meters, 0);

    const totalWasteCost = useMemo(() => {
        return wasteEvents.reduce((totalCost, event) => {
            const roll = inventoryBatches.find(b => b.id === event.rollId);
            const costPerMeter = roll ? 15000 : 12000;
            return totalCost + (event.meters * costPerMeter);
        }, 0);
    }, [wasteEvents, inventoryBatches]);

    const wasteByReasonData = Object.entries(wasteStats).map(([reason, data]) => ({
        name: REASON_LABELS[reason] || reason,
        dbKey: reason,
        meters: data.totalMeters,
        count: data.count
    }));

    const wasteOverTimeData = wasteEvents.slice(-15).map(event => ({
        date: new Date(event.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
        meters: event.meters,
        cost: event.meters * 15000
    }));

    const handleChartClick = (data) => {
        if (data?.activePayload?.length > 0) {
            const key = data.activePayload[0].payload.dbKey;
            setActiveReasonFilter(prev => prev === key ? null : key);
        }
    };

    const displayEvents = activeReasonFilter
        ? wasteEvents.filter(e => e.reason === activeReasonFilter)
        : wasteEvents;

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentUser = users.find(u => u.name === formData.responsible) || users[0];
        logWaste({ ...formData, meters: parseFloat(formData.meters), userId: currentUser?.id });
        setShowAddModal(false);
        setFormData({ rollId: '', meters: '', reason: 'factory_defect', description: '', responsible: '' });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <div className="bg-white dark:bg-slate-800  p-4 rounded-xl shadow-2xl border border-white text-slate-900 dark:text-white">
                    <p className="font-bold mb-1 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-black" style={{ color: payload[0].color }}>
                        {payload[0].name === 'cost' ? formatCurrency(payload[0].value) : `${payload[0].value}m`}
                    </p>
                </div>
            );
        }
        return null;
    };

    useGSAP(() => {
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 20, scale: 0.97 }, 
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }
        );
        gsap.fromTo('.chart-panel', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, delay: 0.3, stagger: 0.1, ease: "power2.out" }
        );
        gsap.fromTo('.table-panel', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: "power2.out" }
        );
    }, { scope: containerRef });

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-4 gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Análisis de Merma: Causa Raíz</h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Identificación de puntos críticos de pérdida y su impacto financiero directo.</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] font-bold shrink-0"
                        >
                            <Plus className="w-5 h-5" /> Registrar Merma
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className={`kpi-card ${glassCard} p-6 border-t-4 border-t-rose-500 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Costo Financiero</span>
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"><DollarSign size={18} /></div>
                            </div>
                            <p className="text-3xl font-black text-rose-600 dark:text-rose-400 relative z-10">{formatCurrency(totalWasteCost)}</p>
                            <p className="text-xs text-rose-500/80 mt-2 font-medium relative z-10">Dinero inmovilizado / perdido</p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 border-t-4 border-t-amber-500 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 dark:bg-amber-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Volumen Mermado</span>
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"><AlertTriangle size={18} /></div>
                            </div>
                            <p className="text-4xl font-black text-amber-600 dark:text-amber-400 relative z-10">{totalWasteMeters.toFixed(1)} <span className="text-lg font-semibold text-amber-400">mts</span></p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Eventos Críticos</span>
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-500"><TrendingDown size={18} /></div>
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white relative z-10">{wasteEvents.length}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2 font-medium relative z-10">Incidentes documentados</p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 dark:bg-purple-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Causa Principal</span>
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400"><Beaker size={18} /></div>
                            </div>
                            <p className="text-xl font-black text-slate-900 dark:text-white relative z-10 leading-tight">
                                {wasteByReasonData.length > 0
                                    ? wasteByReasonData.sort((a, b) => b.meters - a.meters)[0].name
                                    : 'Sin datos'}
                            </p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        <div className={`chart-panel ${glassCard} p-6`}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">Volumen de Merma por Razón</h3>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">💡 Clic en una barra para filtrar la tabla</p>
                                </div>
                                {activeReasonFilter && (
                                    <button onClick={() => setActiveReasonFilter(null)} className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors">
                                        <X size={12} /> Limpiar
                                    </button>
                                )}
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={wasteByReasonData} onClick={handleChartClick} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.8)' }} />
                                    <Bar dataKey="meters" name="Metros" radius={[8, 8, 0, 0]} cursor="pointer">
                                        {wasteByReasonData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                opacity={activeReasonFilter && activeReasonFilter !== entry.dbKey ? 0.2 : 1}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className={`chart-panel ${glassCard} p-6`}>
                            <div className="mb-6">
                                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Tendencia de Costo de Merma</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Evolución de pérdidas financieras en eventos recientes</p>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={wasteOverTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} dy={10} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
                                    <Line type="monotone" dataKey="cost" name="cost" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#fff', stroke: '#ef4444', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={`table-panel ${glassCard}`}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Registro Detallado de Incidentes</h3>
                                {activeReasonFilter && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">Filtrando por: <strong>{REASON_LABELS[activeReasonFilter]}</strong></p>}
                            </div>
                            {activeReasonFilter && (
                                <button onClick={() => setActiveReasonFilter(null)} className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-500/10 transition-colors shadow-sm">
                                    <X size={12} /> Limpiar Filtro
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        {['Fecha', 'ID Rollo', 'Merma', 'Costo Est.', 'Clasificación', 'Causa Raíz', 'Responsable'].map(h => (
                                            <th key={h} className="px-6 py-4">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {displayEvents.slice().reverse().map(event => {
                                        const roll = inventoryBatches.find(b => b.id === event.rollId);
                                        const costPerMeter = roll ? 15000 : 12000;
                                        return (
                                            <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500">{new Date(event.date).toLocaleDateString('es-CO')}</td>
                                                <td className="px-6 py-4"><span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-1 rounded-lg text-xs">{event.rollId}</span></td>
                                                <td className="px-6 py-4 font-black text-amber-600 dark:text-amber-400 text-base">{event.meters}m</td>
                                                <td className="px-6 py-4 font-bold text-rose-600 dark:text-rose-400">{formatCurrency(event.meters * costPerMeter)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                                        event.reason === 'factory_defect' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' :
                                                        event.reason === 'cutting_error' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' :
                                                        event.reason === 'damaged' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
                                                    }`}>{REASON_LABELS[event.reason] || event.reason}</span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 max-w-[180px] truncate" title={event.description}>{event.description}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 shadow-inner">{(event.responsible || '?').charAt(0)}</div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{event.responsible}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 backdrop-blur-3xl rounded-[2rem] shadow-2xl w-full max-w-lg border border-white overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Registrar Incidente de Merma</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">El inventario se ajustará automáticamente.</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-3 bg-white hover:bg-slate-50 dark:bg-slate-500/10 text-slate-400 dark:text-slate-500 hover:text-rose-500 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Lote / Rollo Afectado</label>
                                    <select value={formData.rollId} onChange={(e) => setFormData({ ...formData, rollId: e.target.value })} className={`w-full px-4 py-3 ${cleanInput}`} required>
                                        <option value="">Selecciona del inventario activo...</option>
                                        {inventoryBatches.filter(b => b.currentMeters > 0).map(batch => (
                                            <option key={batch.id} value={batch.id}>{batch.id} — {batch.fabricType} ({batch.currentMeters}m)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Volumen (m)</label>
                                        <input type="number" step="0.1" min="0.1" value={formData.meters} onChange={(e) => setFormData({ ...formData, meters: e.target.value })} className={`w-full px-4 py-3 font-mono ${cleanInput}`} placeholder="0.0" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Clasificación</label>
                                        <select value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className={`w-full px-4 py-3 ${cleanInput}`}>
                                            <option value="factory_defect">Defecto de Fábrica</option>
                                            <option value="cutting_error">Error Humano (Corte)</option>
                                            <option value="damaged">Dañado en Almacén</option>
                                            <option value="quality_control">Muestra Calidad</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Causa Raíz / Descripción</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`w-full px-4 py-3 resize-none ${cleanInput}`} rows="2" placeholder="Ej: La navaja de corte se atascó..." required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Responsable de Planta</label>
                                    <input type="text" value={formData.responsible} onChange={(e) => setFormData({ ...formData, responsible: e.target.value })} className={`w-full px-4 py-3 ${cleanInput}`} placeholder="Identificación del operario" required />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3.5 bg-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:bg-slate-500/10 font-bold transition-colors">Cancelar</button>
                                    <button type="submit" className="flex-1 px-6 py-3.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex justify-center items-center gap-2">
                                        <AlertTriangle size={18} /> Registrar Incidente
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default WasteCalculator;

