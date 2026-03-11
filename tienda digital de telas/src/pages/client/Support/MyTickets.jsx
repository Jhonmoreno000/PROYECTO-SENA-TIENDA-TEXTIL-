import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiPlus, FiClock, FiCheckCircle, FiAlertCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import clientDashboardLinks from '../../../data/clientDashboardLinks';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { useAuth } from '../../../context/AuthContext';

function MyTickets() {
    const { supportTickets = [] } = useMetrics();
    const { user } = useAuth();
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedTicket, setExpandedTicket] = useState(null);

    

    // Mock tickets for demo
    const mockTickets = [
        {
            id: 1,
            orderId: 1001,
            subject: '🩹 Manchas en la tela',
            description: 'La tela llegó con una mancha café de aproximadamente 10cm en una esquina del rollo.',
            priority: 'high',
            status: 'open',
            createdAt: '2026-01-28',
            updatedAt: '2026-01-28',
            photos: [],
            responses: []
        },
        {
            id: 2,
            orderId: 1002,
            subject: '📏 Metraje incorrecto',
            description: 'Pedí 5 metros pero solo recibí 4.5 metros según mi medición.',
            priority: 'high',
            status: 'in_progress',
            createdAt: '2026-01-25',
            updatedAt: '2026-01-27',
            photos: [],
            responses: [
                {
                    id: 1,
                    from: 'seller',
                    name: 'Textiles Premium',
                    message: 'Hola, lamentamos el inconveniente. Vamos a revisar el caso y te contactamos con una solución.',
                    date: '2026-01-26'
                },
                {
                    id: 2,
                    from: 'seller',
                    name: 'Textiles Premium',
                    message: 'Confirmamos que hubo un error en el corte. Te enviaremos los 0.5m faltantes sin costo adicional. ¿Es esta dirección correcta para el envío?',
                    date: '2026-01-27'
                }
            ]
        },
        {
            id: 3,
            orderId: 998,
            subject: '🎨 Color incorrecto',
            description: 'El color de la tela es más claro que el mostrado en las fotos.',
            priority: 'medium',
            status: 'resolved',
            createdAt: '2026-01-15',
            updatedAt: '2026-01-20',
            resolution: 'refund',
            resolutionDetails: 'Se realizó reembolso completo de $185,000 COP',
            photos: [],
            responses: [
                {
                    id: 1,
                    from: 'admin',
                    name: 'Soporte D&D Textil',
                    message: 'Hemos revisado tu caso. Efectivamente hay diferencia de color. Procederemos con el reembolso.',
                    date: '2026-01-18'
                }
            ]
        }
    ];

    const tickets = supportTickets.length > 0
        ? supportTickets.filter(t => t.clientId === user?.id || true)
        : mockTickets;

    const filteredTickets = filterStatus === 'all'
        ? tickets
        : tickets.filter(t => t.status === filterStatus);

    const getStatusInfo = (status) => {
        const statusConfig = {
            open: {
                label: 'Abierto',
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                icon: FiMessageCircle,
                description: 'Tu reporte ha sido recibido'
            },
            in_progress: {
                label: 'En Revisión',
                color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                icon: FiClock,
                description: 'El vendedor está revisando tu caso'
            },
            resolved: {
                label: 'Resuelto',
                color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                icon: FiCheckCircle,
                description: 'Tu caso ha sido solucionado'
            },
            closed: {
                label: 'Cerrado',
                color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
                icon: FiCheckCircle,
                description: 'Caso cerrado'
            }
        };
        return statusConfig[status] || statusConfig.open;
    };

    const toggleExpand = (ticketId) => {
        setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
    };

    return (
        <DashboardLayout title="Mis Tickets de Soporte" links={clientDashboardLinks}>
            <BackButton to="/cliente" label="Volver a Mi Panel" />
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex gap-2">
                    {['all', 'open', 'in_progress', 'resolved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300'
                                }`}
                        >
                            {status === 'all' ? 'Todos'
                                : status === 'open' ? 'Abiertos'
                                    : status === 'in_progress' ? 'En Revisión'
                                        : 'Resueltos'}
                            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                {status === 'all'
                                    ? tickets.length
                                    : tickets.filter(t => t.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>
                <Link
                    to="/cliente/soporte/nuevo"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <FiPlus className="w-4 h-4" />
                    Nuevo Reporte
                </Link>
            </div>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiCheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        ¡Todo en orden!
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {filterStatus === 'all'
                            ? 'No tienes tickets de soporte. ¡Esperamos que todo esté bien con tus compras!'
                            : 'No hay tickets en este estado'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTickets.map(ticket => {
                        const statusInfo = getStatusInfo(ticket.status);
                        const StatusIcon = statusInfo.icon;
                        const isExpanded = expandedTicket === ticket.id;

                        return (
                            <div key={ticket.id} className="card overflow-hidden">
                                {/* Ticket Header */}
                                <button
                                    onClick={() => toggleExpand(ticket.id)}
                                    className="w-full p-6 flex items-start justify-between gap-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${ticket.priority === 'high'
                                            ? 'bg-red-100 dark:bg-red-900/30'
                                            : 'bg-gray-100 dark:bg-slate-700'
                                            }`}>
                                            <FiAlertCircle className={`w-5 h-5 ${ticket.priority === 'high'
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-gray-600 dark:text-gray-400'
                                                }`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {ticket.subject}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Ticket #{ticket.id} • Pedido #{ticket.orderId} •
                                                Creado el {new Date(ticket.createdAt).toLocaleDateString('es-CO')}
                                            </p>
                                            {ticket.responses.length > 0 && (
                                                <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                                                    💬 {ticket.responses.length} respuesta(s)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? (
                                            <FiChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <FiChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Ticket Details (Expanded) */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200 dark:border-slate-700">
                                        {/* Original Description */}
                                        <div className="p-6 bg-gray-50 dark:bg-slate-800/50">
                                            <p className="text-sm font-medium text-gray-500 mb-2">Tu reporte:</p>
                                            <p className="text-gray-900 dark:text-white">
                                                {ticket.description}
                                            </p>
                                            {ticket.photos?.length > 0 && (
                                                <div className="flex gap-2 mt-4">
                                                    {ticket.photos.map((photo, i) => (
                                                        <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg" />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Responses */}
                                        {ticket.responses.length > 0 && (
                                            <div className="p-6 space-y-4">
                                                <p className="text-sm font-medium text-gray-500">Conversación:</p>
                                                {ticket.responses.map(response => (
                                                    <div
                                                        key={response.id}
                                                        className={`p-4 rounded-lg ${response.from === 'client'
                                                            ? 'bg-primary-50 dark:bg-primary-900/20 ml-8'
                                                            : 'bg-gray-100 dark:bg-slate-800 mr-8'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs ${response.from === 'admin'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                                : response.from === 'seller'
                                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                    : 'bg-gray-200 text-gray-600'
                                                                }`}>
                                                                {response.from === 'admin' ? 'Soporte'
                                                                    : response.from === 'seller' ? 'Vendedor'
                                                                        : 'Tú'}
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {response.name}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(response.date).toLocaleDateString('es-CO')}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 dark:text-gray-300">
                                                            {response.message}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Resolution */}
                                        {ticket.status === 'resolved' && ticket.resolutionDetails && (
                                            <div className="p-6 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-900/30">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                                                    <span className="font-bold text-green-800 dark:text-green-200">
                                                        Caso Resuelto
                                                    </span>
                                                </div>
                                                <p className="text-green-700 dark:text-green-300">
                                                    {ticket.resolutionDetails}
                                                </p>
                                            </div>
                                        )}

                                        {/* Reply Box (for open/in_progress tickets) */}
                                        {['open', 'in_progress'].includes(ticket.status) && (
                                            <div className="p-6 border-t border-gray-200 dark:border-slate-700">
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Escribe un mensaje..."
                                                        className="flex-1 px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                                    />
                                                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                                                        Enviar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}

export default MyTickets;
