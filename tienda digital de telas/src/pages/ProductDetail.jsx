import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiShare2, FiArrowLeft, FiCheck } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageGallery from '../components/ImageGallery';
import QuantitySelector from '../components/QuantitySelector';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { useProducts } from '../context/ProductContext';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { getProductById } = useProducts();
    const [quantity, setQuantity] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    const product = getProductById(id);

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Producto no encontrado</h1>
                        <Link to="/catalogo" className="btn-primary">
                            Volver al catálogo
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const { products } = useProducts();
    const relatedProducts = products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleBuyNow = () => {
        addToCart(product, quantity);
        navigate('/carrito');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Breadcrumb */}
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

                {/* Product Details */}
                <section className="section-container">
                    <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-8"
                    >
                        <FiArrowLeft /> Volver al catálogo
                    </Link>

                    <div className="grid md:grid-cols-2 gap-12 mb-16">
                        {/* Images */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <ImageGallery images={product.images} productName={product.name} />
                        </motion.div>

                        {/* Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            {/* Category Badge */}
                            <div className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-4 py-1 rounded-full text-sm font-semibold">
                                {product.category}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-display font-bold">
                                {product.name}
                            </h1>

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                                    {formatCurrency(product.price)}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">por metro</div>
                            </div>

                            {/* Description */}
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                {product.description}
                            </p>

                            {/* Specifications */}
                            <div className="card p-6 space-y-3">
                                <h3 className="font-bold text-lg mb-4">Especificaciones Técnicas</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Material</div>
                                        <div className="font-semibold">{product.material}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Ancho</div>
                                        <div className="font-semibold">{product.width}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Peso</div>
                                        <div className="font-semibold">{product.weight}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Stock</div>
                                        <div className="font-semibold">{product.stock} metros</div>
                                    </div>
                                </div>
                            </div>

                            {/* Care Instructions */}
                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <FiCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-blue-900 dark:text-blue-300">
                                        Cuidado del producto
                                    </div>
                                    <div className="text-sm text-blue-700 dark:text-blue-400">
                                        {product.care}
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div>
                                <label className="block font-bold mb-3">Cantidad (metros)</label>
                                <QuantitySelector
                                    quantity={quantity}
                                    setQuantity={setQuantity}
                                    max={product.stock}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleAddToCart}
                                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                                >
                                    <FiShoppingCart /> Agregar al Carrito
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleBuyNow}
                                    className="flex-1 btn-secondary"
                                >
                                    Comprar Ahora
                                </motion.button>
                            </div>

                            {/* Secondary Actions */}
                            <div className="flex gap-3">
                                <button className="flex-1 btn-outline flex items-center justify-center gap-2">
                                    <FiHeart /> Favoritos
                                </button>
                                <button className="flex-1 btn-outline flex items-center justify-center gap-2">
                                    <FiShare2 /> Compartir
                                </button>
                            </div>

                            {/* Success Message */}
                            {showSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-500 text-white p-4 rounded-lg flex items-center gap-3"
                                >
                                    <FiCheck className="w-5 h-5" />
                                    <span className="font-semibold">¡Producto agregado al carrito!</span>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div>
                            <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">
                                Productos Relacionados
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((relatedProduct) => (
                                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default ProductDetail;
