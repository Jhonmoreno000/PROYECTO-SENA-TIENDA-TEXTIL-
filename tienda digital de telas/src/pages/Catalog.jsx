import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { CatalogSkeleton } from '../components/Skeleton';
import AnimatedPage from '../components/AnimatedPage';
import { WifiOff, RefreshCw, Sparkles, Crown, Tag, LayoutGrid } from 'lucide-react';

import { useProducts } from '../context/ProductContext';
import { getApiUrl } from '../config';

gsap.registerPlugin(useGSAP);

// Flags de productos que alimentan cada apartado
const SECTION_FLAGS = { nuevas: 'isNewCollection', exclusivas: 'isExclusive', ofertas: 'isOffer' };
// Apartados por defecto si el backend no responde
const DEFAULT_SECTIONS = [
    { key: 'nuevas', title: 'Nuevas Colecciones', subtitle: 'Las telas más recientes que llegan a la tienda', icon: Sparkles },
    { key: 'exclusivas', title: 'Telas Exclusivas', subtitle: 'Diseños únicos para tus proyectos especiales', icon: Crown },
    { key: 'ofertas', title: 'Ofertas Especiales', subtitle: 'Precios especiales en telas seleccionadas', icon: Tag },
];

function Catalog() {
    const { products, loading, error, refreshProducts } = useProducts();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [sections, setSections] = useState(DEFAULT_SECTIONS);
    const headerRef = useRef(null);

    const seccion = searchParams.get('seccion');
    const currentSection = sections.find(s => s.key === seccion) || null;
    const SectionIcon = currentSection?.icon || null;

    const visibleProducts = currentSection
        ? products.filter(p => p[SECTION_FLAGS[currentSection.key]])
        : products;

    // Carga los apartados editados por el admin desde la base de datos
    useEffect(() => {
        fetch(getApiUrl('/api/home-sections'))
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.length > 0) {
                    setSections(data.map(s => {
                        const icon = DEFAULT_SECTIONS.find(d => d.key === s.key)?.icon || Sparkles;
                        return { ...s, icon };
                    }));
                }
            })
            .catch(() => {
                // Si el backend no responde se mantienen los apartados por defecto
            });
    }, []);

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
                                    {currentSection ? (
                                        <span className="inline-flex items-center gap-3 justify-center">
                                            {SectionIcon && <SectionIcon className="w-8 h-8 md:w-10 md:h-10" />}
                                            {currentSection.title}
                                        </span>
                                    ) : 'Catálogo de Productos'}
                                </h1>
                                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                                    {currentSection ? currentSection.subtitle : 'Explora nuestra amplia selección de telas premium para todos tus proyectos'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Apartados de la tienda: chips de navegación */}
                    {!loading && (
                        <section className="section-container !pt-8 !pb-0">
                            <div className="flex flex-wrap items-center justify-center gap-2.5">
                                <button
                                    onClick={() => navigate('/catalogo')}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all hover:scale-105 active:scale-95 ${!currentSection
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}
                                >
                                    <LayoutGrid className="w-4 h-4" /> Todos
                                </button>
                                {sections.filter(s => s.active).map(s => {
                                    const Icon = s.icon;
                                    const count = products.filter(p => p[SECTION_FLAGS[s.key]]).length;
                                    if (count === 0) return null;
                                    return (
                                        <button
                                            key={s.key}
                                            onClick={() => navigate(`/catalogo?seccion=${s.key}`)}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all hover:scale-105 active:scale-95 ${currentSection?.key === s.key
                                                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}
                                        >
                                            <Icon className="w-4 h-4" /> {s.title}
                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/20 text-white">{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Products Section */}
                    <section className="section-container">
                        {loading ? (
                            <CatalogSkeleton />
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
                            <ProductGrid products={visibleProducts} />
                        )}
                    </section>
                </main>
            </AnimatedPage>

            <Footer />
        </div>
    );
}

export default Catalog;