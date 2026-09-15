/**
 * metricsUtils.js — Funciones de Métricas y KPIs
 * ================================================
 * Este archivo contiene cálculos matemáticos para las métricas clave (KPIs)
 * que se muestran en los paneles de administración y vendedores.
 * Compatible tanto con propiedades en inglés como en español.
 */

/**
 * calculateTotalSales — Suma el total de ventas de una lista de pedidos
 * @param {Array} orders - Lista de pedidos con campo 'total' o 'montoTotal'
 * @returns {number} Suma de todos los totales en pesos colombianos
 */
export const calculateTotalSales = (orders = []) => {
    return (orders || []).reduce((total, order) => total + Number(order.total ?? order.montoTotal ?? 0), 0);
};

/**
 * calculateAverageTicket — Calcula el ticket promedio (valor promedio por pedido)
 * @param {Array} orders - Lista de pedidos
 * @returns {number} Valor promedio en pesos por pedido
 */
export const calculateAverageTicket = (orders = []) => {
    if (!orders || orders.length === 0) return 0;
    return calculateTotalSales(orders) / orders.length;
};

/**
 * getTopProducts — Devuelve los productos más vendidos con su información
 */
export const getTopProducts = (orders = [], products = [], limit = 5) => {
    const productSales = {};

    (orders || []).forEach(order => {
        const pIds = order.productIds || order.idsProductos || [];
        const total = Number(order.total ?? order.montoTotal ?? 0);
        pIds.forEach(productId => {
            if (!productSales[productId]) {
                productSales[productId] = { count: 0, revenue: 0 };
            }
            productSales[productId].count += 1;
            productSales[productId].revenue += (pIds.length > 0 ? total / pIds.length : total);
        });
    });

    return Object.entries(productSales)
        .map(([id, data]) => {
            const product = (products || []).find(p => String(p.id) === String(id));
            return {
                id: parseInt(id),
                name: product?.name || product?.nombre || 'Producto Desconocido',
                sales: data.count,
                revenue: data.revenue,
                sellerId: product?.sellerId || product?.idVendedor
            };
        })
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit);
};

/**
 * getSellerMetrics — Calcula todos los KPIs de un vendedor específico
 */
export const getSellerMetrics = (sellerId, orders = [], bugReports = []) => {
    const sellerOrders = (orders || []).filter(order => {
        const sId = order.sellerId || order.idVendedor;
        return String(sId) === String(sellerId);
    });

    const sellerBugReports = (bugReports || []).filter(report => {
        const sId = report.sellerId || report.idVendedor;
        return String(sId) === String(sellerId);
    });

    return {
        totalSales: calculateTotalSales(sellerOrders),
        totalOrders: sellerOrders.length,
        averageTicket: calculateAverageTicket(sellerOrders),
        bugReportsCount: sellerBugReports.length,
        completedOrders: sellerOrders.filter(o => (o.status === 'delivered' || o.estado === 'entregado' || o.status === 'completed' || o.estado === 'completado')).length,
        pendingOrders: sellerOrders.filter(o => (o.status !== 'delivered' && o.estado !== 'entregado' && o.status !== 'completed' && o.estado !== 'completado')).length,
    };
};

/**
 * getClientMetrics — Calcula las métricas de un cliente específico
 */
export const getClientMetrics = (clientId, orders = []) => {
    const clientOrders = (orders || []).filter(order => {
        const cId = order.clientId || order.idCliente || order.userId || order.idUsuario;
        return String(cId) === String(clientId);
    });

    const sortedOrders = [...clientOrders].sort((a, b) => {
        const dateA = new Date(a.date || a.fecha || 0);
        const dateB = new Date(b.date || b.fecha || 0);
        return dateA - dateB;
    });

    let averageDaysBetweenPurchases = 0;

    if (sortedOrders.length > 1) {
        const daysDiffs = [];
        for (let i = 1; i < sortedOrders.length; i++) {
            const datePrev = new Date(sortedOrders[i - 1].date || sortedOrders[i - 1].fecha || 0);
            const dateCurr = new Date(sortedOrders[i].date || sortedOrders[i].fecha || 0);
            const diff = Math.abs(dateCurr - datePrev);
            daysDiffs.push(diff / (1000 * 60 * 60 * 24));
        }
        averageDaysBetweenPurchases = daysDiffs.reduce((a, b) => a + b, 0) / daysDiffs.length;
    }

    const lastDate = sortedOrders.length > 0 ? (sortedOrders[sortedOrders.length - 1].date || sortedOrders[sortedOrders.length - 1].fecha) : null;

    return {
        totalPurchases: clientOrders.length,
        totalSpent: calculateTotalSales(clientOrders),
        averageOrderValue: calculateAverageTicket(clientOrders),
        lastPurchaseDate: lastDate,
        purchaseFrequency: averageDaysBetweenPurchases,
        lifetimeValue: calculateTotalSales(clientOrders),
    };
};

