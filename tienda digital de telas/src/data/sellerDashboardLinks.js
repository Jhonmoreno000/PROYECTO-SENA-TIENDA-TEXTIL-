import { Package, ShoppingBag, TrendingUp, Settings } from 'lucide-react';

const sellerDashboardLinks = [
    {
        label: 'Panel Principal',
        path: '/vendedor',
        icon: TrendingUp
    },
    {
        label: 'Inventario',
        icon: Package,
        badge: 2,
        children: [
            { label: 'Mis Productos', path: '/vendedor/productos' },
            { label: 'Alertas de Stock', path: '/vendedor/stock', badge: 2 },
        ]
    },
    {
        label: 'Ventas',
        icon: ShoppingBag,
        badge: 5,
        children: [
            { label: 'Gestión de Pedidos', path: '/vendedor/pedidos', badge: 5 },
        ]
    },
    {
        label: 'Configuración',
        icon: Settings,
        path: '/vendedor/configuracion'
    }
];

export default sellerDashboardLinks;
