/**
 * analyticsUtils.js — Funciones de Análisis e Inteligencia de Negocios
 * ======================================================================
 * Este archivo contiene cálculos avanzados para el módulo de Analítica
 * y Business Intelligence del panel de administración.
 *
 * ¿Qué calcula?
 *  - Velocidad de rotación de productos (cuántos se venden por día)
 *  - Productos con "stock muerto" (sin ventas recientes)
 *  - Productos más vendidos (bestsellers)
 *  - Tasa de reportes o devoluciones
 *  - Proyecciones de ingresos futuros
 *  - Crecimiento mes a mes
 *  - Ventas agrupadas por categoría de tela
 *  - Datos para el mapa de calor de Colombia por departamento
 */

/**
 * calculateInventoryVelocity — Calcula cuántas ventas por día tiene un producto
 * Nos indica si un producto se vende rápido o si está estancado.
 * Ejemplo: 0.5 significa que ese producto se vende en promedio cada 2 días.
 *
 * @param {Object} product - Objeto del producto
 * @param {Array}  orders  - Lista completa de pedidos
 * @returns {number} Ventas promedio por día (usando 90 días como período de análisis)
 */
export function calculateInventoryVelocity(product, orders) {
    // Filtramos los pedidos que contienen este producto específico
    const productOrders = orders.filter(order =>
        order.productIds && order.productIds.includes(product.id)
    );

    const daysSinceLaunch = 90; // Analizamos los últimos 90 días
    const salesCount = productOrders.length;

    return salesCount / daysSinceLaunch; // Resultado: ventas por día
}

/**
 * identifyDeadStock — Identifica productos que no se han vendido en los últimos N días
 * "Stock muerto" significa que el producto ocupa espacio pero no genera ingresos.
 *
 * @param {Array}  products      - Lista de productos del catálogo
 * @param {Array}  orders        - Lista de pedidos
 * @param {number} dayThreshold  - Días sin venta para considerar stock muerto (por defecto 30)
 * @returns {Array} Productos sin ventas recientes con una recomendación
 */
export function identifyDeadStock(products, orders, dayThreshold = 30) {
    // Calculamos la fecha límite: si el último pedido fue antes de esta fecha, es stock muerto
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dayThreshold);

    return products.filter(product => {
        // Buscamos si hubo algún pedido reciente que incluya este producto
        const recentOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= cutoffDate &&
                order.productIds &&
                order.productIds.includes(product.id);
        });

        // Si no hay pedidos recientes, es stock muerto
        return recentOrders.length === 0;
    }).map(product => ({
        ...product,
        daysWithoutSale: dayThreshold,
        recommendation: 'Considerar descuento o promoción' // Sugerencia al admin
    }));
}

/**
 * identifyBestsellers — Devuelve los productos que más se han vendido
 * Ordena todos los productos por número de ventas de mayor a menor.
 *
 * @param {Array}  products - Lista de productos del catálogo
 * @param {Array}  orders   - Lista de pedidos
 * @param {number} limit    - Cuántos bestsellers devolver (por defecto 10)
 * @returns {Array} Productos ordenados por ventas, con datos de ingresos y velocidad
 */
export function identifyBestsellers(products, orders, limit = 10) {
    const productSales = products.map(product => {
        // Pedidos donde este producto aparece
        const productOrders = orders.filter(order =>
            order.productIds && order.productIds.includes(product.id)
        );

        // Ingresos totales generados por este producto
        const totalRevenue = productOrders.reduce((sum, order) => sum + order.total, 0);

        return {
            ...product,
            salesCount: productOrders.length, // Total de veces que se vendió
            revenue: totalRevenue,            // Dinero generado
            velocity: calculateInventoryVelocity(product, orders) // Velocidad de venta diaria
        };
    });

    // Ordenamos de mayor a menor cantidad de ventas y tomamos los primeros N
    return productSales
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, limit);
}

/**
 * calculateReturnRate — Calcula el porcentaje de pedidos con reportes de problemas
 * Un porcentaje alto indica problemas de calidad que deben revisarse.
 *
 * @param {Array} bugReports - Lista de reportes de errores o devoluciones
 * @param {Array} orders     - Lista de pedidos totales
 * @returns {string} Porcentaje con 2 decimales (Ej: "3.50")
 */
export function calculateReturnRate(bugReports, orders) {
    if (orders.length === 0) return 0; // Si no hay pedidos, el porcentaje es 0
    return ((bugReports.length / orders.length) * 100).toFixed(2);
}

/**
 * calculateReturnsByFabricType — Agrupa los reportes de problemas por tipo de tela
 * Útil para identificar qué tipo de tela genera más quejas.
 *
 * @param {Array} bugReports - Lista de reportes de errores
 * @returns {Object} Estadísticas agrupadas por tipo de tela
 */
export function calculateReturnsByFabricType(bugReports) {
    const stats = {};

    bugReports.forEach(report => {
        // Tomamos la primera palabra del nombre del producto como categoría aproximada
        const category = report.productName?.split(' ')[0] || 'Otros';
        if (!stats[category]) {
            stats[category] = {
                count: 0,         // Total de reportes en esta categoría
                highPriority: 0,  // Reportes urgentes
                resolved: 0       // Reportes ya resueltos
            };
        }
        stats[category].count++;
        if (report.priority === 'high') stats[category].highPriority++;
        if (report.status === 'resolved') stats[category].resolved++;
    });

    return stats;
}

/**
 * calculateReturnsBySeller — Muestra cuántos reportes tiene cada vendedor
 * Permite identificar vendedores con más problemas de calidad en sus productos.
 *
 * @param {Array} bugReports - Lista de reportes de errores
 * @param {Array} sellers    - Lista de vendedores registrados
 * @returns {Array} Vendedores ordenados por cantidad de reportes (de mayor a menor)
 */
