import React from 'react';
import { FiPackage, FiDollarSign } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { formatCurrency } from '../../../utils/formatters';

function ReturnsAnalysis() {
    const { orders, bugReports, users } = useMetrics();

    const dashboardLinks = [
        { label: 'Mapa de Ventas', path: '/admin/analytics/mapa-ventas' },
        { label: 'Rotación', path: '/admin/analytics/rotacion' },
        { label: 'Devoluciones', path: '/admin/analytics/devoluciones' },
        { label: 'Proyección', path: '/admin/analytics/proyeccion' },
    ];

    // Calcular órdenes devueltas
    const returnedOrders = orders.filter(o => o.returned || o.status === 'returned');
    const returnRate = orders.length > 0 ? (returnedOrders.length / orders.length) * 100 : 0;
    const returnedValue = returnedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Calcular devoluciones por tipo de tela (basado en bugReports)
    const returnsByType = {};
    bugReports.forEach(report => {
        const category = report.productName?.split(' ')[0] || report.category || 'Otros';
        if (!returnsByType[category]) {
            returnsByType[category] = { name: category, count: 0 };
        }
        returnsByType[category].count++;
    });
    const returnsByTypeArray = Object.values(returnsByType);

    // Calcular devoluciones por vendedor
    const sellers = users.filter(u => u.role === 'seller');
    const returnsBySeller = sellers.map(seller => {
        const sellerReports = bugReports.filter(r => r.sellerId === seller.id);
        const sellerOrders = orders.filter(o => o.sellerId === seller.id);
        return {
            sellerId: seller.id,
            sellerName: seller.name,
            count: sellerReports.length,
            totalOrders: sellerOrders.length,
            rate: sellerOrders.length > 0 ? (sellerReports.length / sellerOrders.length) * 100 : 0
        };
    }).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

    const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

    return (
        <DashboardLayout title="Análisis de Devoluciones" links={dashboardLinks}>
            <BackButton />
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiPackage className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-gray-500">Tasa de Devolución</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{returnRate.toFixed(2)}%</p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Total Reportes</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {bugReports.length}
                    </p>
                </div>
                <div className="card p-6">
                    <p className="text-sm text-gray-500 mb-2">Total Pedidos</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
                </div>
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiDollarSign className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-gray-500">Valor Afectado</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(returnedValue)}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Returns by Fabric Type */}
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4">Reportes por Tipo de Tela</h3>
                    {returnsByTypeArray.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={returnsByTypeArray}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {returnsByTypeArray.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No hay datos de reportes
                        </div>
                    )}
                </div>

                {/* Returns by Seller */}
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4">Top Vendedores con Reportes</h3>
                    {returnsBySeller.length > 0 ? (
                        <div className="space-y-3">
                            {returnsBySeller.slice(0, 5).map((seller, index) => (
                                <div key={seller.sellerId} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{seller.sellerName}</p>
                                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-red-500 h-2 rounded-full"
                                                style={{ width: `${Math.min((seller.count / (returnsBySeller[0]?.count || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-red-600">{seller.count}</p>
                                        <p className="text-xs text-gray-500">{seller.rate.toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-gray-500">
                            No hay reportes de vendedores
                        </div>
                    )}
                </div>
            </div>

            {/* Bug Reports Table */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg">Reportes de Calidad Recientes</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">ID</th>
                                <th className="px-6 py-4 text-left">Producto</th>
                                <th className="px-6 py-4 text-left">Cliente</th>
                                <th className="px-6 py-4 text-left">Descripción</th>
                                <th className="px-6 py-4 text-left">Prioridad</th>
                                <th className="px-6 py-4 text-left">Estado</th>
                                <th className="px-6 py-4 text-left">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {bugReports.slice(0, 10).map(report => (
                                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                                        #{report.id}
                                    </td>
                                    <td className="px-6 py-4 font-medium">{report.productName || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                        {report.clientName || `Cliente ${report.clientId}`}
                                    </td>
                                    <td className="px-6 py-4 text-sm max-w-xs truncate">
                                        {report.description}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.priority === 'high'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            : report.priority === 'medium'
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                            {report.priority === 'high' ? 'Alta' : report.priority === 'medium' ? 'Media' : 'Baja'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.status === 'open'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : report.status === 'resolved'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {report.status === 'open' ? 'Abierto' : report.status === 'resolved' ? 'Resuelto' : 'En revisión'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(report.date).toLocaleDateString('es-CO')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ReturnsAnalysis;
