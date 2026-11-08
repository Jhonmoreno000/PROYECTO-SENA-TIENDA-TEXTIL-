/**
 * ContextoMetricas.jsx — Contexto Global de Datos y Métricas
 * =========================================================
 * Centraliza TODOS los datos de la aplicación. Conecta directamente con
 * la API REST del backend Java en http://localhost:8081.
 *
 * Tablas de PostgreSQL cubiertas:
 *   users, products, orders, coupons, support_tickets, bug_reports,
 *   inventory_batches, waste_events, stock_thresholds, daily_sales,
 *   region_sales, recent_activity, global_banner, system_config
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProductos } from './ContextoProducto';
import { useAutenticacion } from './ContextoAutenticacion';
import { useNotificacion } from './ContextoNotificacion';
import { formatCurrency } from '../utilidades/formateadores';

import { getApiUrl, RUTAS_API } from '../config';

const ContextoMetricas = createContext();

/** Hook para acceder al contexto de métricas */
export function useMetricas() {
    const contextos = useContext(ContextoMetricas);
    if (!contextos) {
        throw new Error('useMetricas debe usarse dentro de un MetricsProvider');
    }
    return contextos;
}

/** Configuración por defecto del sistema */
const defaultSystemConfig = {
    siteName: 'D&D Textil',
    defaultDarkMode: false,
    primaryColor: '#ea580c',
    secondaryColor: '#1e293b',
    accentColor: '#f97316',
    taxRate: 0.19,
    shippingCost: 15000,
    freeShippingThreshold: 200000,
    lowStockThreshold: 20,
    maintenanceMode: false,
    maintenanceMessage: 'Estamos realizando mejoras en el sistema.',
    globalBanner: { enabled: false, message: '', type: 'info' }
};

/**
 * Normalizadores bilingües para garantizar compatibilidad total
 * con las propiedades en inglés y español que retornan los controladores Java.
 */
const normalizarUsuario = (u) => ({
    ...u,
    id: u.id,
    name: u.name || u.nombre || 'Usuario',
    nombre: u.nombre || u.name || 'Usuario',
    email: u.email || u.correo || '',
    correo: u.correo || u.email || '',
    role: u.role || u.rol || 'cliente',
    rol: u.rol || u.role || 'cliente',
    phone: u.phone || u.telefono || '',
    telefono: u.telefono || u.phone || '',
    active: u.active !== undefined ? u.active : (u.activo !== undefined ? u.activo : true),
    activo: u.activo !== undefined ? u.activo : (u.active !== undefined ? u.active : true),
    commissionRate: u.commissionRate ?? u.tasaComision ?? 0.10,
    suspended: u.suspended !== undefined ? u.suspended : (u.suspendido !== undefined ? u.suspendido : false),
    createdAt: u.createdAt || u.fechaCreacion || ''
});

const normalizarProducto = (p) => ({
    ...p,
    id: String(p.id),
    name: p.name || p.nombre || '',
    nombre: p.nombre || p.name || '',
    category: p.category || p.categoria || '',
    categoria: p.categoria || p.category || '',
    price: Number(p.price ?? p.precio ?? 0),
    precio: Number(p.precio ?? p.price ?? 0),
    stock: Number(p.stock ?? p.existencias ?? 0),
    existencias: Number(p.existencias ?? p.stock ?? 0),
    status: p.status ?? p.estadoModeracion ?? 'approved',
    rejectionReason: p.rejectionReason ?? p.motivoRechazo ?? '',
    sellerName: p.sellerName ?? p.nombreVendedor ?? '',
    createdAt: p.createdAt ?? p.creadoEn ?? '',
    images: Array.isArray(p.images) ? p.images : (Array.isArray(p.imagenes) ? p.imagenes : [])
});

const normalizarPedido = (o) => ({
    ...o,
    id: o.id,
    clientId: o.clientId ?? o.idCliente,
    idCliente: o.idCliente ?? o.clientId,
    sellerId: o.sellerId ?? o.idVendedor,
    idVendedor: o.idVendedor ?? o.sellerId,
    status: o.status || o.estado || 'pending',
    estado: o.estado || o.status || 'pending',
    total: Number(o.total ?? o.montoTotal ?? 0),
    montoTotal: Number(o.montoTotal ?? o.total ?? 0),
    date: o.date || o.orderDate || o.fecha || o.fechaPedido || new Date().toISOString(),
    orderDate: o.orderDate || o.date || o.fechaPedido || o.fecha || new Date().toISOString(),
    client: o.client || o.clientName || o.nombreCliente || 'Cliente',
    clientName: o.clientName || o.client || o.nombreCliente || 'Cliente',
    nombreCliente: o.nombreCliente || o.clientName || o.client || 'Cliente',
    clientEmail: o.clientEmail || o.correoCliente || '',
    correoCliente: o.correoCliente || o.clientEmail || '',
    items: o.items ?? o.articulos ?? (Array.isArray(o.lineItems) ? o.lineItems.length : 0),
    productIds: Array.isArray(o.productIds) ? o.productIds : [],
    lineItems: Array.isArray(o.lineItems) ? o.lineItems : [],
    productNames: Array.isArray(o.productNames) ? o.productNames : [],
    totalMeters: Number(o.totalMeters ?? 0),
    shippingAddress: o.shippingAddress ?? o.direccionEnvio ?? '',
    shippingCity: o.shippingCity ?? o.ciudadEnvio ?? '',
    shippingDepartment: o.shippingDepartment ?? o.departamentoEnvio ?? '',
    trackingNumber: o.trackingNumber ?? o.numeroGuia ?? ''
});

