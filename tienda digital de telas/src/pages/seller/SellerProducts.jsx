import React, { useState, useEffect } from 'react';
import {
  Package, Edit2, Trash2, Plus, Save, X, Filter, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AnimatedPage from '../../components/AnimatedPage';
import sellerDashboardLinks from '../../data/sellerDashboardLinks';
import { formatCurrency } from '../../utils/formatters';
import { useMetrics } from '../../context/MetricsContext';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getApiUrl } from '../../config';

export default function SellerProducts() {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const {
    products, getProductsBySeller,
    updateProduct, deleteProduct, refreshData,
  } = useMetrics();
  const { refreshProducts } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const sellerId = user?.id;
  const sellerProducts = getProductsBySeller(sellerId);

  const categories = [...new Set(sellerProducts.map(p => p.category).filter(Boolean))];

  const filteredProducts = sellerProducts.filter(p => {
    const matchSearch = !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  useEffect(() => {
    if (sellerId) refreshData();
  }, [sellerId]);

  const deleteItem = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
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

    if (updatedForm.images?.[0]?.startsWith('data:')) {
      try {
        const res = await fetch(getApiUrl(`/api/products/${productId}/image`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: updatedForm.images[0] }),
        });
        if (res.ok) {
          const data = await res.json();
          updatedForm.images = [data.url];
        }
      } catch (err) {
        console.error('Error al subir imagen:', err);
      }
    }

    await updateProduct(productId, updatedForm);
    setEditingId(null);
    showNotification('success', 'Producto actualizado correctamente');
    refreshData();
    refreshProducts();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...(editForm.images || [])];
        newImages[0] = reader.result;
        setEditForm({ ...editForm, images: newImages });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout
      title="Mis Productos"
      links={sellerDashboardLinks}
      subtitle={`Gestión de inventario de ${user?.name || 'Vendedor'}`}
    >
      <AnimatedPage>
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mb-6 gap-4">
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <Filter size={18} />
            <span>Filtros:</span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-gray-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-48"
            />
            <select
              className="bg-gray-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={() => { refreshData(); showNotification('success', 'Datos sincronizados'); }}
              className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg hover:text-primary-600 dark:text-primary-400 transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="card bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center bg-gray-50/30 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">
                  Control de Inventario
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {filteredProducts.length} productos encontrados
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
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
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
                            <div className="font-bold text-gray-900 dark:text-white">{product.name}</div>
                            <div className="text-[10px] font-mono text-gray-500 uppercase">ID: {product.id}</div>
                          </div>
                        </div>
                      )}
                    </td>
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
                          product.stock < 10
                            ? 'bg-rose-50 text-rose-600 border border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                            : product.stock < 20
                            ? 'bg-amber-50 text-amber-600 border border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        }`}>
                          {product.stock} Mts
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200/50 dark:border-slate-700">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === product.id ? (
                        <div className="flex justify-end gap-1">
                          <button onClick={saveChanges} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 transition-colors" title="Guardar">
                            <Save size={18} strokeWidth={2.5} />
                          </button>
                          <button onClick={cancelEditing} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors" title="Cancelar">
                            <X size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button onClick={() => startEditing(product)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10 transition-colors" title="Editar">
                            <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => deleteItem(product.id)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors" title="Eliminar">
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
