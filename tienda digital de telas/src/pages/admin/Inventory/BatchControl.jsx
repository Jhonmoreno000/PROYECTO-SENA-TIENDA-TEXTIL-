/**
 * BatchControl.jsx — Gestión de Lotes y Rollos (Creative UX & BI)
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
    Package,
    Plus,
    Edit2,
    Filter,
    AlertTriangle,
    TrendingDown,
    Activity,
    DollarSign,
    Box
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { calculateWastePercentage } from '../../../utils/inventoryUtils';
import adminDashboardLinks from '../../../data/adminDashboardLinks';
import { formatCurrency } from '../../../utils/formatters';

function BatchControl() {
    const { inventoryBatches, wasteEvents, updateBatch, addBatch } = useMetrics();
    
    const [filterType, setFilterType] = useState('all');
    const [deadStockThreshold, setDeadStockThreshold] = useState(30); 
    const [editingBatch, setEditingBatch] = useState(null);
    const containerRef = useRef(null);

    const filteredBatches = inventoryBatches.filter(b => {
        if (filterType === 'all') return true;
        return b.status === filterType;
    });

    const handleUpdateMeters = (batchId, currentMeters) => {
        if (currentMeters && !isNaN(currentMeters)) {
            updateBatch(batchId, { currentMeters: parseInt(currentMeters) });
        }
        setEditingBatch(null);
    };

    const COSTO_PROMEDIO_METRO = 15000;

    const stats = useMemo(() => {
        let active = 0;
        let low = 0;
        let critical = 0;
        let capitalEstancado = 0;

        inventoryBatches.forEach(b => {
            if (b.status === 'active') active++;
            if (b.status === 'low') {
                low++;
                capitalEstancado += (b.currentMeters * COSTO_PROMEDIO_METRO);
            }
            if (b.status === 'critical') {
                critical++;
                capitalEstancado += (b.currentMeters * COSTO_PROMEDIO_METRO);
            }
        });

        return { active, low, critical, capitalEstancado };
    }, [inventoryBatches]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'critical': return 'bg-rose-100 text-rose-700 dark:text-rose-400 border-rose-200';
            case 'low': return 'bg-amber-100 text-amber-700 dark:text-amber-400 border-amber-200';
            case 'active': return 'bg-emerald-100 text-emerald-700 dark:text-emerald-400 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    const getNeonOrb = (status) => {
        switch (status) {
            case 'critical': 
                return <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse" title="Crítico" />;
            case 'low': 
                return <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse" title="Stock Bajo" />;
            case 'active': 
                return <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]" title="Activo" />;
            default: 
                return <div className="w-3 h-3 rounded-full bg-slate-500" />;
        }
    };

    useGSAP(() => {
        gsap.fromTo('.stat-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
        );
    }, { scope: containerRef });

    useGSAP(() => {
        gsap.fromTo('.batch-card', 
            { opacity: 0, scale: 0.95, y: 20 }, 
            { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "back.out(1.2)", clearProps: "all" }
        );
    }, { scope: containerRef, dependencies: [filterType] });

    const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen relative overflow-hidden">
                <div className="relative z-10">
                    <BackButton />
                    
                    <div className="mb-8 mt-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Control de Lotes y Capital</h1>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2 max-w-2xl">
                                Gestión logística inmersiva con análisis predictivo de <strong className="text-rose-600 dark:text-rose-400">capital estancado</strong> en almacén.
                            </p>
                        </div>
                        <button
                            onClick={() => alert('Abrir modal de Nuevo Lote')}
                            className="flex items-center gap-2 px-6 py-3 bg-[#f97316] text-white rounded-xl hover:bg-[#ea580c] transition-colors shadow-[0_0_20px_rgba(249,115,22,0.3)] font-bold shrink-0 w-full sm:w-auto justify-center"
                        >
                            <Plus className="w-5 h-5" />
                            Ingresar Lote
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className={`stat-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-100 rounded-full mix-blend-multiply opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-4 relative z-10">
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-slate-200 dark:border-slate-700">
                                    <Box className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Rollos Totales</span>
                            </div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white relative z-10">{inventoryBatches.length}</div>
                        </div>

                        <div className={`stat-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full mix-blend-multiply opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center gap-3 text-emerald-500 mb-4 relative z-10">
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 dark:text-slate-500">En Movimiento</span>
                            </div>
                            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 relative z-10">{stats.active}</div>
                        </div>

                        <div className={`stat-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group border-t-4 border-t-rose-500 hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full mix-blend-multiply opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center gap-3 text-rose-500 mb-4 relative z-10">
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-rose-200 dark:border-rose-500/20">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 dark:text-slate-500">Alertas de Stock</span>
                            </div>
                            <div className="text-4xl font-black text-rose-600 dark:text-rose-400 relative z-10 flex items-center gap-3">
                                {stats.critical}
                                {stats.critical > 0 && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute left-8 mt-1" />}
                            </div>
                        </div>

                        <div className={`stat-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group bg-gradient-to-br from-amber-500/5 to-rose-500/5 border-amber-200 hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-amber-500/10 rounded-full mix-blend-multiply opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-4 relative z-10">
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-amber-200">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">Capital Riesgo</span>
                            </div>
                            <div className="text-3xl lg:text-4xl font-black text-amber-600 dark:text-amber-400 relative z-10 leading-none">
                                {formatCurrency(stats.capitalEstancado)}
                            </div>
                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400/70 uppercase tracking-widest mt-2 relative z-10">Dinero en lotes bajo/crítico</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-white dark:bg-slate-800  p-4 rounded-2xl border border-white shadow-sm">
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-2 shrink-0">
                                <Filter size={18} /> <span className="text-sm uppercase tracking-widest">Filtros:</span>
                            </div>
                            {[
                                { id: 'all', label: 'Todo el Inventario', count: inventoryBatches.length },
                                { id: 'active', label: 'Lotes Sanos', count: stats.active },
                                { id: 'low', label: 'Stock Bajo', count: stats.low },
                                { id: 'critical', label: 'Críticos', count: stats.critical }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setFilterType(tab.id)}
                                    className={`px-5 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap shadow-sm border ${
                                        filterType === tab.id 
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/20' 
                                        : 'bg-white text-slate-600 dark:text-slate-400 dark:text-slate-500 border-white hover:bg-slate-50 dark:bg-slate-500/10 hover:text-slate-900 dark:text-white'
                                    }`}
                                >
                                    {tab.label} <span className={`ml-1.5 px-2 py-0.5 rounded-md text-xs ${filterType === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-w-[280px]">
                            <TrendingDown className="text-rose-500 w-5 h-5 shrink-0" />
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Umbral Crítico</span>
                                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">{deadStockThreshold}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="50"
                                    step="5"
                                    value={deadStockThreshold}
                                    onChange={(e) => setDeadStockThreshold(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredBatches.map(batch => {
                            const wastePercent = parseFloat(calculateWastePercentage(batch, wasteEvents));
                            const usagePercent = ((batch.currentMeters / batch.initialMeters) * 100);
                            const isCriticalByThreshold = usagePercent <= deadStockThreshold;
                            
                            return (
                                <div 
                                    key={batch.id} 
                                    className={`batch-card ${glassCard} p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group flex flex-col`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                {getNeonOrb(batch.status)}
                                                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">ID: {batch.id}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-[#f97316] transition-colors">{batch.fabricType}</h3>
                                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
                                                <Package size={14} /> {batch.supplier}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${getStatusStyles(batch.status)}`}>
                                            {batch.status === 'critical' ? 'Crítico' : batch.status === 'low' ? 'Bajo' : 'Activo'}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-500/10 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-6 relative overflow-hidden">
                                        {isCriticalByThreshold && <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" title="Bajo el umbral dinámico crítico" />}
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Disp. Actual</span>
                                                
                                                {editingBatch === batch.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            defaultValue={batch.currentMeters}
                                                            onBlur={(e) => handleUpdateMeters(batch.id, e.target.value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter') handleUpdateMeters(batch.id, e.target.value);
                                                            }}
                                                            className="w-24 px-3 py-1.5 text-lg font-black text-slate-900 dark:text-white border-2 border-indigo-500 rounded-lg outline-none bg-white shadow-sm"
                                                            autoFocus
                                                        />
                                                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500">m</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-baseline gap-1 group-hover:cursor-pointer" onClick={() => setEditingBatch(batch.id)}>
                                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{batch.currentMeters}</span>
                                                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500">/ {batch.initialMeters}m</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Merma Acum.</span>
                                                <span className={`text-lg font-black ${wastePercent > 10 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {wastePercent}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-full bg-slate-200 rounded-full h-2.5 mt-3 overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                                    usagePercent > 50 ? 'bg-emerald-500' : usagePercent > deadStockThreshold ? 'bg-amber-500' : 'bg-rose-500'
                                                }`}
                                                style={{ width: `${usagePercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between gap-4">
                                        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                            Actualizado: {new Date(batch.lastUpdate).toLocaleDateString('es-CO')}
                                        </div>
                                        <button 
                                            onClick={() => setEditingBatch(batch.id)}
                                            className="px-4 py-2 text-xs font-black uppercase tracking-widest text-[#f97316] bg-transparent border-2 border-[#f97316]/30 rounded-xl hover:bg-[#f97316] hover:text-white hover:border-[#f97316] transition-all shadow-sm flex items-center gap-2"
                                        >
                                            <Edit2 size={14} /> Ajustar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredBatches.length === 0 && (
                            <div className={`col-span-full ${glassCard} flex flex-col items-center justify-center py-24 text-center border-dashed border-slate-300 animate-in fade-in duration-500`}>
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-500/10 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-inner">
                                    <Box className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sin Resultados</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">No hay lotes que coincidan con este filtro de estado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default BatchControl;

