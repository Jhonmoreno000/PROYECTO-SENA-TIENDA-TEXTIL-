import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Store, ChevronDown } from 'lucide-react';
import TarjetaProducto from './TarjetaProducto';
import SmartFilter from './SmartFilter';
import { formatCurrency } from '../utilidades/formateadores';

const MOOD_FILTERS = {
    'Gala': (p) => {
        const text = `${p.category || ''} ${p.categoria || ''} ${p.name || ''} ${p.nombre || ''} ${p.description || ''} ${p.descripcion || ''}`.toLowerCase();
        return text.includes('seda') || text.includes('terciopelo') || text.includes('gala') || text.includes('fiesta') || text.includes('brillante');
    },
    'Exterior': (p) => {
        const text = `${p.category || ''} ${p.categoria || ''} ${p.name || ''} ${p.nombre || ''} ${p.description || ''} ${p.descripcion || ''}`.toLowerCase();
        return text.includes('dril') || text.includes('lino') || text.includes('poliester') || text.includes('poliéster') || text.includes('mueble') || text.includes('cortina') || text.includes('tapiceria') || text.includes('tapicería') || text.includes('resistente');
    },
    'Verano': (p) => {
        const text = `${p.category || ''} ${p.categoria || ''} ${p.name || ''} ${p.nombre || ''} ${p.description || ''} ${p.descripcion || ''} ${p.material || ''} ${p.composicion || ''}`.toLowerCase();
        return text.includes('algodon') || text.includes('algodón') || text.includes('lino') || text.includes('fresca') || text.includes('verano') || text.includes('camisa');
    }
};

const PAGE_SIZE = 24;

