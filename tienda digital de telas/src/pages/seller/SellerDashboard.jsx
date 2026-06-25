/**
 * SellerDashboard.jsx — Panel principal del Vendedor
 * =====================================================
 * Esta es la pantalla de inicio que ve el vendedor cuando entra a su cuenta.
 * Muestra un resumen de sus ventas, sus productos y un gráfico de rendimiento.
 *
 * ¿Qué datos usa?
 *  - useAuth()         → saber quién es el vendedor que inició sesión
 *  - useMetrics()      → traer pedidos, productos y reportes de la base de datos
 *  - useProducts()     → actualizar el catálogo de productos después de cambios
 *  - useNotification() → mostrar mensajes de éxito o error en pantalla
 *
 * ¿Qué calcula?
 *  - getSellerMetrics() → ventas totales, cantidad de pedidos, ticket promedio
 *  - getTopProducts()   → los 5 productos que más se han vendido
 *  - formatCurrency()   → convierte números a formato de pesos colombianos
 */

import React, { useState, useEffect } from 'react';

// Íconos de lucide-react usados en todo el panel
import {
  Package,  // Reportes de bugs
  Edit2,          // Botón editar producto
  Trash2,         // Botón eliminar producto
  Plus,           // Botón nuevo producto
  Save,           // Guardar edición
  X,              // Cancelar edición
  DollarSign,     // Métrica de ventas
  ShoppingBag,    // Métrica de pedidos
  TrendingUp,     // Gráfico / tendencia
  BarChart3,      // Sección de productos estrella
  Filter,         // Barra de filtros
  RefreshCw,      // Refrescar datos
  Star            // Banner decorativo / productos
} from 'lucide-react';

// Layout compartido: sidebar + header
import DashboardLayout from '../../components/layouts/DashboardLayout';
// Animación de entrada (fade + slide)
import AnimatedPage from '../../components/AnimatedPage';
// Links del menú lateral del vendedor
import sellerDashboardLinks from '../../data/sellerDashboardLinks';

// --- NUEVOS COMPONENTES ERP ---
import ErpMetricCard from '../../components/dashboard/ErpMetricCard';
import ErpAreaChart from '../../components/dashboard/ErpAreaChart';

// Formato de moneda
import { formatCurrency } from '../../utils/formatters';
// Contextos globales
import { useMetrics } from '../../context/MetricsContext';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
// Funciones de cálculo de métricas
import { getSellerMetrics, getTopProducts } from '../../utils/metricsUtils';

// ===========================================================================
// COMPONENTE PRINCIPAL
// ===========================================================================
/**
 * Componente principal del panel de vendedor.
 * Permite a los vendedores ver sus métricas financieras, administrar su inventario
 * (editar/eliminar productos) y visualizar gráficas de rendimiento.
 *
 * @component
 * @returns {JSX.Element} Vista del Dashboard del Vendedor
 */
