import { MdGridView, MdGroup, MdAttachMoney, MdShoppingBag, MdLayers, MdDashboard, MdDescription, MdWarningAmber, MdTrendingUp, MdInventory2 } from 'react-icons/md';

/**
 * Hierarchical navigation links for the Admin Dashboard sidebar.
 * Parent nodes have a `children` array; leaf nodes have a `path`.
 */
const adminDashboardLinks = [
    { label: 'Resumen', path: '/admin', icon: MdGridView },
    {
        label: 'Usuarios', icon: MdGroup,
        children: [
            { label: 'Gestión de Usuarios', path: '/admin/usuarios', icon: MdGroup },
            { label: 'Vendedores', path: '/admin/vendedores', icon: MdTrendingUp },
            { label: 'Clientes', path: '/admin/clientes', icon: MdGroup },
        ],
    },
    {
        label: 'Catálogo', icon: MdShoppingBag,
        children: [
            { label: 'Productos', path: '/admin/productos', icon: MdShoppingBag },
            { label: 'Carrusel', path: '/admin/carrusel', icon: MdLayers },
            { label: 'Página Inicio', path: '/admin/home', icon: MdDashboard },
        ],
    },
    {
        label: 'Inventario', icon: MdInventory2,
        children: [
            { label: 'Control de Lotes', path: '/admin/inventario/lotes', icon: MdInventory2 },
            { label: 'Calculadora de Merma', path: '/admin/inventario/merma', icon: MdWarningAmber },
            { label: 'Alertas de Stock', path: '/admin/inventario/alertas', icon: MdWarningAmber },
            { label: 'Historial de Movimientos', path: '/admin/inventario/historial', icon: MdDescription },
        ],
    },
    {
        label: 'Moderación', icon: MdTrendingUp,
        children: [
            { label: 'Cola de Aprobación', path: '/admin/moderacion/aprobacion', icon: MdShoppingBag, badge: 3 },
            { label: 'Rendimiento', path: '/admin/moderacion/vendedores', icon: MdTrendingUp },
        ],
    },
    {
        label: 'Analytics', icon: MdTrendingUp,
        children: [
            { label: 'Mapa de Ventas', path: '/admin/analytics/mapa-ventas', icon: MdGridView },
            { label: 'Rotación de Inventario', path: '/admin/analytics/rotacion', icon: MdInventory2 },
            { label: 'Análisis de Devoluciones', path: '/admin/analytics/devoluciones', icon: MdWarningAmber },
            { label: 'Proyección de Ingresos', path: '/admin/analytics/proyeccion', icon: MdAttachMoney },
        ],
    },
    {
        label: 'Soporte', icon: MdDescription,
        children: [
            { label: 'Gestión de Tickets', path: '/admin/soporte/tickets', icon: MdDescription, badge: 12 },
            { label: 'Crear Cupones', path: '/admin/soporte/cupones', icon: MdAttachMoney },
        ],
    },
    { label: 'Reportes', path: '/admin/reportes', icon: MdDescription },
    { label: 'Configuración', path: '/admin/configuracion', icon: MdGridView },
];

export default adminDashboardLinks;
