import React, { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, Tag, Check, Ruler, Weight, Package, Star, Store, Award, Crown, Lock } from 'lucide-react';
import { useCarrito } from '../contextos/ContextoCarrito';
import { useMetricas } from '../contextos/ContextoMetricas';
import { useNotificacion } from '../contextos/ContextoNotificacion';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';
import { formatCurrency } from '../utilidades/formateadores';

function TarjetaProducto({ product }) {
    const navigate = useNavigate();
    const { addToCart, isInCart, getProductQuantity } = useCarrito();
    const { isInWishlist, addToWishlist, removeFromWishlist, productDiscounts } = useMetricas();
    const { showNotification } = useNotificacion();
    const { user, isAuthenticated } = useAutenticacion();
    const [showAddedMessage, setShowAddedMessage] = useState(false);

    const rawRole = String(user?.role || user?.rol || '').toLowerCase();
    const isNonClientLoggedIn = isAuthenticated && rawRole !== 'cliente';

    const discountInfo = productDiscounts?.[product.id];
    const directDiscount = Number(product.discountPercent ?? product.porcentajeDescuento ?? 0);
    const isSpecialOffer = Boolean(product.isOffer || product.esOferta || discountInfo?.active || directDiscount > 0);
    const discountPercent = directDiscount > 0
        ? directDiscount
        : (discountInfo?.percent > 0 ? discountInfo.percent : (isSpecialOffer ? 15 : 0));
    const hasDiscount = discountPercent > 0;
    const basePrice = Number(product.price ?? product.precio ?? 0);
    const discountedPrice = hasDiscount ? basePrice * (1 - discountPercent / 100) : basePrice;
    const stockAvailable = Number(product.stock !== undefined ? product.stock : (product.existencias !== undefined ? product.existencias : 50));
    const isOutOfStock = stockAvailable <= 0;
    const lowStock = !isOutOfStock && stockAvailable < 15;
    const categoryName = product.category || product.categoria || 'Textil';
    const inCart = isInCart(product.id);
    const qtyInCart = getProductQuantity(product.id);
    const favorite = isInWishlist(product.id);

    const sellerId = product.sellerId || product.idVendedor || 2;
    const storeName = product.storeName || product.nombreTienda || product.sellerName || product.nombreVendedor || 'Proveedor Textil';
    const sellerRating = Number(product.sellerRating ?? product.rating ?? 0);
    const soldMeters = Number(product.soldMeters ?? product.metrosVendidos ?? 0);
    const isBestSeller = Boolean(product.isBestSeller || soldMeters >= 150);
    const isExclusive = Boolean(product.isExclusive || product.esExclusivo);

    const topBadges = [];
    if (hasDiscount) {
        topBadges.push({
            key: 'discount',
            icon: Tag,
            text: `-${discountPercent}% OFF`,
            className: 'bg-primary-600/95 text-white backdrop-blur-md shadow-md',
        });
    }
    if (isExclusive) {
        topBadges.push({
            key: 'vip',
            icon: Crown,
            text: 'Exclusivo VIP',
            className: 'bg-slate-950/90 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-md',
        });
    }
    if (isBestSeller && topBadges.length < 2) {
        topBadges.push({
            key: 'bestseller',
            icon: Award,
            text: 'Más Vendido',
            className: 'bg-slate-900/85 text-amber-300 border border-amber-400/35 backdrop-blur-md shadow-md',
        });
    }

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isNonClientLoggedIn) {
            if (showNotification) {
                showNotification('error', 'Solo las cuentas con rol Cliente pueden comprar telas.');
            }
            return;
        }
        const productToAdd = hasDiscount
            ? { ...product, price: discountedPrice, originalPrice: basePrice }
            : product;
        const result = addToCart(productToAdd, 1);
        if (result) {
            setShowAddedMessage(true);
            setTimeout(() => setShowAddedMessage(false), 1800);
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
                showNotification('success', `"${product.name || 'Tela'}" guardada en tus favoritos`);
            }
        }
    };

    const handleViewDetails = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/producto/${product.id}`);
    };

    const handleGoToStore = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/tienda/${sellerId}`);
    };

    return (
        <div className="glass-card-subtle group relative rounded-2xl overflow-hidden transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-primary-900/20">
            <div className="relative h-60 overflow-hidden bg-slate-100 dark:bg-slate-800">
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
                        className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                </Link>

                {/* Botón rápido de favorito */}
                <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-md transition-transform duration-150 hover:scale-110 active:scale-90 ${
                        favorite
                            ? 'bg-rose-600 text-white'
                            : 'bg-white/90 dark:bg-slate-900/85 text-slate-700 dark:text-slate-200 hover:text-rose-600'
                    }`}
                    aria-label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                    <Heart className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} />
                </button>

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <button
                        type="button"
                        onClick={handleViewDetails}
                        className="pointer-events-auto bg-white text-slate-900 p-3 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-transform duration-150"
                        aria-label="Ver detalles"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                </div>

                {/* Badges superiores izquierda (máximo 2 para mantener limpia la fotografía textil) */}
                {topBadges.length > 0 && (
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                        {topBadges.slice(0, 2).map(({ key, icon: BadgeIcon, text, className }) => (
                            <span key={key} className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full flex items-center gap-1 ${className}`}>
                                <BadgeIcon size={11} />
                                {text}
                            </span>
                        ))}
                    </div>
                )}

                {/* Badge inferior de stock en metros */}
                <div className="absolute bottom-2.5 right-2.5 z-10">
                    {isOutOfStock ? (
                        <span className="bg-slate-950/90 text-slate-100 text-[11px] font-bold px-2.5 py-1 rounded-full">
                            Agotado
                        </span>
                    ) : (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                            lowStock ? 'bg-rose-600 text-white' : 'bg-slate-900/80 backdrop-blur-md text-white'
                        }`}>
                            {lowStock ? 'Últimos ' : ''}{stockAvailable % 1 === 0 ? stockAvailable : stockAvailable.toFixed(1)} m disp.
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-5">
                {/* Fila del Proveedor Externo + Categoría + Calificación */}
                <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-200/70 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={handleGoToStore}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 truncate transition-colors"
                        title={`Visitar tienda de ${storeName}`}
                    >
                        <Store className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                        <span className="truncate">{storeName}</span>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                            {categoryName}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {sellerRating > 0 ? sellerRating.toFixed(1) : 'Nuevo'}
                        </span>
                    </div>
                </div>

                <Link to={`/producto/${product.id}`} className="block">
                    <h3 className="font-bold text-base sm:text-lg mb-1.5 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {product.name || product.nombre}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 min-h-[2.25rem]">
                        {product.description || product.descripcion}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-3.5">
                        {(product.width || product.ancho) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium">
                                <Ruler size={11} /> {product.width || product.ancho}
                            </span>
                        )}
                        {(product.weight || product.peso) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium">
                                <Weight size={11} /> {product.weight || product.peso}
                            </span>
                        )}
                        {product.material && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium">
                                <Package size={11} /> {product.material}
                            </span>
                        )}
                    </div>
                </Link>

                <div className="flex items-center justify-between pt-1">
                    <div>
                        <div className="text-xl sm:text-2xl font-black text-primary-600 dark:text-primary-400 leading-tight">
                            {formatCurrency(hasDiscount ? discountedPrice : basePrice)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>por metro</span>
                            {hasDiscount && (
                                <span className="text-gray-400 line-through">
                                    {formatCurrency(basePrice)}
                                </span>
                            )}
                            {soldMeters > 0 && (
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    · {Math.round(soldMeters)}m vend.
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isNonClientLoggedIn}
                        title={isNonClientLoggedIn ? 'Solo las cuentas con rol Cliente pueden comprar' : undefined}
                        className={`relative p-3 rounded-xl transition-all duration-150 ${(isOutOfStock || isNonClientLoggedIn)
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                            : inCart
                                ? 'bg-emerald-600 text-white hover:scale-105 active:scale-95 shadow-sm shadow-emerald-600/20'
                                : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105 active:scale-95 shadow-sm shadow-primary-500/20'
                            }`}
                        aria-label={isOutOfStock ? 'Agotado' : isNonClientLoggedIn ? 'Solo clientes pueden comprar' : inCart ? `${qtyInCart} metro(s) en el carrito` : 'Agregar al carrito'}
                    >
                        {isNonClientLoggedIn ? <Lock className="w-5 h-5" /> : inCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                        {inCart && qtyInCart > 0 && !isNonClientLoggedIn && (
                            <span className="absolute -top-2 -right-2 bg-emerald-700 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-slate-900">
                                {qtyInCart}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {showAddedMessage && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-green-500/95 text-white px-4 py-1.5 rounded-full shadow-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 animate-fade-in pointer-events-none">
                    <Check size={14} />
                    ¡Agregado!
                </div>
            )}
        </div>
    );
}

export default memo(TarjetaProducto);
