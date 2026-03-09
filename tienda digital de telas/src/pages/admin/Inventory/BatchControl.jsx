import React, { useState } from 'react';
import { FiPackage, FiPlus, FiEdit2, FiFilter, FiAlertTriangle } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { calculateWastePercentage } from '../../../utils/inventoryUtils';

function BatchControl() {
    const { inventoryBatches, wasteEvents, updateBatch, addBatch } = useMetrics();
    const [filterType, setFilterType] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);

    const dashboardLinks = [
        { label: 'Lotes', path: '/admin/inventario/lotes', icon: FiPackage },
        { label: 'Merma', path: '/admin/inventario/merma', icon: FiAlertTriangle },
        { label: 'Alertas', path: '/admin/inventario/alertas', icon: FiFilter },
        { label: 'Historial', path: '/admin/inventario/historial', icon: FiEdit2 },
    ];

    const filteredBatches = filterType === 'all'
        ? inventoryBatches
        : inventoryBatches.filter(b => b.status === filterType);

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'low': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const handleUpdateMeters = (batchId, currentMeters) => {
        updateBatch(batchId, { currentMeters: parseInt(currentMeters) });
        setEditingBatch(null);
    };

    return (
        <DashboardLayout title="Control de Lotes y Rollos" links={dashboardLinks}>
            <BackButton />
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
                            }`}
                    >
                        Todos ({inventoryBatches.length})
                    </button>
                    <button
                        onClick={() => setFilterType('active')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === 'active'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
                            }`}
                    >
                        Activos
                    </button>
                    <button
                        onClick={() => setFilterType('low')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === 'low'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
                            }`}
                    >
                        Stock Bajo
                    </button>
                    <button
                        onClick={() => setFilterType('critical')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === 'critical'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
                            }`}
                    >
                        Crítico
                    </button>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <FiPlus className="w-5 h-5" />
                    Agregar Lote
                </button>
            </div>

            {/* Batches Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">ID Rollo</th>
                                <th className="px-6 py-4 text-left">Tipo de Tela</th>
                                <th className="px-6 py-4 text-left">Proveedor</th>
                                <th className="px-6 py-4 text-right">Metros Iniciales</th>
                                <th className="px-6 py-4 text-right">Metros Actuales</th>
                                <th className="px-6 py-4 text-right">Merma %</th>
                                <th className="px-6 py-4 text-left">Estado</th>
                                <th className="px-6 py-4 text-left">Última Actualización</th>
                                <th className="px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredBatches.map(batch => {
                                const wastePercent = calculateWastePercentage(batch, wasteEvents);
                                const usagePercent = ((batch.currentMeters / batch.initialMeters) * 100).toFixed(0);

                                return (
                                    <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                                                {batch.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{batch.fabricType}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {batch.supplier}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono">{batch.initialMeters}m</td>
                                        <td className="px-6 py-4">
                                            {editingBatch === batch.id ? (
                                                <input
                                                    type="number"
                                                    defaultValue={batch.currentMeters}
                                                    onBlur={(e) => handleUpdateMeters(batch.id, e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateMeters(batch.id, e.target.value);
                                                        }
                                                    }}
                                                    className="w-24 px-2 py-1 border rounded text-right font-mono"
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="font-mono font-bold">{batch.currentMeters}m</span>
                                                    <button
                                                        onClick={() => setEditingBatch(batch.id)}
                                                        className="text-gray-400 hover:text-primary-600"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${parseFloat(wastePercent) > 10 ? 'text-red-600' : 'text-gray-600'}`}>
                                                {wastePercent}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(batch.status)}`}>
                                                {batch.status === 'critical' ? 'Crítico' : batch.status === 'low' ? 'Bajo' : 'Activo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(batch.lastUpdate).toLocaleDateString('es-CO')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${usagePercent > 50 ? 'bg-green-500' : usagePercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${usagePercent}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{usagePercent}% restante</p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mt-8">
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Total de Lotes</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{inventoryBatches.length}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Lotes Activos</p>
                    <p className="text-3xl font-bold text-green-600">
                        {inventoryBatches.filter(b => b.status === 'active').length}
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Stock Bajo</p>
                    <p className="text-3xl font-bold text-yellow-600">
                        {inventoryBatches.filter(b => b.status === 'low').length}
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Estado Crítico</p>
                    <p className="text-3xl font-bold text-red-600">
                        {inventoryBatches.filter(b => b.status === 'critical').length}
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default BatchControl;
