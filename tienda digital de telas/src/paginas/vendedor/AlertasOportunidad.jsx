import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Bell,
    Crown,
    Tag,
    CheckCircle2,
    Sparkles,
    TrendingUp,
    RefreshCw,
    ShieldAlert,
    AlertTriangle,
    TrendingDown,
    ArrowRight
} from 'lucide-react';
import LayoutPanel from '../../componentes/layouts/LayoutPanel';
import enlacesVendedor from '../../datos/enlacesVendedor';
import BackButton from '../../componentes/dashboard/BackButton';
import { useMetricas } from '../../contextos/ContextoMetricas';
import { useProductos } from '../../contextos/ContextoProducto';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { useNotificacion } from '../../contextos/ContextoNotificacion';

export default function AlertasOportunidad() {
    const { user } = useAutenticacion();
    const { sellerAlerts, refreshSellerAlerts, markSellerAlertApplied, updateProduct, getProductsBySeller } = useMetricas();
    const { refreshProducts } = useProductos();
    const { showNotification } = useNotificacion();
    const [loading, setLoading] = useState(false);
    const [customDiscount, setCustomDiscount] = useState({});
    const [activeFilter, setActiveFilter] = useState('all');

    const sellerProducts = getProductsBySeller(user?.id);

    useEffect(() => {
        refreshSellerAlerts();
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        await refreshSellerAlerts();
        setLoading(false);
        showNotification('info', 'Alertas y notificaciones sincronizadas con PostgreSQL.');
    };

    const filteredAlerts = useMemo(() => {
        const list = sellerAlerts || [];
        if (activeFilter === 'admin') {
            return list.filter(a => ['auditoria_admin', 'stock_bajo', 'reporte_mermas'].includes(a.alertType));
        }
        if (activeFilter === 'opportunities') {
            return list.filter(a => !['auditoria_admin', 'stock_bajo', 'reporte_mermas'].includes(a.alertType));
        }
        return list;
    }, [sellerAlerts, activeFilter]);

    const adminAlertsCount = useMemo(
        () => (sellerAlerts || []).filter(a => !a.applied && ['auditoria_admin', 'stock_bajo', 'reporte_mermas'].includes(a.alertType)).length,
        [sellerAlerts]
    );

    const handleApplyOpportunity = async (alert) => {
        if (!alert.productId) return;
        const pct = Number(customDiscount[alert.id] ?? alert.suggestedDiscount ?? 15);
        let payload = {};
        if (alert.suggestedAction === 'activar_exclusivo') {
            payload = {
                isExclusive: true,
                esExclusivo: true,
                ...(pct > 0 ? { isOffer: true, esOferta: true, discountPercent: pct, porcentajeDescuento: pct } : {})
            };
        } else {
            payload = {
                isOffer: true,
                esOferta: true,
                discountPercent: pct > 0 ? pct : 15,
                porcentajeDescuento: pct > 0 ? pct : 15
            };
        }
        const ok = await updateProduct(alert.productId, payload);
        if (ok) {
            await markSellerAlertApplied(alert.id, true);
            refreshProducts();
            showNotification('success', '¡Configuración activada! Tus clientes frecuentes ya verán este beneficio.');
        }
    };

    const handleAcknowledgeAdminAlert = async (alert) => {
        const ok = await markSellerAlertApplied(alert.id, true);
        if (ok) {
            showNotification('success', 'Notificación administrativa marcada como atendida.');
        }
    };

    const handleQuickToggle = async (prod, field, value, extra = {}) => {
        const ok = await updateProduct(prod.id, { [field]: value, ...extra });
        if (ok) {
            refreshProducts();
            showNotification('success', `Actualizado "${prod.name}" correctamente.`);
        }
    };

    const getAlertMetadata = (alert) => {
        if (alert.alertType === 'auditoria_admin') {
            return {
                badge: 'Auditoría del Administrador',
                badgeCls: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
                borderCls: 'border-l-rose-500',
                Icon: ShieldAlert,
                actionRoute: '/vendedor/productos',
                actionLabel: 'Ir a Mis Productos'
            };
        }
        if (alert.alertType === 'stock_bajo') {
            return {
                badge: 'Aviso de Stock Bajo',
                badgeCls: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
                borderCls: 'border-l-orange-500',
                Icon: AlertTriangle,
                actionRoute: '/vendedor/stock',
                actionLabel: 'Ir a Reponer Stock'
            };
        }
        if (alert.alertType === 'reporte_mermas') {
            return {
                badge: 'Reporte Oficial de Mermas',
                badgeCls: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
                borderCls: 'border-l-indigo-500',
                Icon: TrendingDown,
                actionRoute: '/vendedor/productos',
                actionLabel: 'Revisar Inventario'
            };
        }
        const isVip = alert.alertType === 'demanda_vip' || alert.suggestedAction === 'activar_exclusivo';
        return {
            badge: isVip ? 'Oportunidad Telas Exclusivas VIP' : 'Oportunidad Descuento Competitivo',
            badgeCls: isVip ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-primary-500/15 text-primary-700 dark:text-primary-300',
            borderCls: isVip ? 'border-l-amber-500' : 'border-l-primary-500',
            Icon: isVip ? Crown : Tag,
            isVip
        };
    };

    return (
        <LayoutPanel title="Centro de Alertas, Auditorías y Oportunidades" links={enlacesVendedor}>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <BackButton to="/vendedor" label="Volver al Resumen" />
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: 'all', label: `Todas (${(sellerAlerts || []).length})` },
                            { id: 'admin', label: `Auditoría y Stock Admin (${adminAlertsCount} pend.)` },
                            { id: 'opportunities', label: 'VIP y Precios' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveFilter(tab.id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    activeFilter === tab.id
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                                        : 'glass-panel text-slate-600 dark:text-slate-300 hover:border-primary-500'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-primary-500 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                    </div>
                </div>

                {/* Alertas recibidas de Administración y del Motor de Mercado */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary-500" />
                        Alertas Recibidas ({(sellerAlerts || []).filter(a => !a.applied).length} pendientes)
                    </h2>

                    {filteredAlerts.length === 0 ? (
                        <div className="glass-panel rounded-2xl p-8 text-center text-slate-500">
                            No hay alertas en esta categoría por el momento.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredAlerts.map((alert) => {
                                const meta = getAlertMetadata(alert);
                                const IconComp = meta.Icon;
                                const isAdminAlert = ['auditoria_admin', 'stock_bajo', 'reporte_mermas'].includes(alert.alertType);

                                return (
                                    <div
                                        key={alert.id}
                                        className={`glass-panel rounded-2xl p-5 border-l-4 ${
                                            alert.applied ? 'border-l-emerald-500 opacity-75' : meta.borderCls
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${meta.badgeCls}`}>
                                                <IconComp className="w-3.5 h-3.5" />
                                                {meta.badge}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {alert.createdAt && (
                                                    <span className="text-[11px] text-slate-400">
                                                        {new Date(alert.createdAt).toLocaleDateString('es-CO')}
                                                    </span>
                                                )}
                                                {alert.applied && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                                        <CheckCircle2 className="w-4 h-4" /> Atendida
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-base text-slate-900 dark:text-white">{alert.title}</h3>
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                                            {alert.message}
                                        </p>

                                        {!alert.applied && isAdminAlert && (
                                            <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-2">
                                                <Link
                                                    to={meta.actionRoute}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                                                >
                                                    {meta.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAcknowledgeAdminAlert(alert)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    {alert.alertType === 'reporte_mermas' ? 'Confirmar Lectura' : 'Marcar como Atendida'}
                                                </button>
                                            </div>
                                        )}

                                        {!alert.applied && !isAdminAlert && alert.productId && (
                                            <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-bold text-slate-500">Descuento (%):</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="80"
                                                        value={customDiscount[alert.id] ?? alert.suggestedDiscount ?? 15}
                                                        onChange={(e) => setCustomDiscount(p => ({ ...p, [alert.id]: e.target.value }))}
                                                        className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleApplyOpportunity(alert)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    {meta.isVip ? 'Activar Exclusiva VIP Ahora' : 'Activar Promoción Ahora'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Control Rápido de Exclusivas y Descuentos para todas las telas del vendedor */}
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary-500" /> Gestión Directa de Telas Exclusivas y Descuentos
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Solo tú (como vendedor propietario) puedes activar o desactivar exclusividad para clientes frecuentes y promociones en tus telas.
                            </p>
                        </div>
                    </div>

                    <div tabIndex={0} role="region" aria-label="Control de telas exclusivas y promociones del vendedor" className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500">
                                    <th className="py-3 pr-4">Tela</th>
                                    <th className="py-3 px-3">Stock</th>
                                    <th className="py-3 px-3">Tela Exclusiva (Solo Clientes VIP)</th>
                                    <th className="py-3 px-3">Promoción Activa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {sellerProducts.map(prod => (
                                    <tr key={prod.id}>
                                        <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">{prod.name}</td>
                                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{prod.stock} m</td>
                                        <td className="py-3 px-3">
                                            <button
                                                type="button"
                                                onClick={() => handleQuickToggle(prod, 'isExclusive', !prod.isExclusive, { esExclusivo: !prod.isExclusive })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                    prod.isExclusive
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                }`}
                                            >
                                                {prod.isExclusive ? 'Exclusiva Activa' : 'Activar Exclusiva'}
                                            </button>
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const nextOffer = !prod.isOffer;
                                                        handleQuickToggle(prod, 'isOffer', nextOffer, {
                                                            esOferta: nextOffer,
                                                            discountPercent: nextOffer ? (prod.discountPercent || 15) : 0,
                                                            porcentajeDescuento: nextOffer ? (prod.discountPercent || 15) : 0
                                                        });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                        prod.isOffer
                                                            ? 'bg-primary-600 text-white'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                    }`}
                                                >
                                                    {prod.isOffer ? `Promo -${prod.discountPercent || 15}%` : 'Activar -15%'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </LayoutPanel>
    );
}
