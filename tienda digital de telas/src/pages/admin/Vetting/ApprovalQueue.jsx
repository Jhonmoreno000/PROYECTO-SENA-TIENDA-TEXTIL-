import React, { useState } from 'react';
import { FiCheck, FiX, FiEye, FiFilter } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { useProducts } from '../../../context/ProductContext';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

function ApprovalQueue() {
    const { pendingProducts, approveProduct, rejectProduct } = useMetrics();
    const { refreshProducts } = useProducts();
    const [filterSeller, setFilterSeller] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(null);
    const filteredProducts = filterSeller === 'all'
        ? pendingProducts.filter(p => p.status === 'pending')
        : pendingProducts.filter(p => p.status === 'pending' && p.sellerName === filterSeller);

    const sellers = [...new Set(pendingProducts.map(p => p.sellerName))];

    const handleApprove = (productId) => {
        approveProduct(productId);
        refreshProducts(); // Sync catalog
    };

    const handleReject = (productId) => {
        if (rejectReason.trim()) {
            rejectProduct(productId, rejectReason);
            setShowRejectModal(null);
            setRejectReason('');
        }
    };

    return (
        <DashboardLayout title="Cola de Aprobación de Productos" links={adminDashboardLinks}>
            <BackButton />
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Productos Pendientes</h2>
                    <p className="text-gray-500 mt-1">Revisa y aprueba productos nuevos de los vendedores</p>
                </div>

                <select
                    value={filterSeller}
                    onChange={(e) => setFilterSeller(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="all">Todos los vendedores ({filteredProducts.length})</option>
                    {sellers.map(seller => (
                        <option key={seller} value={seller}>
                            {seller} ({pendingProducts.filter(p => p.sellerName === seller && p.status === 'pending').length})
                        </option>
                    ))}
                </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        ¡Todo al día!
                    </h3>
                    <p className="text-gray-500">No hay productos pendientes de aprobación</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="card overflow-hidden">
                            {/* Product Image */}
                            <div className="aspect-square bg-gray-100 dark:bg-slate-700 relative overflow-hidden">
                                <img
                                    src={product.images?.[0] || '/placeholder.png'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white">
                                        Pendiente
                                    </span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">{product.category}</p>
                                    </div>
                                    <p className="text-xl font-bold text-primary-600">
                                        ${(product.price / 1000).toFixed(0)}k
                                    </p>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
                                        {product.sellerName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {product.sellerName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Enviado: {new Date(product.submittedAt).toLocaleDateString('es-CO')}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setSelectedProduct(product)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <FiEye className="w-4 h-4" />
                                        Ver
                                    </button>
                                    <button
                                        onClick={() => handleApprove(product.id)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <FiCheck className="w-4 h-4" />
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(product.id)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <FiX className="w-4 h-4" />
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-bold">Vista Previa del Producto</h3>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>

                            <img
                                src={selectedProduct.images[0]}
                                alt={selectedProduct.name}
                                className="w-full aspect-square object-cover rounded-lg mb-4"
                            />

                            <h4 className="text-xl font-bold mb-2">{selectedProduct.name}</h4>
                            <p className="text-2xl font-bold text-primary-600 mb-4">
                                ${selectedProduct.price.toLocaleString('es-CO')}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedProduct.description}</p>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                                    {selectedProduct.sellerName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium">Vendedor: {selectedProduct.sellerName}</p>
                                    <p className="text-sm text-gray-500">
                                        Categoría: {selectedProduct.category}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        handleApprove(selectedProduct.id);
                                        setSelectedProduct(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                >
                                    ✓ Aprobar Producto
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(selectedProduct.id);
                                        setSelectedProduct(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                >
                                    ✗ Rechazar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Rechazar Producto</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Por favor especifica la razón del rechazo para que el vendedor pueda corregir el producto.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Ej: Las fotos no muestran claramente el producto..."
                            className="w-full px-4 py-2 border rounded-lg mb-4"
                            rows="4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleReject(showRejectModal)}
                                disabled={!rejectReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                Confirmar Rechazo
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(null);
                                    setRejectReason('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default ApprovalQueue;

