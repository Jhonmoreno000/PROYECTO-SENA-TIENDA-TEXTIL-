import React, { useState } from 'react';
import { MdPerson, MdInventory, MdVisibility } from 'react-icons/md';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AnimatedPage from '../../components/AnimatedPage';
import clientDashboardLinks from '../../data/clientDashboardLinks';
import BackButton from '../../components/dashboard/BackButton';
import { formatCurrency, formatDate } from '../../utils/formatters';
import OrderDetailsModal from '../../components/client/OrderDetailsModal';
import { useNotification } from '../../context/NotificationContext';

function OrderHistory() {
    const { showNotification } = useNotification();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    

    // Mock Orders
    const [orders, setOrders] = useState([
        { id: 'DD12345678', date: '2023-10-25T14:30:00', status: 'Entregado', total: 156000, items: 3 },
        { id: 'DD87654321', date: '2023-11-05T09:15:00', status: 'En Proceso', total: 85000, items: 1 },
        { id: 'DD45612378', date: '2023-11-12T16:45:00', status: 'Enviado', total: 240000, items: 5 },
        { id: 'DD11223344', date: '2023-11-15T10:00:00', status: 'Pendiente', total: 50000, items: 2 },
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Entregado': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'En Proceso': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Enviado': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'Pendiente': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Cancelado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCancelOrder = (orderId) => {
        setOrders(orders.map(o =>
            o.id === orderId ? { ...o, status: 'Cancelado' } : o
        ));
        setIsModalOpen(false);
        showNotification('success', `Pedido #${orderId} cancelado exitosamente`);
    };

    const handleRefundRequest = (orderId) => {
        setIsModalOpen(false);
        showNotification('success', `Solicitud de reembolso para el pedido #${orderId} enviada`);
    };

    const handleReportProblem = (orderId, reportText) => {
        // Aquí iría la lógica para enviar al backend
        console.log(`Reporte para ${orderId}: ${reportText}`);
        setIsModalOpen(false);
        showNotification('info', 'Gracias por tu reporte. Nos pondremos en contacto pronto.');
    };

    return (
        <DashboardLayout title="Historial de Pedidos" links={clientDashboardLinks}>
            <AnimatedPage>
            <BackButton to="/cliente" label="Volver a Mi Panel" />
            <div className="card overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedido</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium font-mono text-primary-600 dark:text-primary-400">
                                        #{order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(order.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(order.total)}
                                        <span className="text-xs font-normal text-gray-500 ml-1">({order.items} items)</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(order)}
                                            className="text-gray-400 hover:text-primary-600 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
                                            title="Ver detalles"
                                        >
                                            <MdVisibility className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
                onCancel={handleCancelOrder}
                onRefund={handleRefundRequest}
                onReport={handleReportProblem}
            />
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default OrderHistory;