export default function SellerDashboard() {

  // ── Contextos ──────────────────────────────────────────────────────────
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const {
    products, orders, bugReports,
    getProductsBySeller, getOrdersBySeller, getBugReportsBySeller,
    updateProduct, deleteProduct, refreshData,
  } = useMetrics();
  const { refreshProducts } = useProducts();

  // ── Filtros de la barra superior (rango de fechas y categoría) ────────
  // Estos valores controlan qué periodo y qué tipo de producto se muestra.
  const [filters, setFilters] = useState({ dateRange: '7d', category: 'all' });

  // ── Estado para editar un producto directamente en la tabla ───────────
  // editingId guarda el ID del producto que se está editando (null = ninguno)
  const [editingId, setEditingId] = useState(null);
  // editForm es una copia temporal del producto para no perder los datos originales
  const [editForm, setEditForm] = useState({});

  // ── Datos del vendedor actual obtenidos de la base de datos ───────────
  // sellerId viene del usuario que inició sesión
  const sellerId = user?.id;

  // Filtramos solo los productos que le pertenecen a este vendedor
  const sellerProducts = getProductsBySeller(sellerId);

  // Filtramos solo los pedidos donde este vendedor fue el que vendió
  const sellerOrders = getOrdersBySeller(sellerId);

  // Filtramos solo los reportes de problemas relacionados con este vendedor
  const sellerBugReports = getBugReportsBySeller(sellerId);

  // ── Cálculo de métricas (totales, promedios, etc.) ─────────────────────
  // getSellerMetrics calcula: ventas totales, número de pedidos, ticket promedio,
  // pedidos completados y pedidos pendientes
  const metrics = getSellerMetrics(sellerId, orders, bugReports);

  // Los 5 productos que más veces aparecen en pedidos de este vendedor
  const topProducts = getTopProducts(sellerOrders, sellerProducts, 5);

  // Cuántos productos tienen menos de 20 metros en inventario (stock bajo)
  const lowStockCount = sellerProducts.filter(p => p.stock < 20).length;

  // ── Cargar datos frescos cuando el vendedor entra a la pantalla ────────
  // Esto llama a la API para traer datos actualizados de la base de datos
  useEffect(() => {
    if (sellerId) refreshData();
  }, [sellerId]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // En un caso real, esto filtraría la data global
  };

  const handleRefresh = () => {
    refreshData();
    showNotification('success', 'Datos sincronizados exitosamente.');
  };

  // ── Datos para la gráfica de ventas de los últimos 7 días ─────────────
  // Buscamos la fecha más reciente entre los pedidos del vendedor.
  // Si no tiene ningún pedido aún, usamos la fecha de hoy como punto de partida.
  const maxDateStr = sellerOrders.reduce((max, o) => {
    return (!max || (o.date && o.date > max)) ? o.date : max;
  }, null);

  // baseDate es el día desde donde contamos hacia atrás 7 días
  const baseDate = maxDateStr ? new Date(maxDateStr + 'T12:00:00') : new Date();

  // Creamos un arreglo con las últimas 7 fechas en formato YYYY-MM-DD
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  // Para cada día buscamos cuánto vendió el vendedor y lo preparamos para la gráfica.
  // La gráfica ErpAreaChart necesita los campos: date, actualSales, targetSales
  const chartData = last7Days.map(date => {
    // Pedidos entregados en ese día exacto
    const dayOrders = sellerOrders.filter(o => o.date && o.date.startsWith(date));
    // Suma total de dinero de esos pedidos
    const daySales = dayOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      // Etiqueta del eje X: "Lun", "Mar", "Mié"...
      date: new Date(date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short' }),
      // Ventas reales del día
      actualSales: daySales,
      // Meta del día: si hay ventas, ponemos un 20% más; si no, una meta base de $50.000
      targetSales: daySales > 0 ? Math.round(daySales * 1.2) : 50000,
    };
  });

  // Datos de tendencia para las mini-gráficas dentro de las tarjetas de métricas
  const salesTrendData  = chartData.map(d => ({ value: d.actualSales || 1000 }));
  const ordersTrendData = chartData.map(d => ({ value: 1 }));

  // ── Handlers de edición inline ─────────────────────────────────────────

  /** Elimina un producto tras confirmación del usuario */
  const deleteItem = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(id);
      showNotification('success', 'Producto eliminado');
    }
  };

  /** Activa el modo de edición para un producto específico */
  const startEditing = (product) => {
    setEditingId(product.id);
    setEditForm({ ...product }); // copia superficial para no mutar
  };

  /** Cancela la edición y limpia el formulario temporal */
  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  /** Guarda los cambios del producto editado */
  const saveChanges = async () => {
    const productId = editingId;
    const updatedForm = { ...editForm };

    // Si se seleccionó una nueva imagen (Base64), subirla al servidor
    if (updatedForm.images?.[0]?.startsWith('data:')) {
      try {
        const res = await fetch(`http://localhost:8081/api/products/${productId}/image`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: updatedForm.images[0] }),
        });
        if (res.ok) {
          const data = await res.json();
          updatedForm.images = [data.url]; // reemplaza Base64 por URL del servidor
        }
      } catch (err) {
        console.error('Error al subir imagen:', err);
      }
    }

    await updateProduct(productId, updatedForm);
    setEditingId(null);
    showNotification('success', 'Producto actualizado correctamente');

    // Refrescar ambos contextos para sincronizar la UI
    refreshData();
    refreshProducts();
  };

  /** Maneja cambios en los inputs del formulario de edición */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      // Convierte price y stock a número, el resto queda como string
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    });
  };

  /** Maneja la selección de una nueva imagen para el producto */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...(editForm.images || [])];
        newImages[0] = reader.result; // data:image/jpeg;base64,...
        setEditForm({ ...editForm, images: newImages });
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Renderizado ────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title="ERP Vendedor"
      links={sellerDashboardLinks}
      subtitle={`Panel de control de ${user?.name || 'Vendedor'}`}
    >
      <AnimatedPage>

        {/* --- BARRA DE FILTROS DINÁMICOS (Enterprise Design) --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mb-6 gap-4">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
                <Filter size={18} />
                <span>Filtros Operativos:</span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                <select 
                    className="bg-gray-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                    <option value="7d">Últimos 7 días</option>
                    <option value="30d">Últimos 30 días</option>
                    <option value="ytd">Año actual</option>
                </select>
                <select 
                    className="bg-gray-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                    <option value="all">Todas las Categorías</option>
                    <option value="algodon">Algodón</option>
                    <option value="seda">Seda</option>
                    <option value="lino">Lino</option>
                </select>
                <button 
                  onClick={handleRefresh}
                  className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg hover:text-primary-600 dark:text-primary-400 transition-colors" 
                  title="Actualizar datos"
                >
                    <RefreshCw size={18} />
                </button>
            </div>
        </div>

        {/* --- MÉTRICAS FINANCIERAS Y STOCK (DATA-DENSE GRID) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ErpMetricCard
                title="Mis Ventas Totales"
                value={formatCurrency(metrics.totalSales)}
                icon={DollarSign}
                trendData={salesTrendData}
                trendValue="+5.2%"
                trendDirection="up"
                colorKey="green"
            />
            <ErpMetricCard
                title="Pedidos Procesados"
                value={metrics.totalOrders}
                icon={ShoppingBag}
                trendData={ordersTrendData}
                trendValue="+2.1%"
                trendDirection="up"
                colorKey="blue"
            />
            <ErpMetricCard
                title="Ticket Promedio"
                value={formatCurrency(metrics.averageTicket)}
                icon={TrendingUp}
                trendValue={metrics.totalOrders > 0 ? "+1.5%" : "0%"}
                trendDirection="neutral"
                colorKey="purple"
            />
            <ErpMetricCard
                title="Estado de Inventario"
                value={`${sellerProducts.length} Items`}
                icon={Package}
                trendValue={lowStockCount > 0 ? `${lowStockCount} Alertas` : "Saludable"}
                trendDirection={lowStockCount > 0 ? "down" : "up"}
                colorKey="orange"
                subtitle="Productos publicados"
            />
        </div>

        {/* --- GRÁFICA DE VENTAS Y TOP PRODUCTOS --- */}
        {/* La gráfica ocupa 2 de 3 columnas; los productos estrella la tercera */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Gráfica de área: muestra ventas reales vs. meta por día */}
            <div className="lg:col-span-2 card p-6 bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800">
                <ErpAreaChart
                    data={chartData}
                    title="Desempeño de Ventas Diarias"
                    subtitle="Evolución de ingresos de tus productos (Últimos 7 días)"
                />
            </div>
            
            {/* Top Productos ocupa 1 columna */}
            <div className="lg:col-span-1 card p-6 bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-[400px]">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">
                        Productos Estrella
                    </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
                    {topProducts.length > 0 ? (
                        <div className="space-y-3">
                            {topProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors bg-gray-50/50 dark:bg-slate-800/30 group"
                                >
                                    <div className="text-lg font-black text-gray-300 dark:text-gray-700 w-6 text-center flex-shrink-0 group-hover:text-primary-500 transition-colors">
                                        {index + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                                            {product.sales} ventas
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                            <Star className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-2" />
                            <p className="text-sm font-medium text-gray-500">Sin ventas registradas</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- TABLA DE DATOS EMPRESARIALES (INVENTARIO) --- */}
        <div className="card bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center bg-gray-50/30 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">
                  Control de Inventario
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Gestión rápida de catálogo y precios
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-xs bg-primary-600 text-white px-4 py-2 hover:bg-primary-700 transition-all rounded-lg font-bold shadow-sm uppercase tracking-wider">
              <Plus className="w-4 h-4" /> Nuevo Producto
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg font-bold tracking-wider">Producto</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Precio</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Stock</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-right rounded-tr-lg font-bold tracking-wider">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                {sellerProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">

                    {/* Columna: Producto */}
                    <td className="px-6 py-4">
                      {editingId === product.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleFormChange}
                            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:border-primary-500 rounded-lg text-gray-900 dark:text-white outline-none px-3 py-1.5 text-sm"
                            placeholder="Nombre del producto"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            name="images"
                            onChange={handleImageChange}
                            className="w-full text-[10px] font-bold file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 dark:file:bg-slate-800 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-slate-700 cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-slate-700">
                            <img
                              src={product.images?.length > 0 ? product.images[0] : '/placeholder.png'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="text-[10px] font-mono text-gray-500 uppercase">
                              ID: {product.id}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Columna: Precio */}
                    <td className="px-6 py-4 font-mono font-medium">
                      {editingId === product.id ? (
                        <input
                          type="number"
                          name="price"
                          value={editForm.price}
                          onChange={handleFormChange}
                          className="w-24 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:border-primary-500 rounded-lg text-gray-900 dark:text-white outline-none px-3 py-1.5 text-sm"
                        />
                      ) : (
                        formatCurrency(product.price)
                      )}
                    </td>

                    {/* Columna: Stock */}
                    <td className="px-6 py-4">
                      {editingId === product.id ? (
                        <input
                          type="number"
                          name="stock"
                          value={editForm.stock}
                          onChange={handleFormChange}
                          className="w-20 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:border-primary-500 rounded-lg text-gray-900 dark:text-white outline-none px-3 py-1.5 text-sm"
                        />
                      ) : (
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          product.stock < 20
                            ? 'bg-rose-50 text-rose-600 border border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        }`}>
                          {product.stock} Mts
                        </span>
                      )}
                    </td>

                    {/* Columna: Categoría */}
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200/50 dark:border-slate-700">
                        {product.category}
                      </span>
                    </td>

                    {/* Columna: Acciones */}
                    <td className="px-6 py-4 text-right">
                      {editingId === product.id ? (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={saveChanges}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 transition-colors"
                            title="Guardar"
                          >
                            <Save size={18} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors"
                            title="Cancelar"
                          >
                            <X size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => startEditing(product)}
                            className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => deleteItem(product.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
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
