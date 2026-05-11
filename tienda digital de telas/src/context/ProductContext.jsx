/**
 * ProductContext.jsx — Contexto del Catálogo de Productos
 * =========================================================
 * Este archivo se conecta a la API del backend Java para traer todos los
 * productos de la tienda desde la base de datos PostgreSQL.
 *
 * ¿Qué hace?
 *  - Al cargar la app, pide automáticamente la lista de productos al backend
 *  - Guarda esa lista en memoria para que cualquier pantalla pueda usarla
 *  - Ofrece funciones para crear, actualizar y eliminar productos
 *
 * ¿Cómo se usa?
 *  const { products, loading, updateProduct } = useProducts();
 *
 * Endpoint de la API: GET http://localhost:8081/api/products
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Creamos el contexto del catálogo de productos
const ProductContext = createContext();

/**
 * useProducts — Hook para acceder al catálogo de productos desde cualquier componente
 */
export function useProducts() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts debe usarse dentro de un ProductProvider');
    }
    return context;
}

/**
 * ProductProvider — Proveedor del catálogo de productos
 * Carga los productos al iniciar y los mantiene actualizados.
 */
export function ProductProvider({ children }) {
    // Lista de todos los productos disponibles en la tienda
    const [products, setProducts] = useState([]);
    // true mientras los productos están cargando (mostramos un esqueleto de carga)
    const [loading, setLoading] = useState(true);
    // Mensaje de error si la conexión al backend falla
    const [error, setError] = useState(null);

    /**
     * fetchProducts — Pide la lista de productos al backend Java
     * Se llama automáticamente cuando la app carga y cuando se llama refreshProducts()
     */
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:8081/api/products');
            if (!response.ok) {
                throw new Error('Error al cargar los productos');
            }
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error('Error al obtener productos de la API:', err);
            // Mensaje específico si el backend no está encendido
            const errorMsg = err.message?.includes('Failed to fetch')
                ? 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.'
                : err.message;
            setError(errorMsg);
        } finally {
            setLoading(false); // Siempre quitamos el estado de carga, haya error o no
        }
    };

    /**
     * refreshProducts — Recarga los productos desde la base de datos
     * Se llama después de crear, editar o eliminar un producto para sincronizar la UI.
     */
    const refreshProducts = () => {
        fetchProducts();
    };

    // Cargamos los productos automáticamente cuando la app inicia
    useEffect(() => {
        fetchProducts();
    }, []); // El array vacío [] significa que se ejecuta solo una vez al montar el componente

    /**
     * getProductById — Busca un producto por su ID en la lista local
     * Acepta tanto IDs numéricos como en texto (ya que el backend puede devolver strings)
     * @param {string|number} id - ID del producto a buscar
     * @returns {Object|undefined} El producto encontrado, o undefined si no existe
     */
    const getProductById = (id) => {
        return products.find(p => p.id === id || p.id === String(id));
    };

    /**
     * updateProduct — Actualiza un producto en la base de datos y en la UI
     * Envía los cambios al backend y actualiza la lista local al mismo tiempo.
     * @param {Object} updatedProduct - Producto con los campos modificados (debe incluir 'id')
     */
    const updateProduct = async (updatedProduct) => {
        try {
            const response = await fetch(`http://localhost:8081/api/products/${updatedProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct)
            });
            if (response.ok) {
                // Actualizamos la lista local sin necesidad de recargar todo
                setProducts(prev => prev.map(p =>
                    p.id === updatedProduct.id || p.id === String(updatedProduct.id) ? updatedProduct : p
                ));
                // Luego recargamos desde la API para garantizar que los datos son exactos
                refreshProducts();
            }
        } catch (err) {
            console.error('Error al actualizar el producto:', err);
        }
    };

    /**
     * deleteProduct — Elimina un producto de la base de datos y de la lista local
     * @param {string|number} id - ID del producto a eliminar
     */
    const deleteProduct = async (id) => {
        try {
            const response = await fetch(`http://localhost:8081/api/products/${id}`, { method: 'DELETE' });
            if (response.ok) {
                // Quitamos el producto de la lista sin recargar toda la página
                setProducts(prev => prev.filter(p => p.id !== id && p.id !== String(id)));
                refreshProducts();
            }
        } catch (err) {
            console.error('Error al eliminar el producto:', err);
        }
    };

    /**
     * addProduct — Crea un nuevo producto en la base de datos
     * @param {Object} newProduct - Datos del nuevo producto
     */
    const addProduct = async (newProduct) => {
        try {
            const response = await fetch('http://localhost:8081/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            if (response.ok) {
                // Recargamos la lista para incluir el nuevo producto con su ID de la base de datos
                refreshProducts();
            }
        } catch (err) {
            console.error('Error al agregar el producto:', err);
        }
    };

    /**
     * getFeaturedProducts — Devuelve los productos marcados como "destacados"
     * Máximo 4 productos. Se usan en la sección de "Productos Destacados" del Home.
     * @returns {Array} Lista de hasta 4 productos con featured=true
     */
    const getFeaturedProducts = () => {
        return products.filter(p => p.featured).slice(0, 4);
    };

    // Datos y funciones disponibles para toda la app
    const value = {
        products,            // Lista completa de productos
        loading,             // true mientras carga (para mostrar skeleton)
        error,               // Mensaje de error (o null si todo está bien)
        getProductById,      // Buscar un producto por ID
        updateProduct,       // Modificar un producto
        deleteProduct,       // Eliminar un producto
        addProduct,          // Crear un producto nuevo
        getFeaturedProducts, // Obtener productos destacados para el Home
        refreshProducts      // Recargar la lista desde la API
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
}
