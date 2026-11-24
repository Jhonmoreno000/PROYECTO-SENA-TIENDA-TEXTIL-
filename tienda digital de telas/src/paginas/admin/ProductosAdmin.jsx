/**
 * ProductosAdmin.jsx — Catálogo de Textiles del Administrador
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
 *  - useProductos() → se conecta al backend Java (/api/productos)
 *    y trae todos los productos que están en la base de datos PostgreSQL
 *  - useNotificacion() → para mostrar mensajes de "Guardado exitosamente" o errores
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
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';

import {
  Package,
  Search,
  Eye,
  X as XIcon,
  Filter,
  Star,
  AlertTriangle,
  Image as ImageIcon,
  ShieldCheck,
  Lock,
  Store,
  CheckCircle2
} from 'lucide-react';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import LayoutPanel from '../../componentes/layouts/LayoutPanel';
import enlacesAdmin from '../../datos/enlacesAdmin';
import { formatCurrency } from '../../utilidades/formateadores';
import { useProductos } from '../../contextos/ContextoProducto';
import { useNotificacion } from '../../contextos/ContextoNotificacion';
import BackButton from '../../componentes/dashboard/BackButton';
import { getApiUrl } from '../../config';

const ETIQUETAS_MODERACION = {
  approved: {
    label: 'Aprobado',
    cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
  },
  changes_requested: {
    label: 'Cambios solicitados',
    cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
  },
  rejected: {
    label: 'Suspendido',
    cls: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
  },
  pending: {
    label: 'Pendiente',
    cls: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
  }
};

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
export default function ProductosAdmin() {
  const { showNotification } = useNotificacion();
  const { products: contextProducts, loading: productsLoading, refreshProducts } = useProductos();

  const [adminProducts,   setAdminProducts]   = useState([]);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [filterCategory,  setFilterCategory]  = useState('all');
  const [editingProduct,  setEditingProduct]  = useState(null);
  const [moderationReason, setModerationReason] = useState('');

  const containerRef = useRef(null);
  const modalRef     = useRef(null);

  const cargarCatalogoAuditoria = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/productos?includeInactive=true'));
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw)) {
          setAdminProducts(raw.map(p => ({
            ...p,
            id: String(p.id),
            name: p.name || p.nombre || '',
            category: p.category || p.categoria || '',
            price: Number(p.price ?? p.precio ?? 0),
            stock: Number(p.stock ?? p.existencias ?? 0),
            images: p.images || p.imagenes || [],
            status: String(p.status ?? p.moderationStatus ?? p.estadoModeracion ?? 'approved').toLowerCase(),
            rejectionReason: p.rejectionReason ?? p.motivoRechazo ?? '',
            storeName: p.storeName || p.nombreTienda || p.sellerName || p.nombreVendedor || 'Proveedor',
            sellerName: p.sellerName || p.nombreVendedor || '',
            discountPercent: Number(p.discountPercent ?? p.porcentajeDescuento ?? 0),
            soldMeters: Number(p.soldMeters ?? p.metrosVendidos ?? 0),
            isNewCollection: Boolean(p.isNewCollection ?? p.esNuevaColeccion),
            isExclusive: Boolean(p.isExclusive ?? p.esExclusivo),
            isOffer: Boolean(p.isOffer ?? p.esOferta ?? p.isSale),
          })));
        }
      }
    } catch {
      // Mantiene productos del contexto si falla consulta extendida
    }
  }, []);

  useEffect(() => {
    cargarCatalogoAuditoria();
  }, [cargarCatalogoAuditoria, contextProducts]);

  const products = adminProducts.length > 0 ? adminProducts : contextProducts;

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
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
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
      { opacity: 0, y: 14, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.28, stagger: 0.025, ease: 'back.out(1.2)', force3D: true, clearProps: 'transform' }
    );
    gsap.fromTo(
      '.product-item',
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.25, stagger: 0.02, ease: 'power3.out', delay: 0.05, force3D: true, clearProps: 'transform' }
    );
  }, { scope: containerRef, dependencies: [productsLoading, filteredProducts.length] });

  useGSAP(() => {
    if (editingProduct && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.98, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: 0.24, ease: 'power3.out', force3D: true, clearProps: 'transform' }
      );
    }
  }, { dependencies: [editingProduct] });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openEditModal = (product) => {
    setEditingProduct(product);
    setModerationReason(product.rejectionReason || '');
  };

  const closeEditModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0, scale: 0.98, y: 12, duration: 0.18, ease: 'power2.in',
        onComplete: () => { setEditingProduct(null); setModerationReason(''); },
      });
    } else {
      setEditingProduct(null);
      setModerationReason('');
    }
  };

  const handleModerateProduct = async (status) => {
    if (!editingProduct) return;
    const motivoLimpio = moderationReason.trim();
    if ((status === 'changes_requested' || status === 'rejected') && !motivoLimpio) {
      showNotification('error', 'Debes escribir una observación real de auditoría para notificar al vendedor.');
      return;
    }

    try {
      const res = await fetch(getApiUrl(`/api/productos/${editingProduct.id}/moderar`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, estado: status, reason: motivoLimpio, motivo: motivoLimpio })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const etiquetaEspanol = data.statusLabel || ETIQUETAS_MODERACION[status]?.label || 'Auditado';
        showNotification(
          'success',
          `Producto marcado como "${etiquetaEspanol}". Alerta enviada automáticamente al vendedor (precios e inventario intactos).`
        );
        closeEditModal();
        await cargarCatalogoAuditoria();
        refreshProducts();
      } else {
        showNotification('error', data?.error || 'No se pudo actualizar el estado de moderación.');
      }
    } catch {
      showNotification('error', 'Error de conexión al moderar producto.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <LayoutPanel links={enlacesAdmin} title="" refreshProducts={refreshProducts}>
      <div ref={containerRef} className="-m-6 p-6 min-h-screen">
        <div className="relative z-10">
          <BackButton />

          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="mb-8 mt-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Auditoría de Catálogo Marketplace
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                {totalProducts} telas publicadas por proveedores externos · Vista de solo lectura y moderación (los precios son protegidos e inalterables por administración).
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Lock className="w-4 h-4 shrink-0" />
              Precios y Descuentos Protegidos (Propiedad del Vendedor)
            </div>
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
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

                const sectionBadges = [
                    { on: product.isNewCollection, label: 'Nueva Colección', cls: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' },
                    { on: product.isExclusive, label: 'Exclusiva', cls: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20' },
                    { on: product.isOffer, label: 'Oferta', cls: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' },
                ].filter(b => b.on);

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
                          {(() => {
                            const modInfo = ETIQUETAS_MODERACION[product.status] || ETIQUETAS_MODERACION.approved;
                            return (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${modInfo.cls}`}>
                                {modInfo.label}
                              </span>
                            );
                          })()}
                          {sectionBadges.map(badge => (
                            <span key={badge.label} className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase border ${badge.cls}`}>
                              {badge.label}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-2">
                          <span>#{String(product.id).padStart(6, '0')}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 font-sans font-bold text-primary-600 dark:text-primary-400">
                            <Store size={12} /> {product.storeName || product.sellerName || 'Proveedor'}
                          </span>
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${stockBadge.bg}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${stockBadge.dot}`} />
                            {stockBadge.label}
                          </span>
                          {product.rejectionReason && (
                            <span className="text-xs text-amber-700 dark:text-amber-300 truncate max-w-md" title={product.rejectionReason}>
                              Obs: {product.rejectionReason}
                            </span>
                          )}
                        </div>
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-colors"
                          title="Auditar Ficha y Notificar al Vendedor"
                        >
                          <Eye size={15} /> Auditar
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

      {/* ── MODAL DE AUDITORÍA SOLO LECTURA + MODERACIÓN ───────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={closeEditModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Lock size={18} />
                  </div>
                  Auditoría (Solo Lectura): {editingProduct.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Proveedor: <strong>{editingProduct.storeName || editingProduct.sellerName || 'Vendedor Externo'}</strong> · Precios bloqueados contra edición administrativa
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon size={22} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <div className="aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    {editingProduct.images?.[0] ? (
                      <img src={editingProduct.images[0]} alt={editingProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Precio Vendedor / m</span>
                    <span className="font-black text-lg text-slate-900 dark:text-white">{formatCurrency(editingProduct.price)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Descuento Activo</span>
                    <span className="font-black text-lg text-primary-600">
                      {Number(editingProduct.discountPercent || 0)}% OFF
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Stock Declarado</span>
                    <span className="font-bold text-slate-900 dark:text-white">{editingProduct.stock} metros</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Metros Vendidos</span>
                    <span className="font-bold text-emerald-600">{Math.round(editingProduct.soldMeters || 0)} m</span>
                  </div>
                  <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                    <p><strong>Categoría:</strong> {editingProduct.category || '—'} · <strong>Material:</strong> {editingProduct.material || '—'}</p>
                    <p><strong>Ancho:</strong> {editingProduct.width || '—'} · <strong>Peso:</strong> {editingProduct.weight || '—'}</p>
                    <p><strong>Exclusiva VIP:</strong> {editingProduct.isExclusive ? 'Sí (solo clientes frecuentes)' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Controles Exclusivos de Moderación Administrativa */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <ShieldCheck className="w-4 h-4" /> Moderación de Cumplimiento (Sin Alterar Precios)
                </div>
                <input
                  type="text"
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="Observación real de auditoría (obligatoria al solicitar cambios o suspender)..."
                  className={`w-full px-4 py-2.5 text-sm ${glassInput}`}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleModerateProduct('approved')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    <CheckCircle2 size={14} /> Aprobar Publicación
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModerateProduct('changes_requested')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                  >
                    <AlertTriangle size={14} /> Solicitar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModerateProduct('rejected')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                  >
                    <XIcon size={14} /> Suspender Producto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutPanel>
  );
}
