import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
    mockUsers,
    mockOrders,
    mockSalesData,
    mockBugReports,
    mockRecentActivity,
    mockSystemConfig,
    mockInventoryBatches,
    mockWasteEvents,
    mockCoupons,
    mockSupportTickets,
    mockColombiaRegionSales,
    mockStockThresholds,
    mockPendingProducts
} from '../data/mockData';
import productsData from '../data/products.json';

const MetricsContext = createContext();

export function useMetrics() {
    const context = useContext(MetricsContext);
    if (!context) {
        throw new Error('useMetrics debe usarse dentro de un MetricsProvider');
    }
    return context;
}

export function MetricsProvider({ children }) {
    // Estado persistente
    const [users, setUsers] = useLocalStorage('metrics_users', mockUsers);
    const [orders, setOrders] = useLocalStorage('metrics_orders', mockOrders);
    const [salesData, setSalesData] = useLocalStorage('metrics_sales', mockSalesData);
    const [bugReports, setBugReports] = useLocalStorage('metrics_bugs', mockBugReports);
    const [systemConfig, setSystemConfig] = useLocalStorage('system_config', mockSystemConfig);
    const [inventoryBatches, setInventoryBatches] = useLocalStorage('inventory_batches', mockInventoryBatches);
    const [wasteEvents, setWasteEvents] = useLocalStorage('waste_events', mockWasteEvents);
    const [coupons, setCoupons] = useLocalStorage('coupons', mockCoupons);
    const [supportTickets, setSupportTickets] = useLocalStorage('support_tickets', mockSupportTickets);
    const [stockThresholds, setStockThresholds] = useLocalStorage('stock_thresholds', mockStockThresholds);
    const [pendingProducts, setPendingProducts] = useLocalStorage('pending_products', mockPendingProducts);

    // Estado local
    const [products, setProducts] = useState(productsData);
    const [recentActivity] = useState(mockRecentActivity);
    const [regionSales] = useState(mockColombiaRegionSales);

    // Funciones para gestión de usuarios
    const updateUserRole = (userId, newRole) => {
        setUsers(users.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
        ));
    };

    const toggleUserActive = (userId) => {
        setUsers(users.map(user =>
            user.id === userId ? { ...user, active: !user.active } : user
        ));
    };

    const getUsersByRole = (role) => {
        return users.filter(user => user.role === role);
    };

    // Funciones para gestión de reportes
    const updateBugReportStatus = (reportId, newStatus, assignedTo = null) => {
        setBugReports(bugReports.map(report => {
            if (report.id === reportId) {
                const updated = { ...report, status: newStatus };
                if (assignedTo !== null) updated.assignedTo = assignedTo;
                if (newStatus === 'resolved') updated.resolvedAt = new Date().toISOString().split('T')[0];
                return updated;
            }
            return report;
        }));
    };

    const getBugReportsBySeller = (sellerId) => {
        return bugReports.filter(report => report.sellerId === sellerId);
    };

    // Funciones para gestión de pedidos
    const getOrdersBySeller = (sellerId) => {
        return orders.filter(order => order.sellerId === sellerId);
    };

    const getOrdersByClient = (clientId) => {
        return orders.filter(order => order.clientId === clientId);
    };

    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    // Funciones para productos
    const getProductsBySeller = (sellerId) => {
        return products.filter(product => product.sellerId === sellerId);
    };

    const updateProduct = (productId, updates) => {
        setProducts(products.map(product =>
            product.id === productId ? { ...product, ...updates } : product
        ));
    };

    const deleteProduct = (productId) => {
        setProducts(products.filter(product => product.id !== productId));
    };

    const addProduct = (newProduct) => {
        const maxId = Math.max(...products.map(p => p.id), 0);
        setProducts([...products, { ...newProduct, id: maxId + 1 }]);
    };

    // Funciones para configuración del sistema
    const updateSystemConfig = (updates) => {
        setSystemConfig({ ...systemConfig, ...updates });
    };

    // Funciones para inventario
    const addBatch = (newBatch) => {
        const maxId = Math.max(...inventoryBatches.map(b => parseInt(b.id.slice(1)) || 0), 0);
        setInventoryBatches([...inventoryBatches, { ...newBatch, id: `R${String(maxId + 1).padStart(3, '0')}` }]);
    };

    const updateBatch = (batchId, updates) => {
        setInventoryBatches(inventoryBatches.map(batch =>
            batch.id === batchId ? { ...batch, ...updates, lastUpdate: new Date().toISOString().split('T')[0] } : batch
        ));
    };

    const logWaste = (wasteEvent) => {
        const maxId = Math.max(...wasteEvents.map(e => e.id), 0);
        setWasteEvents([...wasteEvents, { ...wasteEvent, id: maxId + 1, date: new Date().toISOString().split('T')[0] }]);
    };

    const updateStockThreshold = (fabricType, minMeters) => {
        setStockThresholds(stockThresholds.map(threshold =>
            threshold.fabricType === fabricType ? { ...threshold, minMeters } : threshold
        ));
    };

    // Funciones para moderación de vendedores
    const approveProduct = (productId) => {
        setPendingProducts(pendingProducts.filter(p => p.id !== productId));
        // Aquí se agregaría el producto a la lista principal
    };

    const rejectProduct = (productId, reason) => {
        setPendingProducts(pendingProducts.map(p =>
            p.id === productId ? { ...p, status: 'rejected', rejectionReason: reason } : p
        ));
    };

    const updateSellerCommission = (sellerId, commissionRate) => {
        setUsers(users.map(user =>
            user.id === sellerId ? { ...user, commissionRate } : user
        ));
    };

    const toggleSellerSuspension = (sellerId, reason = null) => {
        setUsers(users.map(user => {
            if (user.id === sellerId) {
                return {
                    ...user,
                    suspended: !user.suspended,
                    suspensionReason: !user.suspended ? reason : null,
                    active: user.suspended // Si estaba suspendido, activar; si no, desactivar
                };
            }
            return user;
        }));
    };

    // Funciones para cupones
    const createCoupon = (newCoupon) => {
        const maxId = Math.max(...coupons.map(c => c.id), 0);
        setCoupons([...coupons, {
            ...newCoupon,
            id: maxId + 1,
            usageCount: 0,
            createdAt: new Date().toISOString().split('T')[0]
        }]);
    };

    const deactivateCoupon = (couponId) => {
        setCoupons(coupons.map(coupon =>
            coupon.id === couponId ? { ...coupon, active: false } : coupon
        ));
    };

    const validateCoupon = (code, cartTotal, userOrders) => {
        const coupon = coupons.find(c => c.code === code && c.active);
        if (!coupon) return { valid: false, message: 'Cupón no válido o expirado' };

        const now = new Date();
        const expiryDate = new Date(coupon.expiresAt);
        if (now > expiryDate) return { valid: false, message: 'Cupón expirado' };

        if (coupon.rules.minPurchase && cartTotal < coupon.rules.minPurchase) {
            return { valid: false, message: `Compra mínima de $${coupon.rules.minPurchase.toLocaleString()}` };
        }

        if (coupon.rules.firstTimeOnly && userOrders.length > 0) {
            return { valid: false, message: 'Este cupón es solo para primera compra' };
        }

        if (coupon.rules.maxUses && coupon.usageCount >= coupon.rules.maxUses) {
            return { valid: false, message: 'Cupón agotado' };
        }

        return { valid: true, coupon };
    };

    // Funciones para tickets de soporte
    const createTicket = (newTicket) => {
        const maxId = Math.max(...supportTickets.map(t => t.id), 0);
        setSupportTickets([...supportTickets, {
            ...newTicket,
            id: maxId + 1,
            status: 'open',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        }]);
    };

    const updateTicketStatus = (ticketId, newStatus) => {
        setSupportTickets(supportTickets.map(ticket => {
            if (ticket.id === ticketId) {
                const updated = {
                    ...ticket,
                    status: newStatus,
                    updatedAt: new Date().toISOString().split('T')[0]
                };
                if (newStatus === 'resolved') {
                    updated.resolvedAt = new Date().toISOString().split('T')[0];
                }
                return updated;
            }
            return ticket;
        }));
    };

    const assignTicket = (ticketId, userId) => {
        setSupportTickets(supportTickets.map(ticket =>
            ticket.id === ticketId
                ? { ...ticket, assignedTo: userId, updatedAt: new Date().toISOString().split('T')[0] }
                : ticket
        ));
    };

    const value = {
        // Datos
        users,
        orders,
        salesData,
        bugReports,
        products,
        recentActivity,
        systemConfig,
        inventoryBatches,
        wasteEvents,
        coupons,
        supportTickets,
        regionSales,
        stockThresholds,
        pendingProducts,

        // Funciones de usuarios
        updateUserRole,
        toggleUserActive,
        getUsersByRole,

        // Funciones de reportes
        updateBugReportStatus,
        getBugReportsBySeller,

        // Funciones de pedidos
        getOrdersBySeller,
        getOrdersByClient,
        updateOrderStatus,

        // Funciones de productos
        getProductsBySeller,
        updateProduct,
        deleteProduct,
        addProduct,

        // Funciones de configuración
        updateSystemConfig,

        // Funciones de inventario
        addBatch,
        updateBatch,
        logWaste,
        updateStockThreshold,

        // Funciones de moderación
        approveProduct,
        rejectProduct,
        updateSellerCommission,
        toggleSellerSuspension,

        // Funciones de cupones
        createCoupon,
        deactivateCoupon,
        validateCoupon,

        // Funciones de soporte
        createTicket,
        updateTicketStatus,
        assignTicket,
    };

    return <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>;
}
