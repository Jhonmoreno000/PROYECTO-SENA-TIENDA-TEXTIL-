import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './Skeleton';
import { useProducts } from '../context/ProductContext';

gsap.registerPlugin(ScrollTrigger);

/**
 * HomeSection — Sección genérica del Home conectada a la base de datos.
 * Muestra los productos marcados por el administrador con el flag de la
 * sección (nuevas colecciones, telas exclusivas u ofertas especiales).
 * El título, subtítulo y visibilidad vienen de la tabla home_sections
 * (editables por el administrador vía API).
 */
function HomeSection({ section, flag, bgClass }) {
    const { products, loading } = useProducts();
    const containerRef = useRef(null);
    const id = section.key;

    const sectionProducts = products.filter(p => p[flag]).slice(0, 6);

    // La última palabra del título se resalta con el degradado del diseño
    const titleParts = (section.title || '').split(' ');
    const gradientWord = titleParts.length > 1 ? titleParts.pop() : '';
    const plainTitle = titleParts.join(' ');

    useGSAP(() => {
        if (sectionProducts.length === 0) return;
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 85%",
                once: true
            }
        });

        tl.fromTo(`.hs-header-${id}`,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }
        );

        tl.fromTo(`.hs-card-${id}`,
            { opacity: 0, y: 40, scale: 0.97 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 0.8, force3D: true, stagger: 0.1, ease: "power3.out"
            },
            "-=0.4"
        );

        tl.fromTo(`.hs-btn-${id}`,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" },
            "-=0.3"
        );
    }, { scope: containerRef, dependencies: [sectionProducts.length, loading] });

    // Apartado oculto por el admin o sin productos: no se muestra
    if (!section.active || (!loading && sectionProducts.length === 0)) return null;

    return (
        <section ref={containerRef} className={`section-container ${bgClass || 'bg-[var(--color-bg-secondary)]'} overflow-hidden`}>
            <div className="text-center mb-12">
                <h2 className={`hs-header-${id} text-3xl md:text-4xl font-display font-bold mb-4 dark:text-white`}>
                    {plainTitle} {gradientWord && <span className="text-gradient">{gradientWord}</span>}
                </h2>
                <p className={`hs-header-${id} text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto`}>
                    {section.subtitle}
                </p>
            </div>

            {loading ? (
                <ProductGridSkeleton count={3} />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                        {sectionProducts.map((product) => (
                            <div key={product.id} className={`hs-card-${id}`}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link
                            to={`/catalogo?seccion=${id}`}
                            className={`hs-btn-${id} btn-primary inline-flex items-center hover:scale-105 active:scale-95 transition-transform`}
                        >
                            Ver Todo en el Catálogo
                        </Link>
                    </div>
                </>
            )}
        </section>
    );
}

export default HomeSection;