export function calculateReturnsBySeller(bugReports, sellers) {
    return sellers.map(seller => {
        // Solo los reportes que pertenecen a este vendedor
        const sellerReports = bugReports.filter(report => report.sellerId === seller.id);
        return {
            sellerId: seller.id,
            sellerName: seller.name,
            totalReports: sellerReports.length,                                        // Total de reportes
            openReports: sellerReports.filter(r => r.status === 'open').length,        // Sin resolver
            resolvedReports: sellerReports.filter(r => r.status === 'resolved').length,// Resueltos
            highPriorityReports: sellerReports.filter(r => r.priority === 'high').length // Urgentes
        };
    }).sort((a, b) => b.totalReports - a.totalReports); // El vendedor con más reportes primero
}

/**
 * projectRevenue — Proyecta cuánto se venderá en los próximos días
 * Usa los datos históricos de ventas para estimar ingresos futuros.
 *
 * Métodos disponibles:
 *  - 'linear'         → Usa el promedio de los últimos 30 días
 *  - 'moving_average' → Usa el promedio de los últimos 7 días (más reactivo a cambios recientes)
 *
 * @param {Array}  salesData  - Datos históricos de ventas diarias
 * @param {string} method     - Método de proyección ('linear' o 'moving_average')
 * @param {number} daysAhead  - Cuántos días hacia el futuro proyectar (por defecto 30)
 * @returns {number|null} Proyección de ingresos en pesos, o null si hay pocos datos
 */
export function projectRevenue(salesData, method = 'linear', daysAhead = 30) {
    // Necesitamos al menos 7 días de datos para proyectar
    if (salesData.length < 7) return null;

    // Tomamos los últimos 30 días como base de la proyección
    const recentData = salesData.slice(-30);

    if (method === 'linear') {
        // Calculamos el promedio de ventas diarias y lo multiplicamos por los días a proyectar
        const avgDailySales = recentData.reduce((sum, day) => sum + day.sales, 0) / recentData.length;
        return avgDailySales * daysAhead;
    }

    if (method === 'moving_average') {
        // Usamos solo los últimos 7 días (más sensible a tendencias recientes)
        const last7Days = recentData.slice(-7);
        const avgLast7 = last7Days.reduce((sum, day) => sum + day.sales, 0) / 7;
        return avgLast7 * daysAhead;
    }

    return null; // Si el método no es reconocido, no proyectamos
}

/**
 * calculateMonthOverMonthGrowth — Compara las ventas del mes actual vs. el mes anterior
 * Muestra si el negocio está creciendo, estable o en descenso.
 *
 * @param {Array} salesData - Datos históricos de ventas con campo 'date' y 'sales'
 * @returns {Object} { currentMonth, lastMonth, growth, trend }
 *   - currentMonth: Ventas del mes actual
 *   - lastMonth: Ventas del mes pasado
 *   - growth: Porcentaje de cambio (puede ser negativo)
 *   - trend: 'up' (creció), 'down' (bajó) o 'stable' (igual)
 */
export function calculateMonthOverMonthGrowth(salesData) {
    // Primer día del mes actual
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);

    // Primer día del mes anterior
    const lastMonthStart = new Date(currentMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    // Sumamos ventas del mes actual
    const currentMonthSales = salesData
        .filter(day => new Date(day.date) >= currentMonthStart)
        .reduce((sum, day) => sum + day.sales, 0);

    // Sumamos ventas del mes anterior
    const lastMonthSales = salesData
        .filter(day => {
            const date = new Date(day.date);
            return date >= lastMonthStart && date < currentMonthStart;
        })
        .reduce((sum, day) => sum + day.sales, 0);

    // Calculamos el porcentaje de crecimiento
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
 * calculateSalesByCategory — Calcula los ingresos y pedidos por categoría de tela
 * Útil para saber qué tipo de tela (Algodón, Seda, Lino) vende más.
 *
 * @param {Array} products - Lista de productos del catálogo
 * @param {Array} orders   - Lista de pedidos
 * @returns {Object} Estadísticas por categoría con ingresos, pedidos y cantidad de productos
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
                    revenue: 0,             // Ingresos totales de esta categoría
                    orders: 0,              // Pedidos que incluyen productos de esta categoría
                    products: new Set()     // Set para no contar el mismo producto dos veces
                };
            }

            // Distribuimos el total del pedido entre todos los productos que lo componen
            categorySales[category].revenue += order.total / order.productIds.length;
            categorySales[category].orders++;
            categorySales[category].products.add(productId);
        });
    });

    // Convertimos el Set a un simple número (cuántos productos distintos hay en esta categoría)
    Object.keys(categorySales).forEach(category => {
        categorySales[category].productCount = categorySales[category].products.size;
        delete categorySales[category].products; // Borramos el Set ya que no lo necesitamos más
    });

    return categorySales;
}

/**
 * prepareColombiaHeatMapData — Prepara los datos de ventas por departamento para el mapa
 * Convierte los datos de la base de datos al formato que necesita el componente del mapa.
 *
 * @param {Array} regionSales - Lista de ventas por departamento de la tabla region_sales
 * @returns {Array} Datos formateados y ordenados por volumen de ventas (mayor primero)
 */
export function prepareColombiaHeatMapData(regionSales) {
    return regionSales.map(region => ({
        name: region.department,            // Nombre del departamento (Ej: "Antioquia")
        value: region.sales,                // Total de ventas en pesos
        orders: region.orders,              // Cantidad de pedidos en ese departamento
        // Valor promedio por pedido en ese departamento
        avgOrderValue: region.orders > 0 ? region.sales / region.orders : 0
    })).sort((a, b) => b.value - a.value); // El departamento con más ventas primero
}
