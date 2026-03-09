import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import { useCart } from '../context/CartContext';

function Cart() {
    const { cartItems, clearCart } = useCart();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 section-container">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        Carrito de Compras
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    /* Empty Cart */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <FiShoppingBag className="w-16 h-16 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            Parece que aún no has agregado productos a tu carrito. ¡Explora nuestro catálogo y encuentra las telas perfectas para ti!
                        </p>
                        <Link to="/catalogo" className="btn-primary inline-flex items-center">
                            Explorar Catálogo
                        </Link>
                    </motion.div>
                ) : (
                    /* Cart with Items */
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Productos</h2>
                                <button
                                    onClick={clearCart}
                                    className="text-red-500 hover:text-red-600 text-sm font-medium"
                                >
                                    Vaciar Carrito
                                </button>
                            </div>

                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <CartSummary />
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Cart;
