import { FiUser, FiPackage, FiHeart, FiScissors, FiMessageCircle, FiTool } from 'react-icons/fi';

const clientDashboardLinks = [
    {
        label: 'Mi Resumen',
        path: '/cliente',
        icon: FiUser
    },
    {
        label: 'Compras',
        icon: FiPackage,
        children: [
            { label: 'Historial de Pedidos', path: '/cliente/pedidos' },
            { label: 'Rastrear Envío', path: '/cliente/pedidos/rastreo' },
        ]
    },
    {
        label: 'Mi Colección',
        icon: FiHeart,
        children: [
            { label: 'Lista de Deseos', path: '/cliente/coleccion' },
            { label: 'Calculadora de Metraje', path: '/cliente/coleccion/calculadora' },
        ]
    },
    {
        label: 'Ayuda',
        icon: FiMessageCircle,
        badge: 1,
        children: [
            { label: 'Mis Tickets', path: '/cliente/soporte/tickets', badge: 1 },
            { label: 'Reportar Problema', path: '/cliente/soporte/nuevo' },
        ]
    },
    {
        label: 'Ajustes',
        icon: FiTool,
        children: [
            { label: 'Mi Perfil', path: '/cliente/configuracion' },
            { label: 'Libreta de Direcciones', path: '/cliente/configuracion/direcciones' },
        ]
    }
];

export default clientDashboardLinks;
