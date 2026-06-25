/**
 * formatters.js — Funciones de Formato de Datos
 * ===============================================
 * Este archivo contiene funciones utilitarias para convertir datos
 * en formatos más legibles para el usuario colombiano.
 *
 * Se usa en toda la aplicación para mostrar precios, fechas e IDs
 * de manera consistente y con el formato correcto para Colombia.
 */

/**
 * formatCurrency — Convierte un número a formato de pesos colombianos
 * Ejemplo: formatCurrency(25000) → "$\u00a025.000"
 *
 * @param {number} amount - El número a convertir (precio en pesos)
 * @returns {string} El precio formateado con símbolo $ y puntos separadores de miles
 */
export function formatCurrency(amount) {
    // Si el valor es vacío o no es un número, devolvemos "$0" para evitar errores
    if (amount == null || isNaN(amount)) return '$ 0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',        // Formato de moneda
        currency: 'COP',          // Pesos colombianos
        minimumFractionDigits: 0, // Sin decimales (los precios son enteros)
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * formatDate — Convierte una fecha al formato largo en español
 * Ejemplo: formatDate('2026-05-09') → "9 de mayo de 2026"
 *
 * @param {Date|string} date - Fecha a formatear (puede ser objeto Date o texto ISO)
 * @returns {string} Fecha en formato legible en español colombiano
 */
export function formatDate(date) {
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',  // Año completo: 2026
        month: 'long',    // Mes en texto: "mayo"
        day: 'numeric',   // Día: 9
    }).format(new Date(date));
}

/**
 * generateId — Genera un identificador único basado en el tiempo
 * Se usa cuando necesitamos un ID temporal antes de guardar en la base de datos.
 * Ejemplo: "1715282400000-abc123xyz"
 *
 * @returns {string} ID único que combina timestamp + texto aleatorio
 */
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * truncateText — Recorta un texto largo y agrega "..." al final
 * Útil para mostrar descripciones largas en tarjetas pequeñas.
 * Ejemplo: truncateText('Tela de algodón 100% natural...', 20) → "Tela de algodón 100%..."
 *
 * @param {string} text      - Texto original a recortar
 * @param {number} maxLength - Longitud máxima permitida (por defecto 100 caracteres)
 * @returns {string} Texto recortado con "..." si era muy largo
 */
export function truncateText(text, maxLength = 100) {
    if (!text) return '';                          // Si no hay texto, devolvemos vacío
    if (text.length <= maxLength) return text;     // Si ya cabe, lo devolvemos sin cambios
    return text.substring(0, maxLength) + '...';  // Recortamos y añadimos puntos suspensivos
}
