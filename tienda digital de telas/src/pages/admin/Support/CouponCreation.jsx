import React, { useState, useRef } from 'react';
import { Plus, Percent, Tag, Zap, Clock, X, Check, Copy, Gift } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';


const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
const cleanInput = "bg-slate-50 dark:bg-slate-900  border border-slate-200 dark:border-slate-700 focus:border-[#f97316] rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all placeholder-slate-400";

function CouponCreation() {
    const { coupons, createCoupon, deactivateCoupon } = useMetrics();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);
    const containerRef = useRef(null);
    const modalRef = useRef(null);
    const modalOverlayRef = useRef(null);

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiresAt: '',
        rules: { minPurchase: '', maxUses: '', firstTimeOnly: false }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createCoupon({
            code: formData.code.toUpperCase(),
            discountType: formData.discountType,
            discountValue: parseFloat(formData.discountValue),
            expiresAt: formData.expiresAt,
            active: true,
            rules: {
                minPurchase: formData.rules.minPurchase ? parseFloat(formData.rules.minPurchase) : null,
                maxUses: formData.rules.maxUses ? parseInt(formData.rules.maxUses) : null,
                firstTimeOnly: formData.rules.firstTimeOnly
            }
        });
        closeModal();
        setFormData({ code: '', discountType: 'percentage', discountValue: '', expiresAt: '', rules: { minPurchase: '', maxUses: '', firstTimeOnly: false } });
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code).catch(() => {});
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const closeModal = () => {
        gsap.to(modalRef.current, { scale: 0.95, y: 20, opacity: 0, duration: 0.3, ease: "power2.in" });
        gsap.to(modalOverlayRef.current, { opacity: 0, duration: 0.3, onComplete: () => setShowCreateModal(false) });
    };

    const openModal = () => {
        setShowCreateModal(true);
    };

    useGSAP(() => {
        if (showCreateModal) {
            gsap.fromTo(modalOverlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(modalRef.current, { scale: 0.95, y: 20, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.4)" });
        }
    }, { dependencies: [showCreateModal] });

    // Stats
    const activeCoupons = coupons.filter(c => c.active).length;
    const totalUsages = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
    const expiringSoon = coupons.filter(c => {
        const days = Math.ceil((new Date(c.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
        return c.active && days <= 7 && days > 0;
    }).length;

    useGSAP(() => {
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 20, scale: 0.97 }, 
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }
        );
        gsap.fromTo('.coupon-card', 
            { opacity: 0, y: 20, scale: 0.97 }, 
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.2 }
        );
    }, { scope: containerRef });

    const getDiscountLabel = (coupon) => coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% OFF`
        : `-${formatCurrency(coupon.discountValue)}`;

    const getExpiryInfo = (coupon) => {
        const days = Math.ceil((new Date(coupon.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) return { label: 'Expirado', style: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20', neon: 'bg-rose-500' };
        if (days <= 7) return { label: `${days}d restantes`, style: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', neon: 'bg-amber-500' };
        return { label: new Date(coupon.expiresAt).toLocaleDateString('es-CO'), style: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', neon: 'bg-emerald-500' };
    };

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-4 gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Motor de Cupones</h1>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Crea y gestiona campañas de descuento inteligentes para clientes D&D Textil.</p>
                        </div>
                        <button
                            onClick={openModal}
                            className="flex items-center gap-2 px-6 py-3 bg-[#f97316] text-white rounded-xl hover:bg-[#ea580c] hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] font-bold shrink-0 w-full sm:w-auto justify-center"
                        >
                            <Plus className="w-5 h-5" /> Crear Cupón
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className={`kpi-card ${glassCard} p-6 border-t-4 border-t-[#f97316] overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 dark:bg-orange-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Cupones</span>
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-orange-200 dark:border-orange-500/20 text-[#f97316]"><Tag size={18} /></div>
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white relative z-10">{coupons.length}</p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Activos</span>
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"><Zap size={18} /></div>
                            </div>
                            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 relative z-10">{activeCoupons}</p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Usos Totales</span>
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400"><Percent size={18} /></div>
                            </div>
                            <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 relative z-10">{totalUsages}</p>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 border-t-4 border-t-amber-500 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 dark:bg-amber-500/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Expiran Pronto</span>
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"><Clock size={18} /></div>
                            </div>
                            <p className="text-4xl font-black text-amber-600 dark:text-amber-400 relative z-10">
                                {expiringSoon}
                                {expiringSoon > 0 && <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute left-8 top-6" />}
                            </p>
                        </div>
                    </div>

                    {/* Coupon Cards Grid */}
                    {coupons.length === 0 ? (
                        <div className={`${glassCard} flex flex-col items-center justify-center py-24 text-center border-dashed border-slate-300 animate-in fade-in duration-500`}>
                            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mb-4 border border-orange-200 dark:border-orange-500/20 shadow-inner">
                                <Gift className="w-10 h-10 text-[#f97316]" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sin cupones activos</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mb-6">Crea tu primera campaña de descuento para atraer clientes.</p>
                            <button onClick={openModal} className="px-8 py-3 bg-[#f97316] text-white rounded-xl font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:bg-[#ea580c] transition-all flex items-center gap-2">
                                <Plus size={18} /> Crear Primer Cupón
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {coupons.map(coupon => {
                                const expiry = getExpiryInfo(coupon);
                                const usagePercent = coupon.rules?.maxUses
                                    ? Math.min(100, ((coupon.usageCount || 0) / coupon.rules.maxUses) * 100)
                                    : null;
                                const isExpired = Math.ceil((new Date(coupon.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)) < 0;

                                return (
                                    <div
                                        key={coupon.id}
                                        className={`coupon-card ${glassCard} p-6 flex flex-col hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group ${(!coupon.active || isExpired) ? 'opacity-50 grayscale' : ''}`}
                                    >
                                        {/* Top: Code + Discount Badge */}
                                        <div className="flex justify-between items-start mb-5">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${expiry.neon} shadow-[0_0_8px_currentColor]`} />
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                        {isExpired ? 'Expirado' : coupon.active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-black text-2xl text-slate-900 dark:text-white tracking-wider group-hover:text-[#f97316] transition-colors">
                                                        {coupon.code}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopyCode(coupon.code)}
                                                        className={`p-1.5 rounded-lg transition-all ${copiedCode === coupon.code ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200' : 'bg-slate-50 dark:bg-slate-500/10 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'}`}
                                                        title="Copiar código"
                                                    >
                                                        {copiedCode === coupon.code ? <Check size={13} /> : <Copy size={13} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="px-4 py-2 bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white rounded-xl font-black text-sm shadow-[0_4px_15px_rgba(249,115,22,0.4)]">
                                                {getDiscountLabel(coupon)}
                                            </div>
                                        </div>

                                        {/* Usage Bar */}
                                        {usagePercent !== null && (
                                            <div className="mb-5">
                                                <div className="flex justify-between mb-1.5">
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">Uso del Cupón</span>
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{coupon.usageCount || 0} / {coupon.rules.maxUses}</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                                                    <div
                                                        style={{ width: `${usagePercent}%` }}
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${usagePercent > 80 ? 'bg-rose-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Rules */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {coupon.rules?.minPurchase && (
                                                <span className="px-2.5 py-1 bg-white border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-500 text-[10px] font-bold rounded-lg shadow-sm">
                                                    Mín: {formatCurrency(coupon.rules.minPurchase)}
                                                </span>
                                            )}
                                            {coupon.rules?.firstTimeOnly && (
                                                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg shadow-sm">
                                                    Primera Compra
                                                </span>
                                            )}
                                            {!coupon.rules?.minPurchase && !coupon.rules?.firstTimeOnly && (
                                                <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[10px] font-bold rounded-lg shadow-sm">
                                                    Sin restricciones
                                                </span>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700/60 flex justify-between items-center gap-3">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border ${expiry.style}`}>
                                                <Clock size={11} /> {expiry.label}
                                            </div>

                                            {coupon.active && !isExpired && (
                                                <button
                                                    onClick={() => deactivateCoupon(coupon.id)}
                                                    className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 border-2 border-rose-200 rounded-xl hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-[0_0_12px_rgba(244,63,94,0.3)] transition-all"
                                                >
                                                    Desactivar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div ref={modalOverlayRef} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div ref={modalRef} className="bg-white dark:bg-slate-800 backdrop-blur-3xl rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white relative max-h-[90vh] overflow-y-auto">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full mix-blend-multiply filter blur-[60px] pointer-events-none" />

                        <div className="p-8 relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl text-[#f97316]"><Gift size={20} /></div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Nueva Campaña</h3>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Configura las reglas de negocio de tu cupón.</p>
                                </div>
                                <button onClick={closeModal} className="p-3 bg-white hover:bg-slate-50 dark:bg-slate-500/10 text-slate-400 dark:text-slate-500 hover:text-rose-500 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Code */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Código del Cupón</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="Ej: TEXTIL25"
                                        className={`w-full px-4 py-3.5 font-mono text-lg font-black tracking-widest ${cleanInput}`}
                                        required
                                    />
                                </div>

                                {/* Tipo + Valor */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Tipo</label>
                                        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-500/10">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                                                className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-1.5 transition-all ${formData.discountType === 'percentage' ? 'bg-[#f97316] text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                <Percent size={14} /> %
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                                                className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-1.5 transition-all ${formData.discountType === 'fixed' ? 'bg-[#f97316] text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                $ Fijo
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Valor</label>
                                        <input
                                            type="number"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                            placeholder={formData.discountType === 'percentage' ? '15' : '50000'}
                                            className={`w-full px-4 py-3.5 font-black ${cleanInput}`}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Expiración */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Fecha de Expiración</label>
                                    <input
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                        className={`w-full px-4 py-3.5 ${cleanInput}`}
                                        required
                                    />
                                </div>

                                {/* Reglas */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Reglas de Negocio (Opcional)</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Compra Mínima</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-sm">$</span>
                                                <input
                                                    type="number"
                                                    value={formData.rules.minPurchase}
                                                    onChange={(e) => setFormData({ ...formData, rules: { ...formData.rules, minPurchase: e.target.value } })}
                                                    placeholder="100000"
                                                    className={`w-full pl-8 pr-4 py-3 ${cleanInput}`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Usos Máximos</label>
                                            <input
                                                type="number"
                                                value={formData.rules.maxUses}
                                                onChange={(e) => setFormData({ ...formData, rules: { ...formData.rules, maxUses: e.target.value } })}
                                                placeholder="100"
                                                className={`w-full px-4 py-3 ${cleanInput}`}
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div
                                            onClick={() => setFormData({ ...formData, rules: { ...formData.rules, firstTimeOnly: !formData.rules.firstTimeOnly } })}
                                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${formData.rules.firstTimeOnly ? 'bg-[#f97316] shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.rules.firstTimeOnly ? 'left-7' : 'left-1'}`} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors">Solo para nuevos clientes (primera compra)</span>
                                    </label>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-4 bg-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:bg-slate-500/10 font-bold transition-colors shadow-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-4 bg-[#f97316] text-white rounded-xl hover:bg-[#ea580c] font-black transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] flex justify-center items-center gap-2 text-sm"
                                    >
                                        <Zap size={18} /> Activar Campaña
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

export default CouponCreation;

