import React, { useState, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ProductCard from './ProductCard';
import SmartFilter from './SmartFilter';

gsap.registerPlugin(useGSAP);

function ProductGrid({ products }) {
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [moodTheme, setMoodTheme] = useState('bg-transparent');
    const gridRef = useRef(null);

    const categories = useMemo(() => {
        return ['Todos', ...new Set(products.map((p) => p.category))];
    }, [products]);

    const filteredProducts = useMemo(() => {
        let filtered = products;
        if (selectedCategory !== 'Todos') {
            filtered = filtered.filter((p) => p.category === selectedCategory);
        }
        filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
        switch (sortBy) {
            case 'price-asc': filtered = [...filtered].sort((a, b) => a.price - b.price); break;
            case 'price-desc': filtered = [...filtered].sort((a, b) => b.price - a.price); break;
            case 'name': filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'featured': default: filtered = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
        }
        return filtered;
    }, [products, selectedCategory, sortBy, priceRange]);

    // Stagger animation for product cards
    useGSAP(() => {
        if (gridRef.current) {
            const cards = gridRef.current.querySelectorAll('.product-card-wrapper');
            gsap.fromTo(cards,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
            );
        }
    }, { scope: gridRef, dependencies: [filteredProducts] });

    return (
        <div className={`transition-colors duration-1000 ease-in-out ${moodTheme} -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 rounded-3xl`}>
            {/* Filters */}
            <div className="mb-8 space-y-6">
                <SmartFilter 
                    activeCategory={selectedCategory} 
                    onCategoryChange={setSelectedCategory} 
                    onMoodChange={setMoodTheme} 
                />

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block font-bold mb-2">Ordenar por</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-primary-500 outline-none"
                        >
                            <option value="featured">Destacados</option>
                            <option value="price-asc">Precio: Menor a Mayor</option>
                            <option value="price-desc">Precio: Mayor a Menor</option>
                            <option value="name">Nombre A-Z</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block font-bold mb-2">
                            Rango de precio: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100000"
                            step="5000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-6 text-gray-600 dark:text-gray-400">
                Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="product-card-wrapper">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        No se encontraron productos con los filtros seleccionados
                    </p>
                </div>
            )}
        </div>
    );
}

export default ProductGrid;
