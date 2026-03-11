import React, { useState } from 'react';
import { FiMessageSquare, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function TicketManagement() {
    const { supportTickets, updateTicketStatus, assignTicket, users } = useMetrics();
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [assignToUser, setAssignToUser] = useState('');
    const filteredTickets = filterStatus === 'all'
        ? supportTickets
        : supportTickets.filter(t => t.status === filterStatus);

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const handleAssignTicket = (ticketId) => {
        if (assignToUser) {
            const user = users.find(u => u.id === parseInt(assignToUser));
            if (user) {
                assignTicket(ticketId, user.id);
                setAssignToUser('');
            }
        }
    };

    return (
        <DashboardLayout title="Gestión de Tickets de Soporte" links={adminDashboardLinks}>
            <BackButton />
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
                    >
                        Todos ({supportTickets.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('open')}
                        className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'open' ? 'bg-yellow-600 text-white' : 'bg-gray-100'}`}
                    >
                        Abiertos ({supportTickets.filter(t => t.status === 'open').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('in_progress')}
                        className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                    >
                        En Progreso ({supportTickets.filter(t => t.status === 'in_progress').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('resolved')}
                        className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                    >
                        Resueltos ({supportTickets.filter(t => t.status === 'resolved').length})
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiMessageSquare className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-500">Total Tickets</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{supportTickets.length}</p>
                </div>
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiClock className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-500">Pendientes</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-600">
                        {supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
                    </p>
                </div>
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiCheck className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-500">Resueltos Hoy</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                        {supportTickets.filter(t =>
                            t.status === 'resolved' &&
                            new Date(t.resolvedAt).toDateString() === new Date().toDateString()
                        ).length}
                    </p>
                </div>
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiAlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-gray-500">Prioridad Alta</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">
                        {supportTickets.filter(t => t.priority === 'high' && t.status !== 'resolved').length}
                    </p>
                </div>
            </div>

            {/* Tickets List */}
            <div className="grid gap-4">
                {filteredTickets.length === 0 ? (
                    <div className="card p-12 text-center">
                        <FiCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            ¡Todo resuelto!
                        </h3>
                        <p className="text-gray-500">No hay tickets con el filtro seleccionado</p>
                    </div>
                ) : (
                    filteredTickets.map(ticket => (
                        <div key={ticket.id} className="card p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                                            #{ticket.id.toString().padStart(4, '0')}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                                            {ticket.status === 'open' ? 'Abierto' :
                                                ticket.status === 'in_progress' ? 'En Progreso' :
                                                    ticket.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                                        </span>
                                        <span className={`text-sm font-bold ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority === 'high' ? '🔴 Alta' :
                                                ticket.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        {ticket.subject}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">{ticket.description}</p>

                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <div>
                                            <span className="font-medium">Cliente:</span> {ticket.customerName}
                                        </div>
                                        <div>
                                            <span className="font-medium">Email:</span> {ticket.customerEmail}
                                        </div>
                                        {ticket.orderId && (
                                            <div>
                                                <span className="font-medium">Pedido:</span> #{ticket.orderId}
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">Creado:</span> {new Date(ticket.createdAt).toLocaleDateString('es-CO')}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Ver Detalles
                                </button>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                                <select
                                    value={ticket.status}
                                    onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                                    className="px-3 py-2 border rounded-lg text-sm"
                                >
                                    <option value="open">Abierto</option>
                                    <option value="in_progress">En Progreso</option>
                                    <option value="resolved">Resuelto</option>
                                    <option value="closed">Cerrado</option>
                                </select>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Asignar a:
                                    </span>
                                    <select
                                        value={assignToUser}
                                        onChange={(e) => {
                                            setAssignToUser(e.target.value);
                                            if (e.target.value) {
                                                handleAssignTicket(ticket.id);
                                            }
                                        }}
                                        className="px-3 py-2 border rounded-lg text-sm"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {users.filter(u => u.role === 'admin').map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {ticket.assignedTo && (
                                    <span className="text-sm text-gray-500">
                                        Asignado a: <strong>{users.find(u => u.id === ticket.assignedTo)?.name}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{selectedTicket.subject}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-primary-600">#{selectedTicket.id.toString().padStart(4, '0')}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status}
                                        </span>
                                        <span className={`text-sm font-bold ${getPriorityColor(selectedTicket.priority)}`}>
                                            Prioridad: {selectedTicket.priority}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-bold mb-2">Descripción</h4>
                                <p className="text-gray-600 dark:text-gray-400">{selectedTicket.description}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Cliente</p>
                                    <p className="font-medium">{selectedTicket.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{selectedTicket.customerEmail}</p>
                                </div>
                                {selectedTicket.orderId && (
                                    <div>
                                        <p className="text-sm text-gray-500">Pedido Relacionado</p>
                                        <p className="font-medium">#{selectedTicket.orderId}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500">Creado</p>
                                    <p className="font-medium">
                                        {new Date(selectedTicket.createdAt).toLocaleString('es-CO')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        updateTicketStatus(selectedTicket.id, 'in_progress');
                                        setSelectedTicket(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Marcar en Progreso
                                </button>
                                <button
                                    onClick={() => {
                                        updateTicketStatus(selectedTicket.id, 'resolved');
                                        setSelectedTicket(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                >
                                    Marcar como Resuelto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default TicketManagement;

