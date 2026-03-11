import { FiPackage, FiShoppingBag, FiAlertCircle, FiTrendingUp, FiSettings } from 'react-icons/fi';

const sellerDashboardLinks = [
    {
        label: 'Panel Principal',
        path: '/vendedor',
        icon: FiTrendingUp
    },
    {
        label: 'Inventario',
        icon: FiPackage,
        badge: 2,
        children: [
            { label: 'Mis Productos', path: '/vendedor/productos' },
            { label: 'Alertas de Stock', path: '/vendedor/stock', badge: 2 },
        ]
    },
    {
        label: 'Ventas',
        icon: FiShoppingBag,
        badge: 5,
        children: [
            { label: 'Gestión de Pedidos', path: '/vendedor/pedidos', badge: 5 },
        ]
    },
    {
        label: 'Configuración',
        icon: FiSettings,
        path: '/vendedor/configuracion'
    }
];

export default sellerDashboardLinks;
