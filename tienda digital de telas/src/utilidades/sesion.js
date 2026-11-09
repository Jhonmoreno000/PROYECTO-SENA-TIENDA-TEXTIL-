/**
 * Lee la expiración del token de sesión sin validar su autenticidad.
 * @param {string} token - Token con carga JSON y firma en base64url
 * @returns {number|null} Expiración en milisegundos desde epoch, o null si es inválido
 */
export function expiracionDeToken(token) {
    try {
        if (typeof token !== 'string') return null;
        const partes = token.split('.');
        if (partes.length !== 2 || partes.some(parte => !parte)) return null;
        const cargaBase64 = partes[0].replace(/-/g, '+').replace(/_/g, '/');
        const cargaBinaria = atob(cargaBase64.padEnd(Math.ceil(cargaBase64.length / 4) * 4, '='));
        const bytes = Uint8Array.from(cargaBinaria, caracter => caracter.charCodeAt(0));
        const carga = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
        // La firma la verifica el servidor; el cliente solo lee exp.
        return typeof carga?.exp === 'number' && Number.isFinite(carga.exp) ? carga.exp * 1000 : null;
    } catch {
        return null;
    }
}

/**
 * Comprueba si un token aún no ha expirado.
 * @param {string} token - Token de sesión
 * @param {number} ahora - Instante de comparación en milisegundos desde epoch
 * @returns {boolean} true si la expiración es válida y posterior al instante indicado
 */
export function tokenVigente(token, ahora = Date.now()) {
    const expiracion = expiracionDeToken(token);
    return expiracion !== null && expiracion > ahora;
}

/**
 * Comprueba si el usuario tiene una sesión local o un token vigente.
 * @param {object|null} usuario - Usuario guardado en la sesión
 * @param {number} ahora - Instante de comparación en milisegundos desde epoch
 * @returns {boolean} true si la sesión sigue vigente
 */
export function sesionVigente(usuario, ahora = Date.now()) {
    return Boolean(usuario) && (usuario.sesionLocal === true || tokenVigente(usuario.token, ahora));
}
