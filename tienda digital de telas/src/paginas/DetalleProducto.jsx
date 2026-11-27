/**
 * DetalleProducto.jsx — Página de Detalle de Producto
 * ===================================================
 * Esta pantalla muestra toda la información de un producto específico:
 * imágenes, precio, especificaciones técnicas, instrucciones de cuidado
 * y los controles para comprarlo o agregarlo al carrito.
 *
 * ¿Cómo sabe qué producto mostrar?
 *  La URL incluye el ID del producto (Ej: /producto/42).
 *  Usamos useParams() para leer ese ID y luego buscamos el producto en el contexto.
 *
 * ¿Qué animaciones tiene?
 *  - La columna izquierda (imágenes) entra deslizando desde la izquierda
 *  - La columna derecha (información) entra deslizando desde la derecha
 *  - El mensaje "¡Producto agregado!" aparece con una animación suave
 *
 * Dependencias:
 *  - ImageGallery:      muestra las fotos del producto con zoom
 *  - QuantitySelector:  control de cantidad (+ / -)
 *  - TarjetaProducto:       tarjetas de productos relacionados al final de la página
 */

import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, ShoppingCart, Heart, Share2, Check, AlertTriangle, Info, Ruler, Layers, Weight, Droplets, Package, Store, Star, ShieldCheck, Award, ArrowRight, Lock, Crown, Tag } from 'lucide-react';
import Encabezado from '../componentes/Encabezado';
import PieDePagina from '../componentes/PieDePagina';
import PaginaAnimada from '../componentes/PaginaAnimada';
import ImageGallery from '../componentes/ImageGallery';
import QuantitySelector from '../componentes/QuantitySelector';
import TarjetaProducto from '../componentes/TarjetaProducto';
import ReviewsSection from '../componentes/ReviewsSection';
import { Skeleton, TextBlockSkeleton } from '../componentes/Skeleton';
import { useCarrito } from '../contextos/ContextoCarrito';
import { formatCurrency } from '../utilidades/formateadores';
import { useProductos } from '../contextos/ContextoProducto';
import { useMetricas } from '../contextos/ContextoMetricas';
import { useNotificacion } from '../contextos/ContextoNotificacion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { getApiUrl } from '../config';

// Registramos el plugin de GSAP para que useGSAP funcione correctamente
gsap.registerPlugin(useGSAP);

