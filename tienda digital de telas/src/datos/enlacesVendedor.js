import { Package, ShoppingBag, TrendingUp, Settings, LifeBuoy, Store, Bell } from 'lucide-react';

const enlacesVendedor = [
    {
        label: 'Resumen',
        path: '/vendedor',
        icon: TrendingUp
    },
    {
        label: 'Mi Tienda (Perfil)',
        path: '/vendedor/mi-tienda',
        icon: Store
    },
    {
        label: 'Alertas y Auditorías',
        path: '/vendedor/alertas',
        icon: Bell,
        badgeKey: 'sellerAlerts'
    },
    {
        label: 'Inventario',
        icon: Package,
        children: [
            { label: 'Mis Productos', path: '/vendedor/productos' },
            { label: 'Alertas de Stock', path: '/vendedor/stock', badgeKey: 'vendorLowStock' },
        ]
    },
    {
        label: 'Ventas',
        icon: ShoppingBag,
        children: [
            { label: 'Gestión de Pedidos', path: '/vendedor/pedidos', badgeKey: 'vendorActiveOrders' },
        ]
    },
    {
        label: 'Ayuda y Soporte',
        icon: LifeBuoy,
        children: [
            { label: 'Reportar Problema', path: '/cliente/soporte/nuevo' },
            { label: 'Mis Tickets', path: '/cliente/soporte/tickets' },
        ]
    },
    {
        label: 'Configuración',
        icon: Settings,
        path: '/vendedor/configuracion'
    }
];

export default enlacesVendedor;
