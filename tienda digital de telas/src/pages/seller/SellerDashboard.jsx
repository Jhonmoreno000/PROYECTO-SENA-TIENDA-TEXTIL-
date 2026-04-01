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
                        color="emerald"
                    />
                    <MetricCard
                        label="Mis Pedidos"
                        value={metrics.totalOrders}
                        icon={MdShoppingBag}
                        color="blue"
                        subtitle={`${metrics.completedOrders} completados`}
                    />
                    <MetricCard
                        label="Ticket Promedio"
                        value={formatCurrency(metrics.averageTicket)}
                        icon={MdTrendingUp}
                        color="purple"
                    />
                    <MetricCard
                        label="Reportes Recibidos"
                        value={metrics.bugReportsCount}
                        icon={MdWarningAmber}
                        color="orange"
                    />
                </div>

                {/* Gráfico de Ventas */}
                <div className="card p-6 mb-8 border-violet-50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                            <MdTrendingUp className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">Rendimiento de Ventas</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Últimos 7 días</p>
                        </div>
                    </div>
                    <LineChart
                        data={chartData}
                        height={250}
                        color="#8B5CF6"
                    />
                </div>

                {/* Productos Más Vendidos */}
                {topProducts.length > 0 && (
                    <div className="card p-6 mb-8 border-emerald-50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                <MdShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">Productos Estrella</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Los más solicitados de tu tienda</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {topProducts.map((product, index) => (
                                <div key={product.id} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-transparent hover:border-emerald-200/50 transition-all duration-300 group">
                                    <div className="text-2xl font-black text-emerald-600/20 dark:text-emerald-400/20 mb-1 group-hover:scale-110 transition-transform">0{index + 1}</div>
                                    <div className="text-sm font-bold text-gray-800 dark:text-white truncate mb-1">{product.name}</div>
                                    <div className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-[10px] font-black text-emerald-700 dark:text-emerald-400 inline-block uppercase tracking-wider">
                                        {product.sales} ventas
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Gestión de Productos */}
                <div className="card border-blue-50 dark:border-slate-700/50 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center bg-blue-50/20 dark:bg-blue-900/10">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                <MdInventory2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Mi Inventario</h2>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-0.5">{sellerProducts.length} productos registrados</p>
                            </div>
                        </div>
                        <button className="btn-primary flex items-center gap-2 text-sm">
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

