// Utilidades para cálculo de métricas y análisis de datos

/**
 * Calcula el total de ventas de un array de pedidos
 */
export const calculateTotalSales = (orders) => {
    return orders.reduce((total, order) => total + order.total, 0);
};

/**
 * Calcula el ticket promedio
 */
export const calculateAverageTicket = (orders) => {
    if (orders.length === 0) return 0;
    return calculateTotalSales(orders) / orders.length;
};

/**
 * Obtiene los productos más vendidos
 */
export const getTopProducts = (orders, products, limit = 5) => {
    const productSales = {};

    orders.forEach(order => {
        const pIds = order.productIds || [];
        pIds.forEach(productId => {
            if (!productSales[productId]) {
                productSales[productId] = { count: 0, revenue: 0 };
            }
            productSales[productId].count += 1;
            productSales[productId].revenue += order.total / pIds.length;
        });
    });

    return Object.entries(productSales)
        .map(([id, data]) => {
            const product = products.find(p => String(p.id) === String(id));
            return {
                id: parseInt(id),
                name: product?.name || 'Producto Desconocido',
                sales: data.count,
                revenue: data.revenue,
                sellerId: product?.sellerId
            };
        })
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit);
};

/**
 * Obtiene métricas de un vendedor específico
 */
export const getSellerMetrics = (sellerId, orders, bugReports = []) => {
    const sellerOrders = orders.filter(order => order.sellerId === sellerId);
    const sellerBugReports = bugReports.filter(report => report.sellerId === sellerId);

    return {
        totalSales: calculateTotalSales(sellerOrders),
        totalOrders: sellerOrders.length,
        averageTicket: calculateAverageTicket(sellerOrders),
        bugReportsCount: sellerBugReports.length,
        completedOrders: sellerOrders.filter(o => o.status === 'delivered').length,
        pendingOrders: sellerOrders.filter(o => o.status !== 'delivered').length,
    };
};

/**
 * Obtiene métricas de un cliente específico
 */
export const getClientMetrics = (clientId, orders) => {
    const clientOrders = orders.filter(order => order.clientId === clientId);

    // Calcular frecuencia de compra (días entre compras)
    const sortedOrders = [...clientOrders].sort((a, b) => new Date(a.date) - new Date(b.date));
    let averageDaysBetweenPurchases = 0;

    if (sortedOrders.length > 1) {
        const daysDiffs = [];
        for (let i = 1; i < sortedOrders.length; i++) {
            const diff = Math.abs(new Date(sortedOrders[i].date) - new Date(sortedOrders[i - 1].date));
            daysDiffs.push(diff / (1000 * 60 * 60 * 24));
        }
        averageDaysBetweenPurchases = daysDiffs.reduce((a, b) => a + b, 0) / daysDiffs.length;
    }

    return {
        totalPurchases: clientOrders.length,
        totalSpent: calculateTotalSales(clientOrders),
        averageOrderValue: calculateAverageTicket(clientOrders),
        lastPurchaseDate: sortedOrders.length > 0 ? sortedOrders[sortedOrders.length - 1].date : null,
        purchaseFrequency: averageDaysBetweenPurchases,
        lifetimeValue: calculateTotalSales(clientOrders),
    };
};

/**
 * Calcula la tasa de crecimiento entre dos valores
 */
export const calculateGrowthRate = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

/**
 * Agrupa pedidos por fecha
 */
export const groupOrdersByDate = (orders) => {
    const grouped = {};

    orders.forEach(order => {
        if (!grouped[order.date]) {
            grouped[order.date] = {
                date: order.date,
                orders: 0,
                sales: 0
            };
        }
        grouped[order.date].orders += 1;
        grouped[order.date].sales += order.total;
    });

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Obtiene estadísticas de todos los vendedores
 */
export const getAllSellersMetrics = (sellers, orders, bugReports = []) => {
    return sellers.map(seller => ({
        ...seller,
        metrics: getSellerMetrics(seller.id, orders, bugReports)
    })).sort((a, b) => b.metrics.totalSales - a.metrics.totalSales);
};

/**
 * Obtiene estadísticas de todos los clientes
 */
export const getAllClientsMetrics = (clients, orders) => {
    return clients.map(client => ({
        ...client,
        metrics: getClientMetrics(client.id, orders)
    })).sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent);
};

/**
 * Filtra pedidos por rango de fechas
 */
export const filterOrdersByDateRange = (orders, startDate, endDate) => {
    return orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
};

/**
 * Calcula métricas de calidad (reportes de fallos)
 */
export const calculateQualityMetrics = (bugReports) => {
    const total = bugReports.length;
    const open = bugReports.filter(r => r.status === 'open').length;
    const inReview = bugReports.filter(r => r.status === 'in_review').length;
    const resolved = bugReports.filter(r => r.status === 'resolved').length;

    return {
        total,
        open,
        inReview,
        resolved,
        resolutionRate: total > 0 ? (resolved / total) * 100 : 0
    };
};

/**
 * Segmenta clientes por valor
 */
export const segmentClients = (clients, orders) => {
    const clientsWithMetrics = getAllClientsMetrics(clients, orders);

    return {
        vip: clientsWithMetrics.filter(c => c.metrics.totalSpent > 1000000),
        regular: clientsWithMetrics.filter(c => c.metrics.totalSpent >= 300000 && c.metrics.totalSpent <= 1000000),
        new: clientsWithMetrics.filter(c => c.metrics.totalSpent < 300000),
    };
};

/**
 * Obtiene productos sin ventas
 */
export const getProductsWithoutSales = (products, orders) => {
    const soldProductIds = new Set();
    orders.forEach(order => {
        (order.productIds || []).forEach(id => soldProductIds.add(id));
    });

    return products.filter(product => !soldProductIds.has(product.id));
};

/**
 * Calcula métricas de stock
 */
export const calculateStockMetrics = (products, lowStockThreshold = 20) => {
    return {
        totalProducts: products.length,
        lowStock: products.filter(p => p.stock < lowStockThreshold).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        inStock: products.filter(p => p.stock >= lowStockThreshold).length,
    };
};

/**
 * Formatea datos para gráficos de línea
 */
export const formatLineChartData = (data, xKey, yKey) => {
    return data.map(item => ({
        name: item[xKey],
        value: item[yKey]
    }));
};

/**
 * Formatea datos para gráficos de barra
 */
export const formatBarChartData = (data, labelKey, valueKey) => {
    return data.map(item => ({
        name: item[labelKey],
        value: item[valueKey]
    }));
};
