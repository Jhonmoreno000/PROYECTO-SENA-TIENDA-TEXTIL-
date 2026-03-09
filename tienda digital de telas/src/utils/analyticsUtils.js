// Utilidades para análisis y business intelligence

/**
 * Calcula la velocidad de rotación de inventario de un producto
 */
export function calculateInventoryVelocity(product, orders) {
    const productOrders = orders.filter(order =>
        order.productIds && order.productIds.includes(product.id)
    );

    const daysSinceLaunch = 90; // Simulado - 90 días
    const salesCount = productOrders.length;

    return salesCount / daysSinceLaunch; // ventas por día
}

/**
 * Identifica productos de "stock muerto" sin ventas recientes
 */
export function identifyDeadStock(products, orders, dayThreshold = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dayThreshold);

    return products.filter(product => {
        const recentOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= cutoffDate &&
                order.productIds &&
                order.productIds.includes(product.id);
        });

        return recentOrders.length === 0;
    }).map(product => ({
        ...product,
        daysWithoutSale: dayThreshold,
        recommendation: 'Considerar descuento o promoción'
    }));
}

/**
 * Identifica productos bestsellers
 */
export function identifyBestsellers(products, orders, limit = 10) {
    const productSales = products.map(product => {
        const productOrders = orders.filter(order =>
            order.productIds && order.productIds.includes(product.id)
        );

        const totalRevenue = productOrders.reduce((sum, order) => sum + order.total, 0);

        return {
            ...product,
            salesCount: productOrders.length,
            revenue: totalRevenue,
            velocity: calculateInventoryVelocity(product, orders)
        };
    });

    // Ordenar por número de ventas
    return productSales
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, limit);
}

/**
 * Calcula la tasa de devoluciones/reportes
 */
export function calculateReturnRate(bugReports, orders) {
    if (orders.length === 0) return 0;
    return ((bugReports.length / orders.length) * 100).toFixed(2);
}

/**
 * Calcula estadísticas de devoluciones por tipo de tela
 */
export function calculateReturnsByFabricType(bugReports) {
    const stats = {};

    bugReports.forEach(report => {
        const category = report.productName?.split(' ')[0] || 'Otros';
        if (!stats[category]) {
            stats[category] = {
                count: 0,
                highPriority: 0,
                resolved: 0
            };
        }
        stats[category].count++;
        if (report.priority === 'high') stats[category].highPriority++;
        if (report.status === 'resolved') stats[category].resolved++;
    });

    return stats;
}

/**
 * Calcula estadísticas de devoluciones por vendedor
 */
export function calculateReturnsBySeller(bugReports, sellers) {
    return sellers.map(seller => {
        const sellerReports = bugReports.filter(report => report.sellerId === seller.id);
        return {
            sellerId: seller.id,
            sellerName: seller.name,
            totalReports: sellerReports.length,
            openReports: sellerReports.filter(r => r.status === 'open').length,
            resolvedReports: sellerReports.filter(r => r.status === 'resolved').length,
            highPriorityReports: sellerReports.filter(r => r.priority === 'high').length
        };
    }).sort((a, b) => b.totalReports - a.totalReports);
}

/**
 * Proyecta ingresos futuros basado en tendencias
 */
export function projectRevenue(salesData, method = 'linear', daysAhead = 30) {
    if (salesData.length < 7) return null;

    // Usar los últimos 30 días para la proyección
    const recentData = salesData.slice(-30);

    if (method === 'linear') {
        // Calcular promedio diario
        const avgDailySales = recentData.reduce((sum, day) => sum + day.sales, 0) / recentData.length;
        return avgDailySales * daysAhead;
    }

    if (method === 'moving_average') {
        // Promedio móvil de 7 días
        const last7Days = recentData.slice(-7);
        const avgLast7 = last7Days.reduce((sum, day) => sum + day.sales, 0) / 7;
        return avgLast7 * daysAhead;
    }

    return null;
}

/**
 * Calcula crecimiento mes a mes
 */
export function calculateMonthOverMonthGrowth(salesData) {
    // Simular datos del mes actual y anterior
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);

    const lastMonthStart = new Date(currentMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const currentMonthSales = salesData
        .filter(day => new Date(day.date) >= currentMonthStart)
        .reduce((sum, day) => sum + day.sales, 0);

    const lastMonthSales = salesData
        .filter(day => {
            const date = new Date(day.date);
            return date >= lastMonthStart && date < currentMonthStart;
        })
        .reduce((sum, day) => sum + day.sales, 0);

    const growth = lastMonthSales > 0
        ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100
        : 0;

    return {
        currentMonth: currentMonthSales,
        lastMonth: lastMonthSales,
        growth: growth.toFixed(2),
        trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
    };
}

/**
 * Calcula ventas por categoría
 */
export function calculateSalesByCategory(products, orders) {
    const categorySales = {};

    orders.forEach(order => {
        if (!order.productIds) return;

        order.productIds.forEach(productId => {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const category = product.category || 'Sin categoría';
            if (!categorySales[category]) {
                categorySales[category] = {
                    revenue: 0,
                    orders: 0,
                    products: new Set()
                };
            }

            categorySales[category].revenue += order.total / order.productIds.length; // Distribuir ingreso
            categorySales[category].orders++;
            categorySales[category].products.add(productId);
        });
    });

    // Convertir Set a count
    Object.keys(categorySales).forEach(category => {
        categorySales[category].productCount = categorySales[category].products.size;
        delete categorySales[category].products;
    });

    return categorySales;
}

/**
 * Prepara datos para mapa de calor de Colombia
 */
export function prepareColombiaHeatMapData(regionSales) {
    return regionSales.map(region => ({
        name: region.department,
        value: region.sales,
        orders: region.orders,
        avgOrderValue: region.orders > 0 ? region.sales / region.orders : 0
    })).sort((a, b) => b.value - a.value);
}
