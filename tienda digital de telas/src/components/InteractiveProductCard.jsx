/**
 * InteractiveProductCard.jsx — Tarjeta de Inspección Premium de Producto
 *
 * Implementa interacciones que acercan el producto digital
 * a la experiencia física mediante simulación visual de texturas y materiales.
 *
 * Migrado de framer-motion a GSAP + CSS nativo.
 */

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ShoppingCart, Check, Eye, Calculator } from 'lucide-react';
import CalculatorModal from './CalculatorModal';

/**
 * InteractiveProductCard
 *
 * Componente de tarjeta de producto con interacción avanzada de lupa
 * para inspeccionar la textura de la tela. También incluye la calculadora
 * de metros y la funcionalidad de añadir al carrito.
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.productName="Tela Violeta Premium"] - Nombre del producto a mostrar
 * @param {string} [props.imageSrc="/images/hero-telas-premium.png"] - URL de la imagen del producto
 * @param {string} [props.price="$45.000 / metro"] - Precio formateado del producto
 * @returns {JSX.Element} Tarjeta interactiva de producto
 */
export default function InteractiveProductCard({ 
    productName = "Tela Violeta Premium", 
    imageSrc = "/images/hero-telas-premium.png",
    price = "$45.000 / metro"
}) {
    const [position, setPosition] = useState({ x: 0, y: 0, mouseX: 0, mouseY: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [cartStatus, setCartStatus] = useState("idle");
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    const lensRef = useRef(null);
    const imageRef = useRef(null);
    const btnContentRef = useRef(null);

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setPosition({ 
            x, 
            y, 
            mouseX: e.clientX - left, 
            mouseY: e.clientY - top 
        });
    };

    // Animar lupa con GSAP (posición spring)
    useEffect(() => {
        if (isHovering && lensRef.current) {
            gsap.to(lensRef.current, {
                x: position.mouseX - 75,
                y: position.mouseY - 75,
                duration: 0.15,
                ease: "power2.out"
            });
        }
    }, [position.mouseX, position.mouseY, isHovering]);

    // Animar entrada/salida de la lupa
    useEffect(() => {
        if (lensRef.current) {
            if (isHovering) {
                gsap.fromTo(lensRef.current,
                    { opacity: 0, scale: 0 },
                    { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.5)" }
                );
            } else {
                gsap.to(lensRef.current, { opacity: 0, scale: 0, duration: 0.2 });
            }
        }
        // Animar imagen base
        if (imageRef.current) {
            gsap.to(imageRef.current, {
                scale: isHovering ? 1.05 : 1,
                filter: isHovering ? "brightness(1.05)" : "brightness(1)",
                duration: 0.8,
                ease: "power2.out"
            });
        }
    }, [isHovering]);

    // Animar transiciones del botón
    useEffect(() => {
        if (btnContentRef.current) {
            gsap.fromTo(btnContentRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }
            );
        }
    }, [cartStatus]);

    /**
     * Maneja la adición del producto al carrito, simulando
     * un estado de carga y éxito.
     * @param {number} qty - Cantidad a agregar (metros)
     */
    const handleAddToCart = (qty = 1) => {
        if (cartStatus !== "idle") return;
        // TODO: Conectar con el contexto real del carrito (CartContext)
        setCartStatus("loading");
        setTimeout(() => setCartStatus("success"), 1200);
        setTimeout(() => setCartStatus("idle"), 3500);
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden border border-gray-100 dark:border-white/5">
            {/* VISOR DE INSPECCIÓN CON EFECTO LUPA */}
            <div 
                className="relative h-80 overflow-hidden cursor-none bg-gray-100 dark:bg-slate-800"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onMouseMove={handleMouseMove}
            >
                <img 
                    ref={imageRef}
                    src={imageSrc} 
                    alt={productName} 
                    className="w-full h-full object-cover"
                />

                {/* Badge Flotante */}
                <div className="absolute top-4 left-4 bg-white/80 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-gray-800 dark:text-gray-200 shadow-sm border border-white/20 pointer-events-none">
                    <Eye size={14} /> Inspeccionar textura
                </div>

                {/* LUPA CON GLASSMORPHISM */}
                <div
                    ref={lensRef}
                    className="absolute top-0 left-0 w-[150px] h-[150px] rounded-full pointer-events-none z-50 overflow-hidden backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/40 ring-4 ring-white/10"
                    style={{ opacity: 0, transform: 'scale(0)' }}
                >
                    <div 
                        className="w-full h-full rounded-full"
                        style={{
                            backgroundImage: `url(${imageSrc})`,
                            backgroundPosition: `${position.x}% ${position.y}%`,
                            backgroundSize: "300%",
                            backgroundRepeat: "no-repeat",
                            filter: "contrast(1.4) saturate(1.2) drop-shadow(0 0 4px rgba(0,0,0,0.5))"
                        }}
                    />
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_10px_rgba(255,255,255,0.6)] mix-blend-overlay pointer-events-none" />
                </div>
            </div>

            {/* DETALLES INFORMATIVOS DEL PRODUCTO */}
            <div className="p-8">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{productName}</h3>
                        
                        <button 
                            onClick={() => setIsCalculatorOpen(true)}
                            className="p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 rounded-full transition-colors flex items-center justify-center shadow-sm"
                            title="¿Cuánta tela necesito?"
                        >
                            <Calculator size={20} />
                        </button>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        Textura sedosa de alta densidad. Pasa el cursor sobre la imagen superior para inspeccionar de cerca la calidad y el patrón de los hilos.
                    </p>
                </div>
                
                {/* Zona de precio y CTA */}
                <div className="flex items-center justify-between mt-8">
                    <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Precio</span>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{price}</div>
                    </div>

                    {/* BOTÓN CON MICRO-INTERACCIÓN PREMIUM */}
                    <button
                        onClick={handleAddToCart}
                        className={`relative overflow-hidden h-12 w-40 rounded-xl font-semibold flex items-center justify-center text-sm transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 ${
                            cartStatus === "success" 
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30" 
                                : "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 shadow-gray-900/20 dark:shadow-white/20"
                        }`}
                    >
                        {cartStatus === "idle" && (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite]" />
                        )}

                        <div ref={btnContentRef} className="flex items-center gap-2">
                            {cartStatus === "idle" && (
                                <>
                                    <ShoppingCart size={16} />
                                    <span>Comprar</span>
                                </>
                            )}
                            {cartStatus === "loading" && (
                                <div className="w-5 h-5 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin" />
                            )}
                            {cartStatus === "success" && (
                                <>
                                    <Check size={18} strokeWidth={3} />
                                    <span>¡Agregado!</span>
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {/* Modal de la Calculadora de Proyectos */}
            <CalculatorModal 
                isOpen={isCalculatorOpen} 
                onClose={() => setIsCalculatorOpen(false)} 
                onAddToCart={(meters) => handleAddToCart(meters)}
            />
        </div>
    );
}
