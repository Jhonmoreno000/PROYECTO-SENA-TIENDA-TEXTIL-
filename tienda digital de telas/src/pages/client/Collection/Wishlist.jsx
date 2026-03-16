import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdFavorite, MdShoppingCart, MdNotifications, MdDelete, MdAdd, MdEdit, MdFolder, MdClose, MdEditNote } from 'react-icons/md';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import AnimatedPage from '../../../components/AnimatedPage';
import clientDashboardLinks from '../../../data/clientDashboardLinks';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { formatCurrency } from '../../../utils/formatters';

function Wishlist() {
    const { products, wishlistItems = [], addToWishlist, removeFromWishlist, updateWishlistItem } = useMetrics();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [editingNotes, setEditingNotes] = useState(null);
    const [tempNotes, setTempNotes] = useState('');

    

    // Mock wishlist data for demo
    const mockWishlist = [
        { id: 1, productId: 1, category: 'Cortinas', notes: 'Para el proyecto del living', notifyOnStock: true, addedAt: '2026-01-15' },
        { id: 2, productId: 2, category: 'Vestidos', notes: '', notifyOnStock: false, addedAt: '2026-01-20' },
        { id: 3, productId: 3, category: 'Cortinas', notes: 'Combina con el sofá gris', notifyOnStock: true, addedAt: '2026-01-22' },
        { id: 4, productId: 4, category: 'Muebles', notes: '', notifyOnStock: false, addedAt: '2026-01-25' },
    ];

    const wishlist = wishlistItems.length > 0 ? wishlistItems : mockWishlist;
    const categories = ['all', ...new Set(wishlist.map(w => w.category))];

    const filteredWishlist = selectedCategory === 'all'
        ? wishlist
        : wishlist.filter(w => w.category === selectedCategory);

    const getProductById = (productId) => {
        return products.find(p => p.id === productId) || {
            id: productId,
            name: `Tela Premium #${productId}`,
            price: 45000,
            category: 'Algodón',
            stock: Math.random() > 0.3 ? 50 : 0
        };
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
            <BackButton to="/cliente" label="Volver a Mi Panel" />
            {/* Header with Category Filters */}
            <div className="card shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Muestrario Virtual</h2>
                        <p className="text-gray-500 mt-1">Tus telas favoritas organizadas por proyecto</p>
                    </div>
                    <button
                        onClick={() => setShowAddCategory(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <MdAdd className="w-4 h-4" />
                        Nueva Categoría
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mt-6">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <MdFolder className="w-4 h-4" />
                                {category === 'all' ? 'Todas' : category}
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                    {category === 'all'
                                        ? wishlist.length
                                        : wishlist.filter(w => w.category === category).length
                                    }
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Wishlist Items */}
            {filteredWishlist.length === 0 ? (
                <div className="card shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-12 text-center">
                    <MdFavorite className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Lista vacía
                    </h3>
                    <p className="text-gray-500 mb-4">Aún no has guardado telas en esta categoría</p>
                    <Link
                        to="/catalogo"
                        className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Explorar Catálogo
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWishlist.map(item => {
                        const product = getProductById(item.productId);
                        const isOutOfStock = product.stock === 0;

                        return (
                            <div key={item.id} className="card shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden group">
                                {/* Product Image */}
                                <div className="aspect-square relative flex bg-gray-100 dark:bg-slate-800">
                                    <img
                                        src={product?.images?.[0] || '/placeholder.png'}
                                        alt={product?.name || 'Producto'}
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold">
                                                Agotado
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <span className="px-3 py-1 bg-white/90 dark:bg-slate-800/90 rounded-full text-xs font-medium">
                                            {item.category}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <MdDelete className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Product Info */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">{product.category}</p>
                                        </div>
                                        <p className="text-xl font-bold text-primary-600">
                                            {formatCurrency(product.price)}/m
                                        </p>
                                    </div>

                                    {/* Notes */}
                                    {editingNotes === item.id ? (
                                        <div className="mt-3">
                                            <textarea
                                                value={tempNotes}
                                                onChange={(e) => setTempNotes(e.target.value)}
                                                placeholder="Añade notas sobre esta tela..."
                                                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700"
                                                rows="2"
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleSaveNotes(item.id)}
                                                    className="px-3 py-1 bg-primary-600 text-white rounded text-sm"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={() => setEditingNotes(null)}
                                                    className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm"
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
                                            className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-left w-full group/note"
                                        >
                                            <p className="flex items-center text-gray-600 dark:text-gray-400">
                                                <MdEditNote className="w-4 h-4 mr-1 text-gray-500" /> {item.notes}
                                            </p>
                                            <span className="text-xs text-primary-600 dark:text-primary-400 opacity-0 group-hover/note:opacity-100">
                                                Clic para editar
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingNotes(item.id);
                                                setTempNotes('');
                                            }}
                                            className="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600"
                                        >
                                            <MdEdit className="w-4 h-4" />
                                            Añadir nota
                                        </button>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-4">
                                        {isOutOfStock ? (
                                            <button
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${item.notifyOnStock
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                <MdNotifications className="w-4 h-4" />
                                                {item.notifyOnStock ? 'Te avisaremos' : 'Avisar disponibilidad'}
                                            </button>
                                        ) : (
                                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                                <MdShoppingCart className="w-4 h-4" />
                                                Agregar al Carrito
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-400 mt-3 text-center">
                                        Guardado el {new Date(item.addedAt).toLocaleDateString('es-CO')}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Category Modal */}
            {showAddCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Nueva Categoría</h3>
                            <button
                                onClick={() => setShowAddCategory(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <MdClose className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="text-gray-500 mb-4">
                            Crea una categoría para organizar tus telas por proyecto
                        </p>
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Ej: Cortinas, Vestidos, Tapicería..."
                            className="w-full px-4 py-2 border rounded-lg mb-4 dark:bg-slate-700 dark:border-slate-600"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddCategory}
                                disabled={!newCategory.trim()}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                            >
                                Crear Categoría
                            </button>
                            <button
                                onClick={() => setShowAddCategory(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancelar
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
