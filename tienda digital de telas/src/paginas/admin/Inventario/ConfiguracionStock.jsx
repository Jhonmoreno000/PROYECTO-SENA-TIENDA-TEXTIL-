import React, { useState, useMemo, useRef } from 'react';
import {
    Bell,
    Send,
    AlertTriangle,
    CheckCircle,
    Settings,
    Edit,
    Check,
    Store,
    Mail,
    CheckCircle2
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import LayoutPanel from '../../../componentes/layouts/LayoutPanel';
import BackButton from '../../../componentes/dashboard/BackButton';
import { useMetricas } from '../../../contextos/ContextoMetricas';
import { useProductos } from '../../../contextos/ContextoProducto';
import { useNotificacion } from '../../../contextos/ContextoNotificacion';
import enlacesAdmin from '../../../datos/enlacesAdmin';

const glassCard = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl';
const glassInput = 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#f97316] rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all';

function ConfiguracionStock() {
    const {
        inventoryBatches,
        stockThresholds,
        updateStockThreshold,
        notifyVendorLowStock,
        users
    } = useMetricas();
    const { products } = useProductos();
    const { showNotification } = useNotificacion();

    const [editingType, setEditingType] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const [customMessages, setCustomMessages] = useState({});
    const [sendingKey, setSendingKey] = useState(null);
    const [notifiedKeys, setNotifiedKeys] = useState({});
    const containerRef = useRef(null);

    const lowStockTargets = useMemo(() => {
        const items = [];
        const seenKeys = new Set();

        const findThreshold = (fabricName) => {
            const match = (stockThresholds || []).find(
                t => String(t.fabricType || t.tipoTela || '').toLowerCase() === String(fabricName || '').toLowerCase()
            );
            return Number(match?.minMeters ?? match?.metrosMinimos ?? 20);
        };

        (inventoryBatches || []).forEach(b => {
            const name = b.fabricType || b.productName || '';
            const currentM = Number(b.currentMeters || 0);
            const minM = findThreshold(name);
            if (currentM <= minM && b.sellerId) {
                const key = `prod-${b.productId || b.id}`;
                seenKeys.add(key);
                items.push({
                    key,
                    sellerId: b.sellerId,
                    productId: b.productId,
                    fabricName: name,
                    batchNumber: b.batchNumber || b.batchCode || '',
                    storeName: b.storeName || b.supplier || 'Tienda Vendedora',
                    sellerEmail: b.sellerEmail || '',
                    currentMeters: currentM,
                    threshold: minM,
                    severity: currentM <= 10 ? 'high' : 'medium'
                });
            }
        });

        (products || []).forEach(p => {
            const key = `prod-${p.id}`;
            if (seenKeys.has(key)) return;
            const currentM = Number(p.stock ?? 0);
            const minM = findThreshold(p.name);
            const sellerId = p.sellerId ?? p.idVendedor;
            if (currentM <= minM && sellerId) {
                const vendorUser = (users || []).find(u => String(u.id) === String(sellerId));
                items.push({
                    key,
                    sellerId,
                    productId: p.id,
                    fabricName: p.name,
                    batchNumber: '',
                    storeName: p.storeName || p.sellerName || vendorUser?.name || 'Tienda Vendedora',
                    sellerEmail: vendorUser?.email || vendorUser?.correo || '',
                    currentMeters: currentM,
                    threshold: minM,
                    severity: currentM <= 10 ? 'high' : 'medium'
                });
            }
        });

        return items.sort((a, b) => a.currentMeters - b.currentMeters);
    }, [inventoryBatches, products, stockThresholds, users]);

    const handleUpdateThreshold = (fabricType) => {
        if (tempValue && !isNaN(tempValue)) {
            updateStockThreshold(fabricType, parseInt(tempValue, 10));
            showNotification('success', `Umbral mínimo de "${fabricType}" actualizado a ${parseInt(tempValue, 10)}m.`);
        }
        setEditingType(null);
        setTempValue('');
    };

    const handleNotifyVendor = async (target) => {
        setSendingKey(target.key);
        try {
            await notifyVendorLowStock({
                sellerId: target.sellerId,
                productId: target.productId,
                fabricName: target.fabricName,
                batchNumber: target.batchNumber,
                currentMeters: target.currentMeters,
                threshold: target.threshold,
                message: (customMessages[target.key] || '').trim()
            });
            setNotifiedKeys(prev => ({ ...prev, [target.key]: true }));
            showNotification('success', `Alerta de stock bajo enviada a ${target.storeName}.`);
        } catch (err) {
            showNotification('error', err?.message || 'Error enviando notificación de stock al vendedor.');
        } finally {
            setSendingKey(null);
        }
    };

    useGSAP(() => {
        gsap.fromTo('.kpi-card',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.28, stagger: 0.025, ease: 'power3.out', force3D: true, clearProps: 'transform' }
        );
        gsap.fromTo('.table-panel',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.28, delay: 0.04, ease: 'power3.out', force3D: true, clearProps: 'transform' }
        );
        gsap.fromTo('.alert-card',
            { opacity: 0, x: -12 },
            { opacity: 1, x: 0, duration: 0.25, stagger: 0.025, delay: 0.06, ease: 'power3.out', force3D: true, clearProps: 'transform' }
        );
    }, { scope: containerRef });

    const notifiedCount = Object.values(notifiedKeys).filter(Boolean).length;

    return (
        <LayoutPanel title="" links={enlacesAdmin}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Notificación de Stock Bajo a Vendedores</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                            Supervisa niveles críticos reales en PostgreSQL, configura umbrales mínimos y envía alertas directas al panel de cada vendedor.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 mb-8">
                        <div className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300 ${lowStockTargets.length > 0 ? 'border-t-4 border-t-rose-500' : 'border-t-4 border-t-emerald-500'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Telas en Stock Bajo</span>
                                <div className={`p-2.5 rounded-xl border ${lowStockTargets.length > 0 ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 text-emerald-600'}`}>
                                    <Bell size={18} />
                                </div>
                            </div>
                            <p className={`text-4xl font-black ${lowStockTargets.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {lowStockTargets.length}
                            </p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Avisos Enviados</span>
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                    <Send size={18} />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white">{notifiedCount}</p>
                            <p className="text-xs text-slate-500 mt-1">Persistidos en panel del vendedor</p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Umbrales Configurados</span>
                                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
                                    <Settings size={18} />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white">{stockThresholds.length}</p>
                        </div>
                    </div>

                    {/* Sección principal: Notificar stock bajo directamente al vendedor propietario */}
                    <div className="space-y-4 mb-8">
                        {lowStockTargets.length > 0 ? (
                            <div className={`${glassCard} overflow-hidden border-rose-200/70 dark:border-rose-500/30`}>
                                <div className="p-6 border-b border-rose-200 dark:border-rose-500/20 bg-rose-50/70 dark:bg-rose-950/20 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-rose-900 dark:text-rose-200 text-lg">Vendedores con Stock Bajo por Notificar</h3>
                                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5 uppercase tracking-widest">
                                            {lowStockTargets.length} referencia{lowStockTargets.length !== 1 ? 's' : ''} por debajo del umbral mínimo
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3">
                                    {lowStockTargets.map(target => {
                                        const isNotified = Boolean(notifiedKeys[target.key]);
                                        const isSending = sendingKey === target.key;
                                        return (
                                            <div key={target.key} className="alert-card flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-slate-900/60 border-l-4 border-l-rose-500 rounded-r-2xl border border-slate-200 dark:border-slate-700">
                                                <div className="space-y-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-black text-slate-900 dark:text-white text-base">{target.fabricName}</p>
                                                        {target.batchNumber && (
                                                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold">
                                                                {target.batchNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                                                        <span className="inline-flex items-center gap-1 font-bold text-primary-600 dark:text-primary-400">
                                                            <Store size={13} /> {target.storeName}
                                                        </span>
                                                        {target.sellerEmail && (
                                                            <span className="inline-flex items-center gap-1 text-slate-500">
                                                                <Mail size={12} /> {target.sellerEmail}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                    <div className="text-left sm:text-right shrink-0 pr-2">
                                                        <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{target.currentMeters}m</span>
                                                        <span className="block text-[11px] font-bold text-slate-400">Mínimo: {target.threshold}m</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={customMessages[target.key] || ''}
                                                        onChange={(e) => setCustomMessages(prev => ({ ...prev, [target.key]: e.target.value }))}
                                                        placeholder="Nota opcional al vendedor..."
                                                        className={`px-3 py-2 text-xs min-w-[200px] ${glassInput}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={isSending}
                                                        onClick={() => handleNotifyVendor(target)}
                                                        className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 transition-all ${
                                                            isNotified
                                                                ? 'bg-emerald-600 text-white'
                                                                : 'bg-[#f97316] hover:bg-[#ea580c] text-white shadow-sm'
                                                        } disabled:opacity-50`}
                                                    >
                                                        {isNotified ? <CheckCircle2 size={14} /> : <Send size={14} />}
                                                        {isSending ? 'Enviando...' : isNotified ? 'Notificado' : 'Notificar al Vendedor'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className={`${glassCard} flex items-center gap-5 p-6`}>
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shadow-sm">
                                    <CheckCircle className="w-7 h-7 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-white text-xl">Niveles de Inventario Saludables</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Ningún producto o lote está por debajo de los umbrales configurados.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`table-panel ${glassCard} overflow-hidden`}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-black text-slate-900 dark:text-white text-xl">Umbrales por Tipo de Tela</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Haz clic en el umbral para ajustar · Enter o clic fuera para guardar en PostgreSQL</p>
                        </div>
                        <div tabIndex={0} role="region" aria-label="Tabla de umbrales mínimos de stock por tipo de tela" className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                    <tr>{['Tipo de Tela', 'Stock en Lotes', 'Umbral Mínimo (m)', 'Estado'].map(h => <th key={h} className="px-6 py-5">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {stockThresholds.map(threshold => {
                                        const fName = threshold.fabricType || threshold.tipoTela;
                                        const currentStock = inventoryBatches
                                            .filter(b => (b.fabricType || b.productName) === fName)
                                            .reduce((s, b) => s + Number(b.currentMeters || 0), 0);
                                        const minVal = Number(threshold.minMeters ?? threshold.metrosMinimos ?? 20);
                                        const isLow = currentStock <= minVal;
                                        return (
                                            <tr key={fName} className={`transition-colors ${isLow ? 'bg-rose-50/60 dark:bg-rose-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'}`}>
                                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{fName}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-mono font-black text-lg ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>{currentStock}m</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingType === fName ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={tempValue}
                                                                onChange={e => setTempValue(e.target.value)}
                                                                onBlur={() => handleUpdateThreshold(fName)}
                                                                onKeyDown={e => { if (e.key === 'Enter') handleUpdateThreshold(fName); }}
                                                                className={`w-24 px-3 py-2 text-right font-mono ${glassInput}`}
                                                                autoFocus
                                                            />
                                                            <button onClick={() => handleUpdateThreshold(fName)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-emerald-200">
                                                                <Check size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setEditingType(fName); setTempValue(String(minVal)); }}
                                                            className="flex items-center gap-2 font-mono font-black text-slate-700 dark:text-slate-300 hover:text-[#f97316] transition-colors group/edit"
                                                        >
                                                            {minVal}m
                                                            <Edit size={13} className="opacity-0 group-hover/edit:opacity-100 transition-opacity" />
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
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutPanel>
    );
}

export default ConfiguracionStock;
