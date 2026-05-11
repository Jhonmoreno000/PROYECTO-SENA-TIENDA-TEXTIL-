/**
 * metricsUtils.js — Funciones de Métricas y KPIs
 * ================================================
 * Este archivo contiene cálculos matemáticos para las métricas clave (KPIs)
 * que se muestran en los paneles de administración y vendedores.
 *
 * Glosario:
 *  - KPI (Key Performance Indicator): indicador clave de rendimiento
 *  - Ticket promedio: el valor promedio que gasta un cliente por pedido
 *  - Tasa de resolución: qué porcentaje de problemas se han resuelto
 *
 * ¿Dónde se usan estas funciones?
 *  - Panel del Administrador: AdminOverview, SellerMetrics, ClientMetrics
 *  - Panel del Vendedor: SellerDashboard
 */

/**
 * calculateTotalSales — Suma el total de ventas de una lista de pedidos
 * @param {Array} orders - Lista de pedidos con campo 'total'
 * @returns {number} Suma de todos los totales en pesos colombianos
 */
export const calculateTotalSales = (orders) => {
    return orders.reduce((total, order) => total + order.total, 0);
};

/**
 * calculateAverageTicket — Calcula el ticket promedio (valor promedio por pedido)
 * Si no hay pedidos, devuelve 0 para evitar división por cero.
 * @param {Array} orders - Lista de pedidos
 * @returns {number} Valor promedio en pesos por pedido
 */
export const calculateAverageTicket = (orders) => {
    if (orders.length === 0) return 0;
    return calculateTotalSales(orders) / orders.length;
};

/**
 * getTopProducts — Devuelve los productos más vendidos con su información
 * Analiza los pedidos para contar cuántas veces aparece cada producto
 * y cuánto dinero ha generado.
 *
 * @param {Array}  orders   - Lista de pedidos (cada uno tiene un array 'productIds')
 * @param {Array}  products - Catálogo completo de productos
 * @param {number} limit    - Cuántos productos devolver (por defecto 5)
 * @returns {Array} Productos ordenados por ventas, con nombre, ventas e ingresos
 */
export const getTopProducts = (orders, products, limit = 5) => {
    // Contamos cuántas veces aparece cada producto en los pedidos
    const productSales = {};

    orders.forEach(order => {
        const pIds = order.productIds || [];
        pIds.forEach(productId => {
            if (!productSales[productId]) {
                productSales[productId] = { count: 0, revenue: 0 };
            }
            productSales[productId].count += 1;
            // Distribuimos los ingresos del pedido entre todos los productos que lo componen
            productSales[productId].revenue += order.total / pIds.length;
        });
    });

    // Convertimos el objeto a una lista con los datos completos del producto
    return Object.entries(productSales)
        .map(([id, data]) => {
            // Buscamos el nombre del producto en el catálogo (comparamos como string por seguridad)
            const product = products.find(p => String(p.id) === String(id));
            return {
                id: parseInt(id),                              // ID numérico
                name: product?.name || 'Producto Desconocido',// Nombre del producto
                sales: data.count,                            // Cuántas veces se vendió
                revenue: data.revenue,                        // Ingresos generados
                sellerId: product?.sellerId                   // Quién lo vende
            };
        })
        .sort((a, b) => b.sales - a.sales) // Ordenamos de más vendido a menos
        .slice(0, limit);                   // Tomamos solo los primeros N
};

/**
 * getSellerMetrics — Calcula todos los KPIs de un vendedor específico
 * Filtra solo sus pedidos y reportes para calcular métricas individuales.
 *
 * @param {string|number} sellerId   - ID del vendedor a analizar
 * @param {Array}         orders     - Lista completa de pedidos del sistema
 * @param {Array}         bugReports - Lista de reportes de problemas (por defecto vacío)
 * @returns {Object} {
 *   totalSales: número total de ventas en pesos,
 *   totalOrders: cantidad de pedidos,
 *   averageTicket: valor promedio por pedido,
 *   bugReportsCount: cantidad de reportes de problemas,
 *   completedOrders: pedidos entregados,
 *   pendingOrders: pedidos no entregados aún
 * }
 */
export const getSellerMetrics = (sellerId, orders, bugReports = []) => {
    // Filtramos solo los pedidos de este vendedor (comparamos como string para evitar errores de tipo)
    const sellerOrders = orders.filter(order => String(order.sellerId) === String(sellerId));
    // Filtramos solo los reportes de este vendedor
    const sellerBugReports = bugReports.filter(report => String(report.sellerId) === String(sellerId));

    return {
        totalSales: calculateTotalSales(sellerOrders),        // Dinero total vendido
        totalOrders: sellerOrders.length,                     // Número de pedidos
        averageTicket: calculateAverageTicket(sellerOrders),  // Valor promedio por pedido
        bugReportsCount: sellerBugReports.length,             // Reportes de problemas
        completedOrders: sellerOrders.filter(o => o.status === 'delivered').length, // Entregados
        pendingOrders: sellerOrders.filter(o => o.status !== 'delivered').length,   // En proceso
    };
};

