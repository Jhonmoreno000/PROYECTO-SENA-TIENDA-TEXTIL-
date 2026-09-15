const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.PROD ? '' : 'http://localhost:8082');

export const getApiUrl = (path) => `${API_BASE_URL}${path}`;

/**
 * Endpoints oficiales de la API REST (compatibles con backend Java multihilo).
 */
export const RUTAS_API = {
    // Autenticación
    login: '/api/iniciar-sesion',
    registro: '/api/registro',
    // Catálogo
    productos: '/api/productos',
    resenas: '/api/resenas',
    carrusel: '/api/carrusel',
    seccionesInicio: '/api/secciones-inicio',
    // Operaciones
    pedidos: '/api/pedidos',
    carrito: '/api/carrito',
    facturas: '/api/facturas',
    cupones: '/api/cupones',
    // Administración y Métricas ERP
    usuarios: '/api/usuarios',
    configuracion: '/api/configuracion',
    soporte: '/api/soporte',
    inventario: '/api/inventario',
    metricas: '/api/metricas',
    actividad: '/api/actividad',
    banner: '/api/banner'
};

export default API_BASE_URL;
