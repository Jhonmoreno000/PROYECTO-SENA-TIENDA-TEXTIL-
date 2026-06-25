/**
 * Wishlist.jsx — Panel de "Mi Lista de Deseos" / Muestrario virtual (Client)
 *
 * Interfaz para guardar y organizar telas por categorías personalizadas.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Importación de íconos desde lucide-react
import { 
    Heart,          
    ShoppingCart,   
    Bell,           
    Trash2,         
    Plus,           
    Edit2,          
    Folder,         
    X,              
    Edit3,
    ArrowRight
} from 'lucide-react';

import DashboardLayout from '../../../components/layouts/DashboardLayout';
import AnimatedPage from '../../../components/AnimatedPage';
import clientDashboardLinks from '../../../data/clientDashboardLinks';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { useProducts } from '../../../context/ProductContext';
import { formatCurrency } from '../../../utils/formatters';

function Wishlist() {
    const { wishlistItems = [], addToWishlist, removeFromWishlist, updateWishlistItem } = useMetrics();
    const { products } = useProducts();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [editingNotes, setEditingNotes] = useState(null);
    const [tempNotes, setTempNotes] = useState('');

    // Si no hay ítems reales en wishlist, generamos una demo usando productos reales del catálogo
    const mockWishlist = products.slice(0, 4).map((p, i) => ({
        id: i + 1,
        productId: p.id,
        category: p.category || 'General',
        notes: '',
        notifyOnStock: false,
        addedAt: '2026-01-15'
    }));

    const wishlist = wishlistItems.length > 0 ? wishlistItems : mockWishlist;
    const categories = ['all', ...new Set(wishlist.map(w => w.category))];

    const filteredWishlist = selectedCategory === 'all'
        ? wishlist
        : wishlist.filter(w => w.category === selectedCategory);

    const getProductById = (productId) => {
        return products.find(p => String(p.id) === String(productId)) || null;
    };

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            // In real app, save to context
            setShowAddCategory(false);
            setNewCategory('');
        }
    };

    const handleSaveNotes = (itemId) => {
        // In real app, update via context
        setEditingNotes(null);
        setTempNotes('');
    };

    const handleRemoveItem = (itemId) => {
        if (confirm('¿Eliminar esta tela de tu lista de deseos?')) {
            // removeFromWishlist(itemId);
        }
    };

    return (
        <DashboardLayout title="Mi Lista de Deseos" links={clientDashboardLinks}>
            <AnimatedPage>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <BackButton to="/cliente" label="Volver a Mi Panel" />
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4 tracking-tight flex items-center gap-3">
                            Muestrario Virtual
                            <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                Favoritos
                            </span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                            Tus telas guardadas y organizadas por proyecto.
                        </p>
                    </div>
                </div>

                {/* ================================================================
                    FILTROS Y CATEGORÍAS
                ================================================================ */}
                <div className="card p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                                    selectedCategory === category
                                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 -translate-y-0.5'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                            >
                                <Folder className={`w-4 h-4 ${selectedCategory === category ? 'text-rose-200' : 'text-slate-400'}`} />
                                {category === 'all' ? 'Todas las Telas' : category}
                                <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                                    selectedCategory === category
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}>
                                    {category === 'all'
                                        ? wishlist.length
                                        : wishlist.filter(w => w.category === category).length
                                    }
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowAddCategory(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-400 dark:hover:border-slate-500 transition-colors font-bold text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Categoría
                    </button>
                </div>

                {/* ================================================================
                    GRID DE PRODUCTOS
                ================================================================ */}
                {filteredWishlist.length === 0 ? (
                    <div className="card p-16 text-center border-dashed border-2 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-rose-300 dark:text-rose-800/50" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Aún no hay telas aquí
                        </h3>
                        <p className="text-gray-500 font-medium mb-6">
                            Explora el catálogo y guarda tus telas favoritas para organizar tu próximo proyecto.
                        </p>
                        <Link
                            to="/catalogo"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Explorar Catálogo <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredWishlist.map(item => {
                            const product = getProductById(item.productId);
                            if (!product) return null;
                            const isOutOfStock = (product.stock ?? 1) === 0;

                            return (
                                <div key={item.id} className="card overflow-hidden group hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 flex flex-col">
                                    {/* Imagen */}
                                    <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                        <img
                                            src={product?.images?.[0] || '/placeholder.png'}
                                            alt={product?.name || 'Producto'}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center">
                                                <span className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold shadow-lg shadow-rose-500/30">
                                                    Agotado
                                                </span>
                                            </div>
                                        )}

                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                                                {item.category}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="absolute top-4 right-4 p-2.5 bg-white/90 dark:bg-slate-900/90 text-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-600 hover:text-white shadow-lg translate-y-2 group-hover:translate-y-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Contenido */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-4 gap-4">
                                            <div>
                                                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm font-medium text-gray-500 mt-1">{product.category}</p>
                                            </div>
                                            <p className="text-lg font-black text-rose-600 dark:text-rose-400">
                                                {formatCurrency(product.price)}
                                            </p>
                                        </div>

                                        {/* Notas */}
                                        <div className="mb-4 flex-1">
                                            {editingNotes === item.id ? (
                                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <textarea
                                                        value={tempNotes}
                                                        onChange={(e) => setTempNotes(e.target.value)}
                                                        placeholder="Escribe tus ideas o medidas para esta tela..."
                                                        className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none resize-none"
                                                        rows="3"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                        <button
                                                            onClick={() => handleSaveNotes(item.id)}
                                                            className="flex-1 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingNotes(null)}
                                                            className="flex-1 py-1.5 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : item.notes ? (
                                                <button
                                                    onClick={() => {
                                                        setEditingNotes(item.id);
                                                        setTempNotes(item.notes);
                                                    }}
                                                    className="w-full text-left bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 transition-colors group/note"
                                                >
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium italic">
                                                        "{item.notes}"
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 opacity-0 group-hover/note:opacity-100 transition-opacity">
                                                        <Edit3 className="w-3 h-3" /> Editar nota
                                                    </div>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingNotes(item.id);
                                                        setTempNotes('');
                                                    }}
                                                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors py-2"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Añadir nota de proyecto
                                                </button>
                                            )}
                                        </div>

                                        {/* Botones */}
                                        <div className="mt-auto">
                                            {isOutOfStock ? (
                                                <button
                                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${item.notifyOnStock
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                                        }`}
                                                >
                                                    <Bell className="w-4 h-4" />
                                                    {item.notifyOnStock ? 'Notificación activada' : 'Avisar disponibilidad'}
                                                </button>
                                            ) : (
                                                <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg shadow-gray-900/10 dark:shadow-white/10">
                                                    <ShoppingCart className="w-4 h-4" />
                                                    Agregar al Carrito
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ================================================================
                    MODAL NUEVA CATEGORÍA
                ================================================================ */}
                {showAddCategory && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 transform transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                        <Folder className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Nueva Categoría</h3>
                                </div>
                                <button
                                    onClick={() => setShowAddCategory(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-slate-500 font-medium mb-6">
                                Crea una nueva categoría para organizar tus telas (ej. Vestido de novia, Cortinas sala).
                            </p>
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Nombre del proyecto..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 font-medium"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddCategory(false)}
                                    className="flex-1 py-3 bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddCategory}
                                    disabled={!newCategory.trim()}
                                    className="flex-1 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors shadow-lg shadow-rose-500/30"
                                >
                                    Crear
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default Wishlist;