/**
 * calculateGrowthRate — Calcula el porcentaje de crecimiento entre dos valores
 */
export const calculateGrowthRate = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

/**
 * groupOrdersByDate — Agrupa los pedidos por fecha para gráficas de línea/barra
 */
export const groupOrdersByDate = (orders = []) => {
    const grouped = {};

    (orders || []).forEach(order => {
        const dateKey = order.date || order.fecha || 'Sin Fecha';
        if (!grouped[dateKey]) {
            grouped[dateKey] = {
                date: dateKey,
                orders: 0,
                sales: 0
            };
        }
        grouped[dateKey].orders += 1;
        grouped[dateKey].sales += Number(order.total ?? order.montoTotal ?? 0);
    });

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * getAllSellersMetrics — Calcula las métricas de todos los vendedores a la vez
 */
export const getAllSellersMetrics = (sellers = [], orders = [], bugReports = []) => {
    return (sellers || []).map(seller => ({
        ...seller,
        metrics: getSellerMetrics(seller.id, orders, bugReports)
    })).sort((a, b) => b.metrics.totalSales - a.metrics.totalSales);
};

/**
 * getAllClientsMetrics — Calcula las métricas de todos los clientes a la vez
 */
export const getAllClientsMetrics = (clients = [], orders = []) => {
    return (clients || []).map(client => ({
        ...client,
        metrics: getClientMetrics(client.id, orders)
    })).sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent);
};

/**
 * calculateConversionRate — Calcula la tasa de conversión
 */
export const calculateConversionRate = (conversions, totalVisitors) => {
    if (totalVisitors === 0) return 0;
    return (conversions / totalVisitors) * 100;
};

/**
 * getResolutionRate — Calcula la tasa de resolución de problemas/tickets
 */
export const getResolutionRate = (items = []) => {
    if (!items || items.length === 0) return 0;
    const resolved = items.filter(item => item.status === 'resolved' || item.status === 'closed' || item.estado === 'resuelto' || item.estado === 'cerrado').length;
    return (resolved / items.length) * 100;
};

/**
 * calculateAverageResolutionTime — Calcula el tiempo promedio de resolución en días
 */
export const calculateAverageResolutionTime = (items = []) => {
    const resolved = (items || []).filter(item => (item.resolvedAt || item.fechaResolucion) && (item.createdAt || item.fechaCreacion || item.reportedAt || item.fechaReporte));
    if (resolved.length === 0) return 0;

    const totalDays = resolved.reduce((sum, item) => {
        const start = new Date(item.createdAt || item.fechaCreacion || item.reportedAt || item.fechaReporte);
        const end = new Date(item.resolvedAt || item.fechaResolucion);
        return sum + Math.abs(end - start) / (1000 * 60 * 60 * 24);
    }, 0);

    return totalDays / resolved.length;
};

/**
 * getPriorityDistribution — Cuenta cuántos elementos hay de cada prioridad
 */
export const getPriorityDistribution = (items = []) => {
    const distribution = { critical: 0, high: 0, medium: 0, low: 0, critico: 0, alta: 0, media: 0, baja: 0 };
    (items || []).forEach(item => {
        const priority = (item.priority || item.prioridad || 'medium').toLowerCase();
        if (distribution[priority] !== undefined) {
            distribution[priority]++;
        } else {
            distribution.medium++;
        }
    });
    return distribution;
};

/**
 * calculateSellerCommission — Calcula la comisión que le corresponde a un vendedor
 */
export const calculateSellerCommission = (totalSales, commissionRate = 0.05) => {
    return totalSales * commissionRate;
};

/**
 * filterOrdersByDateRange — Filtra pedidos por rango de fechas
 */
export const filterOrdersByDateRange = (orders = [], startDate, endDate) => {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();

    return (orders || []).filter(order => {
        const orderDate = new Date(order.date || order.fecha);
        return orderDate >= start && orderDate <= end;
    });
};

/**
 * getPeriodComparison — Compara las ventas de dos periodos
 */
export const getPeriodComparison = (currentOrders = [], previousOrders = []) => {
    const currentSales = calculateTotalSales(currentOrders);
    const previousSales = calculateTotalSales(previousOrders);
    const growthRate = calculateGrowthRate(currentSales, previousSales);

    return {
        currentSales,
        previousSales,
        growthRate,
        absoluteDifference: currentSales - previousSales,
        currentOrdersCount: currentOrders.length,
        previousOrdersCount: previousOrders.length,
        ordersGrowthRate: calculateGrowthRate(currentOrders.length, previousOrders.length)
    };
};
