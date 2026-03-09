import React, { createContext, useContext, useState } from 'react';
import productsData from '../data/products.json';

const ProductContext = createContext();

export function useProducts() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts debe usarse dentro de un ProductProvider');
    }
    return context;
}

export function ProductProvider({ children }) {
    const [products, setProducts] = useState(productsData);

    const getProductById = (id) => {
        return products.find(p => p.id === id);
    };

    const updateProduct = (updatedProduct) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const deleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const addProduct = (newProduct) => {
        setProducts(prev => [...prev, newProduct]);
    };

    const getFeaturedProducts = () => {
        // Por ahora retornamos los primeros 4, en el futuro podría ser un flag 'featured'
        return products.slice(0, 4);
    };

    const value = {
        products,
        getProductById,
        updateProduct,
        deleteProduct,
        addProduct,
        getFeaturedProducts
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
}
