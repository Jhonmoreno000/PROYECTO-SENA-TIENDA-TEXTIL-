import { MdInventory2, MdShoppingBag, MdWarningAmber, MdTrendingUp, MdSettings } from 'react-icons/md';

const sellerDashboardLinks = [
    {
        label: 'Panel Principal',
        path: '/vendedor',
        icon: MdTrendingUp
    },
    {
        label: 'Inventario',
        icon: MdInventory2,
        badge: 2,
        children: [
            { label: 'Mis Productos', path: '/vendedor/productos' },
            { label: 'Alertas de Stock', path: '/vendedor/stock', badge: 2 },
        ]
    },
    {
        label: 'Ventas',
        icon: MdShoppingBag,
        badge: 5,
        children: [
            { label: 'Gestión de Pedidos', path: '/vendedor/pedidos', badge: 5 },
        ]
    },
    {
        label: 'Configuración',
        icon: MdSettings,
        path: '/vendedor/configuracion'
    }
];

export default sellerDashboardLinks;
