import React, { useState, useRef } from 'react';
import { Users, Search, Shield, ShoppingBag, UserCheck, ToggleLeft, ToggleRight, Filter } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useMetrics } from '../../context/MetricsContext';
import { useNotification } from '../../context/NotificationContext';
import adminDashboardLinks from '../../data/adminDashboardLinks';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
const glassInput = "bg-slate-50 dark:bg-slate-900  border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400";

const colorVariants = {
    indigo: { icon: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-500/20", value: "text-indigo-600 dark:text-indigo-400" },
    blue: { icon: "text-blue-600 dark:text-blue-400", border: "border-blue-100 dark:border-blue-500/20", value: "text-blue-600 dark:text-blue-400" },
    emerald: { icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-500/20", value: "text-emerald-600 dark:text-emerald-400" },
    slate: { icon: "text-slate-600 dark:text-slate-400", border: "border-slate-100 dark:border-slate-500/20", value: "text-slate-600 dark:text-slate-400" },
    amber: { icon: "text-amber-600 dark:text-amber-400", border: "border-amber-100 dark:border-amber-500/20", value: "text-amber-600 dark:text-amber-400" },
    rose: { icon: "text-rose-600 dark:text-rose-400", border: "border-rose-100 dark:border-rose-500/20", value: "text-rose-600 dark:text-rose-400" },
};

const ROLE_BADGE = {
    admin: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    administrador: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    seller: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    vendedor: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    client: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    cliente: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
};
const ROLE_LABELS = { admin: 'Administrador', administrador: 'Administrador', seller: 'Vendedor', vendedor: 'Vendedor', client: 'Cliente', cliente: 'Cliente' };

function UserManagement() {
    const { users, updateUserRole, toggleUserActive } = useMetrics();
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const containerRef = useRef(null);

    const filteredUsers = users.filter(u => {
        const ms = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const mr = activeTab === 'all' || u.role === activeTab || (activeTab === 'admin' && u.role === 'administrador') || (activeTab === 'seller' && u.role === 'vendedor') || (activeTab === 'client' && u.role === 'cliente');
        return ms && mr;
    });

    useGSAP(() => {
        const tl = gsap.timeline();

        // 1. Entrance for KPI Cards
        tl.fromTo('.kpi-card', 
            { opacity: 0, y: 20, scale: 0.95 },
            { 
                opacity: 1, y: 0, scale: 1, 
                duration: 0.5, stagger: 0.08, 
                ease: "back.out(1.4)" 
            }
        );

        // 2. Entrance for User List items
        gsap.fromTo('.user-item',
            { opacity: 0, x: -15 },
            { 
                opacity: 1, x: 0, 
                duration: 0.4, stagger: 0.05, 
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.user-list-container',
                    start: "top 80%"
                }
            }
        );
    }, { scope: containerRef, dependencies: [filteredUsers.length] });

    const handleRoleChange = (userId, newRole) => {
        updateUserRole(userId, newRole);
        showNotification('success', `Rol actualizado a ${ROLE_LABELS[newRole]}`);
    };
    const handleToggleActive = (userId, userName, isActive) => {
        toggleUserActive(userId);
        showNotification('success', `Usuario ${userName} ${isActive ? 'desactivado' : 'activado'}`);
    };

    const totalCount = users.length;
    const adminCount = users.filter(u => u.role === 'admin' || u.role === 'administrador').length;
    const sellerCount = users.filter(u => u.role === 'seller' || u.role === 'vendedor').length;
    const clientCount = users.filter(u => u.role === 'client' || u.role === 'cliente').length;

    const TABS = [
        { id: 'all', label: 'Todos', count: totalCount },
        { id: 'admin', label: 'Admins', count: adminCount },
        { id: 'seller', label: 'Vendedores', count: sellerCount },
        { id: 'client', label: 'Clientes', count: clientCount },
    ];

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de Usuarios</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Control de accesos, roles y estado de todos los perfiles registrados.</p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Usuarios', value: totalCount, icon: Users, color: 'slate' },
                            { label: 'Administradores', value: adminCount, icon: Shield, color: 'indigo' },
                            { label: 'Vendedores', value: sellerCount, icon: ShoppingBag, color: 'blue' },
                            { label: 'Clientes Activos', value: clientCount, icon: UserCheck, color: 'emerald' },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className={`kpi-card ${glassCard} p-6 overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300`}>
                                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
                                    <div className={`p-2.5 bg-white shadow-sm rounded-xl ${colorVariants[color]?.border || ''} ${colorVariants[color]?.icon || ''}`}><Icon size={18} /></div>
                                </div>
                                <p className={`text-4xl font-black ${colorVariants[color]?.value || ''} relative z-10`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filters + Search */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-2 shrink-0">
                                <Filter size={16} /><span className="text-xs uppercase tracking-widest">Filtrar:</span>
                            </div>
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap shadow-sm border ${activeTab === tab.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-800  text-slate-600 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-white'}`}>
                                    {tab.label} <span className={`ml-1.5 px-2 py-0.5 rounded-md text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>{tab.count}</span>
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-72 shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                            <input type="text" placeholder="Buscar usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full pl-11 pr-4 py-3 ${glassInput}`} />
                        </div>
                    </div>

                    {/* User List */}
                    <div className="user-list-container space-y-4">
                        {filteredUsers.length === 0 ? (
                            <div className={`${glassCard} flex flex-col items-center justify-center py-24 text-center border-dashed border-slate-300/60`}>
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-500/10 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-inner"><Users className="w-10 h-10 text-slate-300 dark:text-slate-600" /></div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sin resultados</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Ajusta los filtros de búsqueda.</p>
                            </div>
                        ) : filteredUsers.map(user => (
                            <div key={user.id} className={`user-item ${glassCard} p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${!user.active ? 'opacity-60 grayscale' : ''}`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex-shrink-0 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-lg shadow-sm">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                                <h3 className="text-base font-black text-slate-900 dark:text-white">{user.name}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${ROLE_BADGE[user.role] || 'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                                                    {ROLE_LABELS[user.role] || user.role}
                                                </span>
                                                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${user.active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]' : 'bg-rose-500'}`} />
                                                    {user.active ? 'Activo' : 'Inactivo'}
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-2">{user.email}</p>
                                            <div className="flex items-center gap-6 text-xs text-slate-400 dark:text-slate-500">
                                                <span><strong className="font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">Último acceso:</strong> {new Date(user.lastLogin).toLocaleDateString('es-CO')}</span>
                                                <span><strong className="font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500">Registro:</strong> {new Date(user.registeredAt).toLocaleDateString('es-CO')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 hidden sm:block">Rol:</span>
                                            <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)} className={`border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 outline-none focus:border-indigo-300 cursor-pointer`}>
                                                <option value="administrador">Administrador</option>
                                                <option value="vendedor">Vendedor</option>
                                                <option value="cliente">Cliente</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => handleToggleActive(user.id, user.name, user.active)}
                                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all border-2 flex items-center gap-1.5 ${user.active ? 'text-rose-600 dark:text-rose-400 border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600' : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'}`}
                                        >
                                            {user.active ? <><ToggleLeft className="w-4 h-4" />Suspender</> : <><ToggleRight className="w-4 h-4" />Activar</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default UserManagement;

