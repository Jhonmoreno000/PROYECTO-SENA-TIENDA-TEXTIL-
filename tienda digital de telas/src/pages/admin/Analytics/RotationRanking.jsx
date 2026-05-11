/**
 * RotationRanking.jsx — BI: Rotación de Inventario (Elite Luxury UI)
 * Hereda el ADN visual del Hero: patrón cruces + glassmorphism + rounded-[2rem]
 */

import React, { useState, useRef } from 'react';
import { Zap, Clock, Tag, TrendingDown, Percent } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { useProducts } from '../../../context/ProductContext';
import { identifyDeadStock, identifyBestsellers } from '../../../utils/analyticsUtils';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden";

const MEDAL_STYLES = [
    'bg-amber-100 text-amber-600 dark:text-amber-400 border-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    'bg-slate-200 text-slate-600 dark:text-slate-400 dark:text-slate-500 border-slate-300',
    'bg-orange-100 text-orange-600 dark:text-orange-400 border-orange-200',
];

function RotationRanking() {
    const { orders } = useMetrics();
    const { products } = useProducts();

    const [deadStockThreshold, setDeadStockThreshold] = useState(60);
    const containerRef = useRef(null);

    const bestsellers = identifyBestsellers(products, orders, 10).sort((a, b) => b.velocity - a.velocity);
    const deadStock = identifyDeadStock(products, orders, deadStockThreshold);

    const handleCreateOffer = (product) => {
        alert(`Iniciando flujo de oferta para: ${product.name}\nDescuento agresivo sugerido por inactividad de ${product.daysWithoutSale} días.`);
    };

    useGSAP(() => {
        gsap.fromTo('.header-item', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
        );
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 30, scale: 0.95 }, 
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.2 }
        );
        gsap.fromTo('.table-panel', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.4 }
        );
    }, { scope: containerRef });

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen relative">
                <div className="relative z-10">
                    <BackButton />

                    {/* ── HEADER ── */}
                    <div className="mb-10 mt-4">
                        <h1 className="header-item text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                            BI: Rotación <span className="text-[#f97316]">de Inventario</span>
                        </h1>
                        <p className="header-item text-base text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2 font-medium">
                            Identifica inventario estancado y productos de alta velocidad para optimizar el flujo de caja.
                        </p>
                    </div>

                    {/* ── KPI CARDS ── */}
                    <div className="grid md:grid-cols-4 gap-6 mb-10">
                        <div className={`kpi-card ${glassCard} p-6 border-t-4 border-t-emerald-500 group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Bestsellers</span>
                                <div className="p-2.5 bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"><Zap size={18} /></div>
                            </div>
                            <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{bestsellers.length}</p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 border-t-4 border-t-rose-500 group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cap. Estancado</span>
                                <div className="p-2.5 bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"><TrendingDown size={18} /></div>
                            </div>
                            <p className="text-4xl font-bold text-rose-600 dark:text-rose-400">
                                {deadStock.length}
                                {deadStock.length > 0 && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block ml-3 mb-1" />}
                            </p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 border-t-4 border-t-indigo-500 group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Catálogo Activo</span>
                                <div className="p-2.5 bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400"><Tag size={18} /></div>
                            </div>
                            <p className="text-4xl font-bold text-slate-900 dark:text-white">
                                {products.length} <span className="text-base font-semibold text-slate-400 dark:text-slate-500">SKUs</span>
                            </p>
                        </div>

                        {/* Umbral interactivo */}
                        <div className={`kpi-card ${glassCard} p-6 flex flex-col justify-between`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Umbral Stock Muerto</span>
                                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"><Clock size={18} /></div>
                            </div>
                            <div className="flex items-center gap-4 mb-3">
                                <input
                                    type="range" min="15" max="120" step="15"
                                    value={deadStockThreshold}
                                    onChange={(e) => setDeadStockThreshold(parseInt(e.target.value))}
                                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 w-16 text-right shrink-0">{deadStockThreshold}d</span>
                            </div>
                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400/80 uppercase tracking-wider">Días inactivos para alerta</p>
                        </div>
                    </div>

                    {/* ── TABLAS LADO A LADO ── */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Ranking de Velocidad */}
                        <div className={`table-panel ${glassCard}`}>
                            {/* Header del panel */}
                            <div className="p-7 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shadow-sm">
                                    <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-xl leading-none">Ranking de Velocidad</h3>
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 uppercase tracking-widest">Unidades / Día · Top 10</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest border-b border-slate-200 dark:border-slate-700">
                                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-7 py-5 w-16">#</th>
                                            <th className="px-7 py-5">Producto</th>
                                            <th className="px-7 py-5 text-right">Velocidad</th>
                                            <th className="px-7 py-5 text-right">Ingresos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                                        {bestsellers.map((product, index) => (
                                            <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group/row">
                                                <td className="px-7 py-5">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border ${MEDAL_STYLES[index] || 'bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-7 py-5">
                                                    <p className="font-bold text-slate-900 dark:text-white truncate max-w-[160px] group-hover/row:text-[#f97316] transition-colors">{product.name}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 font-semibold uppercase tracking-wider">{product.category}</p>
                                                </td>
                                                <td className="px-7 py-5 text-right">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                                                        {product.velocity.toFixed(1)} <span className="text-[9px] font-bold">U/D</span>
                                                    </span>
                                                </td>
                                                <td className="px-7 py-5 text-right font-bold text-slate-700 dark:text-slate-300">{formatCurrency(product.revenue)}</td>
                                            </tr>
                                        ))}
                                        {bestsellers.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-7 py-14 text-center text-slate-400 dark:text-slate-500 font-medium">
                                                    Sin datos de ventas disponibles.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Stock Muerto */}
                        <div className={`table-panel ${glassCard}`}>
                            <div className="p-7 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shadow-sm">
                                    <Clock className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-xl leading-none">
                                        Stock Muerto <span className="text-rose-600 dark:text-rose-400">(+{deadStockThreshold}d)</span>
                                    </h3>
                                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1.5 uppercase tracking-widest">Requiere acción comercial urgente</p>
                                </div>
                            </div>

                            <div>
                                {deadStock.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-16 text-center">
                                        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-6 shadow-inner">
                                            <Zap size={32} className="text-emerald-500" />
                                        </div>
                                        <p className="font-bold text-slate-900 dark:text-white text-2xl mb-2">Inventario Sano</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">No hay productos estancados bajo este umbral. Ajusta el slider para ampliar la búsqueda.</p>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest border-b border-slate-200 dark:border-slate-700">
                                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                                    <th className="px-7 py-5">Producto</th>
                                                    <th className="px-7 py-5 text-center">Inactividad</th>
                                                    <th className="px-7 py-5 text-right">Precio</th>
                                                    <th className="px-7 py-5 text-center">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                                                {deadStock.map(product => (
                                                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group/row">
                                                        <td className="px-7 py-5">
                                                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[160px] group-hover/row:text-rose-600 dark:text-rose-400 transition-colors">{product.name}</p>
                                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 font-semibold">Stock: {product.stock || 0}m</p>
                                                        </td>
                                                        <td className="px-7 py-5 text-center">
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-black text-sm">
                                                                {product.daysWithoutSale}d
                                                            </span>
                                                        </td>
                                                        <td className="px-7 py-5 text-right font-bold text-slate-700 dark:text-slate-300">{formatCurrency(product.price)}</td>
                                                        <td className="px-7 py-5 text-center">
                                                            <button
                                                                onClick={() => handleCreateOffer(product)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#ea580c] text-white rounded-2xl text-xs font-bold shadow-[0_4px_15px_rgba(234,88,12,0.3)] hover:bg-[#c2410c] hover:scale-105 active:scale-95 transition-all border border-[#f97316]/30"
                                                            >
                                                                <Percent size={13} /> Crear Oferta
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default RotationRanking;