const normalizarCupon = (c) => ({
    ...c,
    id: c.id,
    code: c.code || c.codigo || '',
    codigo: c.codigo || c.code || '',
    discountType: c.discountType || c.tipoDescuento || 'percentage',
    tipoDescuento: c.tipoDescuento || c.discountType || 'porcentaje',
    discountValue: Number(c.discountValue ?? c.valorDescuento ?? 0),
    valorDescuento: Number(c.valorDescuento ?? c.discountValue ?? 0),
    active: c.active !== undefined ? c.active : (c.activo !== undefined ? c.activo : true),
    activo: c.activo !== undefined ? c.activo : (c.active !== undefined ? c.active : true),
    usageCount: Number(c.usageCount ?? c.conteoUsos ?? 0),
    conteoUsos: Number(c.conteoUsos ?? c.usageCount ?? 0),
    rules: c.rules || {}
});

const normalizarTicket = (t) => ({
    ...t,
    id: t.id,
    userId: t.userId ?? t.clientId ?? t.idCliente ?? t.idUsuario,
    clientId: t.clientId ?? t.userId ?? t.idCliente ?? t.idUsuario,
    idCliente: t.idCliente ?? t.clientId ?? t.userId ?? t.idUsuario,
    customerName: t.customerName ?? t.nombreUsuario ?? t.clientName ?? t.nombreCliente ?? 'Cliente',
    clientName: t.clientName ?? t.customerName ?? t.nombreUsuario ?? t.nombreCliente ?? 'Cliente',
    nombreCliente: t.nombreCliente ?? t.customerName ?? t.clientName ?? 'Cliente',
    customerEmail: t.customerEmail ?? t.correoUsuario ?? '',
    orderId: t.orderId ?? t.idPedido ?? null,
    subject: t.subject || t.asunto || '',
    asunto: t.asunto || t.subject || '',
    description: t.description ?? t.message ?? t.mensaje ?? t.descripcion ?? '',
    message: t.message ?? t.description ?? t.mensaje ?? t.descripcion ?? '',
    descripcion: t.descripcion ?? t.description ?? t.message ?? t.mensaje ?? '',
    status: t.status || t.estado || 'open',
    estado: t.estado || t.status || 'abierto',
    priority: t.priority || t.prioridad || 'medium',
    prioridad: t.prioridad || t.priority || 'media',
    createdAt: t.createdAt || t.fechaCreacion || '',
    updatedAt: t.updatedAt || t.fechaActualizacion || ''
});

const normalizarReporte = (r) => ({
    ...r,
    id: r.id,
    sellerId: r.sellerId ?? r.idVendedor,
    idVendedor: r.idVendedor ?? r.sellerId,
    sellerName: r.sellerName || r.nombreVendedor || 'Vendedor',
    nombreVendedor: r.nombreVendedor || r.sellerName || 'Vendedor',
    user: r.user ?? r.sellerName ?? r.nombreVendedor ?? 'Usuario',
    email: r.email ?? '',
    date: r.date ?? r.createdAt ?? r.reportadoEn ?? r.fechaCreacion ?? null,
    clientName: r.clientName ?? r.user ?? r.sellerName ?? 'Usuario',
    title: r.title || r.titulo || '',
    titulo: r.titulo || r.title || '',
    description: r.description || r.descripcion || '',
    descripcion: r.descripcion || r.description || '',
    severity: r.severity || r.severidad || 'medium',
    severidad: r.severidad || r.severity || 'media',
    status: r.status || r.estado || 'open',
    estado: r.estado || r.status || 'abierto',
    createdAt: r.createdAt || r.fechaCreacion || ''
});
const normalizarReporteError = normalizarReporte;

const normalizarLote = (b) => ({
    ...b,
    id: b.id,
    batchCode: b.batchCode || b.codigoLote || String(b.id),
    codigoLote: b.codigoLote || b.batchCode || String(b.id),
    fabricType: b.fabricType || b.tipoTela || '',
    tipoTela: b.tipoTela || b.fabricType || '',
    color: b.color || '',
    initialMeters: Number(b.initialMeters ?? b.metrosIniciales ?? 0),
    metrosIniciales: Number(b.metrosIniciales ?? b.initialMeters ?? 0),
    currentMeters: Number(b.currentMeters ?? b.metrosActuales ?? 0),
    metrosActuales: Number(b.metrosActuales ?? b.currentMeters ?? 0),
    status: b.status || b.estado || 'active',
    estado: b.estado || b.status || 'activo',
    supplier: b.supplier || b.proveedor || '',
    proveedor: b.proveedor || b.supplier || '',
    entryDate: b.entryDate || b.fechaIngreso || '',
    fechaIngreso: b.fechaIngreso || b.entryDate || '',
    lastUpdate: b.lastUpdate || b.ultimaActualizacion || ''
});

/**
 * Función auxiliar: hace fetch a un endpoint del backend Java y retorna el JSON o null si falla.
 * @param {string} endpoint - Ruta relativa (ej: '/api/usuarios')
 * @returns {Promise<any|null>}
 */
async function apiFetch(endpoint) {
    try {
        const res = await fetch(getApiUrl(endpoint));
        if (!res.ok) return null;
        const text = await res.text();
        if (!text || text === 'null' || text === '{}') return null;
        return JSON.parse(text);
    } catch {
        return null;
    }
}

