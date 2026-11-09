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

    (batches || []).forEach(batch => {
        const initialM = Number(batch.initialMeters ?? batch.metrosIniciales ?? 0);
        if (initialM > 0 && (batch.entryDate || batch.fechaIngreso)) {
            movements.push({
                id: `entry-${batch.id}`,
                date: batch.entryDate || batch.fechaIngreso,
                type: 'entry',
                tipo: 'ingreso',
                user: batch.supplier || batch.proveedor || 'Proveedor',
                rollId: batch.batchCode || batch.codigoLote || String(batch.id),
                fabricType: batch.fabricType || batch.tipoTela || 'Tela',
                metersChanged: initialM,
                reason: `Ingreso de lote ${batch.batchCode || batch.id}`,
                status: 'completed'
            });
        }
    });

    (wasteEvents || []).forEach(event => {
        const bId = event.batchId || event.rollId || event.loteId || event.idProducto;
        const batch = (batches || []).find(b => String(b.id) === String(bId) || String(b.batchCode) === String(bId));
        const meters = Number(event.meters ?? event.metros ?? event.metrosPerdidos ?? 0);

        movements.push({
            id: `waste-${event.id}`,
            date: event.eventDate || event.date || event.fecha || event.fechaCreacion || new Date().toISOString(),
            type: 'waste',
            tipo: 'merma',
            user: event.responsible || event.responsable || 'Administrador',
            rollId: batch?.batchCode || bId || 'Sin lote',
            fabricType: event.fabricType || batch?.fabricType || batch?.tipoTela || 'Desconocido',
            metersChanged: -meters,
            reason: event.notes || event.description || event.descripcion || event.reason || event.motivo || 'Merma textil',
            status: 'completed'
        });
    });

    (orders || []).forEach(order => {
        const oId = order.id;
        const lineItems = Array.isArray(order.lineItems) ? order.lineItems : [];
        const totalOrderMeters = Number(
            order.totalMeters ||
            lineItems.reduce((sum, li) => sum + Number(li.quantity ?? li.meters ?? 0), 0)
        );
        const fabricNames = Array.isArray(order.productNames) && order.productNames.length > 0
            ? order.productNames.join(', ')
            : (lineItems.map(li => li.name).filter(Boolean).join(', ') || 'Varios');

        movements.push({
            id: `sale-${oId}`,
            date: order.date || order.fecha || order.fechaCreacion || new Date().toISOString(),
            type: 'sale',
            tipo: 'venta',
            user: order.client || order.clientName || `Cliente ID: ${order.clientId || order.idCliente || order.userId || 'General'}`,
            rollId: `PED-${oId}`,
            fabricType: fabricNames,
            metersChanged: -totalOrderMeters,
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
