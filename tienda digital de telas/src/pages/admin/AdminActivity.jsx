import React, { useState, useMemo, useRef } from 'react';
import { History, Search, Filter, ShoppingBag, User, DollarSign, AlertTriangle, Package, RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import adminDashboardLinks from '../../data/adminDashboardLinks';
import { useMetrics } from '../../context/MetricsContext';
import { useProducts } from '../../context/ProductContext';
import { formatCurrency } from '../../utils/formatters';


const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
const glassInput = "bg-slate-50 dark:bg-slate-900  border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400";

const ACTIVITY_ICONS = {
    order:   { icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20' },
    user:    { icon: User,        color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20' },
    payment: { icon: DollarSign,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' },
    bug:     { icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20' },
    product: { icon: Package,     color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20' },
    default: { icon: History,     color: 'text-slate-500 dark:text-slate-400 dark:text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-700' },
};

const FILTER_OPTIONS = [
    { value: 'all', label: 'Todo' },
    { value: 'order', label: 'Pedidos' },
    { value: 'user', label: 'Usuarios' },
    { value: 'payment', label: 'Pagos' },
    { value: 'bug', label: 'Reportes' },
    { value: 'product', label: 'Productos' },
];

function buildActivityFromData(orders, users, bugReports, products) {
    const events = [];
    orders.slice(0, 20).forEach(o => events.push({ id: `order-${o.id}`, type: 'order', userName: users.find(u => String(u.id) === String(o.clientId))?.name || 'Cliente', action: 'realizó un pedido', amount: o.total, time: o.date ? new Date(o.date).toLocaleString('es-CO') : 'Reciente', _date: new Date(o.date || 0) }));
    users.slice(0, 10).forEach(u => events.push({ id: `user-${u.id}`, type: 'user', userName: u.name, action: `se registró como ${(u.role === 'seller' || u.role === 'vendedor') ? 'vendedor' : 'cliente'}`, amount: null, time: u.createdAt ? new Date(u.createdAt).toLocaleString('es-CO') : 'Reciente', _date: new Date(u.createdAt || 0) }));
    bugReports.slice(0, 10).forEach(r => events.push({ id: `bug-${r.id}`, type: 'bug', userName: users.find(u => String(u.id) === String(r.userId))?.name || 'Usuario', action: `reportó un problema: "${r.title || r.description?.slice(0, 40)}"`, amount: null, time: r.createdAt ? new Date(r.createdAt).toLocaleString('es-CO') : 'Reciente', _date: new Date(r.createdAt || 0) }));
    products.slice(0, 10).forEach(p => events.push({ id: `product-${p.id}`, type: 'product', userName: users.find(u => String(u.id) === String(p.sellerId))?.name || 'Vendedor', action: `agregó el producto "${p.name}"`, amount: p.price, time: p.createdAt ? new Date(p.createdAt).toLocaleString('es-CO') : 'Reciente', _date: new Date(p.createdAt || 0) }));
    return events.sort((a, b) => b._date - a._date);
}

function AdminActivity() {
    const { users, orders, bugReports, recentActivity, refreshData } = useMetrics();
    const { products } = useProducts();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const containerRef = useRef(null);

    const allActivity = useMemo(() => {
        if (recentActivity && recentActivity.length > 0) return recentActivity;
        return buildActivityFromData(orders, users, bugReports, products);
    }, [recentActivity, orders, users, bugReports, products]);

    const filtered = useMemo(() => allActivity.filter(a => {
        const mf = filter === 'all' || a.type === filter;
        const ms = !search || a.userName?.toLowerCase().includes(search.toLowerCase()) || a.action?.toLowerCase().includes(search.toLowerCase());
        return mf && ms;
    }), [allActivity, filter, search]);

    useGSAP(() => {
        if (filtered.length > 0) {
            gsap.fromTo('.activity-item', 
                { opacity: 0, y: 16 }, 
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
            );
        }
    }, { scope: containerRef, dependencies: [filtered.length, filter, search] });

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Historial de Movimientos</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">{filtered.length} eventos registrados · Trazabilidad completa de la plataforma.</p>
                    </div>

                    {/* Filters */}
                    <div className={`${glassCard} p-5 mb-6 flex flex-wrap gap-4 items-center`}>
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                            <input type="text" placeholder="Buscar por usuario o acción..." value={search} onChange={e => setSearch(e.target.value)} className={`w-full pl-11 pr-4 py-3 ${glassInput}`} />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="text-slate-400 dark:text-slate-500 w-4 h-4" />
                            {FILTER_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => setFilter(opt.value)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${filter === opt.value ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-white'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={refreshData} className="flex items-center gap-2 px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white rounded-xl font-bold transition-all shadow-sm shrink-0">
                            <RefreshCw className="w-4 h-4" /> Actualizar
                        </button>
                    </div>

                    {/* Activity List */}
                    <div className={`${glassCard} overflow-hidden`}>
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-500">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-500/10 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-inner"><History className="w-10 h-10 text-slate-300" /></div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sin actividad</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{allActivity.length === 0 ? 'Sin actividad registrada todavía.' : 'Ningún resultado coincide.'}</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filtered.map((activity, index) => {
                                    const style = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.default;
                                    const Icon = style.icon;
                                    return (
                                        <li key={activity.id ?? index} className="activity-item p-5 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                                            <div className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>
                                                <Icon className={`w-5 h-5 ${style.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500 leading-relaxed">
                                                    <span className="font-black text-slate-900 dark:text-white">{activity.userName}</span>{' '}
                                                    {activity.action}
                                                    {activity.amount != null && (
                                                        <span className="font-mono font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg ml-1.5 text-xs shadow-sm">
                                                            {formatCurrency(activity.amount)}
                                                        </span>
                                                    )}
                                                </p>
                                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1.5 block">{activity.time}</span>
                                            </div>
                                            {activity.type && (
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl border ${style.bg} ${style.color} flex-shrink-0 mt-0.5`}>
                                                    {activity.type}
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AdminActivity;

