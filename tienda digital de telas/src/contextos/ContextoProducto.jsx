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
import { useAutenticacion } from './ContextoAutenticacion';
import servicioWebSocket from '../servicios/servicioWebSocket';

const CLAVE_CACHE_CATALOGO = 'ddtextil_catalogo_respaldo_v1';

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
            discountPercent: Number(p.discountPercent ?? p.porcentajeDescuento ?? 0),
            porcentajeDescuento: Number(p.discountPercent ?? p.porcentajeDescuento ?? 0),
            soldMeters: Number(p.soldMeters ?? p.metrosVendidos ?? 0),
            metrosVendidos: Number(p.soldMeters ?? p.metrosVendidos ?? 0),
            rating: Number(p.rating ?? p.calificacionPromedio ?? 0),
            reviewsCount: Number(p.reviewsCount ?? p.totalResenas ?? 0),
            storeName: p.storeName || p.nombreTienda || p.sellerName || p.nombreVendedor || 'Tienda Textil',
            sellerAvatar: p.sellerAvatar || p.avatarTienda || '/images/hero-detail-1.webp',
            sellerRating: Number(p.sellerRating ?? p.calificacionVendedor ?? 0),
            sellerReviewsCount: Number(p.sellerReviewsCount ?? p.totalResenasVendedor ?? 0),
            isBestSeller: Boolean(p.isBestSeller ?? p.esMasVendido ?? (Number(p.soldMeters ?? p.metrosVendidos ?? 0) >= 150)),
        };
    });
}

function obtenerCatalogoRespaldo() {
    try {
        const guardado = localStorage.getItem(CLAVE_CACHE_CATALOGO);
        if (guardado) {
            const parseado = JSON.parse(guardado);
            if (Array.isArray(parseado) && parseado.length > 0) {
                return normalizarListaProductos(parseado).filter(p => !p.isExclusive);
            }
        }
    } catch {
        // Ignorar errores de almacenamiento restringido
    }
    return [];
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
    const { user } = useAutenticacion();
    // Lista de todos los productos disponibles en la tienda (inicia con respaldo local instantáneo)
    const [products, setProducts] = useState(() => obtenerCatalogoRespaldo());
    const [loading, setLoading] = useState(() => obtenerCatalogoRespaldo().length === 0);
    const [vipEligibility, setVipEligibility] = useState({
        esClienteFrecuente: false,
        nivelVip: 'Estándar',
        comprasCompletadas: 0,
        metrosAcumulados: 0,
        umbralPedidos: 3,
        umbralMetros: 50,
        faltantePedidos: 3,
        faltanteMetros: 50
    });
    // Mensaje de error si la conexión al backend falla y no hay respaldo disponible
    const [error, setError] = useState(null);
    const { showNotification } = useNotificacion();

    const fetchVipEligibility = useCallback(async () => {
        if (!user?.token) {
            setVipEligibility(prev => ({ ...prev, esClienteFrecuente: false, nivelVip: 'Estándar', comprasCompletadas: 0, metrosAcumulados: 0 }));
            return;
        }
        try {
            const res = await fetch(getApiUrl('/api/clientes/elegibilidad-vip'));
            if (res.ok) {
                const data = await res.json();
                setVipEligibility(data);
            }
        } catch {
            // Mantener evaluación por defecto si el endpoint no responde
        }
    }, [user?.token]);

    /**
     * fetchProducts — Pide la lista de productos al backend Java con reintentos automáticos
     * y respaldo resiliente en caché local para evitar bloqueos visuales.
     */
    const fetchProducts = useCallback(async () => {
        setError(null);
        fetchVipEligibility();
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
                        if (Array.isArray(datos)) {
                            const formattedData = normalizarListaProductos(datos);
                            setProducts(formattedData);
                            setError(null);
                            try {
                                const sinBlobs = formattedData.map(item => ({
                                    ...item,
                                    images: (item.images || []).filter(img => typeof img === 'string' && !img.startsWith('data:'))
                                }));
                                localStorage.setItem(CLAVE_CACHE_CATALOGO, JSON.stringify(sinBlobs));
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
            const errBody = await response.json().catch(() => ({}));
            showNotification('error', errBody?.error || 'No se pudo actualizar el producto en el servidor.');
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
        vipEligibility,      // Evaluación de cliente frecuente VIP para telas exclusivas
        loading,             // true mientras carga (para mostrar skeleton)
        error,               // Mensaje de error (o null si todo está bien)
        getProductById,      // Buscar un producto por ID
        updateProduct,       // Modificar un producto
        deleteProduct,       // Eliminar un producto
        addProduct,          // Crear un producto nuevo
        getFeaturedProducts, // Obtener productos destacados para el Inicio
        refreshProducts      // Recargar la lista desde la API
    }), [products, vipEligibility, loading, error, getProductById, updateProduct, deleteProduct, addProduct, getFeaturedProducts, refreshProducts]);

    return (
        <ContextoProducto.Provider value={value}>
            {children}
        </ContextoProducto.Provider>
    );
}
