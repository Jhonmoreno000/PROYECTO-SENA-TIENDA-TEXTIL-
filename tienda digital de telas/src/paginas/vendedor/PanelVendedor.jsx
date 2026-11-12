/**
 * PanelVendedor.jsx — Panel principal del Vendedor
 * =====================================================
 * Esta es la pantalla de inicio que ve el vendedor cuando entra a su cuenta.
 * Muestra un resumen de sus ventas, sus productos y un gráfico de rendimiento.
 *
 * ¿Qué datos usa?
 *  - useAutenticacion()         → saber quién es el vendedor que inició sesión
 *  - useMetricas()      → traer pedidos, productos y reportes de la base de datos
 *  - useProductos()     → actualizar el catálogo de productos después de cambios
 *  - useNotificacion() → mostrar mensajes de éxito o error en pantalla
 *
 * ¿Qué calcula?
 *  - getSellerMetrics() → ventas totales, cantidad de pedidos, ticket promedio
 *  - getTopProducts()   → los 5 productos que más se han vendido
 *  - formatCurrency()   → convierte números a formato de pesos colombianos
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Íconos de lucide-react usados en todo el panel
import {
 Package,  // Reportes de bugs
 Edit,          // Botón editar producto
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
import LayoutPanel from '../../componentes/layouts/LayoutPanel';
// Animación de entrada (fade + slide)
import PaginaAnimada from '../../componentes/PaginaAnimada';
// Links del menú lateral del vendedor
import enlacesVendedor from '../../datos/enlacesVendedor';

// --- NUEVOS COMPONENTES ERP ---
import ErpMetricCard from '../../componentes/dashboard/ErpMetricCard';
import ErpAreaChart from '../../componentes/dashboard/ErpAreaChart';

// Formato de moneda
import { formatCurrency } from '../../utilidades/formateadores';
// Contextos globales
import { useMetricas } from '../../contextos/ContextoMetricas';
import { useProductos } from '../../contextos/ContextoProducto';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';
import { useNotificacion } from '../../contextos/ContextoNotificacion';
// Funciones de cálculo de métricas
import { getSellerMetrics, getTopProducts } from '../../utilidades/metricsUtils';
import { getApiUrl } from '../../config';

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
export default function PanelVendedor() {

  // ── Contextos ──────────────────────────────────────────────────────────
  const { showNotification } = useNotificacion();
  const { user } = useAutenticacion();
  const {
    products, orders, bugReports,
    getProductsBySeller, getOrdersBySeller, getBugReportsBySeller,
    deleteProduct, refreshData,
  } = useMetricas();
  const { updateProduct, refreshProducts, addProduct } = useProductos();

  // ── Filtros de la barra superior (rango de fechas y categoría) ────────
  // Estos valores controlan qué periodo y qué tipo de producto se muestra.
  const [filters, setFilters] = useState({ dateRange: '7d', category: 'all' });

  // ── Estado para nuevo producto modal ──────────────────────────────────
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'algodon',
    description: '',
    images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&q=80']
  });

  // ── Estado para editar un producto directamente en la tabla ───────────
  // editingId guarda el ID del producto que se está editando (null = ninguno)
  const [editingId, setEditingId] = useState(null);
  // editForm es una copia temporal del producto para no perder los datos originales
  const [editForm, setEditForm] = useState({});

  const location = useLocation();

  // ── Datos del vendedor actual obtenidos de la base de datos ───────────
  // sellerId viene del usuario que inició sesión. Si es administrador inspeccionando
  // o el vendedor aún no tiene productos asociados, usamos ID 2 (Carlos Pérez) para poblar el demo.
  const isElevatedRole = user?.role === 'admin' || user?.rol === 'administrador' || user?.role === 'administrador';
  const directProducts = getProductsBySeller(user?.id);
  const effectiveSellerId = (directProducts.length > 0 || !isElevatedRole) ? user?.id : 2;
  const sellerId = effectiveSellerId;

  // Filtramos solo los productos que le pertenecen a este vendedor
  const sellerProducts = getProductsBySeller(sellerId);

  // Filtramos solo los pedidos donde este vendedor fue el que vendió
  const sellerOrders = getOrdersBySeller(sellerId);

  // Filtramos solo los reportes de problemas relacionados con este vendedor
  const sellerBugReports = getBugReportsBySeller(sellerId);

  // ── Auto-scroll al inventario cuando la ruta es /vendedor/productos ──
  useEffect(() => {
    if (location.pathname === '/vendedor/productos') {
      const el = document.getElementById('inventario-vendedor');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location.pathname]);

  // ── FILTRADO REACTIVO REAL ─────────────────────────────────────────────
  // 1. Filtrado de productos por categoría
  const filteredProducts = sellerProducts.filter(p => {
    if (!filters.category || filters.category === 'all') return true;
    const cat = (p.category || p.categoria || '').toLowerCase();
    return cat.includes(filters.category.toLowerCase());
  });

  // 2. Filtrado de pedidos por rango de fecha
  const filteredOrders = sellerOrders.filter(o => {
    if (!o.date) return true;
    const oDate = new Date(o.date);
    const now = new Date();
    if (filters.dateRange === '7d') {
      const past7 = new Date(); past7.setDate(now.getDate() - 7);
      return oDate >= past7;
    }
    if (filters.dateRange === '30d') {
      const past30 = new Date(); past30.setDate(now.getDate() - 30);
      return oDate >= past30;
    }
    if (filters.dateRange === 'ytd') {
      const startYear = new Date(now.getFullYear(), 0, 1);
      return oDate >= startYear;
    }
    return true;
  });

  // Métricas reactivas calculadas según los filtros activos
  const liveTotalSales = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const liveTotalOrders = filteredOrders.length;
  const liveAverageTicket = liveTotalOrders > 0 ? Math.round(liveTotalSales / liveTotalOrders) : 0;

  // Los 5 productos estrella según los pedidos filtrados
  const topProducts = getTopProducts(filteredOrders, filteredProducts, 5);

  // Cuántos productos tienen menos de 20 metros en inventario (stock bajo)
  const lowStockCount = filteredProducts.filter(p => p.stock < 20).length;

  // ── Cargar datos frescos cuando el vendedor entra a la pantalla ────────
  useEffect(() => {
    if (sellerId) refreshData();
  }, [sellerId]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    refreshData();
    showNotification('success', 'Datos sincronizados exitosamente.');
  };

  // ── Datos para la gráfica según el rango seleccionado ────────────────
  const maxDateStr = filteredOrders.reduce((max, o) => {
    return (!max || (o.date && o.date > max)) ? o.date : max;
  }, null);

  const baseDate = maxDateStr ? new Date(maxDateStr + 'T12:00:00') : new Date();

  // Generamos puntos de la gráfica según el filtro de tiempo
  const chartData = (() => {
    if (filters.dateRange === '30d') {
      // 6 bloques de 5 días
      return [25, 20, 15, 10, 5, 0].map(offset => {
        const dPoint = new Date(baseDate);
        dPoint.setDate(dPoint.getDate() - offset);
        const datePrefix = dPoint.toISOString().split('T')[0];
        const dayOrders = filteredOrders.filter(o => o.date && o.date.startsWith(datePrefix));
        const daySales = dayOrders.reduce((sum, o) => sum + o.total, 0);
        return {
          date: dPoint.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
          actualSales: daySales,
          targetSales: daySales > 0 ? Math.round(daySales * 1.2) : 60000,
        };
      });
    }

    if (filters.dateRange === 'ytd') {
      // Meses transcurridos del año
      const currentMonth = new Date().getMonth();
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return [...Array(currentMonth + 1)].map((_, mIdx) => {
        const monthOrders = filteredOrders.filter(o => {
          if (!o.date) return false;
          const d = new Date(o.date);
          return d.getFullYear() === new Date().getFullYear() && d.getMonth() === mIdx;
        });
        const monthSales = monthOrders.reduce((sum, o) => sum + o.total, 0);
        return {
          date: monthNames[mIdx],
          actualSales: monthSales,
          targetSales: monthSales > 0 ? Math.round(monthSales * 1.2) : 150000,
        };
      });
    }

    // Por defecto: últimos 7 días
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayOrders = filteredOrders.filter(o => o.date && o.date.startsWith(date));
      const daySales = dayOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        date: new Date(date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short' }),
        actualSales: daySales,
        targetSales: daySales > 0 ? Math.round(daySales * 1.2) : 50000,
      };
    });
  })();

  // Datos de tendencia para las mini-gráficas dentro de las tarjetas de métricas
  const salesTrendData  = chartData.map(d => ({ value: d.actualSales || 1000 }));
  const ordersTrendData = chartData.map(d => ({ value: 1 }));

  // ── Handlers de edición inline ─────────────────────────────────────────

  /** Elimina un producto y notifica el resultado */
  const deleteItem = async (id) => {
    const eliminado = await deleteProduct(id);
    if (eliminado) {
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
        const res = await fetch(getApiUrl(`/api/productos/${productId}/imagen`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: updatedForm.images[0],
            imagen: updatedForm.images[0]
          }),
        });
        if (res.ok) {
          const datos = await res.json();
          updatedForm.images = [datos.url]; // reemplaza Base64 por URL del servidor
        }
      } catch (err) {
        console.error('Error al subir imagen:', err);
      }
    }

    await updateProduct({ ...updatedForm, id: productId });
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
        newImages[0] = reader.result; // datos:image/jpeg;base64,...
        setEditForm({ ...editForm, images: newImages });
      };
      reader.readAsDataURL(file);
    }
  };

  /** Maneja cambios en el formulario de creación de producto */
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /** Envía la creación del nuevo producto */
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      showNotification('error', 'Por favor completa nombre, precio y stock.');
      return;
    }
    setIsSubmitting(true);
    try {
      const creado = await addProduct({
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        sellerId: user?.id || 2,
        sellerName: user?.name || user?.nombre || 'Vendedor',
        status: 'approved'
      });
      if (creado) {
        showNotification('success', 'Producto publicado con éxito.');
        setShowNewModal(false);
        setNewProduct({
          name: '',
          price: '',
          stock: '',
          category: 'algodon',
          description: '',
          images: ['https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&q=80']
        });
        refreshData();
        refreshProducts();
      }
    } catch (err) {
      console.error('Error al crear producto:', err);
      showNotification('error', 'Ocurrió un error al crear el producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Renderizado ────────────────────────────────────────────────────────
  return (
    <LayoutPanel
      title="ERP Vendedor"
      links={enlacesVendedor}
      subtitle={`Panel de control de ${user?.name || 'Vendedor'}`}
    >
      <PaginaAnimada>

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
                    <option value="poliester">Poliéster</option>
                    <option value="lana">Lana</option>
                    <option value="viscosa">Viscosa</option>
                </select>
                <button 
                  onClick={handleRefresh}
                  className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg hover:text-primary-600 dark:text-primary-400 transition-colors" 
                  title="Actualizar datos"
                >
                    <RefreshCw size={18} className="text-gray-500 dark:text-gray-400" />
                </button>
            </div>
        </div>

        {/* --- MÉTRICAS FINANCIERAS Y STOCK (DATA-DENSE GRID) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ErpMetricCard
                title="Mis Ventas Totales"
                value={formatCurrency(liveTotalSales)}
                icon={DollarSign}
                trendData={salesTrendData}
                trendValue={filters.dateRange === '7d' ? '7 días' : filters.dateRange === '30d' ? '30 días' : 'Año'}
                trendDirection="up"
                colorKey="green"
            />
            <ErpMetricCard
                title="Pedidos Procesados"
                value={liveTotalOrders}
                icon={ShoppingBag}
                trendData={ordersTrendData}
                trendValue={`${liveTotalOrders} pedidos`}
                trendDirection="up"
                colorKey="blue"
            />
            <ErpMetricCard
                title="Ticket Promedio"
                value={formatCurrency(liveAverageTicket)}
                icon={TrendingUp}
                trendValue={liveTotalOrders > 0 ? "Calculado" : "0%"}
                trendDirection="neutral"
                colorKey="purple"
            />
            <ErpMetricCard
                title="Estado de Inventario"
                value={`${filteredProducts.length} Items`}
                icon={Package}
                trendValue={lowStockCount > 0 ? `${lowStockCount} Alertas` : "Saludable"}
                trendDirection={lowStockCount > 0 ? "down" : "up"}
                colorKey="orange"
                subtitle={filters.category !== 'all' ? `Categoría: ${filters.category}` : "Productos publicados"}
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
                    subtitle={`Evolución de ingresos de tus productos (${filters.dateRange === '7d' ? 'Últimos 7 días' : filters.dateRange === '30d' ? 'Últimos 30 días' : 'Año en curso'})`}
                />
            </div>
            
            {/* Top Productos ocupa 1 columna */}
            <div className="lg:col-span-1 card p-6 bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-[400px]">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
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
                            <p className="text-sm font-medium text-gray-500">Sin ventas en este periodo</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- TABLA DE DATOS EMPRESARIALES (INVENTARIO) --- */}
        <div id="inventario-vendedor" className="card bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center bg-gray-50/30 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">
                    Control de Inventario y Catálogo
                  </h3>
                  {filters.category !== 'all' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 uppercase tracking-widest">
                      {filters.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Gestión rápida de catálogo, telas y precios
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 text-xs bg-primary-600 text-white px-4 py-2 hover:bg-primary-700 transition-all rounded-lg font-bold shadow-sm uppercase tracking-wider"
            >
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
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-primary-500" />
                      <p className="font-bold text-base text-gray-700 dark:text-gray-300">
                        {filters.category !== 'all' ? `No hay productos en la categoría "${filters.category}"` : 'No hay productos en inventario'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        {filters.category !== 'all' 
                          ? 'Prueba cambiando el filtro de categoría o publica una nueva tela.'
                          : 'Aún no has registrado telas en tu catálogo. Haz clic en "Nuevo Producto" para publicar tu primera tela.'
                        }
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-3">
                        {filters.category !== 'all' && (
                          <button
                            onClick={() => handleFilterChange('category', 'all')}
                            className="inline-flex items-center gap-2 text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-wider"
                          >
                            Ver Todas las Categorías
                          </button>
                        )}
                        <button
                          onClick={() => setShowNewModal(true)}
                          className="inline-flex items-center gap-2 text-xs bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition-all uppercase tracking-wider"
                        >
                          <Plus className="w-4 h-4" /> Publicar Producto
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
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
                              src={product.images?.length > 0 ? product.images[0] : '/placeholder.webp'}
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
                            <Edit size={16} strokeWidth={2.5} />
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
                )))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MODAL PARA NUEVO PRODUCTO --- */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">Publicar Nuevo Textil</h3>
                    <p className="text-xs text-gray-500">Agrega un nuevo producto a tu inventario de vendedor</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={newProduct.name}
                    onChange={handleNewProductChange}
                    placeholder="Ej. Seda Italiana Premium"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Precio (COP) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="1"
                      value={newProduct.price}
                      onChange={handleNewProductChange}
                      placeholder="Ej. 45000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Stock (Metros) *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min="1"
                      value={newProduct.stock}
                      onChange={handleNewProductChange}
                      placeholder="Ej. 150"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={newProduct.category}
                    onChange={handleNewProductChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="algodon">Algodón</option>
                    <option value="seda">Seda</option>
                    <option value="lino">Lino</option>
                    <option value="poliester">Poliéster</option>
                    <option value="lana">Lana</option>
                    <option value="viscosa">Viscosa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={newProduct.description}
                    onChange={handleNewProductChange}
                    placeholder="Descripción detallada de la tela, composición y usos recomendados..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors uppercase tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 rounded-xl shadow-md transition-all uppercase tracking-wider disabled:opacity-50"
                  >
                    {isSubmitting ? 'Guardando...' : 'Publicar Textil'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </PaginaAnimada>
    </LayoutPanel>
  );
}
