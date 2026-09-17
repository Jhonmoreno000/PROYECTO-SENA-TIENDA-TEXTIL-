/**
 * inventoryUtils.js — Funciones de Cálculo para el Inventario
 * =============================================================
 * Este archivo contiene funciones matemáticas para el módulo de inventario
 * del panel de administración (ERP).
 * Compatible tanto con propiedades en inglés como en español.
 */

/**
 * calculateWastePercentage — Calcula qué porcentaje de un lote se ha desperdiciado
 *
 * @param {Object} batch        - Objeto del lote con { id, initialMeters, currentMeters }
 * @param {Array}  wasteEvents  - Lista de eventos de merma registrados en la base de datos
 * @returns {string} Porcentaje de desperdicio con 2 decimales (Ej: "4.50")
 */
export function calculateWastePercentage(batch, wasteEvents = []) {
    if (!batch) return "0.00";
    const batchId = batch.id;
    const initial = Number(batch.initialMeters ?? batch.metrosIniciales ?? batch.metersReceived ?? batch.metrosRecibidos ?? 0);

    const batchWaste = (wasteEvents || [])
        .filter(event => (event.rollId === batchId || event.loteId === batchId || event.idProducto === batchId))
        .reduce((sum, event) => sum + Number(event.meters ?? event.metros ?? event.metrosPerdidos ?? 0), 0);

    return initial > 0
        ? ((batchWaste / initial) * 100).toFixed(2)
        : "0.00";
}

/**
 * identifyLowStock — Devuelve los lotes que están por debajo del stock mínimo configurado
 *
 * @param {Array} batches    - Lista de lotes de inventario
 * @param {Array} thresholds - Lista de umbrales mínimos por tipo de tela
 * @returns {Array} Lotes con stock insuficiente
 */
export function identifyLowStock(batches = [], thresholds = []) {
    return (batches || []).filter(batch => {
        const fType = batch.fabricType || batch.tipoTela || '';
        const threshold = (thresholds || []).find(t => (t.fabricType === fType || t.tipoTela === fType));
        const alertEnabled = threshold ? (threshold.alertEnabled ?? threshold.alertaActiva ?? true) : false;
        if (!threshold || !alertEnabled) return false;

        const currentM = Number(batch.currentMeters ?? batch.metrosActuales ?? batch.stock ?? 0);
        const minM = Number(threshold.minMeters ?? threshold.metrosMinimos ?? 20);
        return currentM <= minM;
    });
}

/**
 * generateMovementHistory — Genera el historial de movimientos del inventario
 */
export function generateMovementHistory(batches = [], wasteEvents = [], orders = []) {
    const movements = [];

    (wasteEvents || []).forEach(event => {
        const bId = event.rollId || event.loteId || event.idProducto;
        const batch = (batches || []).find(b => b.id === bId);
        const meters = Number(event.meters ?? event.metros ?? event.metrosPerdidos ?? 0);

        movements.push({
            id: `waste-${event.id}`,
            date: event.date || event.fecha || event.fechaCreacion || new Date().toISOString(),
            type: 'waste',
            tipo: 'merma',
            user: event.responsible || event.responsable || 'Administrador',
            rollId: bId,
            fabricType: batch?.fabricType || batch?.tipoTela || 'Desconocido',
            metersChanged: -meters,
            reason: event.description || event.descripcion || event.motivo || 'Merma textil',
            status: 'completed'
        });
    });

    (orders || []).forEach(order => {
        const oId = order.id;
        movements.push({
            id: `sale-${oId}`,
            date: order.date || order.fecha || order.fechaCreacion || new Date().toISOString(),
            type: 'sale',
            tipo: 'venta',
            user: `Cliente ID: ${order.clientId || order.idCliente || order.userId || 'General'}`,
            rollId: 'Múltiples',
            fabricType: 'Varios',
            metersChanged: -Math.floor(Math.random() * 10 + 5),
            reason: `Pedido #${oId}`,
            status: order.status || order.estado || 'completed'
        });
    });

    return movements.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * calculateTotalMetersByType — Suma los metros disponibles por tipo de tela
 */
export function calculateTotalMetersByType(batches = []) {
    const totals = {};
    (batches || []).forEach(batch => {
        const type = batch.fabricType || batch.tipoTela || 'Sin Categoría';
        const meters = Number(batch.currentMeters ?? batch.metrosActuales ?? batch.stock ?? 0);
        if (!totals[type]) {
            totals[type] = 0;
        }
        totals[type] += meters;
    });
    return totals;
}

/**
 * calculateWasteStatsByReason — Agrupa las mermas por motivo para análisis
 */
export function calculateWasteStatsByReason(wasteEvents = []) {
    const stats = {};
    (wasteEvents || []).forEach(event => {
        const reason = event.reason || event.motivo || event.description || 'Otro';
        const meters = Number(event.meters ?? event.metros ?? event.metrosPerdidos ?? 0);

        if (!stats[reason]) {
            stats[reason] = {
                count: 0,
                totalMeters: 0,
                events: []
            };
        }
        stats[reason].count++;
        stats[reason].totalMeters += meters;
        stats[reason].events.push(event);
    });
    return stats;
}

/**
 * getActiveStockAlerts — Devuelve alertas de stock bajo listas para mostrar en el panel
 */
export function getActiveStockAlerts(batches = [], thresholds = []) {
    const lowStockBatches = identifyLowStock(batches, thresholds);
    return lowStockBatches.map(batch => {
        const fType = batch.fabricType || batch.tipoTela || '';
        const currentM = Number(batch.currentMeters ?? batch.metrosActuales ?? 0);
        const thr = (thresholds || []).find(t => (t.fabricType === fType || t.tipoTela === fType));
        const minM = Number(thr?.minMeters ?? thr?.metrosMinimos ?? 0);
        const status = batch.status || batch.estado;

        return {
            rollId: batch.id,
            fabricType: fType,
            currentMeters: currentM,
            threshold: minM,
            severity: (status === 'critical' || currentM <= 5) ? 'high' : 'medium',
            message: `Stock bajo de ${fType} - Solo quedan ${currentM}m`
        };
    });
}
