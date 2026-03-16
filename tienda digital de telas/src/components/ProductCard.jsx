import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdShoppingCart, MdVisibility, MdFavoriteBorder } from 'react-icons/md';
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
            className="card group relative"
            style={{ borderRadius: '1rem' }}
        >
            <Link to={`/producto/${product.id}`}>
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-slate-800 rounded-t-2xl">
                    <img
                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png'}
                        alt={product.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

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
                            <MdVisibility className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-white text-gray-900 p-3 rounded-full shadow-lg"
                            aria-label="Agregar a favoritos"
                        >
                            <MdFavoriteBorder className="w-5 h-5" />
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
                            <MdShoppingCart className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </Link>

            {/* Added to Cart Message */}
            <AnimatePresence>
                {showAddedMessage && (
                    <motion.div
                        key="added-msg"
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
                        transition={{ duration: 0.2 }}
                        style={{ zIndex: 50, top: '-1rem' }}
                        className="absolute left-1/2 bg-green-500/95 text-white px-5 py-2 rounded-full shadow-xl text-sm font-semibold whitespace-nowrap pointer-events-none flex items-center gap-2"
                    >
                        <MdShoppingCart size={14} />
                        ¡Agregado al carrito!
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default ProductCard;
