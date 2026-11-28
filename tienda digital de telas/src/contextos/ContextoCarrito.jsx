/**
 * ContextoCarrito.jsx — Contexto del Carrito de Compras
 * ===================================================
 * Este archivo gestiona el carrito de compras de la tienda.
 * Guarda los productos que el cliente seleccionó y permite
 * agregarlos, cambiar cantidades, quitarlos o vaciar el carrito.
 *
 * ¿Dónde se guardan los datos?
 *  Los productos del carrito se guardan en localStorage (memoria del navegador),
 *  así el cliente no pierde su carrito aunque recargue la página o cierre el navegador.
 *
 * ¿Cómo se usa?
 *  Cualquier componente puede acceder al carrito con:
 *  const { cartItems, addToCart, removeFromCart } = useCarrito();
 */

import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Guarda datos en el navegador automáticamente
import { useMetricas } from './ContextoMetricas';
import { getApiUrl } from '../config';

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

// Creamos el contexto del carrito para compartirlo con toda la app
const ContextoCarrito = createContext();

/**
 * useCarrito — Hook para acceder al carrito desde cualquier componente
 */
export function useCarrito() {
    const contextos = useContext(ContextoCarrito);
    if (!contextos) {
        throw new Error('useCarrito debe usarse dentro de un CartProvider');
    }
    return contextos;
}

/**
 * CartProvider — Proveedor del carrito
 * Envuelve la aplicación para que el carrito esté disponible en todas las pantallas.
 */
