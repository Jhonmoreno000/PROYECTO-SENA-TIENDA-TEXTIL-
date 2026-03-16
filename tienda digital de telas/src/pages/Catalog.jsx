import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import TruckLoader from '../components/TruckLoader';
import AnimatedPage from '../components/AnimatedPage';

import { useProducts } from '../context/ProductContext';

function Catalog() {
    const { products, loading } = useProducts();
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <AnimatedPage className="flex-1">
                <main>
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
                        {loading ? (
                            <div className="flex justify-center items-center py-24">
                                <TruckLoader
                                    size="large"
                                    text="Cargando catálogo..."
                                />
                            </div>
                        ) : (
                            <ProductGrid products={products} />
                        )}
                    </section>
                </main>
            </AnimatedPage>

            <Footer />
        </div>
    );
}

export default Catalog;
