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
 * Endpoint de la API: GET /api/productos
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getApiUrl, RUTAS_API } from '../config';
import { useNotificacion } from './ContextoNotificacion';
import servicioWebSocket from '../servicios/servicioWebSocket';

const CLAVE_CACHE_CATALOGO = 'ddtextil_catalogo_respaldo_v1';

const CATALOGO_SEMILLA_RESPALDO = [
    { id: '1', name: 'Algodón Premium', category: 'Algodon', price: 25000, sellerId: 2, sellerName: 'Carlos Pérez', description: 'Tela de algodón 100% natural, ideal para camisas y blusas.', material: 'Algodón 100%', width: '1.50m', weight: '150g/m2', care: 'Lavar en frío, no blanquear', stock: 100, featured: true, active: true, status: 'approved', isNewCollection: true, isExclusive: false, isOffer: false, images: ['/uploads/product_12_1775767112691.jpg', '/images/hero-detail-1.webp'] },
    { id: '2', name: 'Seda Italiana', category: 'Seda', price: 85000, sellerId: 2, sellerName: 'Carlos Pérez', description: 'Seda pura con acabado brillante, perfecta para vestidos de gala.', material: 'Seda pura', width: '1.40m', weight: '80g/m2', care: 'Limpieza en seco únicamente', stock: 50, featured: true, active: true, status: 'approved', isNewCollection: false, isExclusive: true, isOffer: false, images: ['/uploads/product_16_1775766690228.webp', '/images/hero-detail-2.webp'] },
    { id: '3', name: 'Lino Orgánico', category: 'Lino', price: 45000, sellerId: 3, sellerName: 'María González', description: 'Lino fresco y transpirable para ropa de verano.', material: 'Lino orgánico', width: '1.50m', weight: '200g/m2', care: 'No usar secadora', stock: 80, featured: false, active: true, status: 'approved', isNewCollection: true, isExclusive: false, isOffer: false, images: ['/uploads/product_14_1775766898975.webp', '/images/hero-detail-3.webp'] },
    { id: '4', name: 'Lana Merino', category: 'Lana', price: 65000, sellerId: 3, sellerName: 'María González', description: 'Lana suave y cálida, ideal para abrigos de invierno.', material: 'Lana merino', width: '1.60m', weight: '300g/m2', care: 'Lavar a mano con agua tibia', stock: 30, featured: true, active: true, status: 'approved', isNewCollection: false, isExclusive: true, isOffer: false, images: ['/uploads/product_14_1775766898975.webp', '/images/hero-detail-1.webp'] },
    { id: '5', name: 'Dril Elástico', category: 'Algodon', price: 35000, sellerId: 2, sellerName: 'Carlos Pérez', description: 'Dril resistente con toque de elasticidad para pantalones.', material: 'Algodón/Lycra 95/5', width: '1.50m', weight: '250g/m2', care: 'Lavar a máquina en ciclo suave', stock: 120, featured: false, active: true, status: 'approved', isNewCollection: false, isExclusive: false, isOffer: true, images: ['/uploads/product_10_1775767265179.jpg', '/images/hero-detail-2.webp'] },
    { id: '6', name: 'Gasa de Seda', category: 'Seda', price: 72000, sellerId: 3, sellerName: 'María González', description: 'Gasa ligera y transparente para pañuelos y cortinas.', material: 'Seda/Poliéster', width: '1.40m', weight: '45g/m2', care: 'Lavar a mano', stock: 60, featured: true, active: true, status: 'approved', isNewCollection: false, isExclusive: true, isOffer: false, images: ['/uploads/product_16_1775766690228.webp', '/images/hero-detail-3.webp'] },
    { id: '7', name: 'Tela Polar', category: 'Poliester', price: 22000, sellerId: 2, sellerName: 'Carlos Pérez', description: 'Tela polar suave para cobijas y chaquetas.', material: 'Poliéster 100%', width: '1.50m', weight: '280g/m2', care: 'Lavar a máquina, no planchar', stock: 150, featured: false, active: true, status: 'approved', isNewCollection: false, isExclusive: false, isOffer: true, images: ['/uploads/product_15_1775767332095.jpg', '/images/hero-detail-1.webp'] },
    { id: '8', name: 'Oxford Camisa', category: 'Algodon', price: 38000, sellerId: 3, sellerName: 'María González', description: 'Tela oxford clásica para camisas formales.', material: 'Algodón peinado', width: '1.50m', weight: '130g/m2', care: 'Planchar a temperatura media', stock: 90, featured: false, active: true, status: 'approved', isNewCollection: true, isExclusive: false, isOffer: false, images: ['/uploads/product_12_1775767112691.jpg', '/images/hero-detail-2.webp'] },
    { id: '9', name: 'Retazo Algodón', category: 'Algodon', price: 12000, sellerId: 2, sellerName: 'Carlos Pérez', description: 'Retazo de algodón premium, disponible para proyectos pequeños.', material: 'Algodón', width: '1.40m', weight: '150g/m2', care: 'Lavar a máquina', stock: 3, featured: false, active: true, status: 'approved', isNewCollection: false, isExclusive: false, isOffer: true, images: ['/uploads/product_9_1775766848979.jpg', '/images/hero-detail-3.webp'] },
    { id: '10', name: 'Seda Cruda', category: 'Seda', price: 95000, sellerId: 2, sellerName: 'Carlos Pérez', description: 'Seda cruda sin teñir, última pieza disponible.', material: 'Seda pura', width: '1.10m', weight: '60g/m2', care: 'Limpieza en seco', stock: 8, featured: false, active: true, status: 'approved', isNewCollection: false, isExclusive: true, isOffer: false, images: ['/uploads/product_10_1775766963190.webp', '/images/hero-detail-1.webp'] },
    { id: '11', name: 'Lino Arrugado', category: 'Lino', price: 38000, sellerId: 2, sellerName: 'Carlos Pérez', description: 'Lino con textura arrugada natural.', material: 'Lino', width: '1.50m', weight: '180g/m2', care: 'Planchar en caliente', stock: 25, featured: false, active: true, status: 'approved', isNewCollection: false, isExclusive: false, isOffer: true, images: ['/uploads/product_11_1775767027618.jpg', '/images/hero-detail-2.webp'] },
    { id: '12', name: 'Lana Bebé', category: 'Lana', price: 72000, sellerId: 3, sellerName: 'María González', description: 'Lana ultra suave para ropa de bebé. Quedan pocos metros.', material: 'Lana merino', width: '1.30m', weight: '200g/m2', care: 'Lavar a mano', stock: 5, featured: false, active: true, status: 'approved', isNewCollection: true, isExclusive: false, isOffer: false, images: ['/uploads/product_15_1775767332095.jpg', '/images/hero-detail-3.webp'] },
    { id: '13', name: 'Algodón Estampado', category: 'Algodon', price: 28000, sellerId: 3, sellerName: 'María González', description: 'Algodón con estampado floral, edición limitada.', material: 'Algodón', width: '1.45m', weight: '130g/m2', care: 'Lavar a máquina', stock: 12, featured: false, active: true, status: 'approved', isNewCollection: true, isExclusive: false, isOffer: false, images: ['/uploads/product_13_1777056293881.jpg', '/images/hero-detail-1.webp'] }
];

