import React from 'react';
import { Link } from 'react-router-dom';
import { MdShoppingBag, MdFavorite, MdSettings, MdSupportAgent, MdPerson, MdLocalShipping, MdContentCut, MdArrowForward, MdAttachMoney } from 'react-icons/md';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AnimatedPage from '../../components/AnimatedPage';
import clientDashboardLinks from '../../data/clientDashboardLinks';
import { useMetrics } from '../../context/MetricsContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

function ClientDashboard() {
    const { getOrdersByClient, supportTickets = [], products = [] } = useMetrics();
    const { user } = useAuth();

    // Fetch actual client specific data
    const allClientOrders = getOrdersByClient(user?.id) || [];
    const clientOrders = allClientOrders.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const pendingOrders = allClientOrders.filter(o => ['paid', 'cutting', 'packed', 'shipped'].includes(o.status));
    const totalSpent = allClientOrders.reduce((sum, o) => sum + o.total, 0);
    
    const userTickets = supportTickets.filter(t => String(t.clientId) === String(user?.id));
    const openTickets = userTickets.filter(t => ['open', 'in_progress'].includes(t.status)).length;

    const quickActions = [
        {
            title: 'Mis Pedidos',
            description: 'Ver historial y rastrear envíos',
            icon: MdShoppingBag,
            link: '/cliente/pedidos',
            color: 'from-blue-400 to-indigo-600',
            stats: `${allClientOrders.length} pedidos`
        },
        {
            title: 'Lista de Deseos',
            description: 'Telas guardadas para después',
            icon: MdFavorite,
            link: '/cliente/coleccion',
            color: 'from-pink-400 to-rose-600',
            stats: '4 telas'
        },
        {
            title: 'Calculadora',
            description: 'Calcula metraje por proyecto',
            icon: MdContentCut,
            link: '/cliente/coleccion/calculadora',
            color: 'from-purple-400 to-fuchsia-600',
            stats: null
        },
        {
            title: 'Soporte',
            description: 'Reportar problemas y ver tickets',
            icon: MdSupportAgent,
            link: '/cliente/soporte/tickets',
            color: 'from-amber-400 to-orange-600',
            stats: openTickets > 0 ? `${openTickets} abiertos` : null
        }
    ];

    

    return (
        <DashboardLayout title={`¡Hola, ${user?.name || 'Cliente'}!`} links={clientDashboardLinks}>
            <AnimatedPage>
                {/* Welcome Banner */}
                <div className="card p-8 mb-8 bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 text-white shadow-xl shadow-primary-500/20 overflow-hidden relative border-none">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    
                    <div className="flex flex-wrap justify-between items-center gap-6 relative z-10">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-black mb-3 tracking-tighter">Tu rincón textil personalizado</h2>
                            <p className="text-primary-50/90 text-lg font-medium leading-relaxed">
                                Gestiona tus pedidos, descubre nuevas telas y sigue tus proyectos desde un solo lugar.
                            </p>
                        </div>
                        <Link
                            to="/catalogo"
                            className="px-8 py-4 bg-white text-primary-600 rounded-2xl font-black hover:bg-white/90 hover:scale-[1.02] transition-all shadow-xl active:scale-95 flex items-center gap-2 group border-none"
                        >
                            Explorar Catálogo <MdArrowForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Stats Cards Integration with MetricCard-style logic */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="card p-5 border-blue-50 dark:border-slate-700/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                <MdShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 opacity-80">Total Pedidos</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{allClientOrders.length}</h3>
                        </div>
                    </div>

                    <div className="card p-5 border-emerald-50 dark:border-slate-700/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                <MdLocalShipping className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            {pendingOrders.length > 0 && (
                                <div className="px-2 py-0.5 rounded-full bg-emerald-500 text-[9px] font-black text-white uppercase tracking-wider animate-pulse">En camino</div>
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 opacity-80">Pedidos Activos</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{pendingOrders.length}</h3>
                        </div>
                    </div>

                    <div className="card p-5 border-rose-50 dark:border-slate-700/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                                <MdFavorite className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 opacity-80">Favoritos</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">04 <span className="text-sm font-bold opacity-40">telas</span></h3>
                        </div>
                    </div>

                    <div className="card p-5 border-purple-50 dark:border-slate-700/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                                <MdAttachMoney className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 opacity-80">Inversión Textil</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none truncate">{formatCurrency(totalSpent)}</h3>
                        </div>
                    </div>
                </div>

            {/* Quick Actions Grid */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                    <MdSettings className="w-5 h-5 text-gray-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Acceso Rápido</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    // Extraer colores del gradiente para uso individual si es posible, o usar el gradiente
                    return (
                        <Link
                            key={action.title}
                            to={action.link}
                            className="card p-6 group hover:-translate-y-1.5 border-gray-50 dark:border-slate-700/50"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-5 shadow-lg shadow-gray-200 dark:shadow-none group-hover:scale-110 transition-transform duration-500`}>
                                <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
                                {action.title}
                            </h4>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 font-bold leading-relaxed">{action.description}</p>
                            
                            <div className="flex items-center justify-between mt-auto pt-2">
                                {action.stats ? (
                                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {action.stats}
                                    </span>
                                ) : <span />}
                                <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <MdArrowForward className="w-5 h-5 text-primary-600" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
                <div className="card lg:col-span-2 border-gray-50 dark:border-slate-700/50 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-gray-50/30 dark:bg-slate-900/30">
                        <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                <MdShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Pedidos Recientes</h3>
                        </div>
                        <Link
                            to="/cliente/pedidos"
                            className="text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 flex items-center gap-1 group"
                        >
                            Ver historial <MdArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    
                    <div className="divide-y divide-gray-50 dark:divide-slate-800">
                        {clientOrders.length > 0 ? (
                            clientOrders.map(order => (
                                <Link
                                    key={order.id}
                                    to={`/cliente/pedidos/rastreo?id=${order.id}`}
                                    className="p-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-gray-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                            #{String(order.id).padStart(4, '0')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Pedido del {new Date(order.date).toLocaleDateString()}</p>
                                            <p className="text-xs font-bold text-gray-400">{order.items?.length || 0} artículos</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                order.status === 'delivered' ? 'text-emerald-500' : 'text-primary-500'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <MdArrowForward className="w-5 h-5 text-gray-300 group-hover:translate-x-1 group-hover:text-primary-500 transition-all" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-10 text-center">
                                <p className="text-sm font-bold text-gray-400 font-bold uppercase tracking-widest text-[10px]">Sin pedidos aún</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Quick Settings */}
                <div className="card overflow-hidden border-amber-50 dark:border-slate-700/50">
                    <div className="p-6 border-b border-gray-50 dark:border-slate-800 bg-amber-50/20 dark:bg-amber-900/10">
                        <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                <MdPerson className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Mi Perfil</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-gray-50/50 dark:bg-slate-800/50 border border-gray-50 dark:border-slate-700/50">
                            <div className="w-14 h-14 rounded-xl shadow-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                                {(user?.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-black text-gray-900 dark:text-white leading-tight">
                                    {user?.name || 'Cliente Demo'}
                                </p>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">{user?.email || 'cliente@ejemplo.com'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <Link
                                to="/cliente/configuracion"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                                        <MdSettings className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Configuración</span>
                                </div>
                                <MdArrowForward className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                            </Link>
                            
                            <Link
                                to="/cliente/soporte/nuevo"
                                className="flex items-center justify-between p-3 rounded-xl bg-orange-50/30 dark:bg-orange-900/10 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600">
                                        <MdSupportAgent className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold text-orange-700 dark:text-orange-400">¿Necesitas ayuda?</span>
                                </div>
                                <MdArrowForward className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default ClientDashboard;
