/**
 * AdminProducts.jsx — Catálogo de Textiles del Administrador
 * ===========================================================
 * Esta pantalla le permite al administrador ver y gestionar todos los
 * productos (telas) que están publicados en la tienda.
 *
 * ¿Qué puede hacer el administrador aquí?
 *  - Ver todos los productos de todos los vendedores en una lista limpia
 *  - Filtrar productos por categoría (Algodón, Seda, Lino, etc.)
 *  - Buscar un producto específico por nombre
 *  - Editar el nombre, precio, stock e imagen de cualquier producto
 *  - Eliminar un producto de la tienda
 *
 * ¿De dónde vienen los datos?
 *  - useProducts() → se conecta al backend Java (http://localhost:8081/api/products)
 *    y trae todos los productos que están en la base de datos PostgreSQL
 *  - useNotification() → para mostrar mensajes de "Guardado exitosamente" o errores
 *
 * Tecnologías usadas:
 *  - GSAP: para las animaciones suaves de entrada de las tarjetas
 *  - useMemo: para que los filtros no calculen todo de nuevo en cada render
 *  - lucide-react: para los íconos del panel (Search, Edit2, Trash2, etc.)
 */

// Herramientas de React que usamos:
// - useState: guardar valores que pueden cambiar (el texto de búsqueda, qué producto se edita)
// - useRef: guardar referencias a elementos HTML para poder animarlos con GSAP
// - useMemo: calcular listas filtradas sin repetir el cálculo innecesariamente
import React, { useState, useRef, useMemo } from 'react';

// Íconos visuales del panel (librería lucide-react)
import {
  Package,        // Ícono de caja (productos)
  Search,         // Lupa para buscar
  Edit2,          // Lápiz para editar
  Trash2,         // Basurero para eliminar
  Save,           // Diskette para guardar
  X as XIcon,     // X para cerrar o indicar "agotado"
  Plus,           // Botón de crear nuevo
  Filter,         // Ícono de filtros
  Star,           // Estrella para "más vendidos"
  AlertTriangle,  // Triángulo de advertencia para stock bajo
  Image as ImageIcon, // Ícono de imagen cuando no hay foto
} from 'lucide-react';

// GSAP: librería de animaciones profesionales
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Componentes compartidos del proyecto
import DashboardLayout from '../../components/layouts/DashboardLayout'; // Marco del panel con el menú lateral
import adminDashboardLinks from '../../data/adminDashboardLinks';       // Links del menú del administrador
import { formatCurrency } from '../../utils/formatters';               // Convierte 25000 → "$25.000"
import { useProducts } from '../../context/ProductContext';            // Trae los productos de la API
import { useNotification } from '../../context/NotificationContext';   // Muestra notificaciones en pantalla
import BackButton from '../../components/dashboard/BackButton';         // Botón "← Volver"

// ── Estilos reutilizables de las tarjetas (fondo blanco con borde sutil) ─────
// Usamos cadenas de texto de clases CSS para no repetirlas en cada elemento
const glassCard = [
  'bg-white dark:bg-slate-800',                       // fondo blanco (modo claro) o gris oscuro (modo oscuro)
  'border border-slate-200 dark:border-slate-700',    // borde gris delgado
  'shadow-sm rounded-2xl',                            // sombra suave y bordes redondeados
].join(' ');

