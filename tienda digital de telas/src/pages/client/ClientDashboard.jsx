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
                <div className="card p-8 mb-8 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white shadow-lg shadow-primary-500/30 overflow-hidden relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                    
                    <div className="flex flex-wrap justify-between items-center gap-6 relative z-10">
                    <div>
                        <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Bienvenido a tu Panel</h2>
                        <p className="text-primary-50 text-lg font-medium max-w-xl">
                            Aquí puedes gestionar tus pedidos, lista de deseos y más, todo en un solo lugar.
                        </p>
                    </div>
                    <Link
                        to="/catalogo"
                        className="px-8 py-3.5 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-50 hover:scale-105 transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                        Explorar Catálogo <MdArrowForward className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-10">
                <div className="card p-6 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl shadow-inner border border-blue-200 dark:border-blue-800">
                            <MdShoppingBag className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Pedidos</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                {allClientOrders.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-2xl shadow-inner border border-emerald-200 dark:border-emerald-800">
                            <MdLocalShipping className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">En Camino</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                {pendingOrders.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40 rounded-2xl shadow-inner border border-rose-200 dark:border-rose-800">
                            <MdFavorite className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Lista de Deseos</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                4 <span className="text-base font-bold text-gray-500">telas</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-2xl shadow-inner border border-purple-200 dark:border-purple-800">
                            <MdAttachMoney className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Comprado</p>
                            <p className="text-2xl font-extrabold text-gray-900 dark:text-white pt-1">
                                {formatCurrency(totalSpent)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                Acceso Rápido
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.title}
                            to={action.link}
                            className="card p-7 group hover:shadow-xl transition-all hover:-translate-y-1.5 border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/90"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-5 shadow-inner`}>
                                <Icon className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                                {action.title}
                            </h4>
                            <p className="text-sm text-gray-500 mb-4 font-medium leading-relaxed">{action.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                                {action.stats ? (
                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                                        {action.stats}
                                    </span>
                                ) : <span />}
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-500/20 transition-colors">
                                    <MdArrowForward className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
                <div className="card overflow-hidden lg:col-span-2 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            Pedidos Recientes
                        </h3>
                        <Link
                            to="/cliente/pedidos"
                            className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
                        >
                            Ver todos <MdArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                        {clientOrders.slice(0, 3).map(order => (
                            <Link
                                key={order.id}
                                to={`/cliente/pedidos/rastreo?id=${order.id}`}
                                className="p-5 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors group"
                            >
                                {(() => {
                                    const firstProduct = products.find(p => String(p.id) === String(order.productIds?.[0]));
                                    const imageUrl = firstProduct?.image || firstProduct?.images?.[0];
                                    
                                    return imageUrl ? (
                                        <div className="w-14 h-14 shrink-0 rounded-xl shadow-sm border border-gray-200/50 dark:border-slate-600 overflow-hidden bg-white">
                                            <img src={imageUrl} alt="Producto" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 shrink-0 rounded-xl shadow-sm border border-gray-200/50 dark:border-slate-600 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white" >
                                            <MdShoppingBag className="w-6 h-6" />
                                        </div>
                                    );
                                })()}
                                <div className="flex-1">
                                    <p className="font-extrabold text-gray-900 dark:text-white text-base group-hover:text-primary-600 transition-colors">
                                        Pedido #{order.id}
                                    </p>
                                    <p className="text-sm font-medium text-gray-500 mt-0.5">
                                        {new Date(order.date).toLocaleDateString('es-CO')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-extrabold text-lg text-gray-900 dark:text-white mb-1">
                                        {formatCurrency(order.total)}
                                    </p>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order.status === 'delivered'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : order.status === 'shipped'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                        {order.status === 'delivered' ? 'Entregado'
                                            : order.status === 'shipped' ? 'En camino'
                                                : 'En proceso'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Account Quick Settings */}
                <div className="card overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            Mi Cuenta
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-8 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                            <div className="w-14 h-14 rounded-xl shadow-inner bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-2xl font-black">
                                {(user?.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-extrabold text-[1.1rem] text-gray-900 dark:text-white leading-tight">
                                    {user?.name || 'Cliente Demo'}
                                </p>
                                <p className="text-sm font-medium text-gray-500 mt-0.5">{user?.email || 'cliente@ejemplo.com'}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Link
                                to="/cliente/configuracion"
                                className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all font-bold group text-gray-900 dark:text-white text-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-200/60 dark:bg-slate-700 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-600 transition-colors shadow-sm">
                                        <MdPerson className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span>Editar Perfil</span>
                                </div>
                                <MdArrowForward className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                            </Link>
                            <Link
                                to="/cliente/configuracion/direcciones"
                                className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all font-bold group text-gray-900 dark:text-white text-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-200/60 dark:bg-slate-700 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-600 transition-colors shadow-sm">
                                        <MdLocalShipping className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span>Direcciones de Envío</span>
                                </div>
                                <MdArrowForward className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                            </Link>
                            <Link
                                to="/cliente/soporte/nuevo"
                                className="flex items-center gap-3 mt-4 p-4 dark:bg-orange-900/20 bg-orange-50/50 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 border border-orange-100 dark:border-orange-900/50 transition-all group font-bold"
                            >
                                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-800/50 flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors shadow-sm text-orange-600 dark:text-orange-400">
                                    <MdSupportAgent className="w-5 h-5" />
                                </div>
                                <span className="text-orange-700 dark:text-orange-300 text-sm">Reportar un Problema</span>
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
