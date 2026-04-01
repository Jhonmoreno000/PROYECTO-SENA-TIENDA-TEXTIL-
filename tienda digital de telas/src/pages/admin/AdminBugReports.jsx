import React, { useState } from 'react';
import { FiFileText, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useNotification } from '../../context/NotificationContext';
import adminDashboardLinks from '../../data/adminDashboardLinks';

function AdminBugReports() {
    const { showNotification } = useNotification();
    const [reports, setReports] = useState([
        { id: 1, title: 'Error en checkout móvil', date: '2023-11-20', severity: 'high', type: 'bug', status: 'open', user: 'Juan Pérez' },
        { id: 2, title: 'Botón de login desalineado', date: '2023-11-19', severity: 'low', type: 'visual', status: 'closed', user: 'Ana García' },
        { id: 3, title: 'Sugerencia: Filtros por color', date: '2023-11-18', severity: 'medium', type: 'feature', status: 'pending', user: 'Pedro Lopez' },
    ]);

    const handleStatusChange = (id, newStatus) => {
        setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
        showNotification('success', 'Estado actualizado');
    };

    const getSeverityBadge = (severity) => {
        const colors = {
            low: 'bg-green-100 text-green-700',
            medium: 'bg-blue-100 text-blue-700',
            high: 'bg-orange-100 text-orange-700',
            critical: 'bg-red-100 text-red-700'
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${colors[severity] || colors.low}`}>{severity}</span>;
    };

    return (
        <DashboardLayout title="Reportes de Fallos" links={adminDashboardLinks}>
            <BackButton />
            <div className="card">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="font-bold text-lg">Tickets Recientes</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold text-left">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Problema</th>
                                <th className="px-6 py-4">Severidad</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-mono text-sm">#{report.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{report.title}</div>
                                        <div className="text-xs text-gray-500 capitalize">{report.type} • {report.date}</div>
                                    </td>
                                    <td className="px-6 py-4">{getSeverityBadge(report.severity)}</td>
                                    <td className="px-6 py-4 text-sm capitalize">{report.status}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{report.user}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {report.status !== 'closed' && (
                                                <button
                                                    onClick={() => handleStatusChange(report.id, 'closed')}
                                                    title="Marcar resuelto"
                                                    className="p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded"
                                                >
                                                    <FiCheck />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleStatusChange(report.id, 'rejected')}
                                                title="Descartar"
                                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AdminBugReports;