// ── Estilos reutilizables de los campos de formulario ────────────────────────
const glassInput = [
  'bg-slate-50 dark:bg-slate-900',
  'border border-slate-200 dark:border-slate-700',
  'focus:border-indigo-500 rounded-xl',
  'text-slate-900 dark:text-white outline-none',
  'focus:ring-2 focus:ring-indigo-500/20 transition-all',
  'placeholder-slate-400',
].join(' ');

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
export default function AdminProducts() {
  // Función para mostrar notificaciones (ej: "Producto eliminado")
  const { showNotification } = useNotification();

  // Datos de productos:
  // - products: lista de todos los productos de la base de datos
  // - loading: true mientras están cargando (muestra el "skeleton")
  // - deleteProduct / updateProduct: funciones para guardar cambios en la API
  const { products, loading: productsLoading, deleteProduct, updateProduct, refreshProducts } = useProducts();


  // ── Estado local ──────────────────────────────────────────────────────────
  const [searchTerm,      setSearchTerm]      = useState('');
  const [filterCategory,  setFilterCategory]  = useState('all');
  const [editingProduct,  setEditingProduct]  = useState(null);
  const [editForm,        setEditForm]        = useState({});

  const containerRef = useRef(null);
  const modalRef     = useRef(null);

  // ── Categorías únicas (memoizadas) ────────────────────────────────────────
  const categories = useMemo(
    () => [...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  );

  // ── Lista filtrada — DEBE definirse ANTES de cualquier hook que la use ────
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        !searchTerm ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'all' || p.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, filterCategory]);

  // ── KPI helpers ───────────────────────────────────────────────────────────
  const totalProducts = products.length;
  const outOfStock    = products.filter(p => (p.stock ?? 0) <= 0).length;
  const lowStock      = products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 15).length;
  const bestsellers   = products.filter(p => p.salesCount > 50 || p.featured).length;

  // ── Animaciones GSAP (después de todos los cálculos) ─────────────────────
  useGSAP(() => {
    if (productsLoading || filteredProducts.length === 0) return;
    gsap.fromTo(
      '.kpi-card',
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.4)' }
    );
    gsap.fromTo(
      '.product-item',
      { opacity: 0, x: -15 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.2 }
    );
  }, { scope: containerRef, dependencies: [productsLoading, filteredProducts.length] });

  useGSAP(() => {
    if (editingProduct && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.2)' }
      );
    }
  }, { dependencies: [editingProduct] });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name:     product.name,
      price:    product.price,
      stock:    product.stock,
      images:   product.images,
      category: product.category,
    });
  };

  const closeEditModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0, scale: 0.95, y: 20, duration: 0.25,
        onComplete: () => { setEditingProduct(null); setEditForm({}); },
      });
    } else {
      setEditingProduct(null);
      setEditForm({});
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const updatedForm = { ...editForm };

    // Si hay imagen nueva en base64, súbela primero
    if (updatedForm.images?.[0]?.startsWith('data:')) {
      try {
        const res = await fetch(
          `http://localhost:8081/api/products/${editingProduct.id}/image`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: updatedForm.images[0] }),
          }
        );
        if (res.ok) {
          const d = await res.json();
          updatedForm.images = [d.url];
        }
      } catch (err) {
        console.error('Error subiendo imagen:', err);
      }
    }

    await updateProduct({ ...updatedForm, id: editingProduct.id });
    closeEditModal();
    showNotification('success', 'Producto actualizado correctamente');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditForm(prev => ({ ...prev, images: [reader.result] }));
    reader.readAsDataURL(file);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      deleteProduct(id);
      showNotification('success', 'Producto eliminado exitosamente');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout links={adminDashboardLinks} title="" refreshProducts={refreshProducts}>
      <div ref={containerRef} className="-m-6 p-6 min-h-screen">
        <div className="relative z-10">
          <BackButton />

          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="mb-8 mt-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Catálogo de Textiles
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                {totalProducts} productos registrados · Gestión y control del inventario publicado.
              </p>
            </div>
            <button
              onClick={() => showNotification('info', 'Módulo de creación en desarrollo')}
              className="flex items-center gap-2 px-6 py-3 text-sm font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" /> Nuevo Textil
            </button>
          </div>

          {/* ── KPI CARDS ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Productos',  value: totalProducts, icon: Package,       color: 'indigo' },
              { label: 'Destacados',       value: bestsellers,   icon: Star,          color: 'amber'  },
              { label: 'Stock Bajo',       value: lowStock,      icon: AlertTriangle, color: 'orange' },
              { label: 'Agotados',         value: outOfStock,    icon: XIcon,         color: 'rose'   },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className={`kpi-card ${glassCard} p-5 overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300`}
              >
                <div
                  className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-40 transition-transform duration-500 group-hover:scale-150`}
                  style={{ background: `var(--color-${color}-100, #f1f5f9)` }}
                />
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {label}
                  </span>
                  <div className={`p-2 rounded-xl border bg-${color}-50 dark:bg-${color}-500/10 border-${color}-100 dark:border-${color}-500/20 text-${color}-600 dark:text-${color}-400`}>
                    <Icon size={16} />
                  </div>
                </div>
                <p className={`text-4xl font-black text-${color}-600 dark:text-${color}-400 relative z-10`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── FILTROS Y BÚSQUEDA ─────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 shrink-0 px-1">
                <Filter size={14} />
                <span className="text-[11px] font-bold uppercase tracking-widest">Filtrar:</span>
              </div>
              {['all', ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-sm border ${
                    filterCategory === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 text-sm ${glassInput}`}
              />
            </div>
          </div>

          {/* ── LISTA DE PRODUCTOS ─────────────────────────────────────── */}
          <div className="space-y-3">
            {productsLoading ? (
              // Skeleton loader
              [...Array(6)].map((_, i) => (
                <div key={i} className={`${glassCard} h-24 animate-pulse bg-slate-100/50 dark:bg-slate-700/30`} />
              ))
            ) : filteredProducts.length === 0 ? (
              // Estado vacío
              <div className={`${glassCard} flex flex-col items-center justify-center py-24 text-center`}>
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-600">
                  <Package className="w-10 h-10 text-slate-300 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sin resultados</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {searchTerm || filterCategory !== 'all'
                    ? 'Ajusta los filtros de búsqueda.'
                    : 'El backend no está respondiendo o no hay productos registrados.'}
                </p>
                {(searchTerm || filterCategory !== 'all') && (
                  <button
                    onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}
                    className="mt-4 px-5 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map(product => {
                const stock       = product.stock ?? 0;
                const isOutOfStock = stock <= 0;
                const isLowStock   = stock > 0 && stock <= 15;
                const isBestseller = product.salesCount > 50 || product.featured;

                const stockBadge = isOutOfStock
                  ? { bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20', dot: 'bg-rose-500 animate-pulse', label: 'Agotado' }
                  : isLowStock
                  ? { bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', dot: 'bg-amber-500', label: `Stock bajo: ${stock}` }
                  : { bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', dot: 'bg-emerald-500', label: `${stock} mts` };

                return (
                  <div
                    key={String(product.id)}
                    className={`product-item ${glassCard} p-4 sm:p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
                  >
                    {/* Columna izquierda: imagen + detalles */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 relative border border-slate-200 dark:border-slate-600">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={20} className="text-slate-400 dark:text-slate-500" />
                          </div>
                        )}
                        {isBestseller && (
                          <div className="absolute top-0 right-0 bg-amber-500 text-white p-1 rounded-bl-lg">
                            <Star size={9} fill="currentColor" />
                          </div>
                        )}
                      </div>

                      {/* Detalles del producto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
                            {product.name}
                          </h3>
                          {product.category && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase border bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600">
                              {product.category}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-1.5">
                          #{String(product.id).padStart(6, '0')}
                        </p>

                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${stockBadge.bg}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${stockBadge.dot}`} />
                          {stockBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Columna derecha: precio + acciones */}
                    <div className="flex items-center gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-700/60">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
                          Precio / mt
                        </p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">
                          {formatCurrency(product.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-auto sm:ml-0">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-colors"
                          title="Editar Producto"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-colors"
                          title="Eliminar Producto"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL DE EDICIÓN ────────────────────────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={closeEditModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Header modal */}
            <div className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-100 dark:border-slate-700/60">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Edit2 size={18} />
                </div>
                Editar: {editingProduct.name}
              </h2>
              <button
                onClick={closeEditModal}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon size={22} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSave} className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Zona de imagen */}
                <div className="w-full md:w-1/3">
                  <div className="aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 relative group cursor-pointer">
                    {editForm.images?.[0] ? (
                      <img src={editForm.images[0]} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
                        <ImageIcon size={28} />
                        <span className="text-xs font-bold">Sin imagen</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-widest px-4 py-2 bg-white/20 rounded-xl border border-white/30 backdrop-blur-sm">
                        Cambiar
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Campos del formulario */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Nombre del Textil
                    </label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-3 text-sm font-bold ${glassInput}`}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={editForm.category || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-4 py-3 text-sm font-bold ${glassInput}`}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Precio / metro
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                      <input
                        type="number"
                        value={editForm.price || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className={`w-full pl-8 pr-4 py-3 font-black ${glassInput}`}
                        required
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Stock (metros)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editForm.stock ?? ''}
                        onChange={e => setEditForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        className={`w-full pl-4 pr-14 py-3 font-black ${glassInput}`}
                        required
                        min={0}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">
                        mts
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 shadow-md"
                >
                  <Save size={17} /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