function normalizarListaProductos(datos) {
    return (datos || []).map(p => {
        const nombre = p.name || p.nombre || '';
        const precio = Number(p.price ?? p.precio ?? 0);
        const rawStock = p.stock ?? p.existencias;
        const existencias = rawStock !== undefined && rawStock !== null ? Number(rawStock) : 0;
        const categoria = p.category || p.categoria || '';
        const imagenes = p.images || p.imagenes || [];
        const isSaleVal = p.isSale ?? p.isOffer ?? p.esOferta ?? false;
        return {
            ...p,
            id: String(p.id),
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
            sellerName: p.sellerName ?? p.nombreVendedor ?? '',
            status: p.status ?? p.estadoModeracion ?? 'approved',
            rejectionReason: p.rejectionReason ?? p.motivoRechazo ?? '',
            createdAt: p.createdAt ?? p.creadoEn ?? '',
            active: p.active !== undefined ? p.active : (p.activo !== undefined ? p.activo : true),
            featured: p.featured ?? p.destacado ?? false,
            destacado: p.featured ?? p.destacado ?? false,
            isNewCollection: p.isNewCollection ?? p.esNuevaColeccion ?? false,
            esNuevaColeccion: p.isNewCollection ?? p.esNuevaColeccion ?? false,
            isExclusive: p.isExclusive ?? p.esExclusivo ?? false,
            esExclusivo: p.isExclusive ?? p.esExclusivo ?? false,
            isSale: isSaleVal,
            isOffer: isSaleVal,
            esOferta: isSaleVal,
        };
    });
}

