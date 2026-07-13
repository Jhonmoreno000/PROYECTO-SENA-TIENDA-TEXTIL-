/**
 * TicketManagement.jsx — Gestión de Tickets de Soporte (Inmersivo Glassmorphism)
 */

import React, { useState, useRef } from 'react';
import { MessageSquare, Check, Clock, AlertCircle, X, User, Mail, ShoppingBag, Calendar, Filter } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import adminDashboardLinks from '../../../data/adminDashboardLinks';


const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";

const colorVariants = {
    indigo: { icon: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-500/20" },
    emerald: { icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-500/20" },
    rose: { icon: "text-rose-600 dark:text-rose-400", border: "border-rose-100 dark:border-rose-500/20" },
    slate: { icon: "text-slate-600 dark:text-slate-400", border: "border-slate-100 dark:border-slate-500/20" },
};
const cleanInput = "bg-slate-50 dark:bg-slate-900  border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all";

function TicketManagement() {
    const { supportTickets, updateTicketStatus, assignTicket, users } = useMetrics();
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [assignToUser, setAssignToUser] = useState('');
    
    const containerRef = useRef(null);
    const modalRef = useRef(null);
    const modalOverlayRef = useRef(null);

    const filteredTickets = filterStatus === 'all'
        ? supportTickets
        : supportTickets.filter(t => t.status === filterStatus);

    const highPriority = supportTickets.filter(t => t.priority === 'high' && t.status !== 'resolved').length;
    const pending = supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const resolvedToday = supportTickets.filter(t =>
        t.status === 'resolved' && new Date(t.resolvedAt).toDateString() === new Date().toDateString()
    ).length;

    useGSAP(() => {
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
        );
        gsap.fromTo('.ticket-item', 
            { opacity: 0, y: 24, scale: 0.97 }, 
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.2 }
        );
    }, { scope: containerRef });

    const openModal = (ticket) => {
        setSelectedTicket(ticket);
    };

    useGSAP(() => {
        if (selectedTicket) {
            gsap.fromTo(modalOverlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(modalRef.current, { scale: 0.95, y: 20, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.4)" });
        }
    }, { dependencies: [selectedTicket] });

    const closeModal = () => {
        gsap.to(modalRef.current, { scale: 0.95, y: 20, opacity: 0, duration: 0.3, ease: "power2.in" });
        gsap.to(modalOverlayRef.current, { opacity: 0, duration: 0.3, onComplete: () => setSelectedTicket(null) });
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'open': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200';
            case 'in_progress': return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200';
            case 'resolved': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200';
            case 'closed': return 'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
            default: return 'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return 'Abierto';
            case 'in_progress': return 'En Progreso';
            case 'resolved': return 'Resuelto';
            case 'closed': return 'Cerrado';
            default: return status;
        }
    };

    const getNeonOrb = (priority) => {
        switch (priority) {
            case 'high': return <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse" />;
            case 'medium': return <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.9)]" />;
            default: return <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />;
        }
    };

    const handleAssignTicket = (ticketId) => {
        if (assignToUser) {
            const user = users.find(u => u.id === parseInt(assignToUser));
            if (user) { assignTicket(ticketId, user.id); setAssignToUser(''); }
        }
    };

    const tabs = [
        { id: 'all', label: 'Todos', count: supportTickets.length },
        { id: 'open', label: 'Abiertos', count: supportTickets.filter(t => t.status === 'open').length },
        { id: 'in_progress', label: 'En Acción', count: supportTickets.filter(t => t.status === 'in_progress').length },
        { id: 'resolved', label: 'Resueltos', count: supportTickets.filter(t => t.status === 'resolved').length },
    ];

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de Tickets de Soporte</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">
                            Sistema de triage operativo. <strong className="text-rose-600 dark:text-rose-400">{highPriority} tickets críticos</strong> requieren atención inmediata.
                        </p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        {[
                            { label: 'Total Tickets', val: supportTickets.length, color: 'slate', icon: MessageSquare, valClass: 'text-slate-900 dark:text-white' },
                            { label: 'Backlog Activo', val: pending, color: 'indigo', icon: Clock, valClass: 'text-indigo-600 dark:text-indigo-400' },
                            { label: 'Resueltos Hoy', val: resolvedToday, color: 'emerald', icon: Check, valClass: 'text-emerald-600 dark:text-emerald-400' },
                            { label: 'Prioridad Alta', val: highPriority, color: 'rose', icon: AlertCircle, valClass: 'text-rose-600 dark:text-rose-400', topBorder: true },
                        ].map(({ label, val, color, icon: Icon, valClass, topBorder }) => (
                            <div key={label} className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300 ${topBorder ? 'border-t-4 border-t-rose-500' : ''}`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                    <div className={`p-2.5 bg-white shadow-sm rounded-xl ${colorVariants[color]?.border || ''} ${colorVariants[color]?.icon || ''}`}><Icon size={18} /></div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
                                </div>
                                <div className={`text-4xl font-black relative z-10 ${valClass}`}>
                                    {val}
                                    {topBorder && val > 0 && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute left-8 top-2" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-2 shrink-0">
                            <Filter size={16} /> <span className="text-sm uppercase tracking-widest">Triage:</span>
                        </div>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterStatus(tab.id)}
                                className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap shadow-sm border ${
                                    filterStatus === tab.id
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                    : 'bg-white dark:bg-slate-800  text-slate-600 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-white hover:text-slate-900 dark:text-white'
                                }`}
                            >
                                {tab.label} <span className={`ml-1.5 px-2 py-0.5 rounded-md text-xs ${filterStatus === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* Ticket List */}
                    <div className="space-y-5">
                        {filteredTickets.length === 0 ? (
                            <div className={`${glassCard} flex flex-col items-center justify-center py-24 text-center border-dashed border-slate-300`}>
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-500/10 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-inner"><Check className="w-10 h-10 text-emerald-500" /></div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">¡Bandeja limpia!</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">No hay tickets en esta categoría.</p>
                            </div>
                        ) : filteredTickets.map(ticket => (
                            <div
                                key={ticket.id}
                                className={`ticket-item ${glassCard} p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group`}
                            >
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2.5 mb-3">
                                            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                #{ticket.id.toString().padStart(4, '0')}
                                            </span>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${getStatusStyles(ticket.status)}`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                                                {getNeonOrb(ticket.priority)}
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                    {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Baja'}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:text-indigo-400 transition-colors">{ticket.subject}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium mb-4 leading-relaxed max-w-2xl">{ticket.description}</p>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <User size={13} className="text-slate-400 dark:text-slate-500" /> {ticket.customerName}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <Mail size={13} className="text-slate-400 dark:text-slate-500" /> {ticket.customerEmail}
                                            </div>
                                            {ticket.orderId && (
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    <ShoppingBag size={13} className="text-slate-400 dark:text-slate-500" /> #{ticket.orderId}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                                                <Calendar size={13} /> {new Date(ticket.createdAt).toLocaleDateString('es-CO')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full lg:w-56 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                                        <button
                                            onClick={() => openModal(ticket)}
                                            className="w-full text-center px-5 py-2.5 text-sm font-black text-[#f97316] bg-transparent border-2 border-[#f97316]/30 rounded-xl hover:bg-[#f97316] hover:text-white hover:border-[#f97316] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-300 hover:scale-105 active:scale-95"
                                        >
                                            Operar Ticket
                                        </button>
                                        <select
                                            value={ticket.status}
                                            onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                                            className={`w-full text-xs font-bold cursor-pointer px-4 py-2.5 ${cleanInput}`}
                                        >
                                            <option value="open">Abierto</option>
                                            <option value="in_progress">En Progreso</option>
                                            <option value="resolved">Resuelto</option>
                                            <option value="closed">Cerrado</option>
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={assignToUser}
                                                onChange={(e) => { setAssignToUser(e.target.value); if (e.target.value) handleAssignTicket(ticket.id); }}
                                                className={`flex-1 text-xs font-bold cursor-pointer px-4 py-2.5 ${cleanInput}`}
                                            >
                                                <option value="">Asignar a...</option>
                                                {users.filter(u => u.role === 'admin' || u.role === 'administrador').map(user => (
                                                    <option key={user.id} value={user.id}>{user.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {ticket.assignedTo && (
                                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-center">
                                                → {users.find(u => u.id === ticket.assignedTo)?.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedTicket && (
                <div ref={modalOverlayRef} className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
                    <div ref={modalRef} className="bg-white dark:bg-slate-800 backdrop-blur-3xl rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full mix-blend-multiply filter blur-[60px] pointer-events-none" />
                        <div className="p-8 md:p-10 relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg shadow-inner">
                                            #{selectedTicket.id.toString().padStart(4, '0')}
                                        </span>
                                        {getNeonOrb(selectedTicket.priority)}
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${getStatusStyles(selectedTicket.status)}`}>
                                            {getStatusLabel(selectedTicket.status)}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{selectedTicket.subject}</h2>
                                </div>
                                <button onClick={closeModal} className="p-3 bg-white hover:bg-slate-50 dark:bg-slate-500/10 text-slate-400 dark:text-slate-500 hover:text-rose-500 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all"><X size={20} /></button>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6 ">
                                <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{selectedTicket.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {[
                                    { label: 'Cliente', val: selectedTicket.customerName, icon: User },
                                    { label: 'Email', val: selectedTicket.customerEmail, icon: Mail },
                                    selectedTicket.orderId && { label: 'Pedido', val: `#${selectedTicket.orderId}`, icon: ShoppingBag },
                                    { label: 'Creado', val: new Date(selectedTicket.createdAt).toLocaleString('es-CO'), icon: Calendar },
                                ].filter(Boolean).map(({ label, val, icon: Icon }) => (
                                    <div key={label} className="bg-white p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{label}</div>
                                        <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Icon size={13} className="text-slate-400 dark:text-slate-500" /> {val}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-200 dark:border-slate-700 pt-8">
                                <button
                                    onClick={() => { updateTicketStatus(selectedTicket.id, 'in_progress'); closeModal(); }}
                                    className="flex-1 px-6 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-500/10 hover:border-indigo-200 hover:text-indigo-600 dark:text-indigo-400 transition-all text-center"
                                >
                                    Tomar Caso
                                </button>
                                <button
                                    onClick={() => { updateTicketStatus(selectedTicket.id, 'resolved'); closeModal(); }}
                                    className="flex-[2] px-6 py-4 rounded-xl bg-[#f97316] text-sm font-black text-white hover:bg-[#ea580c] shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={18} /> Validar y Solucionar
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

