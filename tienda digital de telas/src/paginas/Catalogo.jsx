import React, { useRef, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Encabezado from '../componentes/Encabezado';
import PieDePagina from '../componentes/PieDePagina';
import ProductGrid from '../componentes/ProductGrid';
import { CatalogSkeleton } from '../componentes/Skeleton';
import PaginaAnimada from '../componentes/PaginaAnimada';
import { WifiOff, RefreshCw, Sparkles, Crown, Tag, LayoutGrid } from 'lucide-react';

import { useProductos } from '../contextos/ContextoProducto';
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

function Catalogo() {
    const { products, vipEligibility, loading, error, refreshProducts } = useProductos();
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
        fetch(getApiUrl('/api/secciones-inicio'))
            .then(res => res.ok ? res.json() : null)
            .then(datos => {
                if (datos && datos.length > 0) {
                    setSections(datos.map(s => {
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
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, duration: 0.28, ease: "power3.out", force3D: true, clearProps: "transform" }
            );
        }
    }, { scope: headerRef });

    return (
        <div className="min-h-screen flex flex-col">
            <Encabezado />

            <PaginaAnimada className="flex-1">
                <main>
                    {/* Page Encabezado */}
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
                        <section className="section-container !pt-8 !pb-0 space-y-4">
                            {vipEligibility?.esClienteFrecuente && (
                                <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-white/75 to-primary-500/10 dark:from-amber-500/15 dark:via-slate-900/75 dark:to-primary-500/15">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                                            <Crown className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">
                                                ¡Nivel {vipEligibility.nivelVip} Desbloqueado!
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                                Por tus compras frecuentes ({vipEligibility.comprasCompletadas} pedidos · {vipEligibility.metrosAcumulados} m) tienes acceso exclusivo a colecciones privadas de nuestros mejores proveedores.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/catalogo?seccion=exclusivas')}
                                        className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shrink-0 shadow-sm transition-transform active:scale-95"
                                    >
                                        Ver Telas Exclusivas
                                    </button>
                                </div>
                            )}

                            {currentSection?.key === 'exclusivas' && !vipEligibility?.esClienteFrecuente && (
                                <div className="glass-panel rounded-2xl p-6 text-center space-y-2 border-primary-300/40">
                                    <Crown className="w-8 h-8 text-amber-500 mx-auto" />
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                        Sección reservada para Clientes Frecuentes VIP
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                                        Las telas exclusivas se desbloquean automáticamente al completar {vipEligibility?.umbralPedidos || 3} compras o acumular {vipEligibility?.umbralMetros || 50} metros adquiridos en la plataforma.
                                    </p>
                                </div>
                            )}

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
                                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                                currentSection?.key === s.key
                                                    ? 'bg-white/25 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                            }`}>{count}</span>
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
            </PaginaAnimada>

            <PieDePagina />
        </div>
    );
}

export default Catalogo;