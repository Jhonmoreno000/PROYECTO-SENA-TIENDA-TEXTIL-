/**
 * interceptorSesion.js — Adjunta automáticamente el token de sesión a las peticiones de la API.
 * ============================================================================================
 * El backend protege sus endpoints con control de acceso por roles (RBAC) y exige la cabecera
 * `Authorization: Bearer <token>`. Este interceptor envuelve `window.fetch` una sola vez y agrega
 * el token guardado en `localStorage('authUser')` a toda petición dirigida a `/api/*`, sin
 * sobrescribir una cabecera Authorization que el componente ya haya definido explícitamente.
 */

const CLAVE_SESION = 'authUser';

/**
 * Obtiene el token de sesión vigente almacenado en localStorage.
 * @returns {string|null} Token firmado por el backend o null si no hay sesión.
 */
export function obtenerTokenSesion() {
    try {
        const guardado = window.localStorage.getItem(CLAVE_SESION);
        if (!guardado) return null;
        const usuario = JSON.parse(guardado);
        return typeof usuario?.token === 'string' && usuario.token.length > 0 ? usuario.token : null;
    } catch {
        return null;
    }
}

/**
 * Determina si la URL solicitada corresponde a la API propia del backend (mismo origen o puerto 8081).
 * @param {string} url - URL absoluta o relativa de la petición.
 * @returns {boolean} true si es una ruta /api del backend D&D Textil.
 */
export function esRutaApiPropia(url) {
    if (typeof url !== 'string' || url.length === 0) return false;
    try {
        const destino = new URL(url, window.location.origin);
        const mismoOrigen = destino.origin === window.location.origin;
        const backendLocal = /^(localhost|127\.0\.0\.1)$/.test(destino.hostname) && destino.port === '8081';
        return (mismoOrigen || backendLocal) && destino.pathname.startsWith('/api/');
    } catch {
        return false;
    }
}

/**
 * Instala el interceptor sobre window.fetch (idempotente).
 */
export function instalarInterceptorSesion() {
    if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;
    if (window.fetch.__ddtextilSesion) return;

    const fetchOriginal = window.fetch.bind(window);

    const fetchConSesion = (recurso, opciones = {}) => {
        const url = typeof recurso === 'string' ? recurso : recurso?.url;
        const token = esRutaApiPropia(url) ? obtenerTokenSesion() : null;
        if (!token) return fetchOriginal(recurso, opciones);

        const cabeceras = new Headers(opciones.headers || (typeof recurso !== 'string' ? recurso.headers : undefined));
        if (!cabeceras.has('Authorization')) {
            cabeceras.set('Authorization', `Bearer ${token}`);
        }
        return fetchOriginal(recurso, { ...opciones, headers: cabeceras });
    };

    fetchConSesion.__ddtextilSesion = true;
    window.fetch = fetchConSesion;
}

