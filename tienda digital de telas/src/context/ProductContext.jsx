import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export function useProducts() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts debe usarse dentro de un ProductProvider');
    }
    return context;
}

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Fetch products from the new Java Backend API
            const response = await fetch('http://localhost:8081/api/products');
            if (!response.ok) {
                throw new Error('Error al cargar los productos');
            }
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error("Error fetching products from API:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshProducts = () => {
        fetchProducts();
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const getProductById = (id) => {
        return products.find(p => p.id === id || p.id === String(id));
    };

    const updateProduct = async (updatedProduct) => {
        try {
            const response = await fetch(`http://localhost:8081/api/products/${updatedProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct)
            });
            if (response.ok) {
                setProducts(prev => prev.map(p => p.id === updatedProduct.id || p.id === String(updatedProduct.id) ? updatedProduct : p));
                refreshProducts();
            }
        } catch (err) {
            console.error("Error updating product:", err);
        }
    };

    const deleteProduct = async (id) => {
        try {
            const response = await fetch(`http://localhost:8081/api/products/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setProducts(prev => prev.filter(p => p.id !== id && p.id !== String(id)));
                refreshProducts();
            }
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    };

    const addProduct = async (newProduct) => {
        try {
            const response = await fetch('http://localhost:8081/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            if (response.ok) {
                refreshProducts();
            }
        } catch (err) {
            console.error("Error adding product:", err);
        }
    };

    const getFeaturedProducts = () => {
        return products.filter(p => p.featured).slice(0, 4);
    };

    const value = {
        products,
        loading,
        error,
        getProductById,
        updateProduct,
        deleteProduct,
        addProduct,
        getFeaturedProducts,
        refreshProducts
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
}
