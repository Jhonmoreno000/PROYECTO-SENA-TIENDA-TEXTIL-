import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ShoppingCart, Eye, Heart, Tag, Check, Ruler, Weight, Package } from 'lucide-react';
import { useCarrito } from '../contextos/ContextoCarrito';
import { useMetricas } from '../contextos/ContextoMetricas';
import { useNotificacion } from '../contextos/ContextoNotificacion';
import { formatCurrency } from '../utilidades/formateadores';

const CATEGORY_STYLES = {
    'Seda':       'bg-purple-500/90 text-white',
    'Algodon':    'bg-sky-500/90 text-white',
    'Algodón':    'bg-sky-500/90 text-white',
    'Lino':       'bg-emerald-500/90 text-white',
    'Lana':       'bg-amber-500/90 text-white',
    'Poliester':  'bg-rose-500/90 text-white',
    'Poliéster':  'bg-rose-500/90 text-white',
    'Dril':       'bg-teal-600/90 text-white',
    'Terciopelo': 'bg-indigo-500/90 text-white',
};

function TarjetaProducto({ product }) {
    const navigate = useNavigate();
    const { addToCart, isInCart, getProductQuantity } = useCarrito();
    const { isInWishlist, addToWishlist, removeFromWishlist, productDiscounts } = useMetricas();
    const { showNotification } = useNotificacion();
    const [showAddedMessage, setShowAddedMessage] = useState(false);
    const messageRef = useRef(null);
    const cardRef = useRef(null);
    const tiltFrame = useRef(null);

    const discountInfo = productDiscounts?.[product.id];
    const isSpecialOffer = Boolean(product.isOffer || product.esOferta || discountInfo?.active);
    const discountPercent = discountInfo?.percent > 0 ? discountInfo.percent : (isSpecialOffer ? 15 : 0);
    const hasDiscount = discountPercent > 0;
    const basePrice = Number(product.price ?? product.precio ?? 0);
    const discountedPrice = hasDiscount ? basePrice * (1 - discountPercent / 100) : basePrice;
    const stockAvailable = Number(product.stock !== undefined ? product.stock : (product.existencias !== undefined ? product.existencias : 50));
    const isOutOfStock = stockAvailable <= 0;
    const lowStock = !isOutOfStock && stockAvailable < 10;
    const categoryStyle = CATEGORY_STYLES[product.category || product.categoria] || 'bg-slate-600/90 text-white';
    const inCart = isInCart(product.id);
    const qtyInCart = getProductQuantity(product.id);
    const favorite = isInWishlist(product.id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productToAdd = hasDiscount
            ? { ...product, price: discountedPrice, originalPrice: basePrice }
            : product;
        const result = addToCart(productToAdd, 1);
        if (result) {
            setShowAddedMessage(true);
            if (messageRef.current) {
                gsap.fromTo(messageRef.current,
                    { opacity: 0, y: -12, x: '-50%', scale: 0.95 },
                    { opacity: 1, y: 0, x: '-50%', scale: 1, duration: 0.25, ease: "back.out(1.2)", force3D: true }
                );
            }
            setTimeout(() => setShowAddedMessage(false), 2000);
        }
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (favorite) {
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

    const handleViewDetails = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/producto/${product.id}`);
    };

    const handleMouseEnter = () => {
        gsap.to(cardRef.current, {
            scale: 1.03,
            boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.22)",
            duration: 0.22,
            force3D: true,
            ease: "power2.out"
        });
    };

    const handleMouseLeave = () => {
        gsap.to(cardRef.current, {
            scale: 1,
            rotationY: 0,
            rotationX: 0,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            duration: 0.22,
            force3D: true,
            ease: "power2.out"
        });
    };

    const handleMouseMove = useCallback((e) => {
        if (tiltFrame.current) return;
        tiltFrame.current = requestAnimationFrame(() => {
            tiltFrame.current = null;
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 14;
            const rotateY = (centerX - x) / 14;

            gsap.to(cardRef.current, {
                rotationX: rotateX,
                rotationY: rotateY,
                duration: 0.18,
                force3D: true,
                ease: "power1.out",
                overwrite: "auto"
            });
        });
    }, []);

    return (
        <div
            ref={cardRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
            className="card group relative rounded-2xl transition-shadow duration-300 overflow-hidden"
        >
            <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-slate-800 rounded-t-2xl">
                <Link to={`/producto/${product.id}`} className="block h-full w-full">
                    <img
                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.webp'}
                        alt={product.name || product.nombre}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                            const fallbackSecundario = product.images && product.images.length > 1 ? product.images[1] : '/images/hero-telas-premium.webp';
                            if (!e.target.dataset.triedFallback && e.target.src && !e.target.src.endsWith(fallbackSecundario)) {
                                e.target.dataset.triedFallback = 'true';
                                e.target.src = fallbackSecundario;
                            } else {
                                e.target.onerror = null;
                                e.target.src = '/placeholder.webp';
                            }
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </Link>

                {/* Botón rápido de favorito siempre accesible */}
                <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-md backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90 ${
                        favorite
                            ? 'bg-red-500 text-white'
                            : 'bg-white/85 dark:bg-slate-900/80 text-gray-700 dark:text-gray-200 hover:text-red-500'
                    }`}
                    aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                    title={favorite ? "En tus favoritos" : "Guardar en favoritos"}
                >
                    <Heart className="w-4 h-4" fill={favorite ? "currentColor" : "none"} />
                </button>

                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button
                        type="button"
                        onClick={handleViewDetails}
                        className="pointer-events-auto bg-white text-gray-900 p-3 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-transform duration-200"
                        aria-label="Ver detalles"
                    >
                        <Eye className="w-5 h-5" />
                    </button>

                    <button
                        type="button"
                        onClick={handleToggleWishlist}
                        className={`pointer-events-auto p-3 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all duration-200 ${
                            favorite
                                ? 'bg-red-50 text-red-500 hover:text-red-600'
                                : 'bg-white text-gray-900'
                        }`}
                        aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                    >
                        <Heart className="w-5 h-5" fill={favorite ? "currentColor" : "none"} />
                    </button>
                </div>

                {isOutOfStock ? (
                    <div className="absolute bottom-3 right-3 bg-gray-900/85 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Agotado
                    </div>
                ) : lowStock && (
                    <div className="absolute bottom-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ¡Últimas unidades!
                    </div>
                )}

                {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-1.5 z-10 border border-white/20 backdrop-blur-md animate-pulse">
                        <Tag size={11} />
                        <span>¡OFERTA -{discountPercent}%!</span>
                    </div>
                )}

                <div className={`absolute ${hasDiscount ? 'top-11' : 'top-3'} left-3 text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md ${categoryStyle}`}>
                    {product.category || product.categoria}
                </div>
            </div>

            <div className="p-5">
                <Link to={`/producto/${product.id}`} className="block">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {product.name || product.nombre}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {product.description || product.descripcion}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                        {(product.width || product.ancho) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium">
                                <Ruler size={12} /> Ancho: {product.width || product.ancho}
                            </span>
                        )}
                        {(product.weight || product.peso) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium">
                                <Weight size={12} /> {product.weight || product.peso}
                            </span>
                        )}
                        {product.material && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium">
                                <Package size={12} /> {product.material}
                            </span>
                        )}
                    </div>
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 leading-tight">
                            {formatCurrency(hasDiscount ? discountedPrice : basePrice)}
                        </div>
                        {hasDiscount && (
                            <div className="text-xs text-gray-400 line-through">
                                {formatCurrency(basePrice)}
                            </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">por metro</div>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`relative p-3 rounded-lg transition-all duration-200 ${isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : inCart
                                ? 'bg-green-500 text-white hover:scale-110 active:scale-95'
                                : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-110 active:scale-95'
                            }`}
                        aria-label={isOutOfStock ? "Agotado" : inCart ? `${qtyInCart} metro(s) en el carrito` : "Agregar al carrito"}
                    >
                        {inCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                        {inCart && qtyInCart > 0 && (
                            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-slate-900">
                                {qtyInCart}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div
                ref={messageRef}
                style={{ zIndex: 50, top: '-0.75rem', opacity: 0, pointerEvents: 'none' }}
                className="absolute left-1/2 bg-green-500/95 text-white px-5 py-2 rounded-full shadow-xl text-sm font-semibold whitespace-nowrap flex items-center gap-2"
            >
                <Check size={14} />
                ¡Agregado al carrito!
            </div>
        </div>
    );
}

export default TarjetaProducto;
