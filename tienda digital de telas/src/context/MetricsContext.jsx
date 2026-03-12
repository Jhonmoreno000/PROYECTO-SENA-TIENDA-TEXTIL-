import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Estado desde API y persistente — inicializar con mock data como fallback
    const [users, setUsers] = useState(mockUsers);
    const [orders, setOrders] = useState(mockOrders);
    const [dataSource, setDataSource] = useState('mock'); // 'mock' o 'api'

    const [salesData, setSalesData] = useState(mockSalesData);
    const [bugReports, setBugReports] = useState(mockBugReports);
    const [systemConfig, setSystemConfig] = useState(mockSystemConfig);
    const [inventoryBatches, setInventoryBatches] = useState(mockInventoryBatches);
    const [wasteEvents, setWasteEvents] = useState(mockWasteEvents);
    const [coupons, setCoupons] = useState(mockCoupons);
    const [supportTickets, setSupportTickets] = useState(mockSupportTickets);
    const [stockThresholds, setStockThresholds] = useState(mockStockThresholds);
    const [pendingProducts, setPendingProducts] = useState(mockPendingProducts);

    // Estado local
    const [products, setProducts] = useState(productsData);
    const [recentActivity] = useState(mockRecentActivity);
    const [regionSales] = useState(mockColombiaRegionSales);

    // Fetch from Backend API — if available, override mock data; otherwise keep mocks
    useEffect(() => {
        const fetchRemoteData = async () => {
            try {
                const usersRes = await fetch('http://localhost:8081/api/users');
                if (usersRes.ok) {
                    const apiUsers = await usersRes.json();
                    if (apiUsers && apiUsers.length > 0) {
                        setUsers(apiUsers);
                        setDataSource('api');
                    }
                }

                const ordersRes = await fetch('http://localhost:8081/api/orders');
                if (ordersRes.ok) {
                    const apiOrders = await ordersRes.json();
                    if (apiOrders && apiOrders.length > 0) {
                        setOrders(apiOrders);
                    }
                }

                // Config
                const configRes = await fetch('http://localhost:8081/api/config/system_config');
                if (configRes.ok) {
                    const apiConfigText = await configRes.text();
                    if (apiConfigText && apiConfigText !== '{}') {
                        setSystemConfig(JSON.parse(apiConfigText));
                    }
                }

                // Coupons
                const couponsRes = await fetch('http://localhost:8081/api/coupons');
                if (couponsRes.ok) {
                    const apiCoupons = await couponsRes.json();
                    if (apiCoupons && apiCoupons.length > 0) {
                        setCoupons(apiCoupons);
                    }
                }
                // Tickets & Bugs
                const ticketsRes = await fetch('http://localhost:8081/api/support/tickets');
                if (ticketsRes.ok) {
                    const apiTickets = await ticketsRes.json();
                    if (apiTickets && apiTickets.length > 0) setSupportTickets(apiTickets);
                }

                const bugsRes = await fetch('http://localhost:8081/api/support/bugs');
                if (bugsRes.ok) {
                    const apiBugs = await bugsRes.json();
                    if (apiBugs && apiBugs.length > 0) setBugReports(apiBugs);
                }

                // Pending Products
                const pendingRes = await fetch('http://localhost:8081/api/products/pending');
                if (pendingRes.ok) {
                    const apiPending = await pendingRes.json();
                    if (apiPending && apiPending.length > 0) setPendingProducts(apiPending);
                }

                // Main Products
                const productsRes = await fetch('http://localhost:8081/api/products');
                if (productsRes.ok) {
                    const apiProducts = await productsRes.json();
                    if (apiProducts && apiProducts.length > 0) setProducts(apiProducts);
                }
                // Admin Metrics from Config Table
                const keysToFetch = ['metrics_sales', 'inventory_batches', 'waste_events', 'stock_thresholds'];
                for (let key of keysToFetch) {
                    const res = await fetch(`http://localhost:8081/api/config?key=${key}`);
                    if (res.ok) {
                        const jsonStr = await res.json();
                        if (jsonStr) {
                            try {
                                const parsed = JSON.parse(jsonStr);
                                if (key === 'metrics_sales') setSalesData(parsed);
                                if (key === 'inventory_batches') setInventoryBatches(parsed);
                                if (key === 'waste_events') setWasteEvents(parsed);
                                if (key === 'stock_thresholds') setStockThresholds(parsed);
                            } catch (e) { console.error('Error parsing config', key); }
                        }
                    }
                }
            } catch (err) {
                console.warn("Backend parcial o totalmente no disponible, usando datos de demostración:", err.message);
                // Los datos mock ya están cargados como estado inicial
            }
        };

        fetchRemoteData();
    }, []);

    const refreshData = async (sellerId = null) => {
        try {
            let url = 'http://localhost:8081/api/products';
            if (sellerId) url += `?sellerId=${sellerId}`;
            
            const productsRes = await fetch(url);
            if (productsRes.ok) {
                const apiProducts = await productsRes.json();
                if (apiProducts) setProducts(apiProducts);
            }
            
            const ordersRes = await fetch('http://localhost:8081/api/orders');
            if (ordersRes.ok) {
                const apiOrders = await ordersRes.json();
                if (apiOrders && apiOrders.length > 0) setOrders(apiOrders);
            }
        } catch (err) {
            console.error("Error refreshing metrics data:", err);
        }
    };

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
    const updateBugReportStatus = async (reportId, newStatus, assignedTo = null) => {
        setBugReports(bugReports.map(report => {
            if (report.id === reportId) {
                const updated = { ...report, status: newStatus };
                if (assignedTo !== null) updated.assignedTo = assignedTo;
                if (newStatus === 'resolved') updated.resolvedAt = new Date().toISOString().split('T')[0];
                return updated;
            }
            return report;
        }));

        try {
            await fetch(`http://localhost:8081/api/support/bugs/${reportId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, assignedTo })
            });
        } catch (e) {
            console.error('Error report status', e);
        }
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

    const updateOrderStatus = async (orderId, newStatus) => {
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));

        try {
            await fetch(`http://localhost:8081/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (e) {
            console.error('Error updating order status', e);
        }
    };

    // Funciones para productos
    const getProductsBySeller = (sellerId) => {
        return products.filter(product => product.sellerId === sellerId);
    };

    const updateProduct = async (productId, updates) => {
        // Update local state
        setProducts(products.map(product =>
            product.id === productId ? { ...product, ...updates } : product
        ));

        // Persist to API
        try {
            await fetch(`http://localhost:8081/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (e) {
            console.error('Error persisting product update', e);
        }
    };

    const deleteProduct = async (productId) => {
        // Update local state
        setProducts(products.filter(product => product.id !== productId));

        // Persist to API
        try {
            await fetch(`http://localhost:8081/api/products/${productId}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error('Error persisting product deletion', e);
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
                refreshData();
            }
        } catch (e) {
            console.error('Error adding product', e);
        }
    };

    // Funciones para configuración del sistema
    const updateSystemConfig = async (updates) => {
        const newConfig = { ...systemConfig, ...updates };
        setSystemConfig(newConfig);
        try {
            await fetch('http://localhost:8081/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'system_config', value: JSON.stringify(newConfig) })
            });
        } catch (e) {
            console.error('Error actualizando config en BD', e);
        }
    };

    // Funciones genéricas para persistir métricas en config
    const persistMetric = async (key, dataArray) => {
        try {
            await fetch('http://localhost:8081/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value: JSON.stringify(dataArray) })
            });
        } catch (e) {
            console.error('Error persisting config ' + key, e);
        }
    };

    // Funciones para inventario
    const addBatch = (newBatch) => {
        const maxId = Math.max(...inventoryBatches.map(b => parseInt(b.id.slice(1)) || 0), 0);
        const newArray = [...inventoryBatches, { ...newBatch, id: `R${String(maxId + 1).padStart(3, '0')}` }];
        setInventoryBatches(newArray);
        persistMetric('inventory_batches', newArray);
    };

    const updateBatch = (batchId, updates) => {
        const newArray = inventoryBatches.map(batch =>
            batch.id === batchId ? { ...batch, ...updates, lastUpdate: new Date().toISOString().split('T')[0] } : batch
        );
        setInventoryBatches(newArray);
        persistMetric('inventory_batches', newArray);
    };

    const logWaste = (wasteEvent) => {
        const maxId = Math.max(...wasteEvents.map(e => e.id), 0);
        const newArray = [...wasteEvents, { ...wasteEvent, id: maxId + 1, date: new Date().toISOString().split('T')[0] }];
        setWasteEvents(newArray);
        persistMetric('waste_events', newArray);
    };

    const updateStockThreshold = (fabricType, minMeters) => {
        const newArray = stockThresholds.map(threshold =>
            threshold.fabricType === fabricType ? { ...threshold, minMeters } : threshold
        );
        setStockThresholds(newArray);
        persistMetric('stock_thresholds', newArray);
    };

    // Funciones para moderación de vendedores
    const approveProduct = async (productId) => {
        setPendingProducts(pendingProducts.filter(p => p.id !== productId));
        // Optimistically add to main products array would theoretically go here, 
        // but normally we just refetch logic.

        try {
            await fetch(`http://localhost:8081/api/products/${productId}/moderate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });
        } catch (e) {
            console.error('Error approving product', e);
        }
    };

    const rejectProduct = async (productId, reason) => {
        setPendingProducts(pendingProducts.map(p =>
            p.id === productId ? { ...p, status: 'rejected', rejectionReason: reason } : p
        ));

        try {
            await fetch(`http://localhost:8081/api/products/${productId}/moderate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected', reason: reason })
            });
        } catch (e) {
            console.error('Error rejecting product', e);
        }
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
    const createCoupon = async (newCoupon) => {
        const maxId = Math.max(...coupons.map(c => c.id), 0);
        const couponObj = {
            ...newCoupon,
            id: maxId + 1,
            usageCount: 0,
            active: true,
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        // Update optimistically
        setCoupons([...coupons, couponObj]);

        try {
            await fetch('http://localhost:8081/api/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(couponObj)
            });
            // Re-fetch could be done here to get DB id instead of maxId + 1, but this suffices.
        } catch (e) {
            console.error('Error creando cupón', e);
        }
    };

    const deactivateCoupon = async (couponId) => {
        setCoupons(coupons.map(coupon =>
            coupon.id === couponId ? { ...coupon, active: false } : coupon
        ));

        try {
            await fetch(`http://localhost:8081/api/coupons/${couponId}/deactivate`, {
                method: 'PUT'
            });
        } catch (e) {
            console.error('Error desactivando cupón', e);
        }
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
    const createTicket = async (newTicket) => {
        const maxId = Math.max(...supportTickets.map(t => t.id), 0);
        const ticketObj = {
            ...newTicket,
            id: maxId + 1,
            status: 'open',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        setSupportTickets([...supportTickets, ticketObj]);

        try {
            await fetch('http://localhost:8081/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketObj)
            });
        } catch (e) { console.error('Error creating ticket', e); }
    };

    const updateTicketStatus = async (ticketId, newStatus) => {
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

        try {
            await fetch(`http://localhost:8081/api/support/tickets/${ticketId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (e) { console.error('Error update ticket', e); }
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
        dataSource,
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
        refreshData,

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
