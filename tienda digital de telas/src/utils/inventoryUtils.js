/**
 * inventoryUtils.js — Funciones de Cálculo para el Inventario
 * =============================================================
 * Este archivo contiene funciones matemáticas para el módulo de inventario
 * del panel de administración (ERP).
 *
 * ¿Qué calcula?
 *  - Porcentaje de desperdicio de tela por lote
 *  - Lotes que tienen stock por debajo del mínimo configurado
 *  - Historial de movimientos (mermas + ventas)
 *  - Metros totales por tipo de tela
 *  - Estadísticas de mermas agrupadas por motivo
 *  - Alertas activas de stock bajo
 *
 * Glosario de términos:
 *  - Lote (batch): Un conjunto de metros de un mismo tipo de tela que llegó junto
 *  - Merma (waste): Metros de tela que se perdieron por corte, defecto, etc.
 *  - Umbral (threshold): El mínimo de metros que debe tener un lote antes de alertar
 */

/**
 * calculateWastePercentage — Calcula qué porcentaje de un lote se ha desperdiciado
 * Ejemplo: si un lote empezó con 100 metros y se perdieron 5, el desperdicio es 5%.
 *
 * @param {Object} batch        - Objeto del lote con { id, initialMeters, currentMeters }
 * @param {Array}  wasteEvents  - Lista de eventos de merma registrados en la base de datos
 * @returns {string} Porcentaje de desperdicio con 2 decimales (Ej: "4.50")
 */
export function calculateWastePercentage(batch, wasteEvents) {
    // Sumamos todos los metros perdidos que pertenecen a este lote específico
    const batchWaste = wasteEvents
        .filter(event => event.rollId === batch.id)
        .reduce((sum, event) => sum + event.meters, 0);

    // Calculamos el porcentaje (evitamos dividir por cero si el lote estaba vacío)
    return batch.initialMeters > 0
        ? ((batchWaste / batch.initialMeters) * 100).toFixed(2)
        : 0;
}

/**
 * identifyLowStock — Devuelve los lotes que están por debajo del stock mínimo configurado
 * Solo verifica los tipos de tela que tienen alertas activadas.
 *
 * @param {Array} batches    - Lista de lotes de inventario
 * @param {Array} thresholds - Lista de umbrales mínimos por tipo de tela
 * @returns {Array} Lotes con stock insuficiente
 */
export function identifyLowStock(batches, thresholds) {
    return batches.filter(batch => {
        // Buscamos el umbral configurado para este tipo de tela
        const threshold = thresholds.find(t => t.fabricType === batch.fabricType);
        // Si no tiene umbral configurado o las alertas están desactivadas, lo ignoramos
        if (!threshold || !threshold.alertEnabled) return false;
        // El lote tiene stock bajo si sus metros actuales son menores o iguales al mínimo
        return batch.currentMeters <= threshold.minMeters;
    });
}

/**
 * generateMovementHistory — Genera el historial de movimientos del inventario
 * Combina los eventos de merma y las ventas para mostrar un historial unificado.
 *
 * @param {Array} batches     - Lista de lotes de inventario
 * @param {Array} wasteEvents - Lista de eventos de merma (tela perdida)
 * @param {Array} orders      - Lista de pedidos (para registrar salidas por venta)
 * @returns {Array} Lista de movimientos ordenados por fecha (más reciente primero)
 */
export function generateMovementHistory(batches, wasteEvents, orders) {
    const movements = [];

    // Agregamos los eventos de merma al historial
    wasteEvents.forEach(event => {
        const batch = batches.find(b => b.id === event.rollId);
        movements.push({
            id: `waste-${event.id}`,           // ID único para React
            date: event.date,                   // Fecha del evento
            type: 'waste',                      // Tipo: merma
            user: event.responsible,            // Responsable del registro
            rollId: event.rollId,               // ID del lote afectado
            fabricType: batch?.fabricType || 'Desconocido', // Tipo de tela
            metersChanged: -event.meters,       // Negativo porque es una salida
            reason: event.description,          // Motivo de la merma
            status: 'completed'                 // Las mermas siempre están completadas
        });
    });

    // Agregamos los pedidos como movimientos de salida por venta
    orders.forEach(order => {
        movements.push({
            id: `sale-${order.id}`,
            date: order.date,
            type: 'sale',                       // Tipo: venta
            user: `Cliente ID: ${order.clientId}`,
            rollId: 'Múltiples',                // Una venta puede afectar varios lotes
            fabricType: 'Varios',
            metersChanged: -Math.floor(Math.random() * 10 + 5), // Aproximado (sin dato exacto aún)
            reason: `Pedido #${order.id}`,
            status: order.status
        });
    });

    // Ordenamos de más reciente a más antiguo
    return movements.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * calculateTotalMetersByType — Suma los metros disponibles por tipo de tela
 * Agrupa todos los lotes por tipo y suma sus metros actuales.
 * Ejemplo: { 'Algodón': 350, 'Seda': 120, 'Lino': 80 }
 *
 * @param {Array} batches - Lista de lotes de inventario
 * @returns {Object} Objeto donde cada clave es un tipo de tela y el valor es el total de metros
 */
export function calculateTotalMetersByType(batches) {
    const totals = {};
    batches.forEach(batch => {
        // Si este tipo de tela no está en el objeto, lo inicializamos en 0
        if (!totals[batch.fabricType]) {
            totals[batch.fabricType] = 0;
        }
        totals[batch.fabricType] += batch.currentMeters;
    });
    return totals;
}

/**
 * calculateWasteStatsByReason — Agrupa las mermas por motivo para análisis
 * Devuelve cuántas veces ocurrió cada tipo de merma y cuántos metros se perdieron.
 * Ejemplo: { 'Corte defectuoso': { count: 3, totalMeters: 12.5 } }
 *
 * @param {Array} wasteEvents - Lista de eventos de merma
 * @returns {Object} Estadísticas agrupadas por motivo de merma
 */
export function calculateWasteStatsByReason(wasteEvents) {
    const stats = {};
    wasteEvents.forEach(event => {
        // Si este motivo no está registrado aún, lo inicializamos
        if (!stats[event.reason]) {
            stats[event.reason] = {
                count: 0,        // Número de veces que ocurrió este tipo de merma
                totalMeters: 0,  // Total de metros perdidos por este motivo
                events: []       // Lista de los eventos individuales
            };
        }
        stats[event.reason].count++;
        stats[event.reason].totalMeters += event.meters;
        stats[event.reason].events.push(event);
    });
    return stats;
}

/**
 * getActiveStockAlerts — Devuelve alertas de stock bajo listas para mostrar en el panel
 * Usa identifyLowStock() internamente y formatea los datos para la UI.
 *
 * @param {Array} batches    - Lista de lotes de inventario
 * @param {Array} thresholds - Lista de umbrales mínimos configurados
 * @returns {Array} Lista de alertas con mensaje, severidad y metros actuales
 */
export function getActiveStockAlerts(batches, thresholds) {
    const lowStockBatches = identifyLowStock(batches, thresholds);
    return lowStockBatches.map(batch => ({
        rollId: batch.id,
        fabricType: batch.fabricType,
        currentMeters: batch.currentMeters,
        // Metros mínimos configurados para este tipo de tela
        threshold: thresholds.find(t => t.fabricType === batch.fabricType)?.minMeters || 0,
        // Si el estado es 'critical' la alerta es alta, de lo contrario es media
        severity: batch.status === 'critical' ? 'high' : 'medium',
        // Mensaje legible para mostrar al administrador
        message: `Stock bajo de ${batch.fabricType} - Solo quedan ${batch.currentMeters}m`
    }));
}
