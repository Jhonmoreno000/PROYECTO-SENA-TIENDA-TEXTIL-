// Utilidades para cálculos de inventario

/**
 * Calcula el porcentaje de desperdicio de un lote
 */
export function calculateWastePercentage(batch, wasteEvents) {
    const batchWaste = wasteEvents
        .filter(event => event.rollId === batch.id)
        .reduce((sum, event) => sum + event.meters, 0);

    return batch.initialMeters > 0
        ? ((batchWaste / batch.initialMeters) * 100).toFixed(2)
        : 0;
}

/**
 * Identifica lotes con stock bajo según los umbrales configurados
 */
export function identifyLowStock(batches, thresholds) {
    return batches.filter(batch => {
        const threshold = thresholds.find(t => t.fabricType === batch.fabricType);
        if (!threshold || !threshold.alertEnabled) return false;
        return batch.currentMeters <= threshold.minMeters;
    });
}

/**
 * Genera historial de movimientos de inventario
 */
export function generateMovementHistory(batches, wasteEvents, orders) {
    const movements = [];

    // Agregar eventos de desperdicio
    wasteEvents.forEach(event => {
        const batch = batches.find(b => b.id === event.rollId);
        movements.push({
            id: `waste-${event.id}`,
            date: event.date,
            type: 'waste',
            user: event.responsible,
            rollId: event.rollId,
            fabricType: batch?.fabricType || 'Desconocido',
            metersChanged: -event.meters,
            reason: event.description,
            status: 'completed'
        });
    });

    // Agregar eventos de ventas (simulados basados en ordenes)
    orders.forEach(order => {
        movements.push({
            id: `sale-${order.id}`,
            date: order.date,
            type: 'sale',
            user: `Cliente ID: ${order.clientId}`,
            rollId: 'Múltiples',
            fabricType: 'Varios',
            metersChanged: -Math.floor(Math.random() * 10 + 5), // Simulado
            reason: `Pedido #${order.id}`,
            status: order.status
        });
    });

    // Ordenar por fecha descendente
    return movements.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Calcula el total de metros en inventario por tipo de tela
 */
export function calculateTotalMetersByType(batches) {
    const totals = {};
    batches.forEach(batch => {
        if (!totals[batch.fabricType]) {
            totals[batch.fabricType] = 0;
        }
        totals[batch.fabricType] += batch.currentMeters;
    });
    return totals;
}

/**
 * Calcula estadísticas de desperdicio por tipo de razón
 */
export function calculateWasteStatsByReason(wasteEvents) {
    const stats = {};
    wasteEvents.forEach(event => {
        if (!stats[event.reason]) {
            stats[event.reason] = {
                count: 0,
                totalMeters: 0,
                events: []
            };
        }
        stats[event.reason].count++;
        stats[event.reason].totalMeters += event.meters;
        stats[event.reason].events.push(event);
    });
    return stats;
}

/**
 * Obtiene alertas activas de stock bajo
 */
export function getActiveStockAlerts(batches, thresholds) {
    const lowStockBatches = identifyLowStock(batches, thresholds);
    return lowStockBatches.map(batch => ({
        rollId: batch.id,
        fabricType: batch.fabricType,
        currentMeters: batch.currentMeters,
        threshold: thresholds.find(t => t.fabricType === batch.fabricType)?.minMeters || 0,
        severity: batch.status === 'critical' ? 'high' : 'medium',
        message: `Stock bajo de ${batch.fabricType} - Solo quedan ${batch.currentMeters}m`
    }));
}
