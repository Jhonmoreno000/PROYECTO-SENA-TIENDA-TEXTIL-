import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiEye, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

function ProductCard({ product }) {
    const [isHovered, setIsHovered] = useState(false);
    const { addToCart, isInCart } = useCart();
    const [showAddedMessage, setShowAddedMessage] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(product, 1);
        setShowAddedMessage(true);
        setTimeout(() => setShowAddedMessage(false), 2000);
    };

    return (
        <motion.div
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ y: -8 }}
            className="card overflow-hidden group relative"
        >
            <Link to={`/producto/${product.id}`}>
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-slate-800">
                    <img
                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                        alt={product.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay on Hover */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3"
                    >
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-white text-gray-900 p-3 rounded-full shadow-lg"
                            aria-label="Ver detalles"
                        >
                            <FiEye className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-white text-gray-900 p-3 rounded-full shadow-lg"
                            aria-label="Agregar a favoritos"
                        >
                            <FiHeart className="w-5 h-5" />
                        </motion.button>
                    </motion.div>

                    {/* Stock Badge */}
                    {product.stock < 10 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            ¡Últimas unidades!
                        </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {product.category}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {product.name}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {product.description}
                    </p>

                    {/* Specs */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                        <span className="flex items-center gap-1">
                            <span className="font-semibold">Ancho:</span> {product.width}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="font-semibold">Stock:</span> {product.stock}
                        </span>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {formatCurrency(product.price)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">por metro</div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddToCart}
                            className={`p-3 rounded-lg transition-colors ${isInCart(product.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-primary-600 hover:bg-primary-700 text-white'
                                }`}
                            aria-label="Agregar al carrito"
                        >
                            <FiShoppingCart className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </Link>

            {/* Added to Cart Message */}
            {showAddedMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap"
                >
                    ¡Agregado al carrito!
                </motion.div>
            )}
        </motion.div>
    );
}

export default ProductCard;
