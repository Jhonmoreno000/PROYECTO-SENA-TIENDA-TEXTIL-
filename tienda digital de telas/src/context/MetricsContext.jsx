/**
 * MetricsContext.jsx — Contexto Global de Datos y Métricas
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
import { useProducts } from './ProductContext';

/** URL base del backend Java */
const API = '';

const MetricsContext = createContext();

/** Hook para acceder al contexto de métricas */
export function useMetrics() {
    const context = useContext(MetricsContext);
    if (!context) {
        throw new Error('useMetrics debe usarse dentro de un MetricsProvider');
    }
    return context;
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
 * Función auxiliar: hace fetch a un endpoint y retorna el JSON o null si falla.
 * @param {string} endpoint - Ruta relativa (ej: '/api/users')
 * @returns {Promise<any|null>}
 */
async function apiFetch(endpoint) {
    try {
        const res = await fetch(`${API}${endpoint}`);
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
    // ── Productos (delegados a ProductContext para evitar duplicación) ────
    const { products, refreshProducts } = useProducts();
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
    // Descuentos por producto (admin configura desde AdminProducts)
    const [productDiscounts,  setProductDiscounts]  = useState({});
    // Configuración del sistema (nombre, colores, tasas, etc.)
    const [systemConfig,      setSystemConfig]      = useState(defaultSystemConfig);
    // Lista de deseos de usuarios
    const [wishlistItems,     setWishlistItems]     = useState([]);
    // Métricas de ventas para ERP (si aplica)
    const [erpSalesMetrics,   setErpSalesMetrics]   = useState([]);
    // Notificaciones del ERP
    const [erpNotifications,  setErpNotifications]  = useState([]);
    // Inventario de telas para ERP
    const [erpFabricInventory,setErpFabricInventory]= useState([]);
    // Estado de carga
    const [loading,           setLoading]           = useState(true);
    

    // ── Carga inicial: todos los endpoints en paralelo ───────────────────
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                apiUsers, apiPending, apiOrders, apiCoupons,
                apiTickets, apiBugs, apiBatches, apiWaste, apiThresholds,
                apiSales, apiRegions, apiActivity, apiBanner, apiErpSales,
                apiErpNotif, apiErpFabric, apiConfigRaw, apiProductDiscounts
            ] = await Promise.all([
                apiFetch('/api/users'),
                apiFetch('/api/products/pending'),
                apiFetch('/api/orders'),
                apiFetch('/api/coupons'),
                apiFetch('/api/support/tickets'),
                apiFetch('/api/support/bugs'),
                apiFetch('/api/inventory/batches'),
                apiFetch('/api/inventory/waste'),
                apiFetch('/api/inventory/thresholds'),
                apiFetch('/api/metrics/sales'),
                apiFetch('/api/metrics/regions'),
                apiFetch('/api/activity'),
                apiFetch('/api/banner'),
                apiFetch('/api/metrics/erp-sales'),
                apiFetch('/api/metrics/notifications'),
                apiFetch('/api/metrics/fabric-inventory'),
                apiFetch('/api/config/system_config'),
                apiFetch('/api/config/product_discounts'),
            ]);
            if (apiUsers?.length > 0) setUsers(apiUsers);
            setPendingProducts(apiPending || []);
            if (apiOrders?.length > 0) setOrders(apiOrders);
            if (apiCoupons?.length > 0) setCoupons(apiCoupons);
            if (apiTickets?.length > 0) setSupportTickets(apiTickets);
            if (apiBugs?.length > 0) setBugReports(apiBugs);
            if (apiBatches?.length > 0) setInventoryBatches(apiBatches);
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
    }, []);

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

    // ── refreshData: recarga todos los datos (equivalente a fetchAllData) ──
    const refreshData = useCallback(async () => {
        refreshProducts();
    }, [refreshProducts]);


    // =========================================================================
    // FUNCIONES DE GESTIÓN DE USUARIOS
    // =========================================================================

    /** Actualiza el rol de un usuario localmente */
    const updateUserRole = (userId, newRole) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    /** Activa / desactiva un usuario localmente */
    const toggleUserActive = (userId) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !u.active } : u));
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
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        try {
            await fetch(`${API}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (e) { console.error('Error al actualizar estado de pedido:', e); }
    };

    // =========================================================================
    // FUNCIONES DE PRODUCTOS
    // =========================================================================

    /** Filtra productos por vendedor */
    const getProductsBySeller = (sellerId) =>
        products.filter(p => String(p.sellerId) === String(sellerId));

    /**
     * Actualiza un producto en BD y en estado local.
     * @param {number} productId
     * @param {Object} updates - Campos a actualizar
     */
    const updateProduct = async (productId, updates) => {
        try {
            await fetch(`${API}/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            refreshProducts();
        } catch (e) { console.error('Error al actualizar producto:', e); }
    };

    const deleteProduct = async (productId) => {
        try {
            await fetch(`${API}/api/products/${productId}`, { method: 'DELETE' });
            refreshProducts();
        } catch (e) { console.error('Error al eliminar producto:', e); }
    };

    const addProduct = async (newProduct) => {
        try {
            const res = await fetch(`${API}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            if (res.ok) {
                refreshProducts();
            }
        } catch (e) { console.error('Error al agregar producto:', e); }
    };

    // =========================================================================
    // FUNCIONES DE MODERACIÓN (ADMIN)
    // =========================================================================

    /**
     * Aprueba un producto pendiente.
     * @param {number} productId
     */
    const approveProduct = async (productId) => {
        setPendingProducts(prev => prev.filter(p => String(p.id) !== String(productId)));
        try {
            await fetch(`${API}/api/products/${productId}/moderate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
            refreshProducts();
        } catch (e) { console.error('Error al aprobar producto:', e); }
    };

    const rejectProduct = async (productId, reason) => {
        setPendingProducts(prev => prev.map(p =>
            String(p.id) === String(productId) ? { ...p, status: 'rejected', rejectionReason: reason } : p
        ));
        try {
            await fetch(`${API}/api/products/${productId}/moderate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected', reason })
            });
            refreshProducts();
        } catch (e) { console.error('Error al rechazar producto:', e); }
    };

    /** Actualiza tasa de comisión de un vendedor localmente */
    const updateSellerCommission = (sellerId, commissionRate) => {
        setUsers(prev => prev.map(u => u.id === sellerId ? { ...u, commissionRate } : u));
    };

    /** Suspende / reactiva un vendedor localmente */
    const toggleSellerSuspension = (sellerId, reason = null) => {
        setUsers(prev => prev.map(u => {
            if (u.id === sellerId) {
                return { ...u, suspended: !u.suspended, suspensionReason: !u.suspended ? reason : null, active: u.suspended };
            }
            return u;
        }));
    };

    // =========================================================================
    // FUNCIONES DE BUG REPORTS
    // =========================================================================

    /**
     * Actualiza el estado de un bug report.
     * @param {number} reportId
     * @param {string} newStatus
     * @param {string|null} assignedTo
     */
    const updateBugReportStatus = async (reportId, newStatus, assignedTo = null) => {
        setBugReports(prev => prev.map(r => {
            if (r.id === reportId) {
                const updated = { ...r, status: newStatus };
                if (assignedTo !== null) updated.assignedTo = assignedTo;
                if (newStatus === 'resolved') updated.resolvedAt = new Date().toISOString().split('T')[0];
                return updated;
            }
            return r;
        }));
        try {
            await fetch(`${API}/api/support/bugs/${reportId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, assignedTo })
            });
        } catch (e) { console.error('Error al actualizar bug report:', e); }
    };

    /** Filtra bug reports por vendedor — String() garantiza comparación correcta entre tipos */
    const getBugReportsBySeller = (sellerId) => bugReports.filter(r => String(r.sellerId) === String(sellerId));

    // =========================================================================
    // FUNCIONES DE CUPONES
    // =========================================================================

    /**
     * Crea un nuevo cupón en BD y estado local.
     * @param {Object} newCoupon
     */
    const createCoupon = async (newCoupon) => {
        const couponObj = {
            ...newCoupon,
            id: coupons.length > 0 ? Math.max(...coupons.map(c => c.id)) + 1 : 1,
            usageCount: 0,
            active: true,
            createdAt: new Date().toISOString().split('T')[0]
        };
        setCoupons(prev => [...prev, couponObj]);
        try {
            await fetch(`${API}/api/coupons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(couponObj)
            });
        } catch (e) { console.error('Error al crear cupón:', e); }
    };

    /**
     * Desactiva un cupón en BD y estado local.
     * @param {number} couponId
     */
    const deactivateCoupon = async (couponId) => {
        setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, active: false } : c));
        try {
            await fetch(`${API}/api/coupons/${couponId}/deactivate`, { method: 'PUT' });
        } catch (e) { console.error('Error al desactivar cupón:', e); }
    };

    /**
     * Valida un código de cupón contra las reglas de negocio.
     * @param {string} code
     * @param {number} cartTotal
     * @param {Array} userOrders
     * @returns {{ valid: boolean, coupon?: Object, message?: string }}
     */
    const validateCoupon = (code, cartTotal, userOrders) => {
        const coupon = coupons.find(c => c.code === code && c.active);
        if (!coupon) return { valid: false, message: 'Cupón no válido o expirado' };
        if (new Date() > new Date(coupon.expiresAt)) return { valid: false, message: 'Cupón expirado' };
        if (coupon.rules?.minPurchase && cartTotal < coupon.rules.minPurchase)
            return { valid: false, message: `Compra mínima de $${coupon.rules.minPurchase.toLocaleString()}` };
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
        const ticketObj = {
            ...newTicket,
            id: supportTickets.length > 0 ? Math.max(...supportTickets.map(t => t.id)) + 1 : 1,
            status: 'open',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        setSupportTickets(prev => [...prev, ticketObj]);
        try {
            await fetch(`${API}/api/support/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketObj)
            });
        } catch (e) { console.error('Error al crear ticket:', e); }
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
                const updated = { ...t, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] };
                if (newStatus === 'resolved') updated.resolvedAt = updated.updatedAt;
                return updated;
            }
            return t;
        }));
        try {
            await fetch(`${API}/api/support/tickets/${ticketId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (e) { console.error('Error al actualizar ticket:', e); }
    };

    /** Asigna un ticket a un usuario (solo estado local) */
    const assignTicket = (ticketId, userId) => {
        setSupportTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, assignedTo: userId, updatedAt: new Date().toISOString().split('T')[0] } : t
        ));
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
            await fetch(`${API}/api/inventory/batches`, {
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
        setInventoryBatches(prev => prev.map(b =>
            b.id === batchId ? { ...b, ...updates, lastUpdate: new Date().toISOString().split('T')[0] } : b
        ));
        try {
            await fetch(`${API}/api/inventory/batches/${batchId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (e) { console.error('Error al actualizar lote:', e); }
    };

    /**
     * Registra un evento de merma en BD y estado local.
     * @param {Object} wasteEvent
     */
    const logWaste = async (wasteEvent) => {
        const eventObj = {
            ...wasteEvent,
            id: wasteEvents.length > 0 ? Math.max(...wasteEvents.map(e => e.id)) + 1 : 1,
            eventDate: new Date().toISOString().split('T')[0]
        };
        setWasteEvents(prev => [...prev, eventObj]);
        try {
            await fetch(`${API}/api/inventory/waste`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wasteEvent)
            });
        } catch (e) { console.error('Error al registrar merma:', e); }
    };

    /**
     * Actualiza un umbral de stock mínimo.
     * @param {string} fabricType
     * @param {number} minMeters
     */
    const updateStockThreshold = async (fabricType, minMeters) => {
        setStockThresholds(prev => prev.map(t =>
            t.fabricType === fabricType ? { ...t, minMeters } : t
        ));
        try {
            await fetch(`${API}/api/inventory/thresholds`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fabricType, minMeters })
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
            await fetch(`${API}/api/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'system_config', value: JSON.stringify(newConfig) })
            });
        } catch (e) { console.error('Error al actualizar config:', e); }
    };

    // ── FUNCIONES DE DESCUENTOS POR PRODUCTO ───────────────────────────────

    const saveProductDiscount = async (productId, discount) => {
        const updated = { ...productDiscounts, [productId]: discount };
        setProductDiscounts(updated);
        try {
            await fetch(`${API}/api/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'product_discounts', value: JSON.stringify(updated) })
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
        updateBugReportStatus,
        getBugReportsBySeller,

        // Cupones
        createCoupon,
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
        logWaste,
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

    return <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>;
}
