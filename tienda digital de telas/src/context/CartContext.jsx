import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CartContext = createContext();

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de un CartProvider');
    }
    return context;
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useLocalStorage('cart', []);
    const [appliedCoupon, setAppliedCoupon] = useLocalStorage('applied_coupon', null);

    // Agregar producto al carrito
    const addToCart = (product, quantity = 1) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);

            if (existingItem) {
                // Si el producto ya existe, actualizar cantidad
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Si es nuevo, agregarlo
                return [...prevItems, { ...product, quantity }];
            }
        });
    };

    // Actualizar cantidad de un producto
    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Eliminar producto del carrito
    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    // Limpiar todo el carrito
    const clearCart = () => {
        setCartItems([]);
        setAppliedCoupon(null);
    };

    // Obtener total del carrito
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    // Obtener cantidad total de items
    const getCartItemCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    // Verificar si un producto está en el carrito
    const isInCart = (productId) => {
        return cartItems.some((item) => item.id === productId);
    };

    // Obtener cantidad de un producto específico
    const getProductQuantity = (productId) => {
        const item = cartItems.find((item) => item.id === productId);
        return item ? item.quantity : 0;
    };

    const value = {
        cartItems,
        appliedCoupon,
        setAppliedCoupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
        isInCart,
        getProductQuantity,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
