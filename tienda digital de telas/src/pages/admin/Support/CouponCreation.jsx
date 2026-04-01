import React, { useState } from 'react';
import { FiPlus, FiPercent } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function CouponCreation() {
    const { coupons, createCoupon, deactivateCoupon } = useMetrics();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiresAt: '',
        rules: {
            minPurchase: '',
            maxUses: '',
            firstTimeOnly: false
        }
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
        setShowCreateModal(false);
        setFormData({
            code: '',
            discountType: 'percentage',
            discountValue: '',
            expiresAt: '',
            rules: { minPurchase: '', maxUses: '', firstTimeOnly: false }
        });
    };

    return (
        <DashboardLayout title="Creación y Gestión de Cupones" links={adminDashboardLinks}>
            <BackButton />
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cupones de Descuento</h2>
                    <p className="text-gray-500 mt-1">Crea y gestiona cupones para clientes</p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-none hover:bg-primary-700 transition-colors"
                >
                    <FiPlus className="w-5 h-5" />
                    Crear Cupón
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiPercent className="w-5 h-5 text-primary-600" />
                        <span className="text-sm font-medium text-gray-500">Total Cupones</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{coupons.length}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Activos</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {coupons.filter(c => c.active).length}
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Usados Hoy</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)}
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Expiran Pronto</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {coupons.filter(c => {
                            const daysUntilExpiry = Math.ceil((new Date(c.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
                            return c.active && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                        }).length}
                    </p>
                </div>
            </div>

            {/* Coupons Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Código</th>
                                <th className="px-6 py-4 text-left">Descuento</th>
                                <th className="px-6 py-4 text-right">Usos</th>
                                <th className="px-6 py-4 text-left">Reglas</th>
                                <th className="px-6 py-4 text-left">Expira</th>
                                <th className="px-6 py-4 text-left">Estado</th>
                                <th className="px-6 py-4 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {coupons.map(coupon => {
                                const daysUntilExpiry = Math.ceil((new Date(coupon.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
                                const isExpired = daysUntilExpiry < 0;
                                const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;

                                return (
                                    <tr key={coupon.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${!coupon.active || isExpired ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-lg text-primary-600 dark:text-primary-400">
                                                {coupon.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                {coupon.discountType === 'percentage'
                                                    ? `${coupon.discountValue}% OFF`
                                                    : `-${formatCurrency(coupon.discountValue)}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div>
                                                <span className="font-bold text-gray-900 dark:text-white">{coupon.usageCount || 0}</span>
                                                {coupon.rules.maxUses && (
                                                    <span className="text-sm text-gray-500"> / {coupon.rules.maxUses}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="space-y-1">
                                                {coupon.rules.minPurchase && (
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        Min: {formatCurrency(coupon.rules.minPurchase)}
                                                    </p>
                                                )}
                                                {coupon.rules.firstTimeOnly && (
                                                    <p className="text-gray-800 dark:text-gray-200">Solo nuevos clientes</p>
                                                )}
                                                {!coupon.rules.minPurchase && !coupon.rules.firstTimeOnly && (
                                                    <p className="text-gray-500">Sin restricciones</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className={`text-sm ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-gray-800 dark:text-gray-200' : 'text-gray-600'}`}>
                                                    {new Date(coupon.expiresAt).toLocaleDateString('es-CO')}
                                                </p>
                                                {isExpiringSoon && !isExpired && (
                                                    <p className="text-xs text-gray-800 dark:text-gray-200 font-bold">⚠️ {daysUntilExpiry} días</p>
                                                )}
                                                {isExpired && (
                                                    <p className="text-xs text-red-600 font-bold">Expirado</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isExpired ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                    Expirado
                                                </span>
                                            ) : coupon.active ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {coupon.active && !isExpired && (
                                                <button
                                                    onClick={() => deactivateCoupon(coupon.id)}
                                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-none hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                                                >
                                                    Desactivar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Coupon Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-none p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-6">Crear Nuevo Cupón</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Código del Cupón</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="Ej: VERANO2024"
                                    className="w-full px-4 py-2 border rounded-none font-mono"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tipo de Descuento</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-none"
                                    >
                                        <option value="percentage">Porcentaje (%)</option>
                                        <option value="fixed">Valor Fijo ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Valor</label>
                                    <input
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        placeholder={formData.discountType === 'percentage' ? '10' : '50000'}
                                        className="w-full px-4 py-2 border rounded-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Fecha de Expiración</label>
                                <input
                                    type="date"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Compra Mínima (Opcional)</label>
                                    <input
                                        type="number"
                                        value={formData.rules.minPurchase}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            rules: { ...formData.rules, minPurchase: e.target.value }
                                        })}
                                        placeholder="100000"
                                        className="w-full px-4 py-2 border rounded-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Usos Máximos (Opcional)</label>
                                    <input
                                        type="number"
                                        value={formData.rules.maxUses}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            rules: { ...formData.rules, maxUses: e.target.value }
                                        })}
                                        placeholder="100"
                                        className="w-full px-4 py-2 border rounded-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.rules.firstTimeOnly}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            rules: { ...formData.rules, firstTimeOnly: e.target.checked }
                                        })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium">Solo para nuevos clientes (primera compra)</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-none hover:bg-primary-700 font-medium"
                                >
                                    Crear Cupón
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-none hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default CouponCreation;

