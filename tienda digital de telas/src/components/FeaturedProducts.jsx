import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TriangleAlert, RefreshCw } from 'lucide-react';
import ProductCard from './ProductCard';
import { useProducts } from '../context/ProductContext';

gsap.registerPlugin(useGSAP, ScrollTrigger);

function FeaturedProducts() {
    const { products, getFeaturedProducts, loading, error, refreshProducts } = useProducts();
    const containerRef = useRef(null);

    const featuredProducts = (() => {
        const featured = getFeaturedProducts();
        return featured.length > 0 ? featured : products.slice(0, 6);
    })();

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 85%",
                once: true
            }
        });

        // 1. Reveal Header (Reduced blur for performance)
        tl.fromTo('.fp-header', 
            { opacity: 0, y: 30, filter: 'blur(8px)' },
            { 
                opacity: 1, y: 0, filter: 'blur(0px)', 
                duration: 0.8, stagger: 0.1, ease: "power2.out" 
            }
        );

        // 2. Brutal 3D reveal for cards (Optimized with force3D)
        if (featuredProducts.length > 0 && !loading && !error) {
            tl.fromTo('.fp-card',
                { 
                    opacity: 0, 
                    y: 60, 
                    rotationX: -20,
                    scale: 0.95,
                    filter: 'blur(4px)'
                },
                {
                    opacity: 1, 
                    y: 0, 
                    rotationX: 0, 
                    scale: 1, 
                    filter: 'blur(0px)',
                    duration: 1, 
                    force3D: true,
                    stagger: 0.1,
                    ease: "power3.out",
                    onComplete: () => {
                        // 3. Float animation starts AFTER reveal - Optimized
                        gsap.to('.fp-card', {
                            y: "-=8",
                            duration: 2.5,
                            repeat: -1,
                            yoyo: true,
                            ease: "sine.inOut",
                            force3D: true,
                            stagger: {
                                amount: 1.2,
                                repeat: -1,
                                yoyo: true
                            }
                        });
                    }
                },
                "-=0.5"
            );
        }

        // 4. Reveal Button
        tl.fromTo('.fp-btn',
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1, scale: 1, 
                duration: 0.6, ease: "back.out(1.4)"
            },
            "-=0.4"
        );

    }, { scope: containerRef, dependencies: [featuredProducts.length, loading, error] });

    return (
        <section ref={containerRef} className="section-container bg-[var(--color-bg-secondary)] overflow-hidden">
            <div className="text-center mb-12">
                <h2 className="fp-header text-3xl md:text-4xl font-display font-bold mb-4 dark:text-white will-change-transform">
                    Productos <span className="text-gradient">Destacados</span>
                </h2>
                <p className="fp-header text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto will-change-transform">
                    Descubre nuestra selección especial de telas premium para tus proyectos
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <TriangleAlert className="w-14 h-14 text-amber-400" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-center max-w-sm">
                        No se pudo conectar con el servidor. Verifica que el backend esté activo.
                    </p>
                    <button onClick={refreshProducts} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                        <RefreshCw className="w-5 h-5" /> Reintentar
                    </button>
                </div>
            ) : featuredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <p className="text-gray-400 font-medium">No hay productos disponibles aún.</p>
                    <Link to="/catalogo" className="text-primary-600 hover:underline font-bold">Explorar catálogo</Link>
                </div>
            ) : (
                <div className="fp-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                    {featuredProducts.map((product) => (
                        <div key={product.id} className="fp-card will-change-transform">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}

            <div className="fp-btn-container text-center">
                <Link to="/catalogo" className="fp-btn btn-primary inline-flex items-center hover:scale-105 active:scale-95 transition-transform will-change-transform">
                    Ver Catálogo Completo
                </Link>
            </div>
        </section>
    );
}

export default FeaturedProducts;
