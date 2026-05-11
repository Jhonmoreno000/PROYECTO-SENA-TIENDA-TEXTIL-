/**
 * MyTickets.jsx — Listado de Tickets (Client Support)
 *
 * Muestra el historial de reportes y tickets de soporte del cliente,
 * permitiendo ver el estado y la comunicación.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Importación de íconos desde lucide-react
import { 
    MessageSquare,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Send,
    Headset
} from 'lucide-react';

import DashboardLayout from '../../../components/layouts/DashboardLayout';
import AnimatedPage from '../../../components/AnimatedPage';
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
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50',
                icon: MessageSquare,
                description: 'Tu reporte ha sido recibido'
            },
            in_progress: {
                label: 'En Revisión',
                color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
                icon: Clock,
                description: 'El vendedor está revisando tu caso'
            },
            resolved: {
                label: 'Resuelto',
                color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
                icon: CheckCircle,
                description: 'Tu caso ha sido solucionado'
            },
            closed: {
                label: 'Cerrado',
                color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50',
                icon: CheckCircle,
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
            <AnimatedPage>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <BackButton to="/cliente" label="Volver a Mi Panel" />
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4 tracking-tight flex items-center gap-3">
                            Soporte y Ayuda
                            <span className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                Tickets
                            </span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                            Administra tus reportes, consultas y problemas con pedidos.
                        </p>
                    </div>
                </div>

                {/* ================================================================
                    FILTROS Y ACCIONES
                ================================================================ */}
                <div className="card p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        {['all', 'open', 'in_progress', 'resolved'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                                    filterStatus === status
                                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg shadow-gray-900/20 dark:shadow-white/20 -translate-y-0.5'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                            >
                                {status === 'all' ? 'Todos los tickets'
                                    : status === 'open' ? 'Abiertos'
                                        : status === 'in_progress' ? 'En Revisión'
                                            : 'Resueltos'}
                                <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                                    filterStatus === status
                                        ? 'bg-white/20 dark:bg-gray-900/20 text-current'
                                        : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}>
                                    {status === 'all'
                                        ? tickets.length
                                        : tickets.filter(t => t.status === status).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    <Link
                        to="/cliente/soporte/nuevo"
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Reporte
                    </Link>
                </div>

                {/* ================================================================
                    LISTA DE TICKETS
                ================================================================ */}
                {filteredTickets.length === 0 ? (
                    <div className="card p-16 text-center border-dashed border-2 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-400 dark:text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            ¡Todo en orden!
                        </h3>
                        <p className="text-gray-500 font-medium mb-6">
                            {filterStatus === 'all'
                                ? 'No tienes tickets de soporte. ¡Esperamos que todo esté perfecto con tus compras!'
                                : 'No hay tickets en este estado.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredTickets.map(ticket => {
                            const statusInfo = getStatusInfo(ticket.status);
                            const isExpanded = expandedTicket === ticket.id;

                            return (
                                <div key={ticket.id} className="card overflow-hidden transition-all duration-300 group hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-slate-300 dark:hover:border-slate-600">
                                    {/* Cabecera del Ticket (Clicable) */}
                                    <button
                                        onClick={() => toggleExpand(ticket.id)}
                                        className="w-full p-6 md:p-8 flex items-start justify-between gap-6 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                                                ticket.priority === 'high'
                                                    ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                            }`}>
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <h3 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">
                                                        {ticket.subject}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    <span>Ticket #{String(ticket.id).padStart(4, '0')}</span>
                                                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                                                    <span>Pedido #{String(ticket.orderId).padStart(4, '0')}</span>
                                                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(ticket.createdAt).toLocaleDateString('es-CO')}
                                                    </span>
                                                </div>
                                                {(ticket.responses?.length || 0) > 0 && (
                                                    <div className="flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-400 mt-3 bg-orange-50 dark:bg-orange-900/20 w-fit px-3 py-1 rounded-lg">
                                                        <MessageSquare className="w-4 h-4" /> {ticket.responses.length} respuesta(s)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors flex-shrink-0">
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-500" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Detalles del Ticket (Expandido) */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 dark:border-slate-800">
                                            
                                            {/* Reporte Original */}
                                            <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-800/20">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Descripción de tu reporte</p>
                                                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                                                    <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                                        {ticket.description}
                                                    </p>
                                                </div>
                                                {ticket.photos?.length > 0 && (
                                                    <div className="flex gap-3 mt-4">
                                                        {ticket.photos.map((photo, i) => (
                                                            <div key={i} className="w-24 h-24 bg-gray-200 dark:bg-slate-700 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm" />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Conversación */}
                                            {(ticket.responses?.length || 0) > 0 && (
                                                <div className="p-6 md:p-8 space-y-6 bg-white dark:bg-slate-900">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Historial de mensajes</p>
                                                    {ticket.responses.map(response => {
                                                        const isClient = response.from === 'client';
                                                        return (
                                                            <div
                                                                key={response.id}
                                                                className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                                                            >
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {!isClient && (
                                                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                                            <Headset className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                                        </div>
                                                                    )}
                                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                        {isClient ? 'Tú' : response.name}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400 font-medium">
                                                                        {new Date(response.date).toLocaleDateString('es-CO')}
                                                                    </span>
                                                                    {isClient && (
                                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                                            <span className="text-xs font-bold text-slate-500">CLI</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className={`p-4 rounded-2xl max-w-[85%] md:max-w-[75%] ${
                                                                    isClient
                                                                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-tr-none'
                                                                        : 'bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-tl-none'
                                                                }`}>
                                                                    <p className="font-medium leading-relaxed">
                                                                        {response.message}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Resolución */}
                                            {ticket.status === 'resolved' && ticket.resolutionDetails && (
                                                <div className="p-6 md:p-8 bg-emerald-50 dark:bg-emerald-900/10 border-t border-emerald-100 dark:border-emerald-900/30">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <span className="font-black text-emerald-800 dark:text-emerald-300 text-lg tracking-tight">
                                                            Caso Resuelto
                                                        </span>
                                                    </div>
                                                    <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                                                        <p className="text-emerald-900 dark:text-emerald-100 font-medium leading-relaxed">
                                                            {ticket.resolutionDetails}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Caja de Respuesta */}
                                            {['open', 'in_progress'].includes(ticket.status) && (
                                                <div className="p-6 md:p-8 bg-slate-50/80 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800">
                                                    <div className="flex flex-col md:flex-row gap-3">
                                                        <textarea
                                                            placeholder="Escribe un mensaje al soporte..."
                                                            className="flex-1 px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none font-medium"
                                                            rows="2"
                                                        />
                                                        <button className="flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-all font-bold shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 self-end md:self-auto h-[60px]">
                                                            Enviar <Send className="w-5 h-5" />
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
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default MyTickets;
