/**
 * ProductDetail.jsx — Página de Detalle de Producto
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
 *  - ProductCard:       tarjetas de productos relacionados al final de la página
 */

import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, ShoppingCart, Heart, Share2, Check } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedPage from '../components/AnimatedPage';
import ImageGallery from '../components/ImageGallery';
import QuantitySelector from '../components/QuantitySelector';
import ProductCard from '../components/ProductCard';
import { Skeleton, TextBlockSkeleton } from '../components/Skeleton';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { useProducts } from '../context/ProductContext';
import { useMetrics } from '../context/MetricsContext';

// Registramos el plugin de GSAP para que useGSAP funcione correctamente
gsap.registerPlugin(useGSAP);

function ProductDetail() {
    // Leemos el ID del producto desde la URL (Ej: /producto/42 → id = "42")
    const { id } = useParams();
    const navigate = useNavigate(); // Para navegar programáticamente al carrito

    const { addToCart } = useCart(); // Función para agregar al carrito
    const { getProductById, loading, products } = useProducts(); // Datos de productos
    const { isInWishlist, addToWishlist, removeFromWishlist } = useMetrics(); // Funciones de wishlist

    // Cantidad de metros que el cliente quiere comprar (por defecto 1)
    const [quantity, setQuantity] = useState(1);
    // Controla si se muestra el mensaje verde "¡Producto agregado al carrito!"
    const [showSuccess, setShowSuccess] = useState(false);

    // Referencias para las animaciones GSAP
    const contentRef = useRef(null); // Contenedor de la sección principal
    const successRef = useRef(null); // Mensaje de éxito

    // Animación de entrada: la columna izquierda entra desde la izquierda,
    // la derecha desde la derecha. Se repite cada vez que cambia el ID del producto.
    useGSAP(() => {
        if (contentRef.current) {
            const left = contentRef.current.querySelector('.pd-left');   // Columna de imágenes
            const right = contentRef.current.querySelector('.pd-right'); // Columna de info
            if (left) gsap.fromTo(left, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" });
            if (right) gsap.fromTo(right, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out", delay: 0.1 });
        }
    }, { scope: contentRef, dependencies: [id] });

    // Animación del mensaje de confirmación "¡Producto agregado!"
    useGSAP(() => {
        if (showSuccess && successRef.current) {
            gsap.fromTo(successRef.current,
                { opacity: 0, y: -10 }, // Empieza invisible y arriba
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" } // Aparece suavemente
            );
        }
    }, { dependencies: [showSuccess] });

    // Mientras los productos cargan desde la API, mostramos un spinner
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
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
                <Footer />
            </div>
        );
    }

    // Buscamos el producto con el ID de la URL en la lista de productos
    const product = getProductById(id);

    // Si no encontramos el producto (ID inválido o producto eliminado), mostramos un error
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

    // Productos relacionados: misma categoría, máximo 4, excluyendo el actual
    const relatedProducts = products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    /**
     * handleAddToCart — Agrega el producto al carrito y muestra confirmación
     * El mensaje de confirmación desaparece automáticamente después de 3 segundos.
     */
    const handleAddToCart = () => {
        addToCart(product, quantity);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000); // Ocultamos el mensaje a los 3 segundos
    };

    /**
     * handleBuyNow — Agrega al carrito y lleva directamente a la pantalla del carrito
     */
    const handleBuyNow = () => {
        addToCart(product, quantity);
        navigate('/carrito');
    };

    /**
     * handleToggleWishlist — Agrega o quita de favoritos
     */
    const handleToggleWishlist = () => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* AnimatedPage añade la animación de entrada al cambiar de página */}
            <AnimatedPage className="flex-1">

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
                            {/* Etiqueta de categoría */}
                            <div className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-4 py-1 rounded-full text-sm font-semibold">
                                {product.category}
                            </div>

                            {/* Nombre del producto */}
                            <h1 className="text-3xl md:text-4xl font-display font-bold">
                                {product.name}
                            </h1>

                            {/* Precio por metro */}
                            <div className="flex items-baseline gap-3">
                                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                                    {formatCurrency(product.price)}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">por metro</div>
                            </div>

                            {/* Descripción del producto */}
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                {product.description}
                            </p>

                            {/* Tabla de especificaciones técnicas */}
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

                            {/* Instrucciones de cuidado del tejido */}
                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Check className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-blue-900 dark:text-blue-300">
                                        Cuidado del producto
                                    </div>
                                    <div className="text-sm text-blue-700 dark:text-blue-400">
                                        {product.care}
                                    </div>
                                </div>
                            </div>

                            {/* Selector de cantidad en metros */}
                            <div>
                                <label className="block font-bold mb-3">Cantidad (metros)</label>
                                <QuantitySelector
                                    quantity={quantity}
                                    setQuantity={setQuantity}
                                    max={product.stock} // No permite pedir más que el stock disponible
                                />
                            </div>

                            {/* Botones principales: Agregar al carrito + Comprar ahora */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 btn-primary flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                >
                                    <ShoppingCart className="w-5 h-5" /> Agregar al Carrito
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 btn-secondary active:scale-95 transition-transform"
                                >
                                    Comprar Ahora
                                </button>
                            </div>

                            {/* Botones secundarios: Favoritos + Compartir */}
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleToggleWishlist}
                                    className={`flex-1 flex items-center justify-center gap-2 transition-colors ${
                                        isInWishlist(product?.id) 
                                            ? 'btn-secondary text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20' 
                                            : 'btn-outline'
                                    }`}
                                >
                                    <Heart className="w-5 h-5" fill={isInWishlist(product?.id) ? "currentColor" : "none"} /> 
                                    {isInWishlist(product?.id) ? 'En Favoritos' : 'Favoritos'}
                                </button>
                                <button className="flex-1 btn-outline flex items-center justify-center gap-2">
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
                                    <span className="font-semibold">¡Producto agregado al carrito!</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección de productos relacionados (misma categoría de tela) */}
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
            </AnimatedPage>

            <Footer />
        </div>
    );
}

export default ProductDetail;
