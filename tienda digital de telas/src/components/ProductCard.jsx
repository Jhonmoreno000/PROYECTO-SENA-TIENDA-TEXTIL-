import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ShoppingCart, Eye, Heart, Tag, Check, Ruler, Weight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMetrics } from '../context/MetricsContext';
import { formatCurrency } from '../utils/formatters';

const CATEGORY_STYLES = {
    'Seda':       'bg-purple-500/90 text-white',
    'Algodon':    'bg-sky-500/90 text-white',
    'Lino':       'bg-emerald-500/90 text-white',
    'Lana':       'bg-amber-500/90 text-white',
    'Poliester':  'bg-rose-500/90 text-white',
    'Terciopelo': 'bg-indigo-500/90 text-white',
};

function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart, isInCart, getProductQuantity } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist, productDiscounts } = useMetrics();
    const [showAddedMessage, setShowAddedMessage] = useState(false);
    const messageRef = useRef(null);
    const cardRef = useRef(null);
    const tiltFrame = useRef(null);

    const discountInfo = productDiscounts?.[product.id];
    const hasDiscount = discountInfo?.active && discountInfo?.percent > 0;
    const discountedPrice = hasDiscount ? product.price * (1 - discountInfo.percent / 100) : product.price;
    const isOutOfStock = (product.stock ?? 0) <= 0;
    const lowStock = !isOutOfStock && product.stock < 10;
    const categoryStyle = CATEGORY_STYLES[product.category] || 'bg-slate-600/90 text-white';
    const inCart = isInCart(product.id);
    const qtyInCart = getProductQuantity(product.id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const result = addToCart(product, 1);
        if (result) {
            setShowAddedMessage(true);
            if (messageRef.current) {
                gsap.fromTo(messageRef.current,
                    { opacity: 0, y: -20, x: '-50%', scale: 0.9 },
                    { opacity: 1, y: 0, x: '-50%', scale: 1, duration: 0.35, ease: "back.out(1.8)", force3D: true }
                );
            }
            setTimeout(() => setShowAddedMessage(false), 2000);
        }
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const handleViewDetails = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/producto/${product.id}`);
    };

    // Magnetic / 3D Tilt Hover effect - Optimized for performance
    const handleMouseEnter = () => {
        gsap.to(cardRef.current, {
            scale: 1.05,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            duration: 0.4,
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
            duration: 0.5,
            force3D: true,
            ease: "power2.inOut"
        });
    };

    const handleMouseMove = useCallback((e) => {
        if (tiltFrame.current) return;
        tiltFrame.current = requestAnimationFrame(() => {
            tiltFrame.current = null;
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
                duration: 0.4,
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
                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </Link>

                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <button
                            onClick={handleViewDetails}
                            className="pointer-events-auto bg-white text-gray-900 p-3 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-transform duration-200"
                            aria-label="Ver detalles"
                        >
                            <Eye className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleToggleWishlist}
                            className={`pointer-events-auto p-3 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all duration-200 ${
                                isInWishlist(product.id) 
                                    ? 'bg-red-50 text-red-500 hover:text-red-600' 
                                    : 'bg-white text-gray-900'
                            }`}
                            aria-label={isInWishlist(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                        >
                            <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                        </button>
                    </div>

                    {isOutOfStock ? (
                        <div className="absolute top-3 right-3 bg-gray-900/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Agotado
                        </div>
                    ) : lowStock && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            ¡Últimas unidades!
                        </div>
                    )}

                    {hasDiscount && (
                        <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                            <Tag size={10} />
                            -{discountInfo.percent}%
                        </div>
                    )}

                    <div className={`absolute ${hasDiscount ? 'top-12' : 'top-3'} left-3 text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm ${categoryStyle}`}>
                        {product.category}
                    </div>
                </div>

                <div className="p-5">
                    <Link to={`/producto/${product.id}`} className="block">
                        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {product.name}
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {product.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium">
                                <Ruler size={12} /> Ancho: {product.width}
                            </span>
                            {product.weight && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium">
                                    <Weight size={12} /> {product.weight}
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
                                {formatCurrency(hasDiscount ? discountedPrice : product.price)}
                            </div>
                            {hasDiscount && (
                                <div className="text-xs text-gray-400 line-through">
                                    {formatCurrency(product.price)}
                                </div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400">por metro</div>
                        </div>

                        <button
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

export default ProductCard;