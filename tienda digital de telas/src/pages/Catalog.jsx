import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import TruckLoader from '../components/TruckLoader';
import AnimatedPage from '../components/AnimatedPage';
import { WifiOff, RefreshCw } from 'lucide-react';

import { useProducts } from '../context/ProductContext';

gsap.registerPlugin(useGSAP);

function Catalog() {
    const { products, loading, error, refreshProducts } = useProducts();
    const headerRef = useRef(null);

    useGSAP(() => {
        if (headerRef.current) {
            gsap.fromTo(headerRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            );
        }
    }, { scope: headerRef });

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <AnimatedPage className="flex-1">
                <main>
                    {/* Page Header */}
                    <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div ref={headerRef} className="text-center">
                                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                                    Catálogo de Productos
                                </h1>
                                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                                    Explora nuestra amplia selección de telas premium para todos tus proyectos
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Products Section */}
                    <section className="section-container">
                        {loading ? (
                            <div className="flex justify-center items-center py-24">
                                <TruckLoader size="large" text="Cargando catálogo..." />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center border border-orange-200 dark:border-orange-500/20">
                                    <WifiOff className="w-10 h-10 text-primary-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                        No se puede cargar el catálogo
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                                        {error}
                                    </p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                        Asegúrate de que el servidor backend esté corriendo en el puerto <span className="font-mono font-bold">8081</span>.
                                    </p>
                                </div>
                                <button
                                    onClick={refreshProducts}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Reintentar Conexión
                                </button>
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