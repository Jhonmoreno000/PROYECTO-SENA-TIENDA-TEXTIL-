import { MdPerson, MdShoppingBag, MdFavorite, MdContentCut, MdSupportAgent, MdSettings } from 'react-icons/md';

const clientDashboardLinks = [
    {
        label: 'Mi Resumen',
        path: '/cliente',
        icon: MdPerson
    },
    {
        label: 'Compras',
        icon: MdShoppingBag,
        children: [
            { label: 'Historial de Pedidos', path: '/cliente/pedidos' },
            { label: 'Rastrear Envío', path: '/cliente/pedidos/rastreo' },
        ]
    },
    {
        label: 'Mi Colección',
        icon: MdFavorite,
        children: [
            { label: 'Lista de Deseos', path: '/cliente/coleccion' },
            { label: 'Calculadora de Metraje', path: '/cliente/coleccion/calculadora' },
        ]
    },
    {
        label: 'Ayuda',
        icon: MdSupportAgent,
        badge: 1,
        children: [
            { label: 'Mis Tickets', path: '/cliente/soporte/tickets', badge: 1 },
            { label: 'Reportar Problema', path: '/cliente/soporte/nuevo' },
        ]
    },
    {
        label: 'Ajustes',
        icon: MdSettings,
        children: [
            { label: 'Mi Perfil', path: '/cliente/configuracion' },
            { label: 'Libreta de Direcciones', path: '/cliente/configuracion/direcciones' },
        ]
    }
];

export default clientDashboardLinks;
