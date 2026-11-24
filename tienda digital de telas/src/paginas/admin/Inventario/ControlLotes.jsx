/**
 * ControlLotes.jsx — Auditoría de Lotes y Capital (Solo Lectura + Notificación al Vendedor)
 */

import React, { useState, useMemo, useRef } from 'react';
import {
    Store,
    Filter,
    AlertTriangle,
    TrendingDown,
    Activity,
    DollarSign,
    Box,
    Bell,
    Lock,
    CheckCircle2,
    Mail
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import LayoutPanel from '../../../componentes/layouts/LayoutPanel';
import BackButton from '../../../componentes/dashboard/BackButton';
import { useMetricas } from '../../../contextos/ContextoMetricas';
import { useNotificacion } from '../../../contextos/ContextoNotificacion';
import { calculateWastePercentage } from '../../../utilidades/inventoryUtils';
import enlacesAdmin from '../../../datos/enlacesAdmin';
import { formatCurrency } from '../../../utilidades/formateadores';

const glassCard = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl';
const glassInput = 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#f97316] rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all';

function ControlLotes() {
    const { inventoryBatches, wasteEvents, stockThresholds, notifyVendorLowStock } = useMetricas();
    const { showNotification } = useNotificacion();

    const [filterType, setFilterType] = useState('all');
    const [filterSeller, setFilterSeller] = useState('all');
    const [deadStockThreshold, setDeadStockThreshold] = useState(30);
    const [sendingBatchId, setSendingBatchId] = useState(null);
    const [notifiedBatchIds, setNotifiedBatchIds] = useState({});
    const containerRef = useRef(null);

    const stores = useMemo(() => {
        const names = inventoryBatches
            .map(b => b.storeName || b.supplier)
            .filter(Boolean);
        return [...new Set(names)];
    }, [inventoryBatches]);

    const filteredBatches = useMemo(() => {
        return inventoryBatches.filter(b => {
            const statusOk = filterType === 'all' || b.status === filterType;
            const storeName = b.storeName || b.supplier || '';
            const sellerOk = filterSeller === 'all' || storeName === filterSeller;
            return statusOk && sellerOk;
        });
    }, [inventoryBatches, filterType, filterSeller]);

    const stats = useMemo(() => {
        let active = 0;
        let low = 0;
        let critical = 0;
        let capitalRiesgo = 0;

        inventoryBatches.forEach(b => {
            const costoReal = Number(b.costPerMeter || 0);
            const metrosActuales = Number(b.currentMeters || 0);
            if (b.status === 'active') active++;
            if (b.status === 'low') {
                low++;
                capitalRiesgo += metrosActuales * costoReal;
            }
            if (b.status === 'critical' || b.status === 'depleted') {
                critical++;
                capitalRiesgo += metrosActuales * costoReal;
            }
        });

        return { active, low, critical, capitalRiesgo };
    }, [inventoryBatches]);

    const getStatusLabel = (status) => {
        switch (status) {
            case 'critical': return 'Crítico';
            case 'depleted': return 'Agotado';
            case 'low': return 'Stock Bajo';
            default: return 'Activo';
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'critical':
            case 'depleted':
                return 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
            case 'low':
                return 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
            default:
                return 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
        }
    };

    const getNeonOrb = (status) => {
        switch (status) {
            case 'critical':
            case 'depleted':
                return <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse" title="Crítico" />;
            case 'low':
                return <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse" title="Stock Bajo" />;
            default:
                return <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]" title="Activo" />;
        }
    };

    const handleNotifyVendorStock = async (batch) => {
        if (!batch.sellerId) {
            showNotification('error', 'Este lote no tiene un vendedor propietario vinculado en PostgreSQL.');
            return;
        }
        const fType = batch.fabricType || batch.productName || '';
        const thr = (stockThresholds || []).find(t => (t.fabricType === fType || t.tipoTela === fType));
        const thresholdMeters = Number(thr?.minMeters ?? thr?.metrosMinimos ?? 20);

        setSendingBatchId(batch.id);
        try {
            await notifyVendorLowStock({
                sellerId: batch.sellerId,
                productId: batch.productId,
                fabricName: fType,
                batchNumber: batch.batchNumber || batch.batchCode,
                currentMeters: batch.currentMeters,
                threshold: thresholdMeters
            });
            setNotifiedBatchIds(prev => ({ ...prev, [batch.id]: true }));
            showNotification('success', `Alerta de stock enviada a ${batch.storeName || batch.supplier} (${batch.sellerEmail || 'vendedor'}).`);
        } catch (err) {
            showNotification('error', err?.message || 'No se pudo enviar la notificación al vendedor.');
        } finally {
            setSendingBatchId(null);
        }
    };

    useGSAP(() => {
        gsap.fromTo('.stat-card',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.28, stagger: 0.025, ease: 'power3.out', force3D: true, clearProps: 'transform' }
        );
    }, { scope: containerRef });

    useGSAP(() => {
        gsap.fromTo('.batch-card',
            { opacity: 0, scale: 0.98, y: 12 },
            { opacity: 1, scale: 1, y: 0, duration: 0.25, stagger: 0.02, ease: 'back.out(1.15)', force3D: true, clearProps: 'all' }
        );
    }, { scope: containerRef, dependencies: [filterType, filterSeller] });

    return (
        <LayoutPanel title="" links={enlacesAdmin}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen relative overflow-hidden">
                <div className="relative z-10">
                    <BackButton />

                    <div className="mb-6 mt-4 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Auditoría de Lotes por Vendedor</h1>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                                Revisión en tiempo real de rollos, costo real por metro y alertas de reposición para cada proveedor en PostgreSQL.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold shrink-0">
                            <Lock className="w-4 h-4 shrink-0" />
                            Control Antifraude: Lotes de Solo Lectura (Propiedad Exclusiva del Vendedor)
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className={`stat-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 mb-4">
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <Box className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Lotes Auditados</span>
                            </div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white">{inventoryBatches.length}</div>
                        </div>

                        <div className={`stat-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center gap-3 text-emerald-500 mb-4">
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Lotes Sanos</span>
                            </div>
                            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</div>
                        </div>

                        <div className={`stat-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group border-t-4 border-t-rose-500 hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center gap-3 text-rose-500 mb-4">
                                <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Stock Crítico / Bajo</span>
                            </div>
                            <div className="text-4xl font-black text-rose-600 dark:text-rose-400">
                                {stats.low + stats.critical}
                            </div>
                        </div>

                        <div className={`stat-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group border-amber-200 dark:border-amber-500/30 hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-4">
                                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Capital Real en Alerta</span>
                            </div>
                            <div className="text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">
                                {formatCurrency(stats.capitalRiesgo)}
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Calculado según costo real por metro</p>
                        </div>
                    </div>

                    <div className={`${glassCard} flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8 p-4`}>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold px-2 shrink-0">
                                <Filter size={16} /> <span className="text-xs uppercase tracking-widest">Estado:</span>
                            </div>
                            {[
                                { id: 'all', label: 'Todos', count: inventoryBatches.length },
                                { id: 'active', label: 'Activos', count: stats.active },
                                { id: 'low', label: 'Stock Bajo', count: stats.low },
                                { id: 'critical', label: 'Críticos', count: stats.critical }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterType(tab.id)}
                                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap border ${
                                        filterType === tab.id
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {tab.label} <span className="ml-1 opacity-75">({tab.count})</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={filterSeller}
                                onChange={e => setFilterSeller(e.target.value)}
                                className={`px-3.5 py-2 text-xs font-bold ${glassInput}`}
                                aria-label="Filtrar por tienda vendedora"
                            >
                                <option value="all">Todas las Tiendas ({stores.length})</option>
                                {stores.map(store => (
                                    <option key={store} value={store}>{store}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 min-w-[230px]">
                                <TrendingDown className="text-rose-500 w-4 h-4 shrink-0" />
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Umbral Visual</span>
                                        <span className="text-xs font-black text-rose-600 dark:text-rose-400">{deadStockThreshold}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="50"
                                        step="5"
                                        value={deadStockThreshold}
                                        onChange={(e) => setDeadStockThreshold(parseInt(e.target.value, 10))}
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredBatches.map(batch => {
                            const wastePercent = parseFloat(calculateWastePercentage(batch, wasteEvents));
                            const initial = Number(batch.initialMeters || 0);
                            const current = Number(batch.currentMeters || 0);
                            const usagePercent = initial > 0 ? Math.min(100, (current / initial) * 100) : 0;
                            const isCriticalByThreshold = usagePercent <= deadStockThreshold;
                            const valorLote = current * Number(batch.costPerMeter || 0);
                            const isNotified = Boolean(notifiedBatchIds[batch.id]);
                            const isSending = sendingBatchId === batch.id;

                            return (
                                <div
                                    key={batch.id}
                                    className={`batch-card ${glassCard} p-6 hover:shadow-lg transition-all duration-300 group flex flex-col`}
                                >
                                    <div className="flex justify-between items-start gap-2 mb-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                {getNeonOrb(batch.status)}
                                                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                                    {batch.batchNumber || `Lote #${batch.id}`}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight truncate">
                                                {batch.fabricType || batch.productName}
                                            </h3>
                                            <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-1.5 truncate">
                                                <Store size={14} className="shrink-0" /> {batch.storeName || batch.supplier || 'Sin proveedor asignado'}
                                            </p>
                                            {batch.sellerEmail && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                                                    <Mail size={12} className="shrink-0" /> {batch.sellerEmail}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border shrink-0 ${getStatusStyles(batch.status)}`}>
                                            {getStatusLabel(batch.status)}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-4 relative overflow-hidden">
                                        {isCriticalByThreshold && <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-500" title="Bajo el umbral visual crítico" />}
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Metraje Auditado</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{current}</span>
                                                    <span className="text-sm font-bold text-slate-400">/ {initial}m</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Merma Lote</span>
                                                <span className={`text-lg font-black ${wastePercent > 5 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {wastePercent}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-3 overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                                    usagePercent > 50 ? 'bg-emerald-500' : usagePercent > deadStockThreshold ? 'bg-amber-500' : 'bg-rose-500'
                                                }`}
                                                style={{ width: `${usagePercent}%` }}
                                            />
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Costo real: <strong>{formatCurrency(batch.costPerMeter || 0)}/m</strong></span>
                                            <span className="font-bold text-slate-700 dark:text-slate-200">Valor: {formatCurrency(valorLote)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between gap-3">
                                        <div className="text-[11px] font-semibold text-slate-400">
                                            {batch.lastUpdate ? `Act: ${new Date(batch.lastUpdate).toLocaleDateString('es-CO')}` : 'Registro activo'}
                                        </div>
                                        <button
                                            type="button"
                                            disabled={!batch.sellerId || isSending}
                                            onClick={() => handleNotifyVendorStock(batch)}
                                            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border ${
                                                isNotified
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                                                    : 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30 hover:bg-[#f97316] hover:text-white hover:border-[#f97316]'
                                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                                        >
                                            {isNotified ? <CheckCircle2 size={14} /> : <Bell size={14} />}
                                            {isSending ? 'Enviando...' : isNotified ? 'Notificado' : 'Notificar al Vendedor'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredBatches.length === 0 && (
                            <div className={`col-span-full ${glassCard} flex flex-col items-center justify-center py-24 text-center border-dashed border-slate-300`}>
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-inner">
                                    <Box className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sin Resultados</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No hay lotes que coincidan con los filtros seleccionados.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </LayoutPanel>
    );
}

export default ControlLotes;
