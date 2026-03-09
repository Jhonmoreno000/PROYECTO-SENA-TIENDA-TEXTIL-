import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';

import { useProducts } from '../context/ProductContext';

function Catalog() {
    const { products } = useProducts();
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Page Header */}
                <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                                Catálogo de Productos
                            </h1>
                            <p className="text-xl text-white/90 max-w-2xl mx-auto">
                                Explora nuestra amplia selección de telas premium para todos tus proyectos
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Products Section */}
                <section className="section-container">
                    <ProductGrid products={products} />
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Catalog;
