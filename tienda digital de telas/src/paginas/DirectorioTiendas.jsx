import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Store, Star, MapPin, Package, ShieldCheck, Search, ArrowRight, Award, Mail } from 'lucide-react';
import Encabezado from '../componentes/Encabezado';
import PieDePagina from '../componentes/PieDePagina';
import PaginaAnimada from '../componentes/PaginaAnimada';
import { getApiUrl } from '../config';

export default function DirectorioTiendas() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(getApiUrl('/api/tiendas'))
            .then(res => res.ok ? res.json() : [])
            .then(data => setStores(Array.isArray(data) ? data : []))
            .catch(() => setStores([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return stores;
        return stores.filter(s =>
            (s.storeName || '').toLowerCase().includes(q)
            || (s.city || '').toLowerCase().includes(q)
            || (s.specialty || '').toLowerCase().includes(q)
            || (s.email || '').toLowerCase().includes(q)
        );
    }, [stores, search]);

    return (
        <div className="min-h-screen flex flex-col">
            <Encabezado />
            <PaginaAnimada className="flex-1">
                <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-accent-600 text-white py-14">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_55%)] pointer-events-none" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3.5 relative z-10">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                            <Store className="w-4 h-4" /> Red Global de Proveedores Textiles
                        </span>
                        <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
                            Tiendas Oficiales y Proveedores
                        </h1>
                        <p className="text-white/90 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                            Compara reputación verificada, especialidad textil, reseñas reales de compradores y catálogos directos de las mejores casas textileras conectadas a nuestra plataforma.
                        </p>
                    </div>
                </section>

                <main className="section-container !pt-8 space-y-8">
                    <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar proveedor por nombre, ciudad, especialidad o correo..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/85 dark:bg-slate-800/85 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            />
                        </div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                            <span>{filtered.length} proveedor{filtered.length === 1 ? '' : 'es'} activos en BD</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
                            <Store className="w-10 h-10 text-slate-400 mx-auto" />
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">No encontramos proveedores con ese criterio</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Prueba buscando otra ciudad o especialidad textil.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((store) => {
                                const hasReviews = Number(store.reviewsCount || 0) > 0;
                                const ratingText = hasReviews ? Number(store.rating).toFixed(1) : 'Nuevo';
                                return (
                                    <article
                                        key={store.sellerId}
                                        className="glass-panel rounded-3xl overflow-hidden flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-200"
                                    >
                                        <div>
                                            {/* Portada con overlay elegante */}
                                            <div className="relative h-36 bg-slate-900 overflow-hidden">
                                                <img
                                                    src={store.coverUrl || '/images/carousel-nueva-coleccion.webp'}
                                                    alt={`Portada de ${store.storeName}`}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-slate-950/20" />

                                                {/* Badge de reputación estilo obsidiana + oro sobre la portada */}
                                                <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-amber-400/35 text-amber-300 text-xs font-bold shadow-md">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    <span>{ratingText}</span>
                                                    {hasReviews && (
                                                        <span className="text-[11px] text-slate-300 font-medium">({store.reviewsCount})</span>
                                                    )}
                                                </div>

                                                {/* Ciudad en esquina inferior derecha de portada */}
                                                <div className="absolute bottom-2.5 right-3 z-10 inline-flex items-center gap-1 text-[11px] font-semibold text-white/95">
                                                    <MapPin className="w-3 h-3 text-primary-400" />
                                                    <span>{store.city}</span>
                                                </div>
                                            </div>

                                            <div className="px-5 pb-4">
                                                {/* Avatar superpuesto solo a la izquierda + insignia de verificación */}
                                                <div className="flex items-end justify-between -mt-9 relative z-10 mb-3">
                                                    <img
                                                        src={store.avatarUrl || '/images/hero-detail-1.webp'}
                                                        alt={store.storeName}
                                                        className="w-16 h-16 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-xl bg-slate-800"
                                                    />
                                                    {store.verified !== false && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/12 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                                                            <ShieldCheck className="w-3.5 h-3.5" /> Verificada
                                                        </span>
                                                    )}
                                                </div>

                                                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    {store.storeName}
                                                </h2>
                                                <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5 line-clamp-1">
                                                    {store.specialty}
                                                </p>

                                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 min-h-[2.25rem] leading-relaxed">
                                                    {store.bio}
                                                </p>

                                                {/* Correo real del vendedor en PostgreSQL */}
                                                {store.email && (
                                                    <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/75 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-700 dark:text-slate-300">
                                                        <Mail className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
                                                        <span className="truncate font-medium">{store.email}</span>
                                                    </div>
                                                )}

                                                {/* Métricas reales de la tienda */}
                                                <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                    <span className="flex items-center gap-1 truncate" title="Ubicación principal">
                                                        <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" /> {store.city}
                                                    </span>
                                                    <span className="flex items-center gap-1 justify-center" title="Telas disponibles">
                                                        <Package className="w-3.5 h-3.5 text-primary-500 shrink-0" /> {store.activeProductsCount || 0} telas
                                                    </span>
                                                    <span className="flex items-center gap-1 justify-end" title="Metraje acumulado vendido">
                                                        <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> {Math.round(store.totalSoldMeters || 0)}m
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-5 pb-5">
                                            <Link
                                                to={`/tienda/${store.sellerId}`}
                                                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition-all active:scale-[0.98]"
                                            >
                                                Entrar a la Tienda <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </main>
            </PaginaAnimada>
            <PieDePagina />
        </div>
    );
}