function DetalleProducto() {
    // Leemos el ID del producto desde la URL (Ej: /producto/42 → id = "42")
    const { id } = useParams();
    const navigate = useNavigate(); // Para navegar programáticamente al carrito

    const { addToCart } = useCarrito(); // Función para agregar al carrito
    const { getProductById, loading, products } = useProductos(); // Datos de productos
    const { isInWishlist, addToWishlist, removeFromWishlist, productDiscounts } = useMetricas(); // Funciones de wishlist
    const { showNotification } = useNotificacion();
    const { user, isAuthenticated } = useAutenticacion();
    const rawRole = String(user?.role || user?.rol || '').toLowerCase();
    const isClientUser = isAuthenticated && rawRole === 'cliente';
    const isNonClientLoggedIn = isAuthenticated && rawRole !== 'cliente';
    const roleLabel = (rawRole === 'admin' || rawRole === 'administrador') ? 'Administrador' : 'Vendedor';

    // Cantidad de metros por corte que el cliente quiere comprar (por defecto 1)
    const [metersPerCut, setMetersPerCut] = useState(1);
    // Cantidad de cortes (unidades) del mismo corte de tela
    const [cuts, setCuts] = useState(1);
    // Controla si se muestra el mensaje verde "¡Producto agregado al carrito!"
    const [showSuccess, setShowSuccess] = useState(false);
    const [showStockError, setShowStockError] = useState(false);
    const [competitors, setCompetitors] = useState([]);

    useEffect(() => {
        if (!id) return;
        fetch(getApiUrl(`/api/productos/${id}/competencia`))
            .then(r => r.ok ? r.json() : [])
            .then(data => setCompetitors(Array.isArray(data) ? data : []))
            .catch(() => setCompetitors([]));
    }, [id]);

    // Referencias para las animaciones GSAP
    const contentRef = useRef(null); // Contenedor de la sección principal
    const successRef = useRef(null); // Mensaje de éxito

    // Animación de entrada: la columna izquierda entra desde la izquierda,
    // la derecha desde la derecha. Se repite cada vez que cambia el ID del producto.
    useGSAP(() => {
        if (contentRef.current) {
            const left = contentRef.current.querySelector('.pd-left');   // Columna de imágenes
            const right = contentRef.current.querySelector('.pd-right'); // Columna de info
            if (left) gsap.fromTo(left, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.28, ease: "power3.out", force3D: true, clearProps: "transform" });
            if (right) gsap.fromTo(right, { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: 0.28, ease: "power3.out", delay: 0.04, force3D: true, clearProps: "transform" });
        }
    }, { scope: contentRef, dependencies: [id] });

    // Animación del mensaje de confirmación "¡Producto agregado!"
    useGSAP(() => {
        if (showSuccess && successRef.current) {
            gsap.fromTo(successRef.current,
                { opacity: 0, y: -8 },
                { opacity: 1, y: 0, duration: 0.22, ease: "back.out(1.2)", force3D: true, clearProps: "transform" }
            );
        }
    }, { dependencies: [showSuccess] });

    // Mientras los productos cargan desde la API, mostramos un spinner
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Encabezado />
                <div className="flex-1 section-container">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <Skeleton className="aspect-square rounded-2xl" />
                            <div className="grid grid-cols-4 gap-3">
                                {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-12 w-40" />
                            <TextBlockSkeleton lines={4} />
                            <div className="card p-6 space-y-4">
                                <Skeleton className="h-6 w-48" />
                                <div className="grid grid-cols-2 gap-4">
                                    {[1,2,3,4].map(i => <div key={i}><Skeleton className="h-4 w-16 mb-1" /><Skeleton className="h-5 w-24" /></div>)}
                                </div>
                            </div>
                            <Skeleton className="h-20 rounded-lg" />
                            <Skeleton className="h-14 w-48" />
                            <div className="flex gap-4">
                                <Skeleton className="h-14 flex-1 rounded-xl" />
                                <Skeleton className="h-14 flex-1 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
                <PieDePagina />
            </div>
        );
    }

    // Buscamos el producto con el ID de la URL en la lista de productos
    const product = getProductById(id);

    // Si no encontramos el producto (ID inválido o producto eliminado), mostramos un error
    if (!product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Encabezado />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Producto no encontrado</h1>
                        <Link to="/catalogo" className="btn-primary">
                            Volver al catálogo
                        </Link>
                    </div>
                </div>
                <PieDePagina />
            </div>
        );
    }

    const discountInfo = productDiscounts?.[product.id];
    const directDiscount = Number(product?.discountPercent ?? product?.porcentajeDescuento ?? 0);
    const isOffer = Boolean(product?.isOffer || product?.esOferta || directDiscount > 0 || discountInfo?.active);
    const discountPercent = directDiscount > 0 ? directDiscount : (discountInfo?.percent || (isOffer ? 15 : 0));
    const hasDiscount = discountPercent > 0;
    const discountedPrice = hasDiscount ? product.price * (1 - discountPercent / 100) : product.price;
    const isOutOfStock = (product.stock ?? 0) < 1.0;
    const sellerId = product.sellerId || product.idVendedor || 2;
    const storeName = product.storeName || product.nombreTienda || product.sellerName || product.nombreVendedor || 'Proveedor Textil';
    const sellerRating = Number(product.sellerRating ?? 0);
    const sellerReviewsCount = Number(product.sellerReviewsCount ?? 0);
    const soldMeters = Number(product.soldMeters ?? product.metrosVendidos ?? 0);

    // Total de metros = metros por corte × cantidad de cortes (exacto a 2 decimales)
    const totalMeters = Math.round(metersPerCut * cuts * 100) / 100;
    // Máximo de cortes permitidos para no superar el stock disponible
    const maxCuts = isOutOfStock ? 1 : Math.max(1, Math.floor((product.stock ?? 0) / metersPerCut));
    // Etiqueta legible del total (1,25 o 3,5 o 2 sin truncar centésimas)
    const formatMeters = (val) => {
        const rounded = Math.round((Number(val) || 0) * 100) / 100;
        if (rounded % 1 === 0) return String(rounded);
        return String(rounded).replace('.', ',');
    };
    const totalMetersLabel = formatMeters(totalMeters);

    // Productos relacionados: misma categoría, máximo 4, excluyendo el actual
    const relatedProducts = products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    /**
     * handleAddToCart — Agrega el producto al carrito y muestra confirmación
     * El mensaje de confirmación desaparece automáticamente después de 3 segundos.
     */
    const handleAddToCart = () => {
        if (isNonClientLoggedIn) {
            if (showNotification) {
                showNotification('error', 'Solo las cuentas con rol Cliente pueden comprar telas.');
            }
            return;
        }
        const productToAdd = hasDiscount
            ? { ...product, price: discountedPrice, originalPrice: product.price }
            : product;
        const added = addToCart(productToAdd, totalMeters);
        if (added) {
            setShowSuccess(true);
            setShowStockError(false);
            setTimeout(() => setShowSuccess(false), 3000);
        } else {
            setShowStockError(true);
            setTimeout(() => setShowStockError(false), 3000);
        }
    };

    /**
     * handleBuyNow — Valida cuenta de cliente y lleva a compra o login
     */
    const handleBuyNow = () => {
        if (isNonClientLoggedIn) {
            if (showNotification) {
                showNotification('error', 'Solo las cuentas con rol Cliente pueden comprar telas.');
            }
            return;
        }
        const productToAdd = hasDiscount
            ? { ...product, price: discountedPrice, originalPrice: product.price }
            : product;
        const added = addToCart(productToAdd, totalMeters);
        if (added) {
            if (!isClientUser) {
                if (showNotification) {
                    showNotification('info', 'Inicia sesión o regístrate como cliente para completar tu compra.');
                }
                navigate('/login', { state: { from: { pathname: '/checkout' } } });
            } else {
                navigate('/carrito');
            }
        } else {
            setShowStockError(true);
            setTimeout(() => setShowStockError(false), 3000);
        }
    };

    /**
     * handleMetersChange — Cambia los metros por corte y ajusta los cortes
     * para que el total de metros nunca supere el stock disponible.
     */
    const handleMetersChange = (value) => {
        setMetersPerCut(value);
        setCuts(current => Math.min(current, Math.max(1, Math.floor(product.stock / value))));
    };

    /**
     * handleToggleWishlist — Agrega o quita de favoritos
     */
    const handleToggleWishlist = () => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            if (showNotification) {
                showNotification('info', `"${product.name || 'Tela'}" eliminada de tus favoritos`);
            }
        } else {
            addToWishlist(product);
            if (showNotification) {
                showNotification('success', `"${product.name || 'Tela'}" guardada en tus favoritos ❤️`);
            }
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `Mira esta tela en D&D Textil: ${product.name}`,
                    url: window.location.href,
                });
            } catch (err) {
                // Compartir cancelado por el usuario
            }
        } else {
            navigator.clipboard?.writeText(window.location.href);
            if (showNotification) {
                showNotification('info', 'Enlace copiado al portapapeles');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Encabezado />

            {/* PaginaAnimada añade la animación de entrada al cambiar de página */}
            <PaginaAnimada className="flex-1">

                {/* Breadcrumb: ruta de navegación (Inicio / Catálogo / Nombre del producto) */}
                <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                                Inicio
                            </Link>
                            <span className="text-gray-400">/</span>
                            <Link to="/catalogo" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                                Catálogo
                            </Link>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
                        </div>
                    </div>
                </div>

                {/* Sección principal: imágenes + información del producto */}
                <section className="section-container" ref={contentRef}>
                    <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
                    </Link>

                    <div className="grid md:grid-cols-2 gap-12 mb-16">
                        {/* Columna izquierda: galería de imágenes (animada desde la izquierda) */}
                        <div className="pd-left">
                            <ImageGallery images={product.images || []} productName={product.name} />
                        </div>

                        {/* Columna derecha: todos los datos del producto (animada desde la derecha) */}
                        <div className="pd-right space-y-6">
                            {/* Etiqueta de categoría, Exclusivo y Más Vendido con psicología del color */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3.5 py-1 rounded-full text-xs font-bold">
                                    {product.category}
                                </span>
                                {(product.isExclusive || product.esExclusivo) && (
                                    <span className="inline-flex items-center gap-1.5 bg-slate-950 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                        <Crown className="w-3.5 h-3.5" /> Exclusivo VIP
                                    </span>
                                )}
                                {(product.isBestSeller || soldMeters >= 150) && (
                                    <span className="inline-flex items-center gap-1.5 bg-amber-500/12 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Más Vendido · {Math.round(soldMeters)}m vendidos
                                    </span>
                                )}
                            </div>

                            {/* Tarjeta del Proveedor / Vendedor con Glassmorfismo */}
                            <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <img
                                        src={product.sellerAvatar || '/images/hero-detail-1.webp'}
                                        alt={storeName}
                                        className="w-12 h-12 rounded-xl object-cover border-2 border-primary-500/60 shadow-sm shrink-0"
                                    />
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Vendido por</span>
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" title="Proveedor verificado" />
                                        </div>
                                        <Link
                                            to={`/tienda/${sellerId}`}
                                            className="font-bold text-base text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1"
                                        >
                                            {storeName}
                                        </Link>
                                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                            <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                {sellerRating > 0 ? sellerRating.toFixed(1) : 'Nuevo'}
                                            </span>
                                            <span>({sellerReviewsCount} {sellerReviewsCount === 1 ? 'reseña' : 'reseñas'} reales)</span>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to={`/tienda/${sellerId}`}
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm shadow-primary-500/20 transition-colors shrink-0"
                                >
                                    <Store className="w-3.5 h-3.5" /> Visitar Tienda
                                </Link>
                            </div>

                            {/* Nombre del producto */}
                            <h1 className="text-3xl md:text-4xl font-display font-bold">
                                {product.name}
                            </h1>

                            {/* Precio por metro */}
                            <div className="flex flex-wrap items-baseline gap-3">
                                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                                    {formatCurrency(hasDiscount ? discountedPrice : product.price)}
                                </div>
                                {hasDiscount && (
                                    <div className="text-xl text-slate-400 line-through">
                                        {formatCurrency(product.price)}
                                    </div>
                                )}
                                <div className="text-slate-500 dark:text-slate-400">por metro</div>
                                {hasDiscount && (
                                    <span className="ml-1 inline-flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                                        <Tag className="w-3 h-3" /> -{discountPercent}% OFF
                                    </span>
                                )}
                            </div>

                            {/* Alerta de Oferta Especial */}
                            {hasDiscount && (
                                <div className="p-3.5 rounded-2xl bg-primary-500/10 dark:bg-primary-500/15 border border-primary-500/30 flex items-center gap-3 text-primary-900 dark:text-primary-200">
                                    <Tag className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                                    <p className="text-xs sm:text-sm font-semibold">
                                        ¡Promoción especial del proveedor! Ahorras {formatCurrency(product.price - discountedPrice)} por cada metro adquirido.
                                    </p>
                                </div>
                            )}

                            {/* Descripción del producto */}
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                {product.description}
                            </p>

                            {/* Información de la Tela */}
                            <div className="card p-6">
                                <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    Información de la Tela
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                        <Layers className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Material</div>
                                            <div className="font-semibold text-sm">{product.material || '—'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                        <Ruler className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Ancho</div>
                                            <div className="font-semibold text-sm">{product.width || '—'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                        <Weight className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Peso</div>
                                            <div className="font-semibold text-sm">{product.weight || '—'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                        <Package className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Stock</div>
                                            <div className="font-semibold text-sm">{isOutOfStock ? <span className="text-red-500">Agotado</span> : `${product.stock} metros`}</div>
                                        </div>
                                    </div>
                                </div>
                                {product.care && (
                                    <div className="flex items-start gap-3 p-4 mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold text-blue-900 dark:text-blue-300">
                                                Cuidado y lavado
                                            </div>
                                            <div className="text-sm text-blue-700 dark:text-blue-400">
                                                {product.care}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Selector de metros por corte y cantidad de cortes */}
                            <div className="card p-6 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block font-bold mb-3 flex items-center gap-2 text-sm">
                                            <Ruler className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                            Metros por corte
                                        </label>
                                        <QuantitySelector
                                            quantity={metersPerCut}
                                            setQuantity={handleMetersChange}
                                            max={product.stock}
                                            min={0.5}
                                            step={0.25}
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-3 flex items-center gap-2 text-sm">
                                            <Layers className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                            Cantidad de cortes
                                        </label>
                                        <QuantitySelector
                                            quantity={cuts}
                                            setQuantity={setCuts}
                                            max={maxCuts}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-primary-50/70 dark:bg-slate-800/80 border border-primary-200/50 dark:border-slate-700/80 rounded-xl">
                                    <div className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                                        Total: <span className="font-black text-slate-900 dark:text-white">{totalMetersLabel} metros</span>
                                        <span className="text-slate-500 dark:text-slate-400 font-normal"> · {cuts} corte{cuts > 1 ? 's' : ''} de {formatMeters(metersPerCut)} m</span>
                                    </div>
                                    <div className="font-black text-xl text-primary-600 dark:text-primary-400">
                                        {formatCurrency(discountedPrice * totalMeters)}
                                    </div>
                                </div>
                            </div>

                            {isNonClientLoggedIn && (
                                <div className="p-3.5 rounded-xl bg-amber-500/12 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2.5">
                                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span>Vista de consulta ({roleLabel}): las compras están habilitadas únicamente para cuentas con rol Cliente.</span>
                                </div>
                            )}

                            {/* Botones principales: Agregar al carrito + Comprar ahora */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock || isNonClientLoggedIn}
                                    className={`flex-1 flex items-center justify-center gap-2 active:scale-95 transition-all rounded-xl py-3.5 px-6 font-bold shadow-lg ${(isOutOfStock || isNonClientLoggedIn)
                                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/25 cursor-pointer'
                                    }`}
                                >
                                    {isNonClientLoggedIn ? <Lock className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                                    {isOutOfStock ? 'Agotado' : isNonClientLoggedIn ? 'Solo Clientes' : 'Agregar al Carrito'}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={isOutOfStock || isNonClientLoggedIn}
                                    className={`flex-1 flex items-center justify-center gap-2 active:scale-95 transition-all rounded-xl py-3.5 px-6 font-bold shadow-sm ${(isOutOfStock || isNonClientLoggedIn)
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-slate-700/50 cursor-pointer'
                                    }`}
                                >
                                    Comprar Ahora
                                </button>
                            </div>

                            {/* Botones secundarios: Favoritos + Compartir */}
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleToggleWishlist}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold transition-all border ${
                                        isInWishlist(product?.id) 
                                            ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50 shadow-sm' 
                                            : 'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Heart className="w-5 h-5" fill={isInWishlist(product?.id) ? "currentColor" : "none"} /> 
                                    {isInWishlist(product?.id) ? 'En Favoritos' : 'Favoritos'}
                                </button>
                                <button 
                                    onClick={handleShare}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold transition-all border bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <Share2 className="w-5 h-5" /> Compartir
                                </button>
                            </div>

                            {/* Mensaje de confirmación (aparece 3 segundos después de agregar al carrito) */}
                            {showSuccess && (
                                <div
                                    ref={successRef}
                                    className="bg-green-500 text-white p-4 rounded-lg flex items-center gap-3"
                                >
                                    <Check className="w-6 h-6 flex-shrink-0" />
                                    <span className="font-semibold">¡{totalMetersLabel} metros agregados al carrito!</span>
                                </div>
                            )}

                            {showStockError && (
                                <div className="bg-red-500 text-white p-4 rounded-lg flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                                    <span className="font-semibold">Stock insuficiente para agregar al carrito</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comparador de Competencia entre Proveedores (estilo Marketplace) */}
                    {competitors.length > 0 && (
                        <div className="mb-14">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                                        Compara con otros proveedores en {product.category}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Otras tiendas textiles verificadas con telas disponibles en esta categoría
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {competitors.slice(0, 3).map((comp) => {
                                    const compDisc = Number(comp.discountPercent ?? comp.porcentajeDescuento ?? (comp.isOffer ? 15 : 0));
                                    const compFinalPrice = compDisc > 0 ? comp.price * (1 - compDisc / 100) : comp.price;
                                    const compStore = comp.storeName || comp.nombreTienda || comp.sellerName || 'Proveedor';
                                    return (
                                        <div key={comp.id} className="glass-panel rounded-2xl p-4 flex flex-col justify-between gap-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <Link to={`/tienda/${comp.sellerId}`} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                                                        <Store className="w-3.5 h-3.5" /> {compStore}
                                                    </Link>
                                                    <h3 className="font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">{comp.name}</h3>
                                                </div>
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    {Number(comp.sellerRating) > 0 ? Number(comp.sellerRating).toFixed(1) : 'Nuevo'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
                                                <div>
                                                    <div className="font-black text-lg text-slate-900 dark:text-white">
                                                        {formatCurrency(compFinalPrice)} <span className="text-xs font-normal text-slate-500">/m</span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        Stock: <strong>{comp.stock} m</strong> {compDisc > 0 && <span className="text-primary-600 font-bold">· -{compDisc}%</span>}
                                                    </div>
                                                </div>
                                                <Link
                                                    to={`/producto/${comp.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors"
                                                >
                                                    Ver oferta <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Sección de reseñas de clientes */}
                    <ReviewsSection productId={product.id} />

                    {/* Sección de productos relacionados (misma categoría de tela) */}
                    {relatedProducts.length > 0 && (
                        <div>
                            <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">
                                Productos Relacionados
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((relatedProduct) => (
                                    <TarjetaProducto key={relatedProduct.id} product={relatedProduct} />
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </PaginaAnimada>

            <PieDePagina />
        </div>
    );
}

export default DetalleProducto;