export function CartProvider({ children }) {
    const { systemConfig } = useMetricas();
    // Lista de productos en el carrito (se guarda automáticamente en el navegador)
    const [cartItems, setCartItems] = useLocalStorage('cart', []);
    // Cupón de descuento aplicado actualmente (si hay alguno)
    const [appliedCoupon, setAppliedCoupon] = useLocalStorage('applied_coupon', null);

    /**
     * addToCart — Agrega un producto al carrito
     * Si el producto ya está en el carrito, solo aumenta la cantidad.
     * Si es nuevo, lo agrega al final de la lista.
     * @param {Object} product  - Objeto del producto a agregar
     * @param {number} quantity - Cantidad de metros a agregar (por defecto 1)
     */
    const getProductQuantity = useCallback((productId) => {
        const items = Array.isArray(cartItems) ? cartItems : [];
        const item = items.find((item) => item.id === productId);
        return item ? Number(item.quantity) || 0 : 0;
    }, [cartItems]);

    const addToCart = useCallback((product, quantity = 1) => {
        const isRetazo = String(product.itemType || 'TELA').toUpperCase() === 'RETAZO';
        const maxStock = isRetazo ? 1 : round2(product.stock ?? product.existencias ?? 0);
        const qty = isRetazo ? 1 : round2(quantity || 1);
        if (maxStock <= 0 || qty <= 0) return false;

        const currentQty = round2(getProductQuantity(product.id));
        if (isRetazo && currentQty >= 1) return false;
        if (round2(currentQty + qty) > maxStock) return false;

        setCartItems((prevItems) => {
            const items = Array.isArray(prevItems) ? prevItems : [];
            const existingItem = items.find((item) => item.id === product.id);
            if (existingItem) {
                if (isRetazo) return items;
                return items.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: round2((Number(item.quantity) || 0) + qty) }
                        : item
                );
            }
            return [...items, { ...product, itemType: isRetazo ? 'RETAZO' : 'TELA', quantity: qty }];
        });
        return true;
    }, [getProductQuantity, setCartItems]);

    /**
     * removeFromCart — Quita un producto del carrito completamente
     * @param {string|number} productId - ID del producto a eliminar
     */
    const removeFromCart = useCallback((productId) => {
        setCartItems((prevItems) => {
            const items = Array.isArray(prevItems) ? prevItems : [];
            return items.filter((item) => item.id !== productId);
        });
    }, [setCartItems]);

    /**
     * updateQuantity — Cambia la cantidad de un producto en el carrito
     * Si la nueva cantidad es 0 o menor, el producto se elimina del carrito.
     * Para retazos (pieza única), la cantidad permanece bloqueada en 1.
     */
    const updateQuantity = useCallback((productId, newQuantity) => {
        const parsedQuantity = round2(newQuantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems((prevItems) => {
            const items = Array.isArray(prevItems) ? prevItems : [];
            return items.map((item) => {
                if (item.id !== productId) return item;
                if (String(item.itemType || 'TELA').toUpperCase() === 'RETAZO') {
                    return { ...item, quantity: 1 };
                }
                const maxStock = round2(item.stock ?? item.existencias ?? 0);
                const limitedQuantity = maxStock > 0 ? Math.min(parsedQuantity, maxStock) : parsedQuantity;
                return { ...item, quantity: round2(limitedQuantity) };
            });
        });
    }, [removeFromCart, setCartItems]);

    /**
     * validateCartStock — Valida en tiempo real la disponibilidad de telas y retazos en el backend.
     */
    const validateCartStock = useCallback(async () => {
        const items = Array.isArray(cartItems) ? cartItems : [];
        if (items.length === 0) return { available: false, errors: ['El carrito está vacío.'] };
        try {
            const payload = {
                items: items.map((it) => {
                    const isRetazo = String(it.itemType || 'TELA').toUpperCase() === 'RETAZO';
                    return isRetazo
                        ? { type: 'RETAZO', retazoId: Number(it.retazoId ?? String(it.id).replace('retazo-', '')), productId: Number(it.productId || 0), quantity: 1 }
                        : { type: 'TELA', productId: Number(it.productId ?? it.id), quantity: round2(it.quantity || 1) };
                }),
            };
            const res = await fetch(getApiUrl('/api/inventario/validar-disponibilidad'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) return { available: true, errors: [] };
            return await res.json();
        } catch {
            // Si el backend no responde en modo offline, no bloqueamos el flujo local
            return { available: true, errors: [] };
        }
    }, [cartItems]);

    /**
     * clearCart — Vacía el carrito por completo y quita el cupón aplicado
     * Se llama después de completar una compra.
     */
    const clearCart = useCallback(() => {
        setCartItems([]);
        setAppliedCoupon(null);
    }, [setCartItems, setAppliedCoupon]);

    useEffect(() => {
        const handleLogout = () => clearCart();
        window.addEventListener('auth-logout', handleLogout);
        return () => window.removeEventListener('auth-logout', handleLogout);
    }, [clearCart]);

    /**
     * getCartTotal — Calcula el precio total del carrito
     * Suma (precio × cantidad) de todos los productos.
     * @returns {number} Total en pesos colombianos
     */
    const getCartTotal = useCallback(() => {
        const items = Array.isArray(cartItems) ? cartItems : [];
        return round2(items.reduce((total, item) => total + round2(Number(item.price ?? item.precio ?? 0) * (Number(item.quantity) || 0)), 0));
    }, [cartItems]);

    /**
     * getCartItemCount — Cuenta cuántos artículos/metros hay en el carrito
     */
    const getCartItemCount = useCallback(() => {
        const items = Array.isArray(cartItems) ? cartItems : [];
        return round2(items.reduce((count, item) => count + (Number(item.quantity) || 0), 0));
    }, [cartItems]);

    /**
     * getOrderCalculations — Calcula descuento, envío, IVA y total
     * @param {Object} [coupon] - Cupón a usar (por defecto appliedCoupon)
     * @returns {{ subtotal, discount, afterDiscount, shipping, tax, total }}
     */
    const getOrderCalculations = useCallback((coupon = appliedCoupon) => {
        const subtotal = getCartTotal();
        let discount = 0;
        if (coupon) {
            const isPercentage = (coupon.discountType === 'percentage' || coupon.tipoDescuento === 'porcentaje');
            const discountVal = Number(coupon.discountValue ?? coupon.valorDescuento ?? 0);
            discount = isPercentage
                ? subtotal * (discountVal / 100)
                : discountVal;
            discount = Math.min(discount, subtotal);
        }
        const afterDiscount = subtotal - discount;
        const freeShippingThreshold = Number(systemConfig?.freeShippingThreshold ?? 200000);
        const shippingCost = Number(systemConfig?.shippingCost ?? 15000);
        const taxRate = Number(systemConfig?.taxRate ?? 0.19);
        const shipping = afterDiscount >= freeShippingThreshold ? 0 : shippingCost;
        const tax = afterDiscount * taxRate;
        const total = afterDiscount + shipping + tax;
        return { subtotal, discount, afterDiscount, shipping, tax, total };
    }, [appliedCoupon, getCartTotal, systemConfig]);

    /**
     * isInCart — Verifica si un producto ya está en el carrito
     * @param {string|number} productId - ID del producto a verificar
     * @returns {boolean} true si está en el carrito, false si no
     */
    const isInCart = useCallback((productId) => {
        const items = Array.isArray(cartItems) ? cartItems : [];
        return items.some((item) => item.id === productId);
    }, [cartItems]);

    // Datos y funciones disponibles para todos los componentes que usen useCarrito()
    const value = useMemo(() => ({
        cartItems,           // Lista de productos en el carrito
        appliedCoupon,       // Cupón de descuento activo (o null)
        setAppliedCoupon,    // Función para aplicar/quitar un cupón
        addToCart,           // Agregar un producto
        updateQuantity,      // Cambiar la cantidad de un producto
        removeFromCart,      // Quitar un producto
        clearCart,           // Vaciar todo el carrito
        getCartTotal,        // Calcular el total
        getCartItemCount,    // Contar artículos totales
        getOrderCalculations,// Calcular descuento, envío, IVA, total
        isInCart,            // Saber si un producto ya está en el carrito
        getProductQuantity,  // Saber la cantidad de un producto específico
        validateCartStock,   // Validar stock en tiempo real contra el backend
    }), [
        cartItems,
        appliedCoupon,
        setAppliedCoupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
        getOrderCalculations,
        isInCart,
        getProductQuantity,
        validateCartStock,
    ]);

    return <ContextoCarrito.Provider value={value}>{children}</ContextoCarrito.Provider>;
}
