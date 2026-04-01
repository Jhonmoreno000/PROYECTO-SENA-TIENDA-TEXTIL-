import React, { useState } from 'react';
import { FiClock, FiDownload, FiFilter } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { generateMovementHistory } from '../../../utils/inventoryUtils';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function MovementHistory() {
    const { inventoryBatches, wasteEvents, orders } = useMetrics();
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const movements = generateMovementHistory(inventoryBatches, wasteEvents, orders);

    const filteredMovements = movements.filter(m => {
        const matchesType = filterType === 'all' || m.type === filterType;
        const matchesSearch = searchTerm === '' ||
            m.rollId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.fabricType.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const exportToCSV = () => {
        const headers = ['Fecha', 'Tipo', 'Usuario', 'Rollo', 'Tela', 'Metros', 'Razón', 'Estado'];
        const rows = filteredMovements.map(m => [
            m.date,
            m.type,
            m.user,
            m.rollId,
            m.fabricType,
            m.metersChanged,
            m.reason,
            m.status
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial_inventario_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <DashboardLayout title="Historial de Movimientos" links={adminDashboardLinks}>
            <BackButton />
            {/* Header */}
            <div className="flex flex-wrap gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Buscar por rollo, usuario o tela..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 min-w-[300px] px-4 py-2 border rounded-none"
                />

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-none font-medium ${filterType === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilterType('waste')}
                        className={`px-4 py-2 rounded-none font-medium ${filterType === 'waste' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}
                    >
                        Merma
                    </button>
                    <button
                        onClick={() => setFilterType('sale')}
                        className={`px-4 py-2 rounded-none font-medium ${filterType === 'sale' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                    >
                        Ventas
                    </button>
                </div>

                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-none hover:bg-blue-700"
                >
                    <FiDownload className="w-5 h-5" />
                    Exportar CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiClock className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                        <span className="text-sm font-medium text-gray-500">Total Movimientos</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{movements.length}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Eventos de Merma</p>
                    <p className="text-3xl font-bold text-red-600">
                        {movements.filter(m => m.type === 'waste').length}
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Movimientos por Venta</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {movements.filter(m => m.type === 'sale').length}
                    </p>
                </div>
            </div>

            {/* History Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Fecha</th>
                                <th className="px-6 py-4 text-left">Tipo</th>
                                <th className="px-6 py-4 text-left">Usuario</th>
                                <th className="px-6 py-4 text-left">Rollo</th>
                                <th className="px-6 py-4 text-left">Tipo de Tela</th>
                                <th className="px-6 py-4 text-right">Metros</th>
                                <th className="px-6 py-4 text-left">Razón</th>
                                <th className="px-6 py-4 text-left">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredMovements.slice(0, 50).map((movement) => (
                                <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(movement.date).toLocaleDateString('es-CO')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${movement.type === 'waste'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                            {movement.type === 'waste' ? 'Merma' : 'Venta'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{movement.user}</td>
                                    <td className="px-6 py-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                                        {movement.rollId}
                                    </td>
                                    <td className="px-6 py-4 text-sm">{movement.fabricType}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-mono font-bold ${movement.metersChanged < 0 ? 'text-red-600' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {movement.metersChanged > 0 ? '+' : ''}{movement.metersChanged}m
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {movement.reason}
                                    </td>
                                    <td className="px-6 py-4 text-sm capitalize">
                                        {movement.status === 'completed' ? 'Completado' : movement.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredMovements.length === 0 && (
                    <div className="p-12 text-center">
                        <FiFilter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No se encontraron movimientos con los filtros aplicados</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default MovementHistory;

