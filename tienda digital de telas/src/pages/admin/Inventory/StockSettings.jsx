import React, { useState, useRef } from 'react';
import { Bell, Mail, AlertTriangle, CheckCircle, Settings, Edit2, Check } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { getActiveStockAlerts } from '../../../utils/inventoryUtils';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
const glassInput = "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#f97316] rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all";

function StockSettings() {
    const { inventoryBatches, stockThresholds, updateStockThreshold } = useMetrics();
    const [editingType, setEditingType] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [emailEnabled, setEmailEnabled] = useState(true);
    const activeAlerts = getActiveStockAlerts(inventoryBatches, stockThresholds);
    const containerRef = useRef(null);

    const handleUpdateThreshold = (fabricType) => {
        if (tempValue && !isNaN(tempValue)) updateStockThreshold(fabricType, parseInt(tempValue));
        setEditingType(null); setTempValue('');
    };

    useGSAP(() => {
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
        );
        gsap.fromTo('.table-panel', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
        );
        gsap.fromTo('.alert-card', 
            { opacity: 0, x: -20 }, 
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, delay: 0.6, ease: "power2.out" }
        );
    }, { scope: containerRef });

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Alertas de Stock</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Configura umbrales mínimos por tipo de tela y gestiona las notificaciones.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 mb-8">
                        <div className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300 ${activeAlerts.length > 0 ? 'border-t-4 border-t-rose-500' : 'border-t-4 border-t-emerald-500'}`}>
                            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-40 group-hover:scale-150 transition-transform duration-500 ${activeAlerts.length > 0 ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10'}`} />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Alertas Activas</span>
                                <div className={`p-2.5 bg-white shadow-sm rounded-xl border ${activeAlerts.length > 0 ? 'border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400' : 'border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                                    <Bell size={18} />
                                </div>
                            </div>
                            <p className={`text-4xl font-black relative z-10 ${activeAlerts.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{activeAlerts.length}</p>
                            {activeAlerts.length > 0 && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-6 right-10" />}
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full opacity-40 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Notificaciones Email</span>
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400"><Mail size={18} /></div>
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <button onClick={() => setEmailEnabled(!emailEnabled)} className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${emailEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${emailEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                                </button>
                                <span className={`text-sm font-black ${emailEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{emailEnabled ? 'Activo' : 'Inactivo'}</span>
                            </div>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 dark:bg-amber-500/10 rounded-full opacity-40 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Umbrales Configurados</span>
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"><Settings size={18} /></div>
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white relative z-10">{stockThresholds.length}</p>
                        </div>
                    </div>

                    <div className={`table-panel ${glassCard} overflow-hidden mb-8`}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-black text-slate-900 dark:text-white text-xl">Umbrales por Tipo de Tela</h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Haz clic en el valor para editar · Enter o clic fuera para guardar</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                    <tr>{['Tipo de Tela', 'Stock Actual', 'Umbral Mínimo (m)', 'Estado', 'Alerta'].map(h => <th key={h} className="px-6 py-5">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {stockThresholds.map(threshold => {
                                        const currentStock = inventoryBatches.filter(b => b.fabricType === threshold.fabricType).reduce((s, b) => s + b.currentMeters, 0);
                                        const isLow = currentStock <= threshold.minMeters;
                                        return (
                                            <tr key={threshold.fabricType} className={`transition-colors ${isLow ? 'bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-50 dark:hover:bg-rose-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{threshold.fabricType}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-mono font-black text-lg ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>{currentStock}m</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingType === threshold.fabricType ? (
                                                        <div className="flex items-center gap-2">
                                                            <input type="number" value={tempValue} onChange={e => setTempValue(e.target.value)}
                                                                onBlur={() => handleUpdateThreshold(threshold.fabricType)}
                                                                onKeyDown={e => { if (e.key === 'Enter') handleUpdateThreshold(threshold.fabricType); }}
                                                                className={`w-24 px-3 py-2 text-right font-mono ${glassInput}`} autoFocus />
                                                            <button onClick={() => handleUpdateThreshold(threshold.fabricType)} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 transition-colors"><Check size={14} /></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => { setEditingType(threshold.fabricType); setTempValue(threshold.minMeters.toString()); }}
                                                            className="flex items-center gap-2 font-mono font-black text-slate-700 dark:text-slate-300 hover:text-[#f97316] transition-colors group/edit">
                                                            {threshold.minMeters}m
                                                            <Edit2 size={13} className="opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isLow ? (
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 w-fit">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Stock Bajo
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 w-fit">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Normal
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`w-9 h-5 rounded-full transition-colors ${threshold.alertEnabled ? 'bg-emerald-500' : 'bg-slate-200'} relative`}>
                                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${threshold.alertEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {activeAlerts.length > 0 ? (
                            <div className={`${glassCard} overflow-hidden border-rose-200/60 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                <div className="p-6 border-b border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shadow-sm"><AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" /></div>
                                    <div>
                                        <h3 className="font-black text-rose-900 text-lg">Alertas de Stock Activas</h3>
                                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400/80 mt-0.5 uppercase tracking-widest">{activeAlerts.length} rollo{activeAlerts.length !== 1 ? 's' : ''} por debajo del umbral mínimo</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3">
                                    {activeAlerts.map((alert, i) => (
                                        <div key={i} className="alert-card flex items-center justify-between p-5 bg-white dark:bg-slate-800  border-l-4 border-rose-500 rounded-r-2xl shadow-sm">
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white">{alert.fabricType} · Rollo {alert.rollId}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">{alert.message}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actual</p>
                                                <p className="text-3xl font-black text-rose-600 dark:text-rose-400">{alert.currentMeters}m</p>
                                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Mínimo: {alert.threshold}m</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={`${glassCard} flex items-center gap-5 p-6 animate-in fade-in duration-500`}>
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shadow-sm"><CheckCircle className="w-7 h-7 text-emerald-500" /></div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white text-xl">Todo en orden</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">No hay rollos por debajo de los umbrales configurados.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default StockSettings;

