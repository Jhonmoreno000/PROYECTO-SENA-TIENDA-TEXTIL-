import React, { useState } from 'react';
import { MdInventory2, MdWarningAmber, MdEdit, MdDelete, MdAdd, MdSave, MdClose, MdAttachMoney, MdShoppingBag, MdTrendingUp } from 'react-icons/md';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AnimatedPage from '../../components/AnimatedPage';
import sellerDashboardLinks from '../../data/sellerDashboardLinks';
import MetricCard from '../../components/dashboard/MetricCard';
import LineChart from '../../components/dashboard/LineChart';
import { formatCurrency } from '../../utils/formatters';
import { useMetrics } from '../../context/MetricsContext';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getSellerMetrics, getTopProducts } from '../../utils/metricsUtils';

function SellerProducts() {
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const { products, orders, bugReports, getProductsBySeller, getOrdersBySeller, getBugReportsBySeller, updateProduct, deleteProduct, refreshData } = useMetrics();
    const { refreshProducts } = useProducts();

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Obtener solo los datos del vendedor actual
    const sellerId = user?.id;
    const sellerProducts = getProductsBySeller(sellerId);
    const sellerOrders = getOrdersBySeller(sellerId);
    const sellerBugReports = getBugReportsBySeller(sellerId);

    // Calcular métricas del vendedor
    const metrics = getSellerMetrics(sellerId, orders, bugReports);
    const topProducts = getTopProducts(sellerOrders, sellerProducts, 5);

    // Refresh data on mount to ensure we have the latest
    React.useEffect(() => {
        if (sellerId) {
            refreshData();
        }
    }, [sellerId]);

    // Datos para el gráfico (últimos 7 días de ventas del vendedor)
    const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
    });

    const chartData = last7Days.map(date => {
        const dayOrders = sellerOrders.filter(o => o.date === date);
        const daySales = dayOrders.reduce((sum, o) => sum + o.total, 0);
        return {
            name: new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
            value: daySales
        };
    });



    const deleteItem = (id) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            deleteProduct(id);
            showNotification('success', 'Producto eliminado');
        }
    };

    const startEditing = (product) => {
        setEditingId(product.id);
        setEditForm({ ...product });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveChanges = async () => {
        const productId = editingId;
        const updatedForm = { ...editForm };

        // If a new image was selected (it's a Base64 data URI), send it to the API
        if (updatedForm.images && updatedForm.images[0] && updatedForm.images[0].startsWith('data:')) {
            try {
                const res = await fetch(`http://localhost:8081/api/products/${productId}/image`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: updatedForm.images[0] })
                });
                if (res.ok) {
                    const data = await res.json();
                    updatedForm.images = [data.url]; // replace Base64 with the served URL
                }
            } catch (err) {
                console.error('Error al subir imagen:', err);
            }
        }

        await updateProduct(productId, updatedForm);
        
        setEditingId(null);
        showNotification('success', 'Producto actualizado correctamente');

        // Refresh both contexts
        refreshData();
        refreshProducts();
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm({
            ...editForm,
            [name]: name === 'price' || name === 'stock' ? Number(value) : value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImages = [...(editForm.images || [])];
                newImages[0] = reader.result; // data:image/jpeg;base64,...
                setEditForm({
                    ...editForm,
                    images: newImages
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <DashboardLayout title="Panel de Vendedor" subtitle="Gestión de tienda" links={sellerDashboardLinks}>
            <AnimatedPage>
                {/* Métricas del Vendedor */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        label="Mis Ventas Totales"
                        value={formatCurrency(metrics.totalSales)}
                        icon={MdAttachMoney}
                        color="bg-emerald-100/50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                    />
                    <MetricCard
                        label="Mis Pedidos"
                        value={metrics.totalOrders}
                        icon={MdShoppingBag}
                        color="bg-blue-100/50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                        subtitle={`${metrics.completedOrders} completados`}
                    />
                    <MetricCard
                        label="Ticket Promedio"
                        value={formatCurrency(metrics.averageTicket)}
                        icon={MdTrendingUp}
                        color="bg-purple-100/50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                    />
                    <MetricCard
                        label="Reportes Recibidos"
                        value={metrics.bugReportsCount}
                        icon={MdWarningAmber}
                        color="bg-orange-100/50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
                    />
                </div>

                {/* Gráfico de Ventas */}
                <div className="card p-6 mb-8 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <LineChart
                    data={chartData}
                    title="Mis Ventas - Últimos 7 Días"
                    height={250}
                    color="#8B5CF6"
                />
            </div>

                {/* Productos Más Vendidos */}
                {topProducts.length > 0 && (
                    <div className="card p-6 mb-8 shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Mis Productos Más Vendidos</h3>
                        <div className="grid md:grid-cols-5 gap-5">
                            {topProducts.map((product, index) => (
                                <div key={product.id} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800/80 dark:to-slate-700/80 border border-gray-200/50 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500 mb-2">#{index + 1}</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white pb-1 truncate leading-tight">{product.name}</div>
                                    <div className="text-xs font-semibold text-gray-500">{product.sales} ventas</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Gestión de Productos */}
                <div className="card shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center bg-gray-50/30 dark:bg-slate-800/30">
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Mi Inventario</h2>
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mt-1">
                                <MdInventory2 className="w-4 h-4 text-primary-500" />
                                {sellerProducts.length} productos registrados
                            </p>
                        </div>
                        <button className="btn-primary-gradient shadow-md shadow-primary-500/30 flex items-center gap-2 hover:scale-105 transition-transform">
                            <MdAdd className="w-5 h-5" /> Nuevo Producto
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/80 dark:bg-slate-800/80 text-xs text-gray-500 uppercase font-extrabold tracking-wider text-left">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-lg">Producto</th>
                                    <th className="px-6 py-4">Precio</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Categoría</th>
                                    <th className="px-6 py-4 text-right rounded-tr-lg">Acciones</th>
                                </tr>
                            </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {sellerProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        {editingId === product.id ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editForm.name}
                                                    onChange={handleFormChange}
                                                    className="input-field py-1 text-sm bg-white dark:bg-slate-800 mb-1"
                                                    placeholder="Nombre del producto"
                                                />
                                                <div className="text-xs font-semibold text-gray-500 mb-1">Actualizar Imagen:</div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    name="images"
                                                    onChange={handleImageChange}
                                                    className="w-full text-xs file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden">
                                                    <img src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                    <div className="text-xs text-gray-500 whitespace-nowrap">ID: {product.id}</div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm">
                                        {editingId === product.id ? (
                                            <input
                                                type="number"
                                                name="price"
                                                value={editForm.price}
                                                onChange={handleFormChange}
                                                className="input-field py-1 text-sm bg-white dark:bg-slate-800 w-24"
                                            />
                                        ) : (
                                            formatCurrency(product.price)
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === product.id ? (
                                            <input
                                                type="number"
                                                name="stock"
                                                value={editForm.stock}
                                                onChange={handleFormChange}
                                                className="input-field py-1 text-sm bg-white dark:bg-slate-800 w-20"
                                            />
                                        ) : (
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 20
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {product.stock} m
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {product.category}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingId === product.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={saveChanges} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 p-2 rounded-lg transition-colors" title="Guardar">
                                                        <MdSave className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors" title="Cancelar">
                                                        <MdClose className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => startEditing(product)}
                                                        className="text-primary-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 p-2 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <MdEdit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteItem(product.id)}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <MdDelete className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default SellerProducts;

