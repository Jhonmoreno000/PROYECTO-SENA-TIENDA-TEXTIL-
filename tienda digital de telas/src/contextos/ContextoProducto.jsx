/**
 * ContextoProducto.jsx — Contexto del Catálogo de Productos
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
 *  const { products, loading, updateProduct } = useProductos();
 *
 * Endpoint de la API: GET http://localhost:8081/api/products
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getApiUrl, RUTAS_API } from '../config';

// Creamos el contexto del catálogo de productos
const ContextoProducto = createContext();

/**
 * useProductos — Hook para acceder al catálogo de productos desde cualquier componente
 */
export function useProductos() {
    const contextos = useContext(ContextoProducto);
    if (!contextos) {
        throw new Error('useProductos debe usarse dentro de un ProductProvider');
    }
    return contextos;
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
            const rutaProductos = RUTAS_API?.productos || '/api/productos';
            const response = await fetch(getApiUrl(rutaProductos));
            if (!response.ok) {
                throw new Error('Error al cargar los productos');
            }
            const datos = await response.json();
            const formattedData = (datos || []).map(p => {
                const nombre = p.name || p.nombre || '';
                const precio = Number(p.price ?? p.precio ?? 0);
                const existencias = Number(p.stock ?? p.existencias ?? 0);
                const categoria = p.category || p.categoria || '';
                const imagenes = (p.images || p.imagenes || []).map(img =>
                    img && typeof img === 'string' && img.startsWith('http://localhost:8081/uploads/')
                        ? img.replace('http://localhost:8081', '')
                        : img
                );
                return {
                    ...p,
                    name: nombre,
                    nombre,
                    price: precio,
                    precio,
                    stock: existencias,
                    existencias,
                    category: categoria,
                    categoria,
                    images: imagenes,
                    imagenes,
                    description: p.description || p.descripcion || '',
                    descripcion: p.description || p.descripcion || '',
                    featured: p.featured ?? p.destacado ?? false,
                    destacado: p.featured ?? p.destacado ?? false,
                    isNewCollection: p.isNewCollection ?? p.esNuevaColeccion ?? false,
                    esNuevaColeccion: p.isNewCollection ?? p.esNuevaColeccion ?? false,
                    isExclusive: p.isExclusive ?? p.esExclusivo ?? false,
                    esExclusivo: p.isExclusive ?? p.esExclusivo ?? false,
                    isOffer: p.isOffer ?? p.esOferta ?? false,
                    esOferta: p.isOffer ?? p.esOferta ?? false,
                };
            });
            setProducts(formattedData);
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
    const getProductById = useCallback((id) => {
        return products.find(p => p.id === id || p.id === String(id));
    }, [products]);

    /**
     * updateProduct — Actualiza un producto en la base de datos y en la UI
     * Envía los cambios al backend y actualiza la lista local al mismo tiempo.
     * @param {Object} updatedProduct - Producto con los campos modificados (debe incluir 'id')
     */
    const updateProduct = useCallback(async (updatedProduct) => {
        try {
            const rutaProd = RUTAS_API?.productos || '/api/productos';
            const response = await fetch(getApiUrl(`${rutaProd}/${updatedProduct.id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct)
            });
            if (response.ok) {
                setProducts(prev => prev.map(p =>
                    p.id === updatedProduct.id || p.id === String(updatedProduct.id) ? updatedProduct : p
                ));
                refreshProducts();
            }
        } catch (err) {
            console.error('Error al actualizar el producto:', err);
        }
    }, []);

    /**
     * deleteProduct — Elimina un producto de la base de datos y de la lista local
     * @param {string|number} id - ID del producto a eliminar
     */
    const deleteProduct = useCallback(async (id) => {
        try {
            const rutaProd = RUTAS_API?.productos || '/api/productos';
            const response = await fetch(getApiUrl(`${rutaProd}/${id}`), { method: 'DELETE' });
            if (response.ok) {
                setProducts(prev => prev.filter(p => p.id !== id && p.id !== String(id)));
                refreshProducts();
            }
        } catch (err) {
            console.error('Error al eliminar el producto:', err);
        }
    }, []);

    /**
     * addProduct — Crea un nuevo producto en la base de datos
     * @param {Object} newProduct - Datos del nuevo producto
     */
    const addProduct = useCallback(async (newProduct) => {
        try {
            const rutaProd = RUTAS_API?.productos || '/api/productos';
            const response = await fetch(getApiUrl(rutaProd), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            if (response.ok) {
                refreshProducts();
            }
        } catch (err) {
            console.error('Error al agregar el producto:', err);
        }
    }, []);

    /**
     * getFeaturedProducts — Devuelve los productos marcados como "destacados"
     * Máximo 4 productos. Se usan en la sección de "Productos Destacados" del Inicio.
     * @returns {Array} Lista de hasta 4 productos con featured=true
     */
    const getFeaturedProducts = useCallback(() => {
        return products.filter(p => p.featured).slice(0, 4);
    }, [products]);

    // Datos y funciones disponibles para toda la app
    const value = useMemo(() => ({
        products,            // Lista completa de productos
        loading,             // true mientras carga (para mostrar skeleton)
        error,               // Mensaje de error (o null si todo está bien)
        getProductById,      // Buscar un producto por ID
        updateProduct,       // Modificar un producto
        deleteProduct,       // Eliminar un producto
        addProduct,          // Crear un producto nuevo
        getFeaturedProducts, // Obtener productos destacados para el Inicio
        refreshProducts      // Recargar la lista desde la API
    }), [products, loading, error, getProductById, updateProduct, deleteProduct, addProduct, getFeaturedProducts]);

    return (
        <ContextoProducto.Provider value={value}>
            {children}
        </ContextoProducto.Provider>
    );
}
