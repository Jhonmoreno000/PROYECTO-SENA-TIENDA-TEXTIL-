import { 
    LayoutDashboard, 
    Users, 
    DollarSign, 
    ShoppingBag, 
    Layers, 
    FileText, 
    AlertTriangle, 
    TrendingUp, 
    Package,
    Settings
} from 'lucide-react';

/**
 * Hierarchical navigation links for the Admin Dashboard sidebar.
 * Parent nodes have a `children` array; leaf nodes have a `path`.
 */
const adminDashboardLinks = [
    { label: 'Resumen', path: '/admin', icon: LayoutDashboard },
    {
        label: 'Usuarios', icon: Users,
        children: [
            { label: 'Gestión de Usuarios', path: '/admin/usuarios', icon: Users },
            { label: 'Vendedores', path: '/admin/vendedores', icon: TrendingUp },
            { label: 'Clientes', path: '/admin/clientes', icon: Users },
        ],
    },
    {
        label: 'Catálogo', icon: ShoppingBag,
        children: [
            { label: 'Productos', path: '/admin/productos', icon: ShoppingBag },
            { label: 'Carrusel', path: '/admin/carrusel', icon: Layers },
            { label: 'Página Inicio', path: '/admin/home', icon: LayoutDashboard },
        ],
    },
    {
        label: 'Inventario', icon: Package,
        children: [
            { label: 'Control de Lotes', path: '/admin/inventario/lotes', icon: Package },
            { label: 'Calculadora de Merma', path: '/admin/inventario/merma', icon: AlertTriangle },
            { label: 'Alertas de Stock', path: '/admin/inventario/alertas', icon: AlertTriangle },
            { label: 'Historial de Movimientos', path: '/admin/inventario/historial', icon: FileText },
        ],
    },
    {
        label: 'Moderación', icon: TrendingUp,
        children: [
            { label: 'Cola de Aprobación', path: '/admin/moderacion/aprobacion', icon: ShoppingBag, badge: 3 },
            { label: 'Rendimiento', path: '/admin/moderacion/vendedores', icon: TrendingUp },
        ],
    },
    {
        label: 'Analytics', icon: TrendingUp,
        children: [
            { label: 'Mapa de Ventas', path: '/admin/analytics/mapa-ventas', icon: LayoutDashboard },
            { label: 'Rotación de Inventario', path: '/admin/analytics/rotacion', icon: Package },
            { label: 'Análisis de Devoluciones', path: '/admin/analytics/devoluciones', icon: AlertTriangle },
            { label: 'Proyección de Ingresos', path: '/admin/analytics/proyeccion', icon: DollarSign },
        ],
    },
    {
        label: 'Soporte', icon: FileText,
        children: [
            { label: 'Gestión de Tickets', path: '/admin/soporte/tickets', icon: FileText, badge: 12 },
            { label: 'Crear Cupones', path: '/admin/soporte/cupones', icon: DollarSign },
        ],
    },
    { label: 'Reportes', path: '/admin/reportes', icon: FileText },
    { label: 'Configuración', path: '/admin/configuracion', icon: Settings },
];

export default adminDashboardLinks;