function ProductGrid({ products, hideSellerFilter = false }) {
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedSeller, setSelectedSeller] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('bestsellers');
    const [priceRange, setPriceRange] = useState([0, 150000]);
    const [moodTheme, setMoodTheme] = useState('bg-transparent');
    const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
    const sentinelRef = useRef(null);

    const sellers = useMemo(() => {
        const map = new Map();
        (products || []).forEach(p => {
            const id = String(p.sellerId || p.idVendedor || '');
            const name = p.storeName || p.nombreTienda || p.sellerName || p.nombreVendedor;
            if (id && name && !map.has(id)) {
                map.set(id, name);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [products]);

    const filteredProducts = useMemo(() => {
        let filtered = products || [];
        if (selectedCategory !== 'Todos') {
            filtered = MOOD_FILTERS[selectedCategory]
                ? filtered.filter(MOOD_FILTERS[selectedCategory])
                : filtered.filter((p) => (p.category || p.categoria) === selectedCategory);
        }
        if (selectedSeller !== 'all') {
            filtered = filtered.filter((p) => String(p.sellerId || p.idVendedor) === selectedSeller);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            filtered = filtered.filter((p) =>
                (p.name || '').toLowerCase().includes(q)
                || (p.material || '').toLowerCase().includes(q)
                || (p.storeName || p.sellerName || '').toLowerCase().includes(q)
                || (p.category || '').toLowerCase().includes(q)
            );
        }
        filtered = filtered.filter((p) => Number(p.price ?? 0) >= priceRange[0] && Number(p.price ?? 0) <= priceRange[1]);

        const effectivePrice = (p) => {
            const base = Number(p.price ?? 0);
            const disc = Number(p.discountPercent ?? p.porcentajeDescuento ?? (p.isOffer ? 15 : 0));
            return disc > 0 ? base * (1 - disc / 100) : base;
        };

        switch (sortBy) {
            case 'price-asc':
                return [...filtered].sort((a, b) => effectivePrice(a) - effectivePrice(b));
            case 'price-desc':
                return [...filtered].sort((a, b) => effectivePrice(b) - effectivePrice(a));
            case 'rating':
                return [...filtered].sort((a, b) => (b.sellerRating || b.rating || 0) - (a.sellerRating || a.rating || 0));
            case 'promotions':
                return [...filtered].sort((a, b) => (b.discountPercent || (b.isOffer ? 15 : 0)) - (a.discountPercent || (a.isOffer ? 15 : 0)));
            case 'name':
                return [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            case 'bestsellers':
            default:
                return [...filtered].sort((a, b) => (b.soldMeters || 0) - (a.soldMeters || 0) || (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }
    }, [products, selectedCategory, selectedSeller, searchQuery, sortBy, priceRange]);

    // Reinicia el límite incremental cuando cambian filtros
    useEffect(() => {
        setVisibleLimit(PAGE_SIZE);
    }, [selectedCategory, selectedSeller, searchQuery, sortBy, priceRange]);

    // Carga automática incremental con IntersectionObserver (cero lag al hacer scroll)
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || visibleLimit >= filteredProducts.length) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setVisibleLimit((prev) => Math.min(prev + PAGE_SIZE, filteredProducts.length));
                }
            },
            { rootMargin: '300px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [visibleLimit, filteredProducts.length]);

    const visibleItems = useMemo(
        () => filteredProducts.slice(0, visibleLimit),
        [filteredProducts, visibleLimit]
    );

    return (
        <div className={`transition-colors duration-700 ease-in-out ${moodTheme} -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 rounded-3xl`}>
            {/* Filtros Marketplace */}
            <div className="mb-8 space-y-5">
                <SmartFilter
                    activeCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    onMoodChange={setMoodTheme}
                />

                <div className="glass-panel rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {/* Búsqueda */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Buscar tela o proveedor
                        </label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Algodón, seda, tienda..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm outline-none focus:border-primary-500"
                            />
                        </div>
                    </div>

                    {/* Filtro por Proveedor / Tienda */}
                    {!hideSellerFilter && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                                <Store className="w-3.5 h-3.5 text-primary-500" /> Proveedor
                            </label>
                            <select
                                value={selectedSeller}
                                onChange={(e) => setSelectedSeller(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm outline-none focus:border-primary-500"
                            >
                                <option value="all">Todos los proveedores ({sellers.length})</option>
                                {sellers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Ordenamiento competitivo */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Ordenar por
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm outline-none focus:border-primary-500"
                        >
                            <option value="bestsellers">Más Vendidos</option>
                            <option value="rating">Mejor Calificación de Proveedor</option>
                            <option value="promotions">En Promoción / Descuento</option>
                            <option value="price-asc">Precio: Menor a Mayor</option>
                            <option value="price-desc">Precio: Mayor a Menor</option>
                            <option value="name">Nombre A-Z</option>
                        </select>
                    </div>

                    {/* Rango de precio */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                            Hasta: {formatCurrency(priceRange[1])} / m
                        </label>
                        <input
                            type="range"
                            min="10000"
                            max="150000"
                            step="5000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([0, parseInt(e.target.value, 10)])}
                            className="w-full accent-primary-600"
                        />
                    </div>
                </div>
            </div>

            {/* Conteo de resultados */}
            <div className="mb-5 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                    Mostrando <strong className="text-slate-900 dark:text-white">{visibleItems.length}</strong> de{' '}
                    <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> telas disponibles
                </span>
            </div>

            {/* Grid optimizado con content-visibility para 60 FPS */}
            {visibleItems.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {visibleItems.map((product) => (
                            <div key={product.id} className="product-card-opt">
                                <TarjetaProducto product={product} />
                            </div>
                        ))}
                    </div>

                    {visibleLimit < filteredProducts.length && (
                        <div ref={sentinelRef} className="mt-10 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setVisibleLimit((prev) => Math.min(prev + PAGE_SIZE, filteredProducts.length))}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-panel font-bold text-sm text-primary-600 dark:text-primary-400 hover:scale-105 transition-transform"
                            >
                                <ChevronDown className="w-4 h-4" />
                                Cargar más telas ({filteredProducts.length - visibleLimit} restantes)
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="glass-panel rounded-2xl text-center py-12 px-4">
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        No se encontraron telas con los filtros seleccionados
                    </p>
                </div>
            )}
        </div>
    );
}

export default ProductGrid;
