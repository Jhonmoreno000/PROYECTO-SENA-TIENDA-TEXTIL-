import { FiGrid, FiUsers, FiDollarSign, FiShoppingBag, FiLayers, FiLayout, FiFileText, FiAlertCircle, FiTrendingUp, FiPackage } from 'react-icons/fi';

/**
 * Hierarchical navigation links for the Admin Dashboard sidebar.
 * Parent nodes have a `children` array; leaf nodes have a `path`.
 */
const adminDashboardLinks = [
    { label: 'Resumen', path: '/admin', icon: FiGrid },
    {
        label: 'Usuarios', icon: FiUsers,
        children: [
            { label: 'Gestión de Usuarios', path: '/admin/usuarios', icon: FiUsers },
            { label: 'Vendedores', path: '/admin/vendedores', icon: FiTrendingUp },
            { label: 'Clientes', path: '/admin/clientes', icon: FiUsers },
        ],
    },
    {
        label: 'Catálogo', icon: FiShoppingBag,
        children: [
            { label: 'Productos', path: '/admin/productos', icon: FiShoppingBag },
            { label: 'Carrusel', path: '/admin/carrusel', icon: FiLayers },
            { label: 'Página Inicio', path: '/admin/home', icon: FiLayout },
        ],
    },
    {
        label: 'Inventario', icon: FiPackage,
        children: [
            { label: 'Control de Lotes', path: '/admin/inventario/lotes', icon: FiPackage },
            { label: 'Calculadora de Merma', path: '/admin/inventario/merma', icon: FiAlertCircle },
            { label: 'Alertas de Stock', path: '/admin/inventario/alertas', icon: FiAlertCircle },
            { label: 'Historial de Movimientos', path: '/admin/inventario/historial', icon: FiFileText },
        ],
    },
    {
        label: 'Moderación', icon: FiTrendingUp,
        children: [
            { label: 'Cola de Aprobación', path: '/admin/moderacion/aprobacion', icon: FiShoppingBag, badge: 3 },
            { label: 'Rendimiento', path: '/admin/moderacion/vendedores', icon: FiTrendingUp },
        ],
    },
    {
        label: 'Analytics', icon: FiTrendingUp,
        children: [
            { label: 'Mapa de Ventas', path: '/admin/analytics/mapa-ventas', icon: FiGrid },
            { label: 'Rotación de Inventario', path: '/admin/analytics/rotacion', icon: FiPackage },
            { label: 'Análisis de Devoluciones', path: '/admin/analytics/devoluciones', icon: FiAlertCircle },
            { label: 'Proyección de Ingresos', path: '/admin/analytics/proyeccion', icon: FiDollarSign },
        ],
    },
    {
        label: 'Soporte', icon: FiFileText,
        children: [
            { label: 'Gestión de Tickets', path: '/admin/soporte/tickets', icon: FiFileText, badge: 12 },
            { label: 'Crear Cupones', path: '/admin/soporte/cupones', icon: FiDollarSign },
        ],
    },
    { label: 'Reportes', path: '/admin/reportes', icon: FiFileText },
    { label: 'Configuración', path: '/admin/configuracion', icon: FiGrid },
];

export default adminDashboardLinks;
