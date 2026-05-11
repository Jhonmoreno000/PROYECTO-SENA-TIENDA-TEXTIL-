import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMetrics } from '../context/MetricsContext';
import { formatCurrency } from '../utils/formatters';

gsap.registerPlugin(useGSAP);

function ProductCard({ product }) {
    const navigate = useNavigate();
    const { addToCart, isInCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useMetrics();
    const [showAddedMessage, setShowAddedMessage] = useState(false);
    const messageRef = useRef(null);
    const cardRef = useRef(null);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
        setShowAddedMessage(true);
        setTimeout(() => setShowAddedMessage(false), 2000);
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

    const handleMouseMove = (e) => {
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Slightly reduced tilt for smoother feel
        const rotateX = (y - centerY) / 12;
        const rotateY = (centerX - x) / 12;

        gsap.to(cardRef.current, {
            rotationX: rotateX,
            rotationY: rotateY,
            duration: 0.3, // Smoother follow
            force3D: true,
            ease: "power1.out"
        });
    };

    useGSAP(() => {
        if (showAddedMessage && messageRef.current) {
            gsap.fromTo(messageRef.current,
                { opacity: 0, y: -20, x: '-50%', scale: 0.9 },
                { opacity: 1, y: 0, x: '-50%', scale: 1, duration: 0.3, ease: "back.out(1.5)", force3D: true }
            );
        } else if (!showAddedMessage && messageRef.current) {
            gsap.to(messageRef.current, {
                opacity: 0, scale: 0.8, y: -10, duration: 0.2, ease: "power2.in", force3D: true
            });
        }
    }, { dependencies: [showAddedMessage] });

    return (
        <div 
            ref={cardRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
            className="card group relative rounded-2xl transition-shadow duration-300 will-change-transform"
        >
            <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-slate-800 rounded-t-2xl will-change-transform">
                <Link to={`/producto/${product.id}`} className="block h-full w-full">
                    <img
                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                        alt={product.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 will-change-transform"
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

                    {product.stock < 10 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            ¡Últimas unidades!
                        </div>
                    )}

                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-semibold px-3 py-1 rounded-full">
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

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                            <span className="flex items-center gap-1">
                                <span className="font-semibold">Ancho:</span> {product.width}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="font-semibold">Stock:</span> {product.stock}
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {formatCurrency(product.price)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">por metro</div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className={`p-3 rounded-lg hover:scale-110 active:scale-95 transition-all duration-200 ${isInCart(product.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-primary-600 hover:bg-primary-700 text-white'
                                }`}
                            aria-label="Agregar al carrito"
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            <div
                ref={messageRef}
                style={{ zIndex: 50, top: '-1rem', opacity: 0, pointerEvents: 'none' }}
                className="absolute left-1/2 bg-green-500/95 text-white px-5 py-2 rounded-full shadow-xl text-sm font-semibold whitespace-nowrap flex items-center gap-2"
            >
                <ShoppingCart size={14} />
                ¡Agregado al carrito!
            </div>
        </div>
    );
}

export default ProductCard;
