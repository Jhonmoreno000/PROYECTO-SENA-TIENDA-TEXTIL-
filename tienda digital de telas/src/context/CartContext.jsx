/**
 * CartContext.jsx — Contexto del Carrito de Compras
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
 *  const { cartItems, addToCart, removeFromCart } = useCart();
 */

import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Guarda datos en el navegador automáticamente

// Creamos el contexto del carrito para compartirlo con toda la app
const CartContext = createContext();

/**
 * useCart — Hook para acceder al carrito desde cualquier componente
 */
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de un CartProvider');
    }
    return context;
}

/**
 * CartProvider — Proveedor del carrito
 * Envuelve la aplicación para que el carrito esté disponible en todas las pantallas.
 */
export function CartProvider({ children }) {
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
    const addToCart = (product, quantity = 1) => {
        const maxStock = product.stock ?? 99;
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            const currentQty = existingItem ? existingItem.quantity : 0;
            const newTotal = currentQty + quantity;

            if (newTotal > maxStock) {
                return prevItems;
            }

            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: newTotal }
                        : item
                );
            } else {
                return [...prevItems, { ...product, quantity }];
            }
        });
    };

    /**
     * updateQuantity — Cambia la cantidad de un producto en el carrito
     * Si la nueva cantidad es 0 o menor, el producto se elimina del carrito.
     * @param {string|number} productId - ID del producto a modificar
     * @param {number} newQuantity      - Nueva cantidad deseada
     */
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId); // Si la cantidad llega a 0, lo quitamos del carrito
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    /**
     * removeFromCart — Quita un producto del carrito completamente
     * @param {string|number} productId - ID del producto a eliminar
     */
    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    /**
     * clearCart — Vacía el carrito por completo y quita el cupón aplicado
     * Se llama después de completar una compra.
     */
    const clearCart = () => {
        setCartItems([]);
        setAppliedCoupon(null);
    };

    /**
     * getCartTotal — Calcula el precio total del carrito
     * Suma (precio × cantidad) de todos los productos.
     * @returns {number} Total en pesos colombianos
     */
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    /**
     * getCartItemCount — Cuenta cuántos artículos hay en el carrito (suma de cantidades)
     * @returns {number} Total de unidades/metros en el carrito
     */
    const getCartItemCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    /**
     * getOrderCalculations — Calcula descuento, envío, IVA y total
     * @param {Object} [coupon] - Cupón a usar (por defecto appliedCoupon)
     * @returns {{ subtotal, discount, afterDiscount, shipping, tax, total }}
     */
    const getOrderCalculations = (coupon = appliedCoupon) => {
        const subtotal = getCartTotal();
        let discount = 0;
        if (coupon) {
            discount = coupon.discountType === 'percentage'
                ? subtotal * (coupon.discountValue / 100)
                : coupon.discountValue;
            discount = Math.min(discount, subtotal);
        }
        const afterDiscount = subtotal - discount;
        const shipping = afterDiscount >= 100000 ? 0 : 15000;
        const tax = afterDiscount * 0.19;
        const total = afterDiscount + shipping + tax;
        return { subtotal, discount, afterDiscount, shipping, tax, total };
    };

    /**
     * isInCart — Verifica si un producto ya está en el carrito
     * @param {string|number} productId - ID del producto a verificar
     * @returns {boolean} true si está en el carrito, false si no
     */
    const isInCart = (productId) => {
        return cartItems.some((item) => item.id === productId);
    };

    /**
     * getProductQuantity — Obtiene la cantidad actual de un producto en el carrito
     * @param {string|number} productId - ID del producto
     * @returns {number} Cantidad en el carrito (0 si no está)
     */
    const getProductQuantity = (productId) => {
        const item = cartItems.find((item) => item.id === productId);
        return item ? item.quantity : 0;
    };

    // Datos y funciones disponibles para todos los componentes que usen useCart()
    const value = {
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
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
