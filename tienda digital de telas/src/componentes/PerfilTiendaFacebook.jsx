import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Store, MapPin, ShieldCheck, Star, Package, Award, Truck,
    Camera, Edit3, Save, X, Search, MessageSquare, Send, ExternalLink, Mail, Phone, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import TarjetaProducto from './TarjetaProducto';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { useNotificacion } from '../contextos/ContextoNotificacion';
import { getApiUrl } from '../config';
import { formatDate } from '../utilidades/formateadores';

/**
 * PerfilTiendaFacebook — Componente compartido estilo perfil social/tienda oficial.
 * Lo ven tanto los clientes en `/tienda/:id` como el propio vendedor en `/vendedor/mi-tienda`,
 * permitiéndole editar portada, avatar, nombre comercial, bio y políticas en el mismo perfil.
 */
export default function PerfilTiendaFacebook({ sellerId, allowInlineEdit = true }) {
    const { user, isAuthenticated } = useAutenticacion();
    const { showNotification } = useNotificacion();

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('telas'); // 'telas' | 'resenas' | 'info'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    // Estado de edición tipo Facebook (solo disponible para el vendedor propietario)
    const [isEditing, setIsEditing] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [editForm, setEditForm] = useState({});

    // Estado para nueva reseña de cliente hacia el vendedor
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const isOwner = Boolean(
        allowInlineEdit &&
        user?.id &&
        String(user.id) === String(sellerId)
    );
    const rawUserRole = String(user?.role || user?.rol || '').toLowerCase();
    const isClientUser = isAuthenticated && rawUserRole === 'cliente';

    const fetchStoreProfile = useCallback(async () => {
        if (!sellerId) return;
        setLoading(true);
        try {
            const res = await fetch(getApiUrl(`/api/tiendas/${sellerId}`));
            if (res.ok) {
                const data = await res.json();
                const st = data.store || data.tienda;
                setStore(st);
                setProducts(Array.isArray(data.products) ? data.products : []);
                setReviews(Array.isArray(data.reviews) ? data.reviews : []);
                if (st) {
                    setEditForm({
                        storeName: st.storeName || '',
                        bio: st.bio || '',
                        city: st.city || '',
                        country: st.country || 'Colombia',
                        specialty: st.specialty || '',
                        shippingPolicy: st.shippingPolicy || '',
                        avatarUrl: st.avatarUrl || '',
                        coverUrl: st.coverUrl || ''
                    });
                }
            }
        } catch (err) {
            console.error('Error cargando perfil de tienda:', err);
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    useEffect(() => {
        fetchStoreProfile();
    }, [fetchStoreProfile]);

    const handleImageUpload = (field, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditForm(prev => ({ ...prev, [field]: reader.result }));
            setIsEditing(true);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async (e) => {
        if (e) e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await fetch(getApiUrl('/api/tiendas/mi-perfil'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                const updated = await res.json();
                setStore(updated);
                setIsEditing(false);
                showNotification('success', '¡Perfil de tu tienda actualizado con éxito!');
            } else {
                const err = await res.json().catch(() => ({}));
                showNotification('error', err?.error || 'No se pudo actualizar el perfil de la tienda.');
            }
        } catch {
            showNotification('error', 'Error de conexión al guardar perfil.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewComment.trim()) {
            showNotification('error', 'Escribe tu opinión sobre este proveedor');
            return;
        }
        setSubmittingReview(true);
        try {
            const res = await fetch(getApiUrl(`/api/tiendas/${sellerId}/resenas`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: reviewRating,
                    calificacion: reviewRating,
                    comment: reviewComment.trim(),
                    comentario: reviewComment.trim()
                })
            });
            if (res.ok) {
                showNotification('success', '¡Gracias! Tu reseña hacia este proveedor fue publicada.');
                setReviewComment('');
                fetchStoreProfile();
            } else {
                const err = await res.json().catch(() => ({}));
                showNotification('error', err?.error || 'No se pudo registrar tu reseña.');
            }
        } catch {
            showNotification('error', 'Error de conexión enviando la reseña.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const categories = useMemo(
        () => ['Todas', ...new Set(products.map(p => p.category || p.categoria).filter(Boolean))],
        [products]
    );

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchCat = selectedCategory === 'Todas' || (p.category || p.categoria) === selectedCategory;
            const q = searchTerm.trim().toLowerCase();
            const matchText = !q
                || (p.name || p.nombre || '').toLowerCase().includes(q)
                || (p.material || '').toLowerCase().includes(q);
            return matchCat && matchText;
        });
    }, [products, selectedCategory, searchTerm]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 md:col-span-2" />
                </div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="glass-panel rounded-3xl p-12 text-center">
                <Store className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tienda no encontrada</h2>
                <Link to="/tiendas" className="btn-primary inline-block mt-4">Explorar Proveedores</Link>
            </div>
        );
    }

    const coverPreview = (isEditing && editForm.coverUrl) ? editForm.coverUrl : (store.coverUrl || '/images/carousel-nueva-coleccion.webp');
    const avatarPreview = (isEditing && editForm.avatarUrl) ? editForm.avatarUrl : (store.avatarUrl || '/images/hero-detail-1.webp');
    const realReviewsCount = Number(store.reviewsCount ?? reviews.length ?? 0);
    const hasReviews = realReviewsCount > 0 && Number(store.rating || 0) > 0;
    const formattedRating = hasReviews ? Number(store.rating).toFixed(2) : null;

    return (
        <div className="space-y-8">
            {/* ── ENCABEZADO TIPO FACEBOOK CON GLASSMORFISMO ───────────────── */}
            <div className="glass-panel rounded-3xl overflow-hidden">
                {/* Foto de Portada */}
                <div className="relative h-48 sm:h-64 md:h-72 w-full bg-slate-900 overflow-hidden">
                    <img
                        src={coverPreview}
                        alt={`Portada de ${store.storeName}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

                    {isOwner && (
                        <label className="absolute top-4 right-4 cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-lg transition-all">
                            <Camera className="w-4 h-4 text-primary-400" />
                            Cambiar foto de portada
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload('coverUrl', e.target.files[0])}
                            />
                        </label>
                    )}
                </div>

                {/* Barra de Identidad: solo el avatar sobresale hacia la portada; el texto queda limpio dentro del panel glass */}
                <div className="px-5 sm:px-8 pb-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                            <div className="relative -mt-14 sm:-mt-20 w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl bg-slate-800 shrink-0">
                                <img
                                    src={avatarPreview}
                                    alt={store.storeName}
                                    className="w-full h-full object-cover"
                                />
                                {isOwner && (
                                    <label
                                        className="absolute inset-x-0 bottom-0 py-1.5 bg-black/70 hover:bg-black/85 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer backdrop-blur-sm transition-colors"
                                        title="Cambiar foto de perfil"
                                    >
                                        <Camera className="w-3.5 h-3.5" /> Foto
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload('avatarUrl', e.target.files[0])}
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="pt-1 sm:pt-4 space-y-2">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                                        {store.storeName}
                                    </h1>
                                    {store.verified !== false && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/12 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Proveedor Oficial
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="font-semibold text-primary-600 dark:text-primary-400">{store.specialty}</span>
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                                        {store.city}, {store.country}
                                    </span>
                                    {store.email && (
                                        <a
                                            href={`mailto:${store.email}`}
                                            className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                                        >
                                            <Mail className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                                            <span>{store.email}</span>
                                        </a>
                                    )}
                                    {store.phone && (
                                        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <span>{store.phone}</span>
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-bold">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/12 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 dark:text-amber-400" />
                                        {formattedRating
                                            ? `${formattedRating} (${realReviewsCount} ${realReviewsCount === 1 ? 'reseña' : 'reseñas'})`
                                            : 'Nuevo proveedor (0 reseñas)'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-500/25">
                                        <Package className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                        {products.length} {products.length === 1 ? 'tela activa' : 'telas activas'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/12 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                                        <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        {Math.round(store.totalSoldMeters || 0)} m vendidos
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 lg:pt-4 shrink-0">
                            {isOwner && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                                    >
                                        {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                        {isEditing ? 'Cancelar Edición' : 'Editar Mi Perfil de Tienda'}
                                    </button>
                                    <Link
                                        to={`/tienda/${sellerId}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-primary-500 transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" /> Vista Pública
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Formulario de Edición Inline para el Vendedor */}
                    {isOwner && isEditing && (
                        <form onSubmit={handleSaveProfile} className="mt-6 p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/70 border border-primary-500/30 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                    <Edit3 className="w-4 h-4 text-primary-500" /> Personaliza tu Tienda en el Marketplace
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Nombre Comercial de la Tienda</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.storeName || ''}
                                        onChange={(e) => setEditForm(p => ({ ...p, storeName: e.target.value }))}
                                        className="input-field !py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Ciudad / Sede</label>
                                    <input
                                        type="text"
                                        value={editForm.city || ''}
                                        onChange={(e) => setEditForm(p => ({ ...p, city: e.target.value }))}
                                        className="input-field !py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Especialidad Textil</label>
                                    <input
                                        type="text"
                                        value={editForm.specialty || ''}
                                        onChange={(e) => setEditForm(p => ({ ...p, specialty: e.target.value }))}
                                        className="input-field !py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Presentación / Biografía</label>
                                    <textarea
                                        rows="3"
                                        value={editForm.bio || ''}
                                        onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))}
                                        className="input-field !py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Política de Envíos y Cortes</label>
                                    <textarea
                                        rows="3"
                                        value={editForm.shippingPolicy || ''}
                                        onChange={(e) => setEditForm(p => ({ ...p, shippingPolicy: e.target.value }))}
                                        className="input-field !py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary !py-2 text-xs">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={savingProfile} className="btn-primary !py-2 text-xs inline-flex items-center gap-1.5">
                                    <Save className="w-4 h-4" />
                                    {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Pestañas estilo Facebook */}
                    <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
                        <button
                            type="button"
                            onClick={() => setActiveTab('telas')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'telas'
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            Telas en Venta ({products.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('resenas')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'resenas'
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            Reseñas del Vendedor ({reviews.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('info')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'info'
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            Información y Envíos
                        </button>
                    </div>
                </div>
            </div>

            {/* ── CONTENIDO DE PESTAÑAS ───────────────────────────────────── */}
            {activeTab === 'telas' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Columna lateral tipo muro de Facebook */}
                    <aside className="glass-panel rounded-2xl p-5 space-y-4 lg:sticky lg:top-24">
                        <h2 className="font-bold text-base text-slate-900 dark:text-white">Presentación</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{store.bio}</p>
                        <div className="space-y-2.5 pt-3 border-t border-slate-200/70 dark:border-slate-700/70 text-xs text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                                <span>Ubicación: <strong>{store.city}, {store.country}</strong></span>
                            </div>
                            {store.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-primary-500 shrink-0" />
                                    <span className="truncate">{store.email}</span>
                                </div>
                            )}
                            {store.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>{store.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-primary-500 shrink-0" />
                                <span>{store.shippingPolicy}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>
                                    Reputación: <strong>{formattedRating ? `${formattedRating} / 5.0` : 'Sin calificaciones'}</strong>
                                </span>
                            </div>
                        </div>
                    </aside>

                    {/* Catálogo del vendedor */}
                    <div className="lg:col-span-3 space-y-5">
                        <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="relative flex-1 w-full">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={`Buscar dentro de ${store.storeName}...`}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm outline-none focus:border-primary-500"
                                />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                            selectedCategory === cat
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filteredProducts.map(prod => (
                                    <div key={prod.id} className="product-card-opt">
                                        <TarjetaProducto product={prod} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-panel rounded-2xl p-10 text-center text-slate-500">
                                No hay telas que coincidan con tu búsqueda en esta tienda.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'resenas' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {reviews.length > 0 ? reviews.map((rev) => (
                            <div key={rev.id} className="glass-panel rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-primary-600/15 text-primary-600 font-black flex items-center justify-center text-sm">
                                            {(rev.userName || 'C')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{rev.userName || 'Cliente Verificado'}</p>
                                            <p className="text-[11px] text-slate-400">{rev.createdAt ? formatDate(rev.createdAt) : 'Compra verificada'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`w-4 h-4 ${s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                            </div>
                        )) : (
                            <div className="glass-panel rounded-2xl p-8 text-center text-slate-500">
                                Este proveedor aún no tiene reseñas directas. ¡Sé el primero en calificar su atención!
                            </div>
                        )}
                    </div>

                    <div className="glass-panel rounded-2xl p-6 h-fit">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <MessageSquare className="w-5 h-5 text-primary-500" /> Calificar al Proveedor
                        </h3>
                        {isClientUser && !isOwner ? (
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Tu Calificación</label>
                                    <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewRating(star)}
                                                className="p-1 hover:scale-110 transition-transform"
                                            >
                                                <Star className={`w-6 h-6 ${star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Comentario</label>
                                    <textarea
                                        rows="4"
                                        required
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="¿Qué tal fue la calidad de la tela, cumplimiento y envío de este vendedor?"
                                        className="input-field !py-2.5 text-sm"
                                    />
                                </div>
                                <button type="submit" disabled={submittingReview} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                                    <Send className="w-4 h-4" />
                                    {submittingReview ? 'Publicando...' : 'Publicar Reseña'}
                                </button>
                            </form>
                        ) : isOwner ? (
                            <p className="text-xs text-slate-500">Estas viendo las reseñas recibidas por tu propia tienda.</p>
                        ) : isAuthenticated ? (
                            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                                <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>Solo las cuentas registradas con rol <strong>Cliente</strong> pueden publicar reseñas a los proveedores.</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-slate-600 dark:text-slate-300">Inicia sesión como cliente para dejar tu calificación sobre este proveedor.</p>
                                <Link to="/login" className="btn-primary inline-block text-xs">Iniciar Sesión</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'info' && (
                <div className="glass-panel rounded-2xl p-6 space-y-5">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Información Corporativa, Contacto y Logística</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{store.bio}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Especialidad Principal</p>
                            <p className="font-bold text-slate-900 dark:text-white mt-1">{store.specialty}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Política de Despachos</p>
                            <p className="font-bold text-slate-900 dark:text-white mt-1">{store.shippingPolicy}</p>
                        </div>
                        {store.email && (
                            <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Correo Oficial del Vendedor</p>
                                <a href={`mailto:${store.email}`} className="font-bold text-primary-600 dark:text-primary-400 mt-1 inline-flex items-center gap-1.5 hover:underline">
                                    <Mail className="w-4 h-4" /> {store.email}
                                </a>
                            </div>
                        )}
                        {store.phone && (
                            <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Teléfono de Contacto</p>
                                <p className="font-bold text-slate-900 dark:text-white mt-1 inline-flex items-center gap-1.5">
                                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {store.phone}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

