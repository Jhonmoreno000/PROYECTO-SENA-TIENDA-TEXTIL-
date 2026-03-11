import React, { useState } from 'react';
import { FiDollarSign, FiAlertCircle, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { getAllSellersMetrics } from '../../../utils/metricsUtils';
import { formatCurrency } from '../../../utils/formatters';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function VendorPerformance() {
    const { users, orders, bugReports, updateSellerCommission, toggleSellerSuspension } = useMetrics();
    const [editingCommission, setEditingCommission] = useState(null);
    const [tempCommission, setTempCommission] = useState('');
    const [showSuspendModal, setShowSuspendModal] = useState(null);
    const [suspensionReason, setSuspensionReason] = useState('');
    const sellers = users.filter(u => u.role === 'seller');
    const sellersWithMetrics = getAllSellersMetrics(sellers, orders, bugReports);

    const chartData = sellersWithMetrics.slice(0, 5).map(s => ({
        name: s.name.split(' ')[0],
        ventas: s.metrics.totalSales / 1000,
        pedidos: s.metrics.totalOrders
    }));

    const handleUpdateCommission = (sellerId) => {
        if (tempCommission && !isNaN(tempCommission)) {
            updateSellerCommission(sellerId, parseFloat(tempCommission));
        }
        setEditingCommission(null);
        setTempCommission('');
    };

    const handleToggleSuspension = (seller) => {
        if (seller.suspended) {
            toggleSellerSuspension(seller.id);
            setShowSuspendModal(null);
        } else {
            setShowSuspendModal(seller);
        }
    };

    const confirmSuspension = (sellerId) => {
        if (suspensionReason.trim()) {
            toggleSellerSuspension(sellerId, suspensionReason);
            setShowSuspendModal(null);
            setSuspensionReason('');
        }
    };

    return (
        <DashboardLayout title="Rendimiento de Vendedores" links={adminDashboardLinks}>
            <BackButton />
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Total Vendedores</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{sellers.length}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Vendedores Activos</p>
                    <p className="text-3xl font-bold text-green-600">
                        {sellers.filter(s => !s.suspended).length}
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Suspendidos</p>
                    <p className="text-3xl font-bold text-red-600">
                        {sellers.filter(s => s.suspended).length}
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Comisión Promedio</p>
                    <p className="text-3xl font-bold text-primary-600">
                        {(sellers.reduce((sum, s) => sum + (s.commissionRate || 0), 0) / sellers.length || 0).toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Sales Chart */}
            <div className="card p-6 mb-8">
                <h3 className="font-bold text-lg mb-4">Comparación de Ventas (Top 5)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8B5CF6" />
                        <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="ventas" fill="#8B5CF6" name="Ventas (miles)" />
                        <Bar yAxisId="right" dataKey="pedidos" fill="#F59E0B" name="Pedidos" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Sellers Table */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg">Lista de Vendedores</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Vendedor</th>
                                <th className="px-6 py-4 text-right">Ventas</th>
                                <th className="px-6 py-4 text-right">Pedidos</th>
                                <th className="px-6 py-4 text-right">Comisión %</th>
                                <th className="px-6 py-4 text-center">Reportes</th>
                                <th className="px-6 py-4 text-left">Estado</th>
                                <th className="px-6 py-4 text-center">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {sellersWithMetrics.map(seller => {
                                const sellerBugs = bugReports.filter(b => b.sellerId === seller.id);

                                return (
                                    <tr key={seller.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${seller.suspended ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400">
                                                    {seller.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{seller.name}</p>
                                                    <p className="text-xs text-gray-500">{seller.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(seller.metrics.totalSales)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {seller.metrics.totalOrders} pedidos
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingCommission === seller.id ? (
                                                <input
                                                    type="number"
                                                    value={tempCommission}
                                                    onChange={(e) => setTempCommission(e.target.value)}
                                                    onBlur={() => handleUpdateCommission(seller.id)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateCommission(seller.id);
                                                        }
                                                    }}
                                                    className="w-16 px-2 py-1 border rounded text-right"
                                                    autoFocus
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingCommission(seller.id);
                                                        setTempCommission(seller.commissionRate?.toString() || '0');
                                                    }}
                                                    className="font-mono text-xl font-bold text-green-600 hover:text-green-700 cursor-pointer"
                                                >
                                                    {seller.commissionRate || 0}%
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {sellerBugs.length > 0 && (
                                                    <FiAlertCircle className={`w-5 h-5 ${sellerBugs.length > 3 ? 'text-red-600' : 'text-yellow-600'}`} />
                                                )}
                                                <span className="font-bold">{sellerBugs.length}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {seller.suspended ? (
                                                <div>
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                        Suspendido
                                                    </span>
                                                    {seller.suspensionReason && (
                                                        <p className="text-xs text-gray-500 mt-1">{seller.suspensionReason}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    Activo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleSuspension(seller)}
                                                className={`p-2 rounded-lg transition-colors ${seller.suspended
                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                title={seller.suspended ? 'Reactivar' : 'Suspender'}
                                            >
                                                {seller.suspended ? <FiToggleLeft className="w-6 h-6" /> : <FiToggleRight className="w-6 h-6" />}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Suspension Modal */}
            {showSuspendModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-red-600">⚠️ Suspender Vendedor</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Vas a suspender a <strong>{showSuspendModal.name}</strong>. Por favor especifica la razón:
                        </p>
                        <textarea
                            value={suspensionReason}
                            onChange={(e) => setSuspensionReason(e.target.value)}
                            placeholder="Ej: Múltiples reportes de calidad de productos..."
                            className="w-full px-4 py-2 border rounded-lg mb-4"
                            rows="4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => confirmSuspension(showSuspendModal.id)}
                                disabled={!suspensionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                Confirmar Suspensión
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuspendModal(null);
                                    setSuspensionReason('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default VendorPerformance;