function obtenerCatalogoRespaldo() {
    try {
        const guardado = localStorage.getItem(CLAVE_CACHE_CATALOGO);
        if (guardado) {
            const parseado = JSON.parse(guardado);
            if (Array.isArray(parseado) && parseado.length > 0) {
                return normalizarListaProductos(parseado);
            }
        }
    } catch {
        // Ignorar errores de almacenamiento restringido
    }
    return normalizarListaProductos(CATALOGO_SEMILLA_RESPALDO);
}

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
    // Lista de todos los productos disponibles en la tienda (inicia con respaldo local instantáneo)
    const [products, setProducts] = useState(() => obtenerCatalogoRespaldo());
    // true mientras los productos están cargando por primera vez sin caché previa
    const [loading, setLoading] = useState(false);
    // Mensaje de error si la conexión al backend falla y no hay respaldo disponible
    const [error, setError] = useState(null);
    const { showNotification } = useNotificacion();

    /**
     * fetchProducts — Pide la lista de productos al backend Java con reintentos automáticos
     * y respaldo resiliente en caché local para evitar bloqueos visuales.
     */
    const fetchProducts = useCallback(async () => {
        setError(null);
        const rutaProductos = RUTAS_API?.productos || '/api/productos';
        const urlPrincipal = getApiUrl(rutaProductos);
        const urlsCandidatas = urlPrincipal.startsWith('http')
            ? [urlPrincipal, rutaProductos]
            : [urlPrincipal, `http://localhost:8081${rutaProductos}`];

        for (let intento = 0; intento < 3; intento++) {
            for (const url of urlsCandidatas) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const datos = await response.json();
                        if (Array.isArray(datos) && datos.length > 0) {
                            const formattedData = normalizarListaProductos(datos);
                            setProducts(formattedData);
                            setError(null);
                            try {
                                localStorage.setItem(CLAVE_CACHE_CATALOGO, JSON.stringify(formattedData));
                            } catch {
                                // Ignorar cuota de localStorage
                            }
                            setLoading(false);
                            return;
                        }
                    }
                } catch {
                    // Continuar con siguiente URL candidata o reintento
                }
            }
            if (intento < 2) {
                await new Promise(res => setTimeout(res, 600 * (intento + 1)));
            }
        }

        // Si el backend está temporalmente apagado o reiniciando, mantener el catálogo de respaldo activo
        const respaldo = obtenerCatalogoRespaldo();
        if (respaldo.length > 0) {
            setProducts(respaldo);
            setError(null);
        } else {
            setError('No se puede conectar con el servidor. Verifica que el backend esté corriendo.');
        }
        setLoading(false);
    }, []);

    /**
     * refreshProducts — Recarga los productos desde la base de datos
     * Se llama después de crear, editar o eliminar un producto para sincronizar la UI.
     */
    const refreshProducts = useCallback(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Cargamos los productos automáticamente cuando la app inicia y al recuperar conexión/foco
    useEffect(() => {
        fetchProducts();
        const alRecuperarConexion = () => fetchProducts();
        window.addEventListener('online', alRecuperarConexion);
        window.addEventListener('focus', alRecuperarConexion);
        return () => {
            window.removeEventListener('online', alRecuperarConexion);
            window.removeEventListener('focus', alRecuperarConexion);
        };
    }, [fetchProducts]);

    // Sincronización en tiempo real vía WebSocket
    useEffect(() => {
        servicioWebSocket.conectar();
        const desuscribirStock = servicioWebSocket.suscribir('STOCK_ACTUALIZADO', (datos) => {
            if (!datos || datos.idProducto === undefined) return;
            setProducts((prev) =>
                prev.map((p) =>
                    String(p.id) === String(datos.idProducto)
                        ? { ...p, stock: Number(datos.stock), existencias: Number(datos.stock) }
                        : p
                )
            );
        });

        const desuscribirOferta = servicioWebSocket.suscribir('OFERTA_ACTUALIZADA', (datos) => {
            if (!datos || datos.idProducto === undefined) return;
            setProducts((prev) =>
                prev.map((p) =>
                    String(p.id) === String(datos.idProducto)
                        ? { ...p, isOffer: Boolean(datos.esOferta), isSale: Boolean(datos.esOferta), esOferta: Boolean(datos.esOferta) }
                        : p
                )
            );
        });

        const desuscribirNuevo = servicioWebSocket.suscribir('NUEVO_PRODUCTO', () => {
            fetchProducts();
        });

        return () => {
            desuscribirStock();
            desuscribirOferta();
            desuscribirNuevo();
        };
    }, [fetchProducts]);

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
    const updateProduct = useCallback(async (idOrProduct, maybeUpdates) => {
        try {
            const isTwoArgs = maybeUpdates !== undefined;
            const targetId = isTwoArgs ? idOrProduct : idOrProduct?.id;
            const payload = isTwoArgs ? { ...maybeUpdates, id: targetId } : idOrProduct;
            const rutaProd = RUTAS_API?.productos || '/api/productos';
            const response = await fetch(getApiUrl(`${rutaProd}/${targetId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                setProducts(prev => prev.map(p =>
                    String(p.id) === String(targetId) ? { ...p, ...payload, id: String(targetId) } : p
                ));
                refreshProducts();
                return true;
            }
            showNotification('error', 'No se pudo actualizar el producto en el servidor.');
            return false;
        } catch (err) {
            console.error('Error al actualizar el producto:', err);
            showNotification('error', 'Error de conexión al actualizar el producto.');
            return false;
        }
    }, [showNotification]);

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
                return true;
            }
            showNotification('error', 'No se pudo eliminar el producto en el servidor.');
            return false;
        } catch (err) {
            console.error('Error al eliminar el producto:', err);
            showNotification('error', 'Error de conexión al eliminar el producto.');
            return false;
        }
    }, [showNotification]);

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
                const saved = await response.json().catch(() => ({}));
                const created = saved?.product || { ...newProduct, id: String(saved?.id ?? newProduct.id ?? '') };
                setProducts(prev => [...prev, created]);
                refreshProducts();
                return created;
            }
            showNotification('error', 'No se pudo crear el producto en el servidor.');
            return false;
        } catch (err) {
            console.error('Error al agregar el producto:', err);
            showNotification('error', 'Error de conexión al crear el producto.');
            return false;
        }
    }, [showNotification]);

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
