import React, { useState } from 'react';
import { FiPackage, FiEdit, FiTrash2, FiSearch, FiFilter, FiDollarSign, FiShoppingBag, FiAlertCircle } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import adminDashboardLinks from '../../data/adminDashboardLinks';
import MetricCard from '../../components/dashboard/MetricCard';
import { formatCurrency } from '../../utils/formatters';
import { useMetrics } from '../../context/MetricsContext';
import { useProducts } from '../../context/ProductContext';
import { useNotification } from '../../context/NotificationContext';
import { calculateStockMetrics } from '../../utils/metricsUtils';
import { motion } from 'framer-motion';

function AdminProducts() {
    const { showNotification } = useNotification();
    const { products, deleteProduct, updateProduct } = useMetrics();
    const { refreshProducts } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Métricas de stock
    const stockMetrics = calculateStockMetrics(products);

    // Categorías únicas
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    // Filtrar productos
    const filteredProducts = products.filter(p => {
        const matchSearch = !searchTerm || 
            (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchCategory = filterCategory === 'all' || p.category === filterCategory;
        return matchSearch && matchCategory;
    });

    const handleEdit = (product) => {
        setEditingId(product.id);
        setEditForm({ price: product.price, stock: product.stock });
    };

    const handleSave = async (productId) => {
        updateProduct(productId, editForm);
        setEditingId(null);
        showNotification('success', 'Producto actualizado');
    };

    const handleDelete = (productId) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            deleteProduct(productId);
            showNotification('success', 'Producto eliminado');
        }
    };

    return (
        <DashboardLayout
            links={adminDashboardLinks}
            title="Gestión de Productos"
            subtitle={`${products.length} productos en catálogo`}
        >
            {/* Tarjetas de métricas de stock */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard
                    label="Total Productos"
                    value={stockMetrics.totalProducts}
                    icon={FiPackage}
                    color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                />
                <MetricCard
                    label="En Stock"
                    value={stockMetrics.inStock}
                    icon={FiShoppingBag}
                    color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                />
                <MetricCard
                    label="Stock Bajo"
                    value={stockMetrics.lowStock}
                    icon={FiAlertCircle}
                    color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                />
                <MetricCard
                    label="Agotados"
                    value={stockMetrics.outOfStock}
                    icon={FiAlertCircle}
                    color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                />
            </div>

            {/* Barra de búsqueda y filtro */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 w-full"
                    />
                </div>
                <div className="relative">
                    <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="input-field pl-10 min-w-[180px]"
                    >
                        <option value="all">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabla de productos */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-slate-700">
                                <th className="text-left p-4 font-semibold">Producto</th>
                                <th className="text-left p-4 font-semibold hidden md:table-cell">Categoría</th>
                                <th className="text-right p-4 font-semibold">Precio</th>
                                <th className="text-right p-4 font-semibold">Stock</th>
                                <th className="text-center p-4 font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-8 text-gray-500">
                                        No se encontraron productos
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {product.images && product.images[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                                                        <FiPackage className="text-gray-400" />
                                                    </div>
                                                )}
                                                <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500 hidden md:table-cell">{product.category || '—'}</td>
                                        <td className="p-4 text-right">
                                            {editingId === product.id ? (
                                                <input
                                                    type="number"
                                                    value={editForm.price}
                                                    onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                                                    className="input-field w-28 text-right"
                                                />
                                            ) : (
                                                formatCurrency(product.price)
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {editingId === product.id ? (
                                                <input
                                                    type="number"
                                                    value={editForm.stock}
                                                    onChange={(e) => setEditForm({...editForm, stock: Number(e.target.value)})}
                                                    className="input-field w-20 text-right"
                                                />
                                            ) : (
                                                <span className={`font-medium ${product.stock < 20 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                                                    {product.stock ?? 0}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {editingId === product.id ? (
                                                    <>
                                                        <button onClick={() => handleSave(product.id)} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Guardar">
                                                            <FiDollarSign size={16} />
                                                        </button>
                                                        <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Cancelar">
                                                            ✕
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEdit(product)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Editar">
                                                            <FiEdit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar">
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AdminProducts;