/**
 * getClientMetrics — Calcula las métricas de un cliente específico
 * Analiza su historial de compras para entender su comportamiento.
 *
 * @param {string|number} clientId - ID del cliente a analizar
 * @param {Array}         orders   - Lista completa de pedidos del sistema
 * @returns {Object} {
 *   totalPurchases: cantidad de compras realizadas,
 *   totalSpent: dinero total gastado,
 *   averageOrderValue: valor promedio por compra,
 *   lastPurchaseDate: fecha de la última compra,
 *   purchaseFrequency: días promedio entre compras,
 *   lifetimeValue: valor total del cliente (igual a totalSpent)
 * }
 */
export const getClientMetrics = (clientId, orders) => {
    // Filtramos solo los pedidos de este cliente
    const clientOrders = orders.filter(order => String(order.clientId) === String(clientId));

    // Ordenamos los pedidos por fecha para calcular la frecuencia de compra
    const sortedOrders = [...clientOrders].sort((a, b) => new Date(a.date) - new Date(b.date));
    let averageDaysBetweenPurchases = 0;

    if (sortedOrders.length > 1) {
        // Calculamos cuántos días hay entre cada compra consecutiva
        const daysDiffs = [];
        for (let i = 1; i < sortedOrders.length; i++) {
            const diff = Math.abs(new Date(sortedOrders[i].date) - new Date(sortedOrders[i - 1].date));
            daysDiffs.push(diff / (1000 * 60 * 60 * 24)); // Convertimos de ms a días
        }
        // Calculamos el promedio de días entre compras
        averageDaysBetweenPurchases = daysDiffs.reduce((a, b) => a + b, 0) / daysDiffs.length;
    }

    return {
        totalPurchases: clientOrders.length,                               // Cantidad de compras
        totalSpent: calculateTotalSales(clientOrders),                     // Dinero total gastado
        averageOrderValue: calculateAverageTicket(clientOrders),           // Promedio por compra
        lastPurchaseDate: sortedOrders.length > 0 ? sortedOrders[sortedOrders.length - 1].date : null,
        purchaseFrequency: averageDaysBetweenPurchases,                   // Días entre compras
        lifetimeValue: calculateTotalSales(clientOrders),                  // Valor total del cliente
    };
};

/**
 * calculateGrowthRate — Calcula el porcentaje de crecimiento entre dos valores
 * Ejemplo: calculateGrowthRate(1200, 1000) → 20 (creció un 20%)
 *
 * @param {number} current  - Valor actual
 * @param {number} previous - Valor anterior a comparar
 * @returns {number} Porcentaje de cambio (positivo = creció, negativo = bajó)
 */
export const calculateGrowthRate = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0; // Si el valor anterior era 0, el crecimiento es 100%
    return ((current - previous) / previous) * 100;
};

/**
 * groupOrdersByDate — Agrupa los pedidos por fecha para gráficas de línea/barra
 * Convierte una lista de pedidos individuales en datos diarios agrupados.
 *
 * @param {Array} orders - Lista de pedidos
 * @returns {Array} Lista de días con su total de pedidos y ventas, ordenada cronológicamente
 */
export const groupOrdersByDate = (orders) => {
    const grouped = {};

    orders.forEach(order => {
        if (!grouped[order.date]) {
            grouped[order.date] = {
                date: order.date,
                orders: 0,  // Cantidad de pedidos ese día
                sales: 0    // Total de ventas ese día en pesos
            };
        }
        grouped[order.date].orders += 1;
        grouped[order.date].sales += order.total;
    });

    // Ordenamos los días de más antiguo a más reciente (para la gráfica izquierda → derecha)
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * getAllSellersMetrics — Calcula las métricas de todos los vendedores a la vez
 * Se usa en el panel de administración para el ranking de vendedores.
 *
 * @param {Array} sellers    - Lista de usuarios con rol 'seller'
 * @param {Array} orders     - Lista completa de pedidos
 * @param {Array} bugReports - Lista de reportes de problemas
 * @returns {Array} Vendedores con sus métricas, ordenados por ventas totales
 */
export const getAllSellersMetrics = (sellers, orders, bugReports = []) => {
    return sellers.map(seller => ({
        ...seller,
        metrics: getSellerMetrics(seller.id, orders, bugReports)
    })).sort((a, b) => b.metrics.totalSales - a.metrics.totalSales);
};

/**
 * getAllClientsMetrics — Calcula las métricas de todos los clientes a la vez
 * Se usa en el panel de administración para el ranking de clientes VIP.
 *
 * @param {Array} clients - Lista de usuarios con rol 'client'
 * @param {Array} orders  - Lista completa de pedidos
 * @returns {Array} Clientes con sus métricas, ordenados por dinero total gastado
 */
export const getAllClientsMetrics = (clients, orders) => {
    return clients.map(client => ({
        ...client,
        metrics: getClientMetrics(client.id, orders)
    })).sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent);
};

