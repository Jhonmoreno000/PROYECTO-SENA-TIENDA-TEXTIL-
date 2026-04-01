import React, { useState } from 'react';
import { FiAlertTriangle, FiPlus } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { calculateWasteStatsByReason } from '../../../utils/inventoryUtils';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function WasteCalculator() {
    const { inventoryBatches, wasteEvents, logWaste, users } = useMetrics();
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        rollId: '',
        meters: '',
        reason: 'factory_defect',
        description: '',
        responsible: ''
    });
    const wasteStats = calculateWasteStatsByReason(wasteEvents);
    const totalWaste = wasteEvents.reduce((sum, e) => sum + e.meters, 0);

    // Preparar datos para gráficos
    const wasteByReasonData = Object.entries(wasteStats).map(([reason, data]) => ({
        name: reason === 'factory_defect' ? 'Defecto Fábrica' :
            reason === 'cutting_error' ? 'Error Corte' :
                reason === 'damaged' ? 'Dañado' : 'Control Calidad',
        meters: data.totalMeters,
        count: data.count
    }));

    const wasteOverTimeData = wasteEvents
        .slice(-10)
        .map(event => ({
            date: new Date(event.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
            meters: event.meters
        }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentUser = users.find(u => u.name === formData.responsible) || users[0];
        logWaste({
            ...formData,
            meters: parseFloat(formData.meters),
            userId: currentUser.id
        });
        setShowAddModal(false);
        setFormData({
            rollId: '',
            meters: '',
            reason: 'factory_defect',
            description: '',
            responsible: ''
        });
    };

    return (
        <DashboardLayout title="Calculadora de Merma" links={adminDashboardLinks}>
            <BackButton />
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Desperdicios</h2>
                    <p className="text-gray-500 mt-1">Registra y analiza la merma de tela</p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-none hover:bg-primary-700 transition-colors"
                >
                    <FiPlus className="w-5 h-5" />
                    Registrar Merma
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiAlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-gray-500">Total Merma</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{totalWaste}m</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Eventos Registrados</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{wasteEvents.length}</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Promedio por Evento</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {(totalWaste / wasteEvents.length || 0).toFixed(1)}m
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Principal Causa</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {wasteByReasonData.length > 0 ?
                            wasteByReasonData.sort((a, b) => b.meters - a.meters)[0].name
                            : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Waste by Reason */}
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4">Merma por Razón</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={wasteByReasonData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="meters" fill="#EF4444" name="Metros" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Waste Over Time */}
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4">Tendencia de Merma</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={wasteOverTimeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="meters" stroke="#F59E0B" strokeWidth={2} name="Metros" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Waste Events Table */}
            <div className="card">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg">Eventos Recientes</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Fecha</th>
                                <th className="px-6 py-4 text-left">ID Rollo</th>
                                <th className="px-6 py-4 text-right">Metros</th>
                                <th className="px-6 py-4 text-left">Razón</th>
                                <th className="px-6 py-4 text-left">Descripción</th>
                                <th className="px-6 py-4 text-left">Responsable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {wasteEvents.slice().reverse().map(event => (
                                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(event.date).toLocaleDateString('es-CO')}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                                        {event.rollId}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-red-600">
                                        {event.meters}m
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                            {event.reason === 'factory_defect' ? 'Defecto Fábrica' :
                                                event.reason === 'cutting_error' ? 'Error Corte' :
                                                    event.reason === 'damaged' ? 'Dañado' : 'Control Calidad'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {event.description}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {event.responsible}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Waste Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-none p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Registrar Merma</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">ID Rollo</label>
                                    <select
                                        value={formData.rollId}
                                        onChange={(e) => setFormData({ ...formData, rollId: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-none"
                                        required
                                    >
                                        <option value="">Seleccionar rollo...</option>
                                        {inventoryBatches.map(batch => (
                                            <option key={batch.id} value={batch.id}>
                                                {batch.id} - {batch.fabricType}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Metros Desperdiciados</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.meters}
                                        onChange={(e) => setFormData({ ...formData, meters: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Razón</label>
                                    <select
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-none"
                                    >
                                        <option value="factory_defect">Defecto de Fábrica</option>
                                        <option value="cutting_error">Error de Corte</option>
                                        <option value="damaged">Dañado en Transporte</option>
                                        <option value="quality_control">Control de Calidad</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Descripción</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-none"
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Responsable</label>
                                    <input
                                        type="text"
                                        value={formData.responsible}
                                        onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-none"
                                        placeholder="Nombre del responsable o N/A"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-none hover:bg-primary-700"
                                >
                                    Registrar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-none hover:bg-gray-300"
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

export default WasteCalculator;

