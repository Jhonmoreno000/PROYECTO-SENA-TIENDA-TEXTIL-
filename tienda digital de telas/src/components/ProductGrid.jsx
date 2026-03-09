import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

function ProductGrid({ products }) {
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [sortBy, setSortBy] = useState('featured');
    const [priceRange, setPriceRange] = useState([0, 100000]);

    // Obtener categorías únicas
    const categories = useMemo(() => {
        const cats = ['Todos', ...new Set(products.map((p) => p.category))];
        return cats;
    }, [products]);

    // Filtrar y ordenar productos
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Filtrar por categoría
        if (selectedCategory !== 'Todos') {
            filtered = filtered.filter((p) => p.category === selectedCategory);
        }

        // Filtrar por rango de precio
        filtered = filtered.filter(
            (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        // Ordenar
        switch (sortBy) {
            case 'price-asc':
                filtered = [...filtered].sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered = [...filtered].sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'featured':
            default:
                filtered = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                break;
        }

        return filtered;
    }, [products, selectedCategory, sortBy, priceRange]);

    return (
        <div>
            {/* Filters */}
            <div className="mb-8 space-y-6">
                {/* Category Filter */}
                <div>
                    <h3 className="font-bold mb-3">Categorías</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedCategory === category
                                        ? 'bg-primary-600 text-white shadow-lg'
                                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort and Price Range */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Sort */}
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

                    {/* Price Range */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
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
