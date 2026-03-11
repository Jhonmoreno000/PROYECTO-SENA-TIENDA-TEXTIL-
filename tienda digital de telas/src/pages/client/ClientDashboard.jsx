import React from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiHeart, FiTool, FiMessageCircle, FiUser, FiTruck, FiScissors, FiArrowRight } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import clientDashboardLinks from '../../data/clientDashboardLinks';
import { useMetrics } from '../../context/MetricsContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

function ClientDashboard() {
    const { orders, supportTickets = [] } = useMetrics();
    const { user } = useAuth();

    // Client stats (mock for demo)
    const clientOrders = orders.slice(0, 5);
    const pendingOrders = clientOrders.filter(o => ['paid', 'cutting', 'packed', 'shipped'].includes(o.status));
    const totalSpent = clientOrders.reduce((sum, o) => sum + o.total, 0);
    const openTickets = supportTickets.filter(t => ['open', 'in_progress'].includes(t.status)).length;

    const quickActions = [
        {
            title: 'Mis Pedidos',
            description: 'Ver historial y rastrear envíos',
            icon: FiPackage,
            link: '/cliente/pedidos',
            color: 'from-blue-500 to-blue-600',
            stats: `${clientOrders.length} pedidos`
        },
        {
            title: 'Lista de Deseos',
            description: 'Telas guardadas para después',
            icon: FiHeart,
            link: '/cliente/coleccion',
            color: 'from-pink-500 to-rose-600',
            stats: '4 telas'
        },
        {
            title: 'Calculadora',
            description: 'Calcula metraje por proyecto',
            icon: FiScissors,
            link: '/cliente/coleccion/calculadora',
            color: 'from-purple-500 to-purple-600',
            stats: null
        },
        {
            title: 'Soporte',
            description: 'Reportar problemas y ver tickets',
            icon: FiMessageCircle,
            link: '/cliente/soporte/tickets',
            color: 'from-orange-500 to-orange-600',
            stats: openTickets > 0 ? `${openTickets} abiertos` : null
        }
    ];

    

    return (
        <DashboardLayout title={`¡Hola, ${user?.name || 'Cliente'}!`} links={clientDashboardLinks}>
            {/* Welcome Banner */}
            <div className="card p-8 mb-8 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Bienvenido a tu Panel</h2>
                        <p className="text-primary-100">
                            Aquí puedes gestionar tus pedidos, lista de deseos y más.
                        </p>
                    </div>
                    <Link
                        to="/catalogo"
                        className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                    >
                        Explorar Catálogo
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <FiPackage className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Pedidos</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {clientOrders.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <FiTruck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">En Camino</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {pendingOrders.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                            <FiHeart className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Lista de Deseos</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                4 telas
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <FiTool className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Comprado</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(totalSpent)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Acceso Rápido</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.title}
                            to={action.link}
                            className="card p-6 group hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                                <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                {action.title}
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">{action.description}</p>
                            {action.stats && (
                                <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                                    {action.stats}
                                </span>
                            )}
                            <div className="flex justify-end mt-2">
                                <FiArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600 transition-colors" />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="card overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            Pedidos Recientes
                        </h3>
                        <Link
                            to="/cliente/pedidos"
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            Ver todos →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                        {clientOrders.slice(0, 3).map(order => (
                            <Link
                                key={order.id}
                                to={`/cliente/pedidos/rastreo?id=${order.id}`}
                                className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600" />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Pedido #{order.id}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.date).toLocaleDateString('es-CO')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(order.total)}
                                    </p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : order.status === 'shipped'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
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
                <div className="card overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            Mi Cuenta
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                                {(user?.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-lg text-gray-900 dark:text-white">
                                    {user?.name || 'Cliente Demo'}
                                </p>
                                <p className="text-gray-500">{user?.email || 'cliente@ejemplo.com'}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Link
                                to="/cliente/configuracion"
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <FiUser className="w-5 h-5 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">Editar Perfil</span>
                            </Link>
                            <Link
                                to="/cliente/configuracion/direcciones"
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <FiTruck className="w-5 h-5 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">Direcciones de Envío</span>
                            </Link>
                            <Link
                                to="/cliente/soporte/nuevo"
                                className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                            >
                                <FiMessageCircle className="w-5 h-5 text-orange-500" />
                                <span className="font-medium text-orange-700 dark:text-orange-400">Reportar un Problema</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ClientDashboard;
