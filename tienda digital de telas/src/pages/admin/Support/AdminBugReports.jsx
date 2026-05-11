/**
 * AdminBugReports.jsx — Gestión de Tickets de Soporte (Creative UX)
 */

import React, { useState, useRef } from 'react';
import { 
    MessageSquare,
    Clock,
    Check,
    AlertCircle,
    X as XIcon,
    Filter,
    User,
    Mail,
    Calendar
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useNotification } from '../../context/NotificationContext';
import adminDashboardLinks from '../../data/adminDashboardLinks';


function AdminBugReports() {
    const { showNotification } = useNotification();
    
    const [activeTab, setActiveTab] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);
    
    const containerRef = useRef(null);
    const modalRef = useRef(null);
    const modalOverlayRef = useRef(null);

    const [reports, setReports] = useState([
        { 
            id: '0006', 
            title: 'Consulta sobre tallas en Seda', 
            description: 'Necesito saber el ancho exacto de la Seda Italiana Premium, mi confección requiere mínimo 1.50m.', 
            date: '9/4/2026', 
            severity: 'low', 
            status: 'resolved', 
            user: 'Juan Pérez', 
            email: 'juan@example.com',
            category: 'Seda'
        },
        { 
            id: '0005', 
            title: 'Demora en el envío', 
            description: 'Mi pedido de Lino lleva 5 días y no ha llegado a la sucursal norte.', 
            date: '9/4/2026', 
            severity: 'medium', 
            status: 'in_progress', 
            user: 'Ana García', 
            email: 'ana@example.com',
            category: 'Lino'
        },
        { 
            id: '0004', 
            title: 'Producto llegó dañado', 
            description: 'La tela Algodón Premium llegó con manchas de humedad en los primeros 3 metros.', 
            date: '9/4/2026', 
            severity: 'high', 
            status: 'open', 
            user: 'Pedro Lopez', 
            email: 'pedro@example.com',
            category: 'Algodón'
        },
        { 
            id: '0007', 
            title: 'Error de cobro en tarjeta', 
            description: 'Me descontaron dos veces el pedido de los rollos de Poliéster.', 
            date: '10/4/2026', 
            severity: 'high', 
            status: 'open', 
            user: 'Maria C.', 
            email: 'mc@example.com',
            category: 'Finanzas'
        },
    ]);

    useGSAP(() => {
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 30, scale: 0.95 }, 
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
        );
        gsap.fromTo('.report-card', 
            { opacity: 0, y: 30, scale: 0.95 }, 
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.3 }
        );
    }, { scope: containerRef });

    const openModal = (ticket) => {
        setSelectedTicket(ticket);
    };

    useGSAP(() => {
        if (selectedTicket) {
            gsap.fromTo(modalOverlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(modalRef.current, { scale: 0.9, y: 20, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
        }
    }, { dependencies: [selectedTicket] });

    const closeModal = () => {
        gsap.to(modalRef.current, { scale: 0.9, y: 20, opacity: 0, duration: 0.3, ease: "power2.in" });
        gsap.to(modalOverlayRef.current, { opacity: 0, duration: 0.3, onComplete: () => setSelectedTicket(null) });
    };

    const handleStatusChange = (id, newStatus) => {
        setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
        showNotification('success', 'Ticket actualizado exitosamente');
    };

    const totalTickets = reports.length;
    const pendingTickets = reports.filter(r => r.status === 'open' || r.status === 'in_progress').length;
    const resolvedToday = reports.filter(r => r.status === 'resolved').length;
    const highPriorityCount = reports.filter(r => r.severity === 'high' && r.status !== 'resolved').length;

    const filteredReports = reports.filter(report => {
        if (activeTab === 'all') return true;
        return report.status === activeTab;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'resolved': return 'bg-emerald-100 text-emerald-700 dark:text-emerald-400 border-emerald-200';
            case 'in_progress': return 'bg-indigo-100 text-indigo-700 dark:text-indigo-400 border-indigo-200';
            case 'open': return 'bg-rose-100 text-rose-700 dark:text-rose-400 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    const getStatusLabelText = (status) => {
        switch (status) {
            case 'resolved': return 'Resuelto';
            case 'in_progress': return 'Atendiendo';
            case 'open': return 'Abierto';
            default: return status;
        }
    };

    const getNeonOrb = (severity) => {
        switch (severity) {
            case 'high': 
                return <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse" title="Crítico" />;
            case 'medium': 
                return <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse" title="Media" />;
            case 'low': 
                return <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]" title="Baja" />;
            default: 
                return <div className="w-3 h-3 rounded-full bg-slate-500" />;
        }
    };

    const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen relative overflow-hidden">
                <div className="relative z-10">
                    <BackButton />
                    
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Soporte y Atención Operativa</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2 max-w-2xl">
                            Gestión integral de requerimientos. El estado operativo actual demanda atención a <strong className="text-rose-600 dark:text-rose-400">{highPriorityCount} tickets críticos</strong>.
                        </p>
                    </div>

                    {/* Metric Cards Premium */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <div className={`kpi-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-100 rounded-full mix-blend-multiply opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-4 relative z-10">
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-slate-200 dark:border-slate-700">
                                    <MessageSquare className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Flujo Total</span>
                            </div>
                            <div className="text-4xl font-black text-slate-900 dark:text-white relative z-10">{totalTickets} <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">casos</span></div>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-full mix-blend-multiply opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center gap-3 text-indigo-500 mb-4 relative z-10">
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 dark:text-slate-500">Backlog Activo</span>
                            </div>
                            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 relative z-10">{pendingTickets}</div>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full mix-blend-multiply opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center gap-3 text-emerald-500 mb-4 relative z-10">
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 dark:text-slate-500">Solucionados</span>
                            </div>
                            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 relative z-10">{resolvedToday} <span className="text-sm font-semibold text-emerald-400">hoy</span></div>
                        </div>

                        <div className={`kpi-card ${glassCard} p-6 flex flex-col justify-between overflow-hidden relative group border-t-4 border-t-rose-500 hover:-translate-y-1 transition-all duration-300`}>
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full mix-blend-multiply opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            <div className="flex items-center gap-3 text-rose-500 mb-4 relative z-10">
                                <div className="p-2.5 bg-white shadow-sm rounded-xl border border-rose-200 dark:border-rose-500/20">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 dark:text-slate-500">Prioridad Crítica</span>
                            </div>
                            <div className="text-4xl font-black text-rose-600 dark:text-rose-400 relative z-10 flex items-center gap-3">
                                {highPriorityCount}
                                {highPriorityCount > 0 && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute left-10 mt-1" />}
                            </div>
                        </div>
                    </div>

                    {/* Filtros Inteligentes (Pills) */}
                    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-2 shrink-0">
                            <Filter size={18} /> <span className="text-sm uppercase tracking-widest">Triage:</span>
                        </div>
                        {[
                            { id: 'all', label: 'Bandeja Global', count: totalTickets },
                            { id: 'open', label: 'Abiertos', count: reports.filter(r => r.status === 'open').length },
                            { id: 'in_progress', label: 'En Acción', count: reports.filter(r => r.status === 'in_progress').length },
                            { id: 'resolved', label: 'Completados', count: reports.filter(r => r.status === 'resolved').length }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap shadow-sm border ${
                                    activeTab === tab.id 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
                                    : 'bg-white dark:bg-slate-800  text-slate-600 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-white hover:text-slate-900 dark:text-white'
                                }`}
                            >
                                {tab.label} <span className={`ml-1.5 px-2 py-0.5 rounded-md text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* Lista de Tickets */}
                    <div className="space-y-5">
                        {filteredReports.map(report => (
                            <div 
                                key={report.id} 
                                className={`report-card ${glassCard} p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group`}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex-1 w-full">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">#{report.id}</span>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${getStatusStyles(report.status)}`}>
                                                {getStatusLabelText(report.status)}
                                            </span>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                                                {getNeonOrb(report.severity)}
                                                <span className="text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase">
                                                    Gravedad
                                                </span>
                                            </div>
                                            <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg ml-auto md:ml-0">
                                                {report.category}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:text-indigo-400 transition-colors">{report.title}</h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-5 leading-relaxed max-w-3xl">{report.description}</p>

                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 dark:text-slate-500 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <User size={14} className="text-slate-400 dark:text-slate-500" /> {report.user}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 dark:text-slate-500 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <Mail size={14} className="text-slate-400 dark:text-slate-500" /> {report.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">
                                                <Calendar size={14} /> {report.date}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center justify-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:pl-6">
                                        <button 
                                            onClick={() => openModal(report)}
                                            className="w-full text-center px-6 py-2.5 text-sm font-black text-[#f97316] bg-transparent border-2 border-[#f97316]/30 rounded-xl hover:bg-[#f97316] hover:text-white hover:border-[#f97316] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-300 hover:scale-105 active:scale-95"
                                        >
                                            Operar Ticket
                                        </button>
                                        
                                        <select 
                                            value={report.status}
                                            onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                            className="w-full text-xs font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 bg-white border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm transition-all"
                                        >
                                            <option value="open">Dejar Abierto</option>
                                            <option value="in_progress">Tomar Acción</option>
                                            <option value="resolved">Solucionar</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredReports.length === 0 && (
                            <div className={`${glassCard} flex flex-col items-center justify-center py-20 text-center border-dashed border-slate-300`}>
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-500/10 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-inner">
                                    <Check className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Bandeja Limpia</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">No hay incidencias que requieran atención en esta vista.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Avanzado de Resolución */}
                {selectedTicket && (
                    <div ref={modalOverlayRef} className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4">
                        <div 
                            ref={modalRef}
                            className="bg-white dark:bg-slate-800 backdrop-blur-3xl rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white relative"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full mix-blend-multiply filter blur-[60px] pointer-events-none" />
                            
                            <div className="p-8 md:p-10 relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-sm font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg shadow-inner">#{selectedTicket.id}</span>
                                            {getNeonOrb(selectedTicket.severity)}
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{selectedTicket.title}</h2>
                                    </div>
                                    <button 
                                        onClick={closeModal} 
                                        className="p-3 bg-white hover:bg-slate-50 dark:bg-slate-500/10 text-slate-400 dark:text-slate-500 hover:text-rose-500 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                                    >
                                        <XIcon size={20} />
                                    </button>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8 ">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                                        <MessageSquare size={14} /> Detalles de la Incidencia
                                    </h3>
                                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        {selectedTicket.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-10">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Usuario Afectado</div>
                                        <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><User size={14} className="text-slate-400 dark:text-slate-500"/> {selectedTicket.user}</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Contacto Directo</div>
                                        <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Mail size={14} className="text-slate-400 dark:text-slate-500"/> {selectedTicket.email}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-200 dark:border-slate-700 pt-8">
                                    <button 
                                        onClick={() => {
                                            handleStatusChange(selectedTicket.id, 'in_progress');
                                            closeModal();
                                        }}
                                        className="flex-1 px-6 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-500/10 hover:border-indigo-200 hover:text-indigo-600 dark:text-indigo-400 transition-all text-center"
                                    >
                                        Tomar Caso
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleStatusChange(selectedTicket.id, 'resolved');
                                            closeModal();
                                        }}
                                        className="flex-[2] px-6 py-4 rounded-xl bg-[#f97316] text-sm font-black text-white hover:bg-[#ea580c] shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} /> Validar y Solucionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default AdminBugReports;
