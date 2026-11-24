/**
 * CalculadoraMerma.jsx — Auditoría Real de Mermas y Envío de Métricas a Cada Vendedor
 */

import React, { useState, useMemo, useRef } from 'react';
import {
    AlertTriangle,
    DollarSign,
    X,
    TrendingDown,
    Beaker,
    Send,
    Lock,
    Store,
    Mail,
    CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import LayoutPanel from '../../../componentes/layouts/LayoutPanel';
import BackButton from '../../../componentes/dashboard/BackButton';
import { useMetricas } from '../../../contextos/ContextoMetricas';
import { useNotificacion } from '../../../contextos/ContextoNotificacion';
import { calculateWasteStatsByReason } from '../../../utilidades/inventoryUtils';
import { formatCurrency } from '../../../utilidades/formateadores';
import enlacesAdmin from '../../../datos/enlacesAdmin';

const glassCard = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl';
const cleanInput = 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#f97316] rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all placeholder-slate-400';

const REASON_LABELS = {
    factory_defect: 'Defecto de Fábrica',
    cutting_error: 'Error de Corte',
    damaged: 'Daño en Almacén',
    quality_control: 'Control de Calidad',
    stain: 'Mancha / Contaminación',
    sample: 'Muestras Técnicas',
    end_of_roll: 'Retazo Fin de Rollo',
    retazo_submetro: 'Retazo Sub-Metro',
    sin_eventos: 'Sin Incidentes'
};

const COLORS = ['#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#10b981'];

function CalculadoraMerma() {
    const { inventoryBatches, wasteEvents, sendVendorWasteReport } = useMetricas();
    const { showNotification } = useNotificacion();
    const [activeReasonFilter, setActiveReasonFilter] = useState(null);
    const [sellerNotes, setSellerNotes] = useState({});
    const [sendingSellerId, setSendingSellerId] = useState(null);
    const [sentSellerIds, setSentSellerIds] = useState({});
    const containerRef = useRef(null);

    const resolveEventCost = (event) => {
        const storedCost = Number(event.costImpact || 0);
        if (storedCost > 0) return storedCost;
        const matchedBatch = inventoryBatches.find(
            b => String(b.batchNumber || '') === String(event.batchId || '') || String(b.id) === String(event.batchId || '')
        );
        return Number(event.meters || 0) * Number(matchedBatch?.costPerMeter || 0);
    };

    const wasteStats = useMemo(() => calculateWasteStatsByReason(wasteEvents), [wasteEvents]);
    const totalWasteMeters = useMemo(
        () => wasteEvents.reduce((sum, e) => sum + Number(e.meters || 0), 0),
        [wasteEvents]
    );

    const totalWasteCost = useMemo(
        () => wasteEvents.reduce((sum, event) => sum + resolveEventCost(event), 0),
        [wasteEvents, inventoryBatches]
    );

    const vendorSummaries = useMemo(() => {
        const grouped = {};
        wasteEvents.forEach(ev => {
            if (!ev.sellerId) return;
            const key = String(ev.sellerId);
            if (!grouped[key]) {
                grouped[key] = {
                    sellerId: ev.sellerId,
                    storeName: ev.storeName || ev.sellerName || `Vendedor #${ev.sellerId}`,
                    sellerEmail: ev.sellerEmail || '',
                    totalEvents: 0,
                    totalMeters: 0,
                    totalCostImpact: 0,
                    reasonMeters: {}
                };
            }
            const g = grouped[key];
            const meters = Number(ev.meters || 0);
            g.totalEvents += 1;
            g.totalMeters += meters;
            g.totalCostImpact += resolveEventCost(ev);
            const rKey = ev.reason || 'quality_control';
            g.reasonMeters[rKey] = (g.reasonMeters[rKey] || 0) + meters;
        });

        return Object.values(grouped)
            .map(item => {
                const topEntry = Object.entries(item.reasonMeters).sort((a, b) => b[1] - a[1])[0];
                return {
                    ...item,
                    topReason: topEntry ? (REASON_LABELS[topEntry[0]] || topEntry[0]) : 'Sin clasificar'
                };
            })
            .sort((a, b) => b.totalCostImpact - a.totalCostImpact);
    }, [wasteEvents, inventoryBatches]);

    const wasteByReasonData = Object.entries(wasteStats).map(([reason, datos]) => ({
        name: REASON_LABELS[reason] || reason,
        dbKey: reason,
        meters: Number(datos.totalMeters.toFixed(2)),
        count: datos.count
    }));

    const wasteOverTimeData = wasteEvents.slice(-15).map(event => ({
        date: event.date ? new Date(event.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : 'Reciente',
        meters: Number(event.meters || 0),
        cost: resolveEventCost(event)
    }));

    const handleChartClick = (datos) => {
        if (datos?.activePayload?.length > 0) {
            const key = datos.activePayload[0].payload.dbKey;
            setActiveReasonFilter(prev => (prev === key ? null : key));
        }
    };

    const handleSendVendorReport = async (vendor) => {
        setSendingSellerId(vendor.sellerId);
        try {
            const note = (sellerNotes[vendor.sellerId] || '').trim();
            await sendVendorWasteReport(vendor.sellerId, note);
            setSentSellerIds(prev => ({ ...prev, [vendor.sellerId]: true }));
            showNotification('success', `Métricas de merma enviadas a ${vendor.storeName} (${vendor.sellerEmail || 'panel del vendedor'}).`);
        } catch (err) {
            showNotification('error', err?.message || 'Error enviando reporte de mermas al vendedor.');
        } finally {
            setSendingSellerId(null);
        }
    };

    const displayEvents = activeReasonFilter
        ? wasteEvents.filter(e => e.reason === activeReasonFilter)
        : wasteEvents;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <p className="font-bold mb-1 text-slate-500 text-xs uppercase tracking-widest">{label}</p>
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
            { opacity: 0, y: 12, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.28, stagger: 0.025, ease: 'power3.out', force3D: true, clearProps: 'transform' }
        );
        gsap.fromTo('.chart-panel',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.28, delay: 0.04, stagger: 0.025, ease: 'power3.out', force3D: true, clearProps: 'transform' }
        );
        gsap.fromTo('.table-panel',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.28, delay: 0.06, ease: 'power3.out', force3D: true, clearProps: 'transform' }
        );
    }, { scope: containerRef });

    return (
        <LayoutPanel title="" links={enlacesAdmin}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mt-4 gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Auditoría de Mermas por Vendedor</h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                                Métricas reales consolidadas desde PostgreSQL para revisión y envío directo de reportes a cada tienda vendedora.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold shrink-0">
                            <Lock className="w-4 h-4 shrink-0" />
                            Auditoría Antifraude: El administrador solo revisa y notifica métricas
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className={`kpi-card ${glassCard} p-6 border-t-4 border-t-rose-500 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Impacto Real Total</span>
                                <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"><DollarSign size={18} /></div>
                            </div>
                            <p className="text-3xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(totalWasteCost)}</p>
                            <p className="text-xs text-slate-500 mt-2 font-medium">Valor real calculado por lote</p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 border-t-4 border-t-amber-500 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Volumen Mermado</span>
                                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"><AlertTriangle size={18} /></div>
                            </div>
                            <p className="text-4xl font-black text-amber-600 dark:text-amber-400">{totalWasteMeters.toFixed(1)} <span className="text-lg font-semibold">mts</span></p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Incidentes Registrados</span>
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"><TrendingDown size={18} /></div>
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white">{wasteEvents.length}</p>
                            <p className="text-xs text-slate-500 mt-2 font-medium">{vendorSummaries.length} tiendas involucradas</p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Causa Principal</span>
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400"><Beaker size={18} /></div>
                            </div>
                            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                {wasteByReasonData.length > 0
                                    ? [...wasteByReasonData].sort((a, b) => b.meters - a.meters)[0].name
                                    : 'Sin registros'}
                            </p>
                        </div>
                    </div>

                    {/* Métricas reales por vendedor + Botón para enviar reporte oficial al vendedor */}
                    <div className={`${glassCard} p-6 mb-8`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-lg">Métricas de Mermas por Vendedor — Enviar Reporte</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Envía a cada proveedor su consolidado real de desperdicio y causa raíz directamente a su panel.
                                </p>
                            </div>
                        </div>

                        {vendorSummaries.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
                                No hay eventos de merma registrados para vendedores todavía.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {vendorSummaries.map(vendor => {
                                    const isSent = Boolean(sentSellerIds[vendor.sellerId]);
                                    const isSending = sendingSellerId === vendor.sellerId;
                                    return (
                                        <div key={vendor.sellerId} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                                        <Store size={15} className="text-[#f97316]" /> {vendor.storeName}
                                                    </p>
                                                    {vendor.sellerEmail && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <Mail size={12} /> {vendor.sellerEmail}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 text-xs font-black">
                                                    {vendor.totalMeters.toFixed(2)}m · {formatCurrency(vendor.totalCostImpact)}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
                                                <span><strong>{vendor.totalEvents}</strong> incidente{vendor.totalEvents === 1 ? '' : 's'}</span>
                                                <span>·</span>
                                                <span>Causa principal: <strong>{vendor.topReason}</strong></span>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <input
                                                    type="text"
                                                    value={sellerNotes[vendor.sellerId] || ''}
                                                    onChange={(e) => setSellerNotes(prev => ({ ...prev, [vendor.sellerId]: e.target.value }))}
                                                    placeholder="Recomendación opcional de auditoría..."
                                                    className={`flex-1 px-3 py-2 text-xs ${cleanInput}`}
                                                />
                                                <button
                                                    type="button"
                                                    disabled={isSending}
                                                    onClick={() => handleSendVendorReport(vendor)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                                                        isSent
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-slate-900 dark:bg-[#f97316] hover:bg-slate-800 dark:hover:bg-[#ea580c] text-white'
                                                    } disabled:opacity-50`}
                                                >
                                                    {isSent ? <CheckCircle2 size={14} /> : <Send size={14} />}
                                                    {isSending ? 'Enviando...' : isSent ? 'Reporte Enviado' : 'Enviar Métricas al Vendedor'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        <div className={`chart-panel ${glassCard} p-6`}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">Volumen de Merma por Razón</h3>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Haz clic en una barra para filtrar el detalle</p>
                                </div>
                                {activeReasonFilter && (
                                    <button onClick={() => setActiveReasonFilter(null)} className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-3 py-1.5 rounded-lg">
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
                                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Impacto Económico por Evento</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pérdidas financieras reales calculadas desde PostgreSQL</p>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={wasteOverTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} dy={10} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tick={{ fontSize: 11, fill: '#64748b' }} />
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
                                {activeReasonFilter && (
                                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                                        Filtrando por: <strong>{REASON_LABELS[activeReasonFilter] || activeReasonFilter}</strong>
                                    </p>
                                )}
                            </div>
                            {activeReasonFilter && (
                                <button onClick={() => setActiveReasonFilter(null)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
                                    <X size={12} /> Limpiar Filtro
                                </button>
                            )}
                        </div>
                        <div tabIndex={0} role="region" aria-label="Registro detallado de mermas por vendedor" className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        {['Fecha', 'Tienda / Proveedor', 'Lote y Tela', 'Merma', 'Costo Real', 'Clasificación', 'Detalle'].map(h => (
                                            <th key={h} className="px-6 py-4">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {displayEvents.map(event => {
                                        const realCost = resolveEventCost(event);
                                        return (
                                            <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                                                    {event.date ? new Date(event.date).toLocaleDateString('es-CO') : '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900 dark:text-white">{event.storeName || event.sellerName || event.responsible}</p>
                                                    {event.sellerEmail && <p className="text-xs text-slate-500">{event.sellerEmail}</p>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-lg text-xs">
                                                        {event.batchId || event.rollId}
                                                    </span>
                                                    {event.productName && <p className="text-xs text-slate-500 mt-1">{event.productName}</p>}
                                                </td>
                                                <td className="px-6 py-4 font-black text-amber-600 dark:text-amber-400 text-base">{event.meters}m</td>
                                                <td className="px-6 py-4 font-bold text-rose-600 dark:text-rose-400">{formatCurrency(realCost)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20">
                                                        {REASON_LABELS[event.reason] || event.reason}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-[220px] truncate" title={event.description}>
                                                    {event.description}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {displayEvents.length === 0 && (
                                <p className="text-center text-sm text-slate-500 py-10">No hay incidentes de merma registrados para el criterio seleccionado.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </LayoutPanel>
    );
}

export default CalculadoraMerma;
