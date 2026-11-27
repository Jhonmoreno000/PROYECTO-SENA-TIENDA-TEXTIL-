import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Scissors, Search, RefreshCw, WifiOff, LayoutGrid, Tag, ArrowRight } from 'lucide-react';
import Encabezado from '../componentes/Encabezado';
import PieDePagina from '../componentes/PieDePagina';
import PaginaAnimada from '../componentes/PaginaAnimada';
import TarjetaRetazo from '../componentes/TarjetaRetazo';
import { CatalogSkeleton } from '../componentes/Skeleton';
import { getApiUrl } from '../config';

gsap.registerPlugin(useGSAP);

const DEMO_RETAZOS = [
    {
        id: 901,
        remnantCode: 'RET-ROL-101',
        productId: 1,
        name: 'Lino Belga Natural',
        category: 'Lino',
        material: '100% Lino Europeo',
        image: '/images/hero-detail-1.webp',
        lengthMeters: 0.85,
        widthMeters: 1.50,
        originalPrice: 38250,
        price: 22950,
        discountPercent: 40,
        status: 'DISPONIBLE',
        dyeLot: 'LT-2026-01',
        notes: 'Remanente de corte limpio de rollo maestro, ideal para blusas, cojines o detalles de sastrería.',
    },
    {
        id: 902,
        remnantCode: 'RET-ROL-104',
        productId: 2,
        name: 'Seda Italiana Marfil',
        category: 'Seda',
        material: '100% Seda Natural',
        image: '/images/hero-detail-2.webp',
        lengthMeters: 0.70,
        widthMeters: 1.45,
        originalPrice: 52500,
        price: 31500,
        discountPercent: 40,
        status: 'DISPONIBLE',
        dyeLot: 'LT-2026-04',
        notes: 'Pieza única con caída fluida y brillo satinado, lista para pañoletas o forrería fina.',
    },
    {
        id: 903,
        remnantCode: 'RET-ROL-109',
        productId: 3,
        name: 'Algodón Egipcio Peinado',
        category: 'Algodon',
        material: '100% Algodón Egipcio',
        image: '/images/hero-detail-3.webp',
        lengthMeters: 0.65,
        widthMeters: 1.50,
        originalPrice: 24700,
        price: 14820,
        discountPercent: 40,
        status: 'DISPONIBLE',
        dyeLot: 'LT-2026-09',
        notes: 'Sobrante de lote verificado con tacto suave y alta densidad de hilo.',
    },
    {
        id: 904,
        remnantCode: 'RET-ROL-112',
        productId: 4,
        name: 'Terciopelo Esmeralda Premium',
        category: 'Terciopelo',
        material: 'Poliéster / Elastano',
        image: '/images/carousel-telas-exclusivas.webp',
        lengthMeters: 0.90,
        widthMeters: 1.50,
        originalPrice: 46800,
        price: 28080,
        discountPercent: 40,
        status: 'DISPONIBLE',
        dyeLot: 'LT-2026-12',
        notes: 'Último tramo del rollo en tono uniforme, ideal para tapicería decorativa o accesorios.',
    },
];

function Retazos() {
    const [retazos, setRetazos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [searchTerm, setSearchTerm] = useState('');
    const headerRef = useRef(null);

    const cargarRetazos = async () => {
        setLoading(true);
        setError(null);
        setIsDemoMode(false);
        try {
            const res = await fetch(getApiUrl('/api/retazos'));
            if (!res.ok) {
                throw new Error('No se pudo obtener la lista de retazos disponibles.');
            }
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setRetazos(data);
            } else {
                setRetazos(DEMO_RETAZOS);
                setIsDemoMode(true);
            }
        } catch {
            setRetazos(DEMO_RETAZOS);
            setIsDemoMode(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarRetazos();
    }, []);

    useGSAP(() => {
        if (headerRef.current) {
            gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, duration: 0.28, ease: 'power3.out', force3D: true, clearProps: 'transform' }
            );
        }
    }, { scope: headerRef });

    const categories = useMemo(() => {
        const set = new Set(retazos.map((r) => r.category || r.categoria || 'General'));
        return ['Todas', ...Array.from(set)];
    }, [retazos]);

    const filteredRetazos = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return retazos.filter((r) => {
            const cat = r.category || r.categoria || 'General';
            const matchesCat = selectedCategory === 'Todas' || cat === selectedCategory;
            const matchesQuery =
                !q ||
                String(r.name || r.nombreProducto || '').toLowerCase().includes(q) ||
                String(r.remnantCode || r.codigoRetazo || '').toLowerCase().includes(q) ||
                String(r.material || '').toLowerCase().includes(q);
            return matchesCat && matchesQuery;
        });
    }, [retazos, selectedCategory, searchTerm]);

    return (
        <div className="min-h-screen flex flex-col">
            <Encabezado />

            <PaginaAnimada className="flex-1">
                <main>
                    {/* Hero con exactamente la misma estética de Catalogo.jsx */}
                    <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div ref={headerRef} className="text-center">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 border border-white/25 backdrop-blur-md mb-4">
                                    <Tag className="w-3.5 h-3.5" /> Hasta 40% OFF • Piezas Únicas
                                </span>
                                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 inline-flex items-center gap-3 justify-center w-full">
                                    <Scissors className="w-8 h-8 md:w-10 md:h-10" />
                                    Outlet de Retazos
                                </h1>
                                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                                    Sobrantes de rollo menores a 1 metro con dimensiones fijas, trazabilidad de lote y precio cerrado de liquidación.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Filtros de categoría y búsqueda */}
                    {!loading && !error && (
                        <section className="section-container !pt-8 !pb-0 space-y-5">
                            <div className="flex flex-wrap items-center justify-center gap-2.5">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all hover:scale-105 active:scale-95 ${
                                            selectedCategory === cat
                                                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary-300'
                                        }`}
                                    >
                                        {cat === 'Todas' && <LayoutGrid className="w-4 h-4" />}
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="max-w-md mx-auto relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por tela, material o código de retazo..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500"
                                />
                            </div>
                        </section>
                    )}

                    {/* Grilla de retazos */}
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
                                        No se pudieron cargar los retazos
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md">{error}</p>
                                </div>
                                <button
                                    onClick={cargarRetazos}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Reintentar
                                </button>
                            </div>
                        ) : filteredRetazos.length === 0 ? (
                            <div className="text-center py-20 max-w-md mx-auto">
                                <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                                    <Scissors className="w-10 h-10 text-primary-500" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">No hay retazos disponibles ahora</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                                    Los retazos son piezas únicas que se generan automáticamente cuando un rollo queda por debajo de 1 metro. Explora mientras tanto nuestro catálogo por metraje.
                                </p>
                                <Link to="/catalogo" className="btn-primary inline-flex items-center gap-2">
                                    Ver Catálogo por Metro
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredRetazos.map((retazo) => (
                                    <TarjetaRetazo key={retazo.id} retazo={retazo} />
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </PaginaAnimada>

            <PieDePagina />
        </div>
    );
}

export default Retazos;
