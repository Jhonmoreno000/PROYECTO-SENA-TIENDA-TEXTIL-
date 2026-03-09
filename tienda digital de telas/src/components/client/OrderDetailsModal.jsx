import React, { useState } from 'react';
import { FiX, FiAlertTriangle, FiRefreshCw, FiSlash, FiCheck } from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function OrderDetailsModal({ isOpen, onClose, order, onCancel, onRefund, onReport }) {
    const [reportText, setReportText] = useState('');
    const [showReportForm, setShowReportForm] = useState(false);

    if (!isOpen || !order) return null;

    // Generar productos mock basados en el número de items
    const startId = parseInt(order.id.replace(/\D/g, '')) || 1000;
    const mockProducts = Array.from({ length: order.items }).map((_, i) => ({
        id: startId + i,
        name: i % 2 === 0 ? 'Tela Algodón Premium' : 'Seda Italiana Importada',
        price: order.total / order.items,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1596484552993-87b409746e30?auto=format&fit=crop&q=80&w=200'
    }));

    const handleSubmitReport = (e) => {
        e.preventDefault();
        onReport(order.id, reportText);
        setReportText('');
        setShowReportForm(false);
    };

    const getStatusBadge = (status) => {
        let colorClass = 'bg-gray-100 text-gray-700';
        if (status === 'Entregado') colorClass = 'bg-green-100 text-green-700';
        if (status === 'En Proceso') colorClass = 'bg-blue-100 text-blue-700';
        if (status === 'Enviado') colorClass = 'bg-orange-100 text-orange-700';
        if (status === 'Cancelado') colorClass = 'bg-red-100 text-red-700';

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            Pedido #{order.id}
                            {getStatusBadge(order.status)}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Realizado el {formatDate(order.date)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <FiX className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Lista de Productos */}
                    <div>
                        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Productos ({mockProducts.length})</h3>
                        <div className="space-y-4">
                            {mockProducts.map((product) => (
                                <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-16 h-16 object-cover rounded-md"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Cantidad: {product.quantity}</p>
                                    </div>
                                    <p className="font-bold text-primary-600 dark:text-primary-400">
                                        {formatCurrency(product.price)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resumen Financiero */}
                    <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.total * 0.81)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">IVA (19%)</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.total * 0.19)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-slate-600 pt-2 mt-2">
                            <span className="text-gray-900 dark:text-white">Total</span>
                            <span className="text-primary-600 dark:text-primary-400">{formatCurrency(order.total)}</span>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                        {/* Botón Cancelar - Solo para pedidos activos */}
                        {(order.status === 'En Proceso' || order.status === 'Pendiente') && (
                            <button
                                onClick={() => onCancel(order.id)}
                                className="flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400"
                            >
                                <FiSlash /> Cancelar Pedido
                            </button>
                        )}

                        {/* Botón Reembolso - Solo para entregados */}
                        {order.status === 'Entregado' && (
                            <button
                                onClick={() => onRefund(order.id)}
                                className="flex items-center justify-center gap-2 px-4 py-3 border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors font-medium dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-400"
                            >
                                <FiRefreshCw /> Solicitar Reembolso
                            </button>
                        )}

                        <button
                            onClick={() => setShowReportForm(!showReportForm)}
                            className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
                        >
                            <FiAlertTriangle /> Reportar Problema
                        </button>
                    </div>

                    {/* Formulario de Reporte */}
                    {showReportForm && (
                        <form onSubmit={handleSubmitReport} className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Describe el problema con tu pedido
                            </label>
                            <textarea
                                value={reportText}
                                onChange={(e) => setReportText(e.target.value)}
                                required
                                rows={3}
                                className="w-full rounded-lg border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Ej: Llegó incompleto, producto dañado..."
                            />
                            <div className="flex justify-end gap-2 mt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReportForm(false)}
                                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Enviar Reporte
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
