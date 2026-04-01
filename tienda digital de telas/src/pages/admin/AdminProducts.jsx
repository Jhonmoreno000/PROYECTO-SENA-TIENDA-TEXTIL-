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
        refreshProducts();
    };

    const handleSave = async (productId) => {
        updateProduct(productId, editForm);
        setEditingId(null);
        showNotification('success', 'Producto actualizado');
        refreshProducts();
    };

    const handleDelete = (productId) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            deleteProduct(productId);
            showNotification('success', 'Producto eliminado');
            refreshProducts();
        }
    };

    return (
        <DashboardLayout
            links={adminDashboardLinks}
            title="Gestión de Productos"
            subtitle={`${products.length} productos en catálogo`}
            refreshProducts={refreshProducts}
        >
            {/* Tarjetas de métricas de stock */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard
                    label="Total Productos"
                    value={stockMetrics.totalProducts}
                    icon={FiPackage}
                    color="blue"
                />
                <MetricCard
                    label="En Stock"
                    value={stockMetrics.inStock}
                    icon={FiShoppingBag}
                    color="green"
                />
                <MetricCard
                    label="Stock Bajo"
                    value={stockMetrics.lowStock}
                    icon={FiAlertCircle}
                    color="yellow"
                />
                <MetricCard
                    label="Agotados"
                    value={stockMetrics.outOfStock}
                    icon={FiAlertCircle}
                    color="red"
                />
            </div>

            {/* Barra de búsqueda y filtro */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1 group">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar productos por nombre o categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12 w-full py-3.5 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm focus:shadow-md transition-all font-medium"
                    />
                </div>
                <div className="relative min-w-[220px]">
                    <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="input-field pl-12 w-full py-3.5 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm focus:shadow-md transition-all font-bold appearance-none"
                    >
                        <option value="all">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            {/* Tabla de productos */}
            <div className="card border-blue-50 dark:border-slate-800/50 overflow-hidden shadow-xl shadow-blue-500/5">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-blue-50/10 dark:bg-blue-900/10">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white tracking-tight leading-none">Inventario Maestro</h3>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">Control de existencias y precios</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/30 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800">
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Detalle del Producto</th>
                                <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest text-gray-400 hidden md:table-cell">Categoría</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Precio</th>
                                <th className="text-right p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Stock</th>
                                <th className="text-center p-4 font-black text-[10px] uppercase tracking-widest text-gray-400">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20">
                                        <div className="flex flex-col items-center gap-3">
                                            <FiSearch className="w-12 h-12 text-gray-200 dark:text-slate-800" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No se encontraron productos</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-blue-50/20 dark:hover:bg-blue-900/5 transition-colors group"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                {product.images && product.images[0] ? (
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 bg-white">
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                                                        <FiPackage className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white leading-tight">{product.name}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">ID: {product.id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {product.category || 'Sin categoría'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {editingId === product.id ? (
                                                <input
                                                    type="number"
                                                    value={editForm.price}
                                                    onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                                                    className="w-24 px-2 py-1.5 rounded-lg border border-primary-200 dark:border-primary-900 bg-primary-50/30 dark:bg-primary-900/10 text-right font-bold focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                                />
                                            ) : (
                                                <p className="font-black text-gray-900 dark:text-white">{formatCurrency(product.price)}</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {editingId === product.id ? (
                                                <input
                                                    type="number"
                                                    value={editForm.stock}
                                                    onChange={(e) => setEditForm({...editForm, stock: Number(e.target.value)})}
                                                    className="w-20 px-2 py-1.5 rounded-lg border border-primary-200 dark:border-primary-900 bg-primary-50/30 dark:bg-primary-900/10 text-right font-bold focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-end">
                                                    <p className={`font-black ${product.stock <= 5 ? 'text-red-500' : product.stock <= 20 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                        {product.stock ?? 0}
                                                    </p>
                                                    <div className="w-12 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${product.stock <= 5 ? 'bg-red-500' : product.stock <= 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${Math.min(100, ((product.stock ?? 0) / 100) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {editingId === product.id ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleSave(product.id)}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95"
                                                        >
                                                            <FiDollarSign className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-red-500 hover:text-white transition-all hover:scale-110 active:scale-95"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all hover:scale-110 active:scale-95"
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all hover:scale-110 active:scale-95"
                                                        >
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
