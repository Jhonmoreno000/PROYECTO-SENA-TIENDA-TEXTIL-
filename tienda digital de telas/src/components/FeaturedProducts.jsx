import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

import { useProducts } from '../context/ProductContext';

function FeaturedProducts() {
    const { getFeaturedProducts } = useProducts();
    const featuredProducts = getFeaturedProducts();

    return (
        <section className="section-container bg-[var(--color-bg-secondary)]">
            <div className="text-center mb-12">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-display font-bold mb-4"
                >
                    Productos <span className="text-gradient">Destacados</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto"
                >
                    Descubre nuestra selección especial de telas premium para tus proyectos
                </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                {featuredProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
            >
                <Link to="/catalogo" className="btn-primary inline-flex items-center">
                    Ver Catálogo Completo
                </Link>
            </motion.div>
        </section>
    );
}

export default FeaturedProducts;
