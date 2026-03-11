import React, { useState } from 'react';
import { FiBell, FiMail } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { getActiveStockAlerts } from '../../../utils/inventoryUtils';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function StockSettings() {
    const { inventoryBatches, stockThresholds, updateStockThreshold } = useMetrics();
    const [editingType, setEditingType] = useState(null);
    const [tempValue, setTempValue] = useState('');
    const activeAlerts = getActiveStockAlerts(inventoryBatches, stockThresholds);

    const handleUpdateThreshold = (fabricType) => {
        if (tempValue && !isNaN(tempValue)) {
            updateStockThreshold(fabricType, parseInt(tempValue));
        }
        setEditingType(null);
        setTempValue('');
    };

    return (
        <DashboardLayout title="Configuración de Alertas" links={adminDashboardLinks}>
            <BackButton />
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiBell className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-gray-500">Alertas Activas</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-600">{activeAlerts.length}</p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiMail className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-500">Notificaciones Email</span>
                    </div>
                    <label className="inline-flex items-center cursor-pointer mt-2">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                </div>

                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Umbrales Configurados</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stockThresholds.length}</p>
                </div>
            </div>

            {/* Thresholds Configuration Table */}
            <div className="card mb-8">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg">Umbrales por Tipo de Tela</h3>
                    <p className="text-sm text-gray-500 mt-1">Configura el stock mínimo para cada tipo de tela</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Tipo de Tela</th>
                                <th className="px-6 py-4 text-right">Stock Actual</th>
                                <th className="px-6 py-4 text-right">Umbral Mínimo (m)</th>
                                <th className="px-6 py-4 text-left">Estado</th>
                                <th className="px-6 py-4 text-left">Alerta</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {stockThresholds.map(threshold => {
                                const currentStock = inventoryBatches
                                    .filter(b => b.fabricType === threshold.fabricType)
                                    .reduce((sum, b) => sum + b.currentMeters, 0);

                                const isLow = currentStock <= threshold.minMeters;

                                return (
                                    <tr key={threshold.fabricType} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${isLow ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                        <td className="px-6 py-4 font-medium">{threshold.fabricType}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-mono font-bold ${isLow ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                                {currentStock}m
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingType === threshold.fabricType ? (
                                                <input
                                                    type="number"
                                                    value={tempValue}
                                                    onChange={(e) => setTempValue(e.target.value)}
                                                    onBlur={() => handleUpdateThreshold(threshold.fabricType)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateThreshold(threshold.fabricType);
                                                        }
                                                    }}
                                                    className="w-24 px-2 py-1 border rounded text-right font-mono"
                                                    autoFocus
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingType(threshold.fabricType);
                                                        setTempValue(threshold.minMeters.toString());
                                                    }}
                                                    className="font-mono font-bold hover:text-primary-600 cursor-pointer"
                                                >
                                                    {threshold.minMeters}m
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isLow ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                    ⚠️ Stock Bajo
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    ✓ Normal
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={threshold.alertEnabled}
                                                    readOnly
                                                />
                                                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                                            </label>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Active Alerts */}
            {activeAlerts.length > 0 && (
                <div className="card">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-red-50 dark:bg-red-900/10">
                        <h3 className="font-bold text-lg text-red-900 dark:text-red-200">
                            ⚠️ Alertas de Stock Activas
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Los siguientes rollos están por debajo del umbral mínimo
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="space-y-3">
                            {activeAlerts.map((alert, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-l-4 border-red-500 rounded-lg shadow-sm"
                                >
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {alert.fabricType} - Rollo {alert.rollId}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Actual</p>
                                        <p className="text-2xl font-bold text-red-600">{alert.currentMeters}m</p>
                                        <p className="text-xs text-gray-400">Mínimo: {alert.threshold}m</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default StockSettings;