/**
 * Proveedor del contexto de métricas.
 * Carga todos los datos desde la API al montar y expone funciones para mutaciones.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function MetricsProvider({ children }) {
    // ── Productos (delegados a ContextoProducto para evitar duplicación) ────
    const { products, refreshProducts } = useProductos();
    const { user } = useAutenticacion();
    const { showNotification } = useNotificacion();
    const [pendingProducts,   setPendingProducts]   = useState([]);

    // ── Estado principal ──────────────────────────────────────────────────
    const [users,             setUsers]             = useState([]);
    const [orders,            setOrders]            = useState([]);
    const [coupons,           setCoupons]           = useState([]);
    const [supportTickets,    setSupportTickets]    = useState([]);
    const [bugReports,        setBugReports]        = useState([]);
    const [inventoryBatches,  setInventoryBatches]  = useState([]);
    // Eventos de desperdicio
    const [wasteEvents,       setWasteEvents]       = useState([]);
    // Umbrales de stock configurables por producto
    const [stockThresholds,   setStockThresholds]   = useState([]);
    // Métricas de ventas agregadas (diarias, mensuales, etc.)
    const [salesData,         setSalesData]         = useState([]);
    // Ventas por región (para mapa de ventas)
    const [regionSales,       setRegionSales]       = useState([]);
    // Actividad reciente en el sistema
    const [recentActivity,    setRecentActivity]    = useState([]);
    // Banner global (avisos, mantenimiento, promociones)
    const [globalBanner,      setGlobalBanner]      = useState(null);
    // Descuentos por producto (admin configura desde ProductosAdmin)
    const [productDiscounts,  setProductDiscounts]  = useState({});
    // Configuración del sistema (nombre, colores, tasas, etc.)
    const [systemConfig,      setSystemConfig]      = useState(defaultSystemConfig);
    // Lista de deseos persistida en localStorage por usuario
    const wishlistStorageKey = user?.id ? `wishlist_${user.id}` : 'wishlist_guest';
    const [wishlistItems, setWishlistItems] = useState(() => {
        try {
            const raw = window.localStorage.getItem(wishlistStorageKey);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(wishlistStorageKey);
            setWishlistItems(raw ? JSON.parse(raw) : []);
        } catch {
            setWishlistItems([]);
        }
    }, [wishlistStorageKey]);

    useEffect(() => {
        try {
            window.localStorage.setItem(wishlistStorageKey, JSON.stringify(wishlistItems));
        } catch (e) {
            console.error('Error guardando wishlist en localStorage:', e);
        }
    }, [wishlistStorageKey, wishlistItems]);
    // Métricas de ventas para ERP (si aplica)
    const [erpSalesMetrics,   setErpSalesMetrics]   = useState([]);
    // Notificaciones del ERP
    const [erpNotifications,  setErpNotifications]  = useState([]);
    // Inventario de telas para ERP
    const [erpFabricInventory,setErpFabricInventory]= useState([]);
    // Estado de carga
    const [loading,           setLoading]           = useState(true);
    

    // ── Carga inicial: endpoints según el rol del usuario ────────────────
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const role = user?.role || user?.rol;
            const isStaff = role === 'admin' || role === 'administrador' || role === 'vendedor';
            const isClient = role === 'cliente';

            if (!isStaff) {
                const [apiBanner, apiConfigRaw, apiProductDiscounts, apiCoupons, apiOrders, apiTickets] = await Promise.all([
                    apiFetch(RUTAS_API?.banner || '/api/banner'),
                    apiFetch('/api/configuracion/system_config'),
                    apiFetch('/api/configuracion/product_discounts'),
                    user ? apiFetch(RUTAS_API?.cupones || '/api/cupones') : Promise.resolve(null),
                    isClient ? apiFetch(RUTAS_API?.pedidos || '/api/pedidos') : Promise.resolve(null),
                    isClient ? apiFetch('/api/soporte/tickets') : Promise.resolve(null),
                ]);
                if (apiBanner) setGlobalBanner(apiBanner);
                if (apiConfigRaw && typeof apiConfigRaw === 'object' && Object.keys(apiConfigRaw).length > 0) {
                    setSystemConfig(prev => ({ ...prev, ...apiConfigRaw }));
                }
                if (apiProductDiscounts && typeof apiProductDiscounts === 'object') {
                    setProductDiscounts(apiProductDiscounts);
                }
                if (apiCoupons?.length > 0) setCoupons(apiCoupons.map(normalizarCupon));
                if (apiOrders?.length > 0) setOrders(apiOrders.map(normalizarPedido));
                if (apiTickets?.length > 0) setSupportTickets(apiTickets.map(normalizarTicket));
                return;
            }

            const [
                apiUsers, apiPending, apiOrders, apiCoupons,
                apiTickets, apiBugs, apiBatches, apiWaste, apiThresholds,
                apiSales, apiRegions, apiActivity, apiBanner, apiErpSales,
                apiErpNotif, apiErpFabric, apiConfigRaw, apiProductDiscounts
            ] = await Promise.all([
                apiFetch(RUTAS_API?.usuarios || '/api/usuarios'),
                apiFetch('/api/productos/pendientes'),
                apiFetch(RUTAS_API?.pedidos || '/api/pedidos'),
                apiFetch(RUTAS_API?.cupones || '/api/cupones'),
                apiFetch('/api/soporte/tickets'),
                apiFetch('/api/soporte/reportes').then(r => r || apiFetch('/api/soporte/errores')),
                apiFetch('/api/inventario/lotes'),
                apiFetch('/api/inventario/mermas'),
                apiFetch('/api/inventario/umbrales'),
                apiFetch('/api/metricas/ventas'),
                apiFetch('/api/metricas/regiones'),
                apiFetch(RUTAS_API?.actividad || '/api/actividad'),
                apiFetch(RUTAS_API?.banner || '/api/banner'),
                apiFetch('/api/metricas/ventas-erp'),
                apiFetch('/api/metricas/notificaciones'),
                apiFetch('/api/metricas/inventario-telas'),
                apiFetch('/api/configuracion/system_config'),
                apiFetch('/api/configuracion/product_discounts'),
            ]);
            if (apiUsers?.length > 0) setUsers(apiUsers.map(normalizarUsuario));
            setPendingProducts((apiPending || []).map(normalizarProducto));
            if (apiOrders?.length > 0) setOrders(apiOrders.map(normalizarPedido));
            if (apiCoupons?.length > 0) setCoupons(apiCoupons.map(normalizarCupon));
            if (apiTickets?.length > 0) setSupportTickets(apiTickets.map(normalizarTicket));
            if (apiBugs?.length > 0) setBugReports(apiBugs.map(normalizarReporte));
            if (apiBatches?.length > 0) setInventoryBatches(apiBatches.map(normalizarLote));
            if (apiWaste?.length > 0) setWasteEvents(apiWaste);
            if (apiThresholds?.length > 0) setStockThresholds(apiThresholds);
            if (apiSales?.length > 0) {
                setSalesData(apiSales.map(s => ({
                    ...s,
                    name: s.saleDate
                        ? new Date(s.saleDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
                        : s.name,
                    value: s.totalSales,
                    orders: s.totalOrders
                })).reverse());
            }
            if (apiRegions?.length > 0) setRegionSales(apiRegions);
            if (apiActivity?.length > 0) setRecentActivity(apiActivity);
            if (apiBanner) setGlobalBanner(apiBanner);
            if (apiErpSales?.length > 0) {
                setErpSalesMetrics(apiErpSales.map(s => ({
                    ...s,
                    date: s.recordDate
                        ? new Date(s.recordDate + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
                        : s.recordDate,
                })));
            }
            if (apiErpNotif?.length > 0) setErpNotifications(apiErpNotif);
            if (apiErpFabric?.length > 0) setErpFabricInventory(apiErpFabric);
            if (apiConfigRaw && typeof apiConfigRaw === 'object' && Object.keys(apiConfigRaw).length > 0) {
                setSystemConfig(prev => ({ ...prev, ...apiConfigRaw }));
            }
            if (apiProductDiscounts && typeof apiProductDiscounts === 'object') {
                setProductDiscounts(apiProductDiscounts);
            }
        } catch (err) {
            console.error('Backend no disponible:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    // ── Aplicar colores del tema al DOM ──────────────────────────────────
    useEffect(() => {
        if (!systemConfig) return;
        const root = document.documentElement.style;
        const applyColorScale = (prefix, color, defaults) => {
            if (defaults.includes(color)) {
                [50,100,200,300,400,500,600,700,800,900].forEach(w => root.removeProperty(`--theme-${prefix}-${w}`));
            } else {
                root.setProperty(`--theme-${prefix}-50`,  `color-mix(in srgb, ${color} 10%, white)`);
                root.setProperty(`--theme-${prefix}-100`, `color-mix(in srgb, ${color} 20%, white)`);
                root.setProperty(`--theme-${prefix}-200`, `color-mix(in srgb, ${color} 40%, white)`);
                root.setProperty(`--theme-${prefix}-300`, `color-mix(in srgb, ${color} 60%, white)`);
                root.setProperty(`--theme-${prefix}-400`, `color-mix(in srgb, ${color} 80%, white)`);
                root.setProperty(`--theme-${prefix}-500`, color);
                root.setProperty(`--theme-${prefix}-600`, `color-mix(in srgb, ${color} 85%, black)`);
                root.setProperty(`--theme-${prefix}-700`, `color-mix(in srgb, ${color} 70%, black)`);
                root.setProperty(`--theme-${prefix}-800`, `color-mix(in srgb, ${color} 55%, black)`);
                root.setProperty(`--theme-${prefix}-900`, `color-mix(in srgb, ${color} 40%, black)`);
                root.setProperty(`--theme-${prefix}`, color);
            }
        };
        applyColorScale('primary',   systemConfig.primaryColor,   ['#ea580c', '#f97316']);
        applyColorScale('secondary', systemConfig.secondaryColor, ['#1e293b', '#0f172a']);
        applyColorScale('accent',    systemConfig.accentColor,    ['#f97316', '#ea580c']);
    }, [systemConfig?.primaryColor, systemConfig?.secondaryColor, systemConfig?.accentColor]);

    // ── refreshData: recarga todos los datos (productos y métricas) ──
    const refreshData = useCallback(async () => {
        refreshProducts();
        await fetchAllData();
    }, [refreshProducts, fetchAllData]);


    // =========================================================================
    // FUNCIONES DE GESTIÓN DE USUARIOS
    // =========================================================================

    /** Actualiza el rol de un usuario en el backend y estado local */
    const updateUserRole = async (userId, newRole) => {
        const prevUsers = users;
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, rol: newRole } : u));
        try {
            const res = await fetch(getApiUrl(`/api/usuarios/${userId}/rol`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole, rol: newRole })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return true;
        } catch (e) {
            console.error('Error al actualizar rol de usuario:', e);
            setUsers(prevUsers);
            showNotification('error', 'No se pudo actualizar el rol del usuario.');
            return false;
        }
    };

    /** Activa / desactiva un usuario en el backend y estado local */
    const toggleUserActive = async (userId) => {
        const prevUsers = users;
        const targetUser = users.find(u => u.id === userId);
        const nextActive = targetUser ? !targetUser.active : true;
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: nextActive, activo: nextActive } : u));
        try {
            const res = await fetch(getApiUrl(`/api/usuarios/${userId}/estado`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: nextActive, activo: nextActive })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return true;
        } catch (e) {
            console.error('Error al actualizar estado de usuario:', e);
            setUsers(prevUsers);
            showNotification('error', 'No se pudo cambiar el estado del usuario.');
            return false;
        }
    };

    /** Filtra usuarios por rol */
    const getUsersByRole = (role) => users.filter(u => u.role === role);

    // =========================================================================
    // FUNCIONES DE PEDIDOS
    // =========================================================================

    /** Filtra pedidos por vendedor — usamos String() para evitar errores de tipo número vs texto */
    const getOrdersBySeller = (sellerId) => orders.filter(o => String(o.sellerId) === String(sellerId));

    /** Filtra pedidos por cliente */
    const getOrdersByClient = (clientId) => orders.filter(o => String(o.clientId) === String(clientId));

    /**
     * Actualiza el estado de un pedido en BD y en estado local.
     * @param {number} orderId
     * @param {string} newStatus
     */
    const updateOrderStatus = async (orderId, newStatus) => {
        const prevOrders = orders;
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, estado: newStatus } : o));
        try {
            const res = await fetch(getApiUrl(`/api/pedidos/${orderId}/estado`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, estado: newStatus })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return true;
        } catch (e) {
            console.error('Error al actualizar estado de pedido:', e);
            setOrders(prevOrders);
            showNotification('error', 'No se pudo actualizar el estado del pedido.');
            return false;
        }
    };

    // =========================================================================
    // FUNCIONES DE PRODUCTOS
    // =========================================================================

    /** Filtra productos por vendedor */
    const getProductsBySeller = (sellerId) =>
        products.filter(p => String(p.sellerId ?? p.idVendedor) === String(sellerId));

    /**
     * Actualiza un producto en BD y en estado local.
     * @param {number} productId
     * @param {Object} updates - Campos a actualizar
     */
    const updateProduct = async (idOrProduct, maybeUpdates) => {
        try {
            const isTwoArgs = maybeUpdates !== undefined;
            const productId = isTwoArgs ? idOrProduct : idOrProduct?.id;
            const updates = isTwoArgs ? maybeUpdates : idOrProduct;
            await fetch(getApiUrl(`/api/productos/${productId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            refreshProducts();
            return true;
        } catch (e) {
            console.error('Error al actualizar producto:', e);
            return false;
        }
    };

    const deleteProduct = async (productId) => {
        try {
            await fetch(getApiUrl(`/api/productos/${productId}`), { method: 'DELETE' });
            refreshProducts();
        } catch (e) { console.error('Error al eliminar producto:', e); }
    };

    const addProduct = async (newProduct) => {
        try {
            const res = await fetch(getApiUrl('/api/productos'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            if (res.ok) {
                const saved = await res.json().catch(() => ({}));
                const created = saved.product || { ...newProduct, id: String(saved.id ?? newProduct.id ?? '') };
                refreshProducts();
                return created;
            }
        } catch (e) { console.error('Error al agregar producto:', e); }
        return null;
    };

    // =========================================================================
    // FUNCIONES DE MODERACIÓN (ADMIN)
    // =========================================================================

    /**
     * Aprueba un producto pendiente.
     * @param {number} productId
     */
    const approveProduct = async (productId) => {
        const prevPending = pendingProducts;
        setPendingProducts(prev => prev.filter(p => String(p.id) !== String(productId)));
        try {
            const res = await fetch(getApiUrl(`/api/productos/${productId}/moderar`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved', estado: 'approved' })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            refreshProducts();
            return true;
        } catch (e) {
            console.error('Error al aprobar producto:', e);
            setPendingProducts(prevPending);
            showNotification('error', 'No se pudo aprobar el producto.');
            return false;
        }
    };

    const rejectProduct = async (productId, reason) => {
        const prevPending = pendingProducts;
        setPendingProducts(prev => prev.map(p =>
            String(p.id) === String(productId) ? { ...p, status: 'rejected', estado: 'rejected', rejectionReason: reason, motivo: reason } : p
        ));
        try {
            const res = await fetch(getApiUrl(`/api/productos/${productId}/moderar`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected', estado: 'rejected', reason, motivo: reason })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            refreshProducts();
            return true;
        } catch (e) {
            console.error('Error al rechazar producto:', e);
            setPendingProducts(prevPending);
            showNotification('error', 'No se pudo rechazar el producto.');
            return false;
        }
    };

    /** Actualiza tasa de comisión de un vendedor en BD y estado local */
    const updateSellerCommission = async (sellerId, newRate) => {
        try {
            await fetch(getApiUrl(`/api/usuarios/${sellerId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commissionRate: newRate, tasaComision: newRate })
            });
        } catch (e) {
            console.error('Error al actualizar comisión del vendedor:', e);
        }
        setUsers(prev => prev.map(u => u.id === sellerId ? { ...u, commissionRate: newRate, tasaComision: newRate } : u));
    };

    /** Suspende / reactiva un vendedor en BD y estado local */
    const toggleSellerSuspension = async (sellerId, reason = null) => {
        const target = users.find(u => u.id === sellerId);
        const nuevoEstado = target ? !target.suspended : true;
        try {
            await fetch(getApiUrl(`/api/usuarios/${sellerId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    suspended: nuevoEstado,
                    suspendido: nuevoEstado,
                    suspensionReason: nuevoEstado ? reason : null,
                    motivoSuspension: nuevoEstado ? reason : null,
                    active: !nuevoEstado,
                    activo: !nuevoEstado
                })
            });
        } catch (e) {
            console.error('Error al cambiar estado de suspensión del vendedor:', e);
        }
        setUsers(prev => prev.map(u => {
            if (u.id === sellerId) {
                return {
                    ...u,
                    suspended: nuevoEstado,
                    suspendido: nuevoEstado,
                    suspensionReason: nuevoEstado ? reason : null,
                    motivoSuspension: nuevoEstado ? reason : null,
                    active: !nuevoEstado,
                    activo: !nuevoEstado
                };
            }
            return u;
        }));
    };

    // =========================================================================
    // FUNCIONES DE BUG REPORTS
    // =========================================================================

    /**
     * Crea un nuevo reporte de error en BD y estado local.
     * @param {Object} newReport
     */
    const addBugReport = async (newReport) => {
        try {
            const res = await fetch(getApiUrl('/api/soporte/reportes'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReport)
            });
            const saved = res.ok ? await res.json().catch(() => ({})) : {};
            const reportObj = normalizarReporte({
                ...newReport,
                id: saved.id ?? (bugReports.length > 0 ? Math.max(...bugReports.map(r => Number(r.id) || 0)) + 1 : 1),
                status: 'open',
                createdAt: new Date().toISOString().split('T')[0]
            });
            setBugReports(prev => [...prev, reportObj]);
            return reportObj;
        } catch (e) {
            console.error('Error al crear reporte:', e);
            return null;
        }
    };

    /**
     * Actualiza el estado de un bug report.
     * @param {number} reportId
     * @param {string} newStatus
     * @param {string|null} assignedTo
     */
    const updateBugReportStatus = async (reportId, newStatus, assignedTo = null) => {
        setBugReports(prev => prev.map(r => {
            if (r.id === reportId) {
                const updated = { ...r, status: newStatus, estado: newStatus };
                if (assignedTo !== null) updated.assignedTo = assignedTo;
                if (newStatus === 'resolved') updated.resolvedAt = new Date().toISOString().split('T')[0];
                return updated;
            }
            return r;
        }));
        try {
            await fetch(getApiUrl(`/api/soporte/errores/${reportId}/estado`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, estado: newStatus, assignedTo })
            });
        } catch (e) { console.error('Error al actualizar bug report:', e); }
    };

    /** Filtra bug reports por vendedor — String() garantiza comparación correcta entre tipos */
    const getBugReportsBySeller = (sellerId) => bugReports.filter(r => String(r.sellerId ?? r.idVendedor) === String(sellerId));

    // =========================================================================
    // FUNCIONES DE CUPONES
    // =========================================================================

    /**
     * Crea un nuevo cupón en BD y estado local.
     * @param {Object} newCoupon
     */
    const createCoupon = async (newCoupon) => {
        const prevCoupons = coupons;
        try {
            const res = await fetch(getApiUrl('/api/cupones'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCoupon)
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const saved = await res.json().catch(() => ({}));
            const couponObj = normalizarCupon({
                ...newCoupon,
                id: saved.id ?? (coupons.length > 0 ? Math.max(...coupons.map(c => Number(c.id) || 0)) + 1 : 1),
                usageCount: 0,
                conteoUsos: 0,
                active: true,
                activo: true,
                createdAt: new Date().toISOString().split('T')[0]
            });
            setCoupons(prev => [...prev, couponObj]);
            return true;
        } catch (e) {
            console.error('Error al crear cupón:', e);
            setCoupons(prevCoupons);
            showNotification('error', 'No se pudo crear el cupón.');
            return false;
        }
    };
    const addCoupon = createCoupon;

    /**
     * Desactiva un cupón en BD y estado local.
     * @param {number} couponId
     */
    const deactivateCoupon = async (couponId) => {
        const prevCoupons = coupons;
        setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, active: false, activo: false } : c));
        try {
            const res = await fetch(getApiUrl(`/api/cupones/${couponId}/desactivar`), { method: 'PUT' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return true;
        } catch (e) {
            console.error('Error al desactivar cupón:', e);
            setCoupons(prevCoupons);
            showNotification('error', 'No se pudo desactivar el cupón.');
            return false;
        }
    };

    /**
     * Valida un código de cupón contra las reglas de negocio.
     * @param {string} code
     * @param {number} cartTotal
     * @param {Array} userOrders
     * @returns {{ valid: boolean, coupon?: Object, message?: string }}
     */
    const validateCoupon = (code, cartTotal, userOrders) => {
        const coupon = coupons.find(c => (c.code === code || c.codigo === code) && (c.active || c.activo));
        if (!coupon) return { valid: false, message: 'Cupón no válido o expirado' };
        if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) return { valid: false, message: 'Cupón expirado' };
        if (coupon.rules?.minPurchase && cartTotal < coupon.rules.minPurchase)
            return { valid: false, message: `Compra mínima de ${formatCurrency(coupon.rules.minPurchase)}` };
        if (coupon.rules?.firstTimeOnly && userOrders.length > 0)
            return { valid: false, message: 'Solo para primera compra' };
        if (coupon.rules?.maxUses && coupon.usageCount >= coupon.rules.maxUses)
            return { valid: false, message: 'Cupón agotado' };
        return { valid: true, coupon };
    };

    // =========================================================================
    // FUNCIONES DE SOPORTE / TICKETS
    // =========================================================================

    /**
     * Crea un nuevo ticket de soporte en BD y estado local.
     * @param {Object} newTicket
     */
    const createTicket = async (newTicket) => {
        try {
            const res = await fetch(getApiUrl('/api/soporte/tickets'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTicket)
            });
            const saved = res.ok ? await res.json().catch(() => ({})) : {};
            const ticketObj = normalizarTicket({
                ...newTicket,
                id: saved.id ?? (supportTickets.length > 0 ? Math.max(...supportTickets.map(t => Number(t.id) || 0)) + 1 : 1),
                status: 'open',
                estado: 'abierto',
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            });
            setSupportTickets(prev => [...prev, ticketObj]);
            return ticketObj;
        } catch (e) {
            console.error('Error al crear ticket:', e);
            return null;
        }
    };

    /**
     * Alias de createTicket para compatibilidad con componentes que llaman addSupportTicket.
     * @param {Object} ticket
     */
    const addSupportTicket = (ticket) => createTicket(ticket);

    /**
     * Actualiza el estado de un ticket.
     * @param {number} ticketId
     * @param {string} newStatus
     */
    const updateTicketStatus = async (ticketId, newStatus) => {
        setSupportTickets(prev => prev.map(t => {
            if (t.id === ticketId) {
                const updated = { ...t, status: newStatus, estado: newStatus, updatedAt: new Date().toISOString().split('T')[0] };
                if (newStatus === 'resolved') updated.resolvedAt = updated.updatedAt;
                return updated;
            }
            return t;
        }));
        try {
            await fetch(getApiUrl(`/api/soporte/tickets/${ticketId}/estado`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, estado: newStatus })
            });
        } catch (e) { console.error('Error al actualizar ticket:', e); }
    };

    /** Asigna un ticket a un usuario en BD y estado local */
    const assignTicket = async (ticketId, agentId) => {
        setSupportTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, assignedTo: agentId, updatedAt: new Date().toISOString().split('T')[0] } : t
        ));
        try {
            await fetch(getApiUrl(`/api/soporte/tickets/${ticketId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedTo: agentId })
            });
        } catch (e) { console.error('Error al asignar ticket:', e); }
    };

    // =========================================================================
    // FUNCIONES DE INVENTARIO
    // =========================================================================

    /**
     * Agrega un nuevo lote de inventario.
     * @param {Object} newBatch
     */
    const addBatch = async (newBatch) => {
        setInventoryBatches(prev => [...prev, newBatch]);
        try {
            await fetch(getApiUrl('/api/inventario/lotes'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBatch)
            });
        } catch (e) { console.error('Error al agregar lote:', e); }
    };

    /**
     * Actualiza un lote de inventario existente.
     * @param {string} batchId
     * @param {Object} updates
     */
    const updateBatch = async (batchId, updates) => {
        const computedStatus = updates.currentMeters !== undefined
            ? (Number(updates.currentMeters) < 10 ? 'critical' : Number(updates.currentMeters) < 20 ? 'low' : 'active')
            : undefined;
        const finalUpdates = computedStatus ? { ...updates, status: computedStatus, estado: computedStatus } : updates;
        setInventoryBatches(prev => prev.map(b =>
            b.id === batchId ? { ...b, ...finalUpdates, lastUpdate: new Date().toISOString().split('T')[0] } : b
        ));
        try {
            await fetch(getApiUrl(`/api/inventario/lotes/${batchId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalUpdates)
            });
        } catch (e) { console.error('Error al actualizar lote:', e); }
    };

    const updateBatchMeters = async (batchId, currentMeters) => {
        const metersNum = Number(currentMeters);
        const status = metersNum < 10 ? 'critical' : metersNum < 20 ? 'low' : 'active';
        return updateBatch(batchId, { currentMeters: metersNum, metrosActuales: metersNum, status, estado: status });
    };

    /**
     * Registra un evento de merma en BD y estado local, descontando metros del lote.
     * @param {Object} wasteEvent
     */
    const logWaste = async (wasteEvent) => {
        const eventObj = {
            ...wasteEvent,
            id: wasteEvents.length > 0 ? Math.max(...wasteEvents.map(e => Number(e.id) || 0)) + 1 : 1,
            eventDate: new Date().toISOString().split('T')[0]
        };
        setWasteEvents(prev => [...prev, eventObj]);
        const wastedMeters = Number(wasteEvent.meters ?? wasteEvent.metros ?? 0);
        if (wastedMeters > 0 && wasteEvent.batchId) {
            setInventoryBatches(prev => prev.map(b => {
                if (String(b.id) === String(wasteEvent.batchId) || String(b.batchCode) === String(wasteEvent.batchId)) {
                    const updatedMeters = Math.max(0, Number(b.currentMeters || 0) - wastedMeters);
                    const newStatus = updatedMeters < 10 ? 'critical' : updatedMeters < 20 ? 'low' : 'active';
                    return {
                        ...b,
                        currentMeters: updatedMeters,
                        metrosActuales: updatedMeters,
                        status: newStatus,
                        estado: newStatus,
                        lastUpdate: new Date().toISOString().split('T')[0]
                    };
                }
                return b;
            }));
        }
        try {
            const res = await fetch(getApiUrl('/api/inventario/mermas'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wasteEvent)
            });
            if (res.ok) {
                const updatedBatches = await apiFetch('/api/inventario/lotes');
                if (updatedBatches?.length > 0) {
                    setInventoryBatches(updatedBatches.map(normalizarLote));
                }
            }
        } catch (e) { console.error('Error al registrar merma:', e); }
    };
    const logWasteEvent = logWaste;

    /**
     * Actualiza un umbral de stock mínimo.
     * @param {string} fabricType
     * @param {number} minMeters
     */
    const updateStockThreshold = async (fabricType, minMeters) => {
        setStockThresholds(prev => prev.map(t =>
            (t.fabricType === fabricType || t.tipoTela === fabricType) ? { ...t, minMeters, metrosMinimos: minMeters } : t
        ));
        try {
            await fetch(getApiUrl('/api/inventario/umbrales'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fabricType, tipoTela: fabricType, minMeters, metrosMinimos: minMeters })
            });
        } catch (e) { console.error('Error al actualizar umbral:', e); }
    };

    // =========================================================================
    // FUNCIONES DE WISHLIST (FAVORITOS)
    // =========================================================================

    const addToWishlist = (product) => {
        setWishlistItems(prev => {
            if (prev.find(item => String(item.id) === String(product.id))) return prev;
            return [...prev, { ...product, addedAt: new Date().toISOString() }];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems(prev => prev.filter(item => String(item.id) !== String(productId)));
    };

    const updateWishlistItem = (productId, updates) => {
        setWishlistItems(prev => prev.map(item => String(item.id) === String(productId) ? { ...item, ...updates } : item));
    };
    
    const isInWishlist = (productId) => {
        return wishlistItems.some(item => String(item.id) === String(productId));
    };

    // =========================================================================
    // FUNCIONES DE CONFIGURACIÓN
    // =========================================================================

    /**
     * Actualiza la configuración del sistema en BD y DOM.
     * @param {Object} updates
     */
    const updateSystemConfig = async (updates) => {
        const newConfig = { ...systemConfig, ...updates };
        setSystemConfig(newConfig);
        try {
            await fetch(getApiUrl('/api/configuracion'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'system_config',
                    clave: 'system_config',
                    value: JSON.stringify(newConfig),
                    valor: JSON.stringify(newConfig)
                })
            });
        } catch (e) { console.error('Error al actualizar config:', e); }
    };

    // ── FUNCIONES DE DESCUENTOS POR PRODUCTO ───────────────────────────────

    const saveProductDiscount = async (productId, discount) => {
        const updated = { ...productDiscounts, [productId]: discount };
        setProductDiscounts(updated);
        try {
            await fetch(getApiUrl('/api/configuracion'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'product_discounts',
                    clave: 'product_discounts',
                    value: JSON.stringify(updated),
                    valor: JSON.stringify(updated)
                })
            });
        } catch (e) { console.error('Error al guardar descuento:', e); }
    };

    // ── Valor del contexto ───────────────────────────────────────────────
    const value = {
        // Estado
        loading,
        users,
        orders,
        products,
        pendingProducts,
        coupons,
        supportTickets,
        bugReports,
        inventoryBatches,
        wasteEvents,
        stockThresholds,
        salesData,
        regionSales,
        recentActivity,
        globalBanner,
        systemConfig,
        wishlistItems,
        setWishlistItems,
        erpSalesMetrics,
        erpNotifications,
        erpFabricInventory,

        // Usuarios
        updateUserRole,
        toggleUserActive,
        getUsersByRole,

        // Pedidos
        getOrdersBySeller,
        getOrdersByClient,
        updateOrderStatus,

        // Productos
        getProductsBySeller,
        updateProduct,
        deleteProduct,
        addProduct,
        refreshData,

        // Moderación
        approveProduct,
        rejectProduct,
        updateSellerCommission,
        toggleSellerSuspension,

        // Bug Reports
        addBugReport,
        updateBugReportStatus,
        getBugReportsBySeller,

        // Cupones
        createCoupon,
        addCoupon,
        deactivateCoupon,
        validateCoupon,

        // Soporte
        createTicket,
        addSupportTicket,
        updateTicketStatus,
        assignTicket,

        // Inventario
        addBatch,
        updateBatch,
        updateBatchMeters,
        logWaste,
        logWasteEvent,
        updateStockThreshold,

        // Configuración
        updateSystemConfig,

        // Descuentos por producto
        productDiscounts,
        saveProductDiscount,

        // Wishlist
        addToWishlist,
        removeFromWishlist,
        updateWishlistItem,
        isInWishlist,
    };

    return <ContextoMetricas.Provider value={value}>{children}</ContextoMetricas.Provider>;
}
