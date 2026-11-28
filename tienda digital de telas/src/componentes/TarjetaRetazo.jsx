import React, { useState, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ShoppingCart, Tag, Check, Ruler, Scissors, Package, Layers } from 'lucide-react';
import { useCarrito } from '../contextos/ContextoCarrito';
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

function TarjetaRetazo({ retazo }) {
    const { addToCart, isInCart } = useCarrito();
    const { showNotification } = useNotificacion();
    const [showAddedMessage, setShowAddedMessage] = useState(false);
    const messageRef = useRef(null);
    const cardRef = useRef(null);
    const tiltFrame = useRef(null);

    const cartId = `retazo-${retazo.id}`;
    const inCart = isInCart(cartId);
    const isSold = String(retazo.status || retazo.estado || 'DISPONIBLE').toUpperCase() !== 'DISPONIBLE';
    const lengthMeters = Number(retazo.lengthMeters ?? retazo.largoMetros ?? 0);
    const widthMeters = Number(retazo.widthMeters ?? retazo.anchoMetros ?? 1.5);
    const dimensionsLabel = `${lengthMeters.toFixed(2).replace('.', ',')} m × ${widthMeters.toFixed(2).replace('.', ',')} m`;
    const originalPrice = Number(retazo.originalPrice ?? retazo.precioOriginal ?? 0);
    const liquidationPrice = Number(retazo.price ?? retazo.precioLiquidacion ?? 0);
    const discountPercent = Math.round(Number(retazo.discountPercent ?? retazo.porcentajeDescuento ?? 40));
    const category = retazo.category || retazo.categoria || 'Textil';
    const categoryStyle = CATEGORY_STYLES[category] || 'bg-slate-600/90 text-white';
    const imageUrl = retazo.image || retazo.imagen || '/placeholder.webp';

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSold || inCart) return;

        const retazoItem = {
            id: cartId,
            retazoId: retazo.id,
            productId: retazo.productId ?? retazo.productoId,
            itemType: 'RETAZO',
            name: `Retazo ${retazo.name || retazo.nombreProducto}`,
            category,
            material: retazo.material || '',
            price: liquidationPrice,
            originalPrice,
            stock: 1,
            dimensions: dimensionsLabel,
            lengthMeters,
            widthMeters,
            remnantCode: retazo.remnantCode || retazo.codigoRetazo,
            dyeLot: retazo.dyeLot || retazo.loteTintoreria,
            images: imageUrl ? [imageUrl] : [],
        };

        const added = addToCart(retazoItem, 1);
        if (added) {
            setShowAddedMessage(true);
            if (messageRef.current) {
                gsap.fromTo(
                    messageRef.current,
                    { opacity: 0, y: -12, x: '-50%', scale: 0.95 },
                    { opacity: 1, y: 0, x: '-50%', scale: 1, duration: 0.25, ease: 'back.out(1.2)', force3D: true }
                );
            }
            if (showNotification) {
                showNotification('success', `Pieza única "${retazoItem.name}" (${dimensionsLabel}) agregada al carrito.`);
            }
            setTimeout(() => setShowAddedMessage(false), 2000);
        }
    };

    const handleMouseEnter = () => {
        gsap.to(cardRef.current, {
            scale: 1.03,
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.22)',
            duration: 0.22,
            force3D: true,
            ease: 'power2.out',
        });
    };

    const handleMouseLeave = () => {
        gsap.to(cardRef.current, {
            scale: 1,
            rotationY: 0,
            rotationX: 0,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            duration: 0.22,
            force3D: true,
            ease: 'power2.out',
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
            const rotateX = (y - rect.height / 2) / 14;
            const rotateY = (rect.width / 2 - x) / 14;

            gsap.to(cardRef.current, {
                rotationX: rotateX,
                rotationY: rotateY,
                duration: 0.18,
                force3D: true,
                ease: 'power1.out',
                overwrite: 'auto',
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
            className="card group relative rounded-2xl transition-shadow duration-300 overflow-hidden flex flex-col"
        >
            <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-slate-800 rounded-t-2xl">
                <img
                    src={imageUrl}
                    alt={`Retazo ${retazo.name || retazo.nombreProducto}`}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.webp';
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Badge de liquidación */}
                <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-1.5 z-10 border border-white/20 backdrop-blur-md">
                    <Tag size={11} />
                    <span>RETAZO -{discountPercent}%</span>
                </div>

                {/* Badge de categoría */}
                <div className={`absolute top-11 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md ${categoryStyle}`}>
                    {category}
                </div>

                {/* Badge Pieza Única / Vendido */}
                {isSold ? (
                    <div className="absolute bottom-3 right-3 bg-gray-900/85 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Vendido
                    </div>
                ) : (
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 border border-white/15">
                        <Scissors className="w-3.5 h-3.5 text-amber-400" />
                        Pieza única (1 ud.)
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-mono font-semibold text-gray-400 dark:text-gray-500">
                            {retazo.remnantCode || retazo.codigoRetazo}
                        </span>
                        {retazo.dyeLot && (
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                Lote: {retazo.dyeLot}
                            </span>
                        )}
                    </div>

                    <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        Retazo {retazo.name || retazo.nombreProducto}
                    </h3>

                    {retazo.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {retazo.notes}
                        </p>
                    )}

                    {/* Dimensiones fijas y atributos */}
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold border border-primary-200/60 dark:border-primary-800/50">
                            <Ruler size={12} /> {dimensionsLabel}
                        </span>
                        {retazo.material && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium">
                                <Package size={12} /> {retazo.material}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-medium">
                            <Layers size={12} /> Medida fija
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700/60">
                    <div>
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 leading-tight">
                            {formatCurrency(liquidationPrice)}
                        </div>
                        {originalPrice > liquidationPrice && (
                            <div className="text-xs text-gray-400 line-through">
                                {formatCurrency(originalPrice)}
                            </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">precio cerrado</div>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isSold || inCart}
                        className={`relative px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all duration-200 ${
                            isSold
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : inCart
                                    ? 'bg-green-500 text-white cursor-default'
                                    : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105 active:scale-95 shadow-md shadow-primary-500/20'
                        }`}
                        aria-label={isSold ? 'Vendido' : inCart ? 'En tu carrito' : 'Agregar pieza única al carrito'}
                    >
                        {inCart ? (
                            <>
                                <Check className="w-4 h-4" /> En carrito
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4" /> {isSold ? 'Vendido' : 'Agregar'}
                            </>
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
                ¡Pieza única agregada!
            </div>
        </div>
    );
}

export default TarjetaRetazo;