/**
 * filterOrdersByDateRange — Filtra pedidos dentro de un rango de fechas
 * @param {Array}  orders    - Lista de pedidos
 * @param {string} startDate - Fecha de inicio (formato 'YYYY-MM-DD')
 * @param {string} endDate   - Fecha de fin (formato 'YYYY-MM-DD')
 * @returns {Array} Solo los pedidos que ocurrieron dentro del rango indicado
 */
export const filterOrdersByDateRange = (orders, startDate, endDate) => {
    return orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
};

/**
 * calculateQualityMetrics — Calcula estadísticas sobre los reportes de problemas
 * Muestra cuántos reportes hay, cuáles están abiertos y cuál es la tasa de resolución.
 *
 * @param {Array} bugReports - Lista de reportes de errores o devoluciones
 * @returns {Object} { total, open, inReview, resolved, resolutionRate }
 */
export const calculateQualityMetrics = (bugReports) => {
    const total = bugReports.length;
    const open = bugReports.filter(r => r.status === 'open').length;         // Sin atender
    const inReview = bugReports.filter(r => r.status === 'in_review').length;// En revisión
    const resolved = bugReports.filter(r => r.status === 'resolved').length; // Resueltos

    return {
        total,
        open,
        inReview,
        resolved,
        // Porcentaje de reportes que se han resuelto (qué tan eficiente es el equipo)
        resolutionRate: total > 0 ? (resolved / total) * 100 : 0
    };
};

/**
 * segmentClients — Clasifica a los clientes en tres categorías según su gasto total
 * Esta segmentación ayuda a identificar los clientes más valiosos.
 *
 * Segmentos:
 *  - VIP:     gastaron más de $1.000.000
 *  - Regular: gastaron entre $300.000 y $1.000.000
 *  - Nuevo:   gastaron menos de $300.000
 *
 * @param {Array} clients - Lista de clientes
 * @param {Array} orders  - Lista de pedidos
 * @returns {Object} { vip, regular, new } — Tres listas de clientes segmentadas
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
 * getProductsWithoutSales — Devuelve los productos que nunca han sido vendidos
 * Compara el catálogo con los pedidos para encontrar productos sin ventas.
 *
 * @param {Array} products - Catálogo de productos
 * @param {Array} orders   - Lista de pedidos
 * @returns {Array} Productos que no aparecen en ningún pedido
 */
export const getProductsWithoutSales = (products, orders) => {
    // Recopilamos todos los IDs de productos que sí se han vendido (en cualquier formato)
    const soldProductIds = new Set();
    orders.forEach(order => {
        (order.productIds || []).forEach(id => soldProductIds.add(id));
    });

    // Devolvemos los que no están en ese conjunto (nunca vendidos)
    return products.filter(product =>
        !soldProductIds.has(product.id) &&
        !soldProductIds.has(String(product.id)) &&
        !soldProductIds.has(Number(product.id))
    );
};

/**
 * calculateStockMetrics — Resume el estado del inventario de productos
 * @param {Array}  products          - Lista de productos del catálogo
 * @param {number} lowStockThreshold - Umbral para considerar stock bajo (por defecto 20 metros)
 * @returns {Object} { totalProducts, lowStock, outOfStock, inStock }
 */
export const calculateStockMetrics = (products, lowStockThreshold = 20) => {
    return {
        totalProducts: products.length,                                     // Total de productos
        lowStock: products.filter(p => p.stock < lowStockThreshold).length, // Stock bajo
        outOfStock: products.filter(p => p.stock === 0).length,             // Agotados
        inStock: products.filter(p => p.stock >= lowStockThreshold).length, // Con stock suficiente
    };
};

/**
 * formatLineChartData — Convierte datos al formato que necesitan los gráficos de línea
 * Los gráficos de Recharts necesitan objetos con las propiedades 'name' y 'value'.
 *
 * @param {Array}  data - Lista de datos a convertir
 * @param {string} xKey - Nombre de la propiedad que será el eje X (etiqueta)
 * @param {string} yKey - Nombre de la propiedad que será el eje Y (valor)
 * @returns {Array} Lista de objetos { name, value } para Recharts
 */
export const formatLineChartData = (data, xKey, yKey) => {
    return data.map(item => ({
        name: item[xKey],   // Etiqueta del punto en el eje horizontal
        value: item[yKey]   // Valor del punto en el eje vertical
    }));
};

/**
 * formatBarChartData — Convierte datos al formato que necesitan los gráficos de barra
 * Similar a formatLineChartData pero con nombres más descriptivos para gráficas de barra.
 *
 * @param {Array}  data     - Lista de datos a convertir
 * @param {string} labelKey - Nombre de la propiedad que será la etiqueta de cada barra
 * @param {string} valueKey - Nombre de la propiedad que define la altura de cada barra
 * @returns {Array} Lista de objetos { name, value } para Recharts
 */
export const formatBarChartData = (data, labelKey, valueKey) => {
    return data.map(item => ({
        name: item[labelKey],   // Texto debajo de cada barra
        value: item[valueKey]   // Altura de la barra
    }));
};
