import React, { useState, useRef } from 'react';
import { MessageSquare, Clock, Check, AlertCircle, X, ChevronDown, Filter } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useNotification } from '../../context/NotificationContext';
import adminDashboardLinks from '../../data/adminDashboardLinks';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";

const SEV_CONFIG = {
    high:   { dot: 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.9)]', badge: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',   label: 'Alta' },
    medium: { dot: 'bg-amber-500',  badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',   label: 'Media' },
    low:    { dot: 'bg-emerald-500', badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', label: 'Baja' },
};

const STATUS_CONFIG = {
    open:        { badge: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',   dot: 'bg-indigo-500 animate-pulse', label: 'Abierto' },
    in_progress: { badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',      dot: 'bg-amber-500',                label: 'En Progreso' },
    resolved:    { badge: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', dot: 'bg-emerald-500',              label: 'Resuelto' },
};

const INITIAL_REPORTS = [
    { id: '0006', title: 'Consulta sobre tallas', description: 'Necesito saber el ancho exacto de la Seda Italiana.', date: '9/4/2026', severity: 'low', status: 'resolved', user: 'Juan Pérez', email: 'juan@example.com' },
    { id: '0005', title: 'Demora en el envío', description: 'Mi pedido lleva 5 días y no ha llegado.', date: '9/4/2026', severity: 'medium', status: 'in_progress', user: 'Ana García', email: 'ana@example.com' },
    { id: '0004', title: 'Producto llegó dañado', description: 'La tela Algodón Premium llegó con manchas de humedad.', date: '9/4/2026', severity: 'high', status: 'open', user: 'Pedro López', email: 'pedro@example.com' },
    { id: '0003', title: 'Error al aplicar cupón', description: 'El código de descuento PROMO10 no funciona en el carrito.', date: '8/4/2026', severity: 'medium', status: 'open', user: 'María Díaz', email: 'maria@example.com' },
    { id: '0002', title: 'Foto del producto incorrecta', description: 'La imagen del Lino Natural muestra otra tela.', date: '7/4/2026', severity: 'low', status: 'resolved', user: 'Carlos Ruiz', email: 'carlos@example.com' },
];

function AdminBugReports() {
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reports, setReports] = useState(INITIAL_REPORTS);
    
    const containerRef = useRef(null);
    const expansionRefs = useRef({});

    const handleStatusChange = (id, newStatus) => {
        setReports(r => r.map(rep => rep.id === id ? { ...rep, status: newStatus } : rep));
        showNotification('success', 'Estado actualizado correctamente');
        if (selectedTicket?.id === id) setSelectedTicket(p => ({ ...p, status: newStatus }));
    };

    const toggleTicket = (report) => {
        const isOpening = selectedTicket?.id !== report.id;
        
        if (selectedTicket) {
            const currentRef = expansionRefs.current[selectedTicket.id];
            if (currentRef) {
                gsap.to(currentRef, { height: 0, opacity: 0, duration: 0.3, ease: "power2.inOut" });
            }
        }

        if (isOpening) {
            setSelectedTicket(report);
            const targetRef = expansionRefs.current[report.id];
            if (targetRef) {
                gsap.fromTo(targetRef, 
                    { height: 0, opacity: 0 }, 
                    { height: 'auto', opacity: 1, duration: 0.4, ease: "power2.out" }
                );
            }
        } else {
            setSelectedTicket(null);
        }
    };

    useGSAP(() => {
        gsap.fromTo('.kpi-card', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
        );
        gsap.fromTo('.report-item', 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.2 }
        );
    }, { scope: containerRef });

    const totalTickets = reports.length;
    const pendingCount = reports.filter(r => r.status === 'open' || r.status === 'in_progress').length;
    const resolvedCount = reports.filter(r => r.status === 'resolved').length;
    const highCount = reports.filter(r => r.severity === 'high' && r.status !== 'resolved').length;

    const filtered = reports.filter(r => {
        if (activeTab === 'all') return true;
        return r.status === activeTab;
    });

    const TABS = [
        { id: 'all', label: 'Todos', count: totalTickets },
        { id: 'open', label: 'Abiertos', count: reports.filter(r => r.status === 'open').length },
        { id: 'in_progress', label: 'En Progreso', count: reports.filter(r => r.status === 'in_progress').length },
        { id: 'resolved', label: 'Resueltos', count: resolvedCount },
    ];

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de Reportes</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Seguimiento y resolución de tickets de soporte de la plataforma.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Tickets', value: totalTickets, icon: MessageSquare, color: 'slate' },
                            { label: 'Pendientes', value: pendingCount, icon: Clock, color: 'amber', top: pendingCount > 0 },
                            { label: 'Resueltos', value: resolvedCount, icon: Check, color: 'emerald' },
                            { label: 'Prioridad Alta', value: highCount, icon: AlertCircle, color: 'rose', top2: highCount > 0 },
                        ].map(({ label, value, icon: Icon, color, top, top2 }) => (
                            <div key={label} className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300 ${top ? 'border-t-4 border-t-amber-500' : top2 ? 'border-t-4 border-t-rose-500' : ''}`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-50 rounded-full opacity-40 group-hover:scale-150 transition-transform duration-500`} />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
                                    <div className={`p-2.5 bg-white shadow-sm rounded-xl border border-${color}-100 text-${color}-600`}><Icon size={18} /></div>
                                </div>
                                <p className={`text-4xl font-black text-${color}-600 relative z-10`}>{value}</p>
                                {(top2 && highCount > 0) && <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                        <Filter size={15} className="text-slate-400 dark:text-slate-500 shrink-0" />
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border whitespace-nowrap shadow-sm ${activeTab === tab.id ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-white'}`}>
                                {tab.label} <span className={`ml-1.5 px-1.5 py-0.5 rounded-lg text-[10px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {filtered.length === 0 ? (
                            <div className={`${glassCard} flex flex-col items-center justify-center py-24 text-center`}>
                                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-500/20 shadow-inner"><Check className="w-10 h-10 text-emerald-400" /></div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sin tickets en esta vista</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Prueba con otro filtro.</p>
                            </div>
                        ) : filtered.map(report => {
                            const sev = SEV_CONFIG[report.severity] || SEV_CONFIG.low;
                            const sta = STATUS_CONFIG[report.status] || STATUS_CONFIG.open;
                            return (
                                <div key={report.id} className={`report-item ${glassCard} overflow-hidden hover:shadow-xl transition-all duration-300`}>
                                    <div className="p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex gap-4 flex-1 min-w-0">
                                                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-lg shadow-sm shrink-0">
                                                    {report.user.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500">#{report.id}</span>
                                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sev.badge}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />{sev.label}
                                                        </span>
                                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sta.badge}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${sta.dot}`} />{sta.label}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight mb-1">{report.title}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed mb-3">{report.description}</p>
                                                    <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-bold">
                                                        <span>{report.user}</span>
                                                        <span className="text-slate-300">·</span>
                                                        <span>{report.email}</span>
                                                        <span className="text-slate-300">·</span>
                                                        <span>{report.date}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 shrink-0 sm:items-end">
                                                <select value={report.status} onChange={e => handleStatusChange(report.id, e.target.value)}
                                                    className="bg-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-[#f97316] cursor-pointer shadow-sm">
                                                    <option value="open">Abierto</option>
                                                    <option value="in_progress">En Progreso</option>
                                                    <option value="resolved">Resuelto</option>
                                                </select>
                                                <button onClick={() => toggleTicket(report)}
                                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-white hover:bg-white border border-transparent hover:border-slate-200 dark:border-slate-700 rounded-xl transition-all">
                                                    {selectedTicket?.id === report.id ? <><X size={13} /> Cerrar</> : <><ChevronDown size={13} /> Detalles</>}
                                                </button>
                                            </div>
                                        </div>

                                        <div 
                                            ref={el => expansionRefs.current[report.id] = el}
                                            className="overflow-hidden"
                                            style={{ height: 0, opacity: 0 }}
                                        >
                                            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700 grid sm:grid-cols-2 gap-4">
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Descripción completa</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{report.description}</p>
                                                </div>
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Cambiar estado</p>
                                                    <div className="flex flex-col gap-2">
                                                        {[['open', 'Marcar como Abierto'], ['in_progress', 'En Progreso'], ['resolved', '✓ Marcar Resuelto']].map(([s, label]) => (
                                                            <button key={s} onClick={() => handleStatusChange(report.id, s)}
                                                                className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${report.status === s ? `${STATUS_CONFIG[s].badge} font-black` : 'bg-white border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-500/10'}`}>
                                                                {label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AdminBugReports;
