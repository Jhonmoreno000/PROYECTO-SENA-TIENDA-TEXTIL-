// Mock data para métricas y analytics del sistema

// Usuarios mock
export const mockUsers = [
    // Admins
    { id: 1, name: 'Admin Principal', email: 'admin@ddtextil.com', role: 'admin', active: true, registeredAt: '2024-01-15', lastLogin: '2026-01-27' },

    // Vendedores
    { id: 2, name: 'Carlos Rodríguez', email: 'vendedor@ddtextil.com', role: 'seller', active: true, registeredAt: '2024-02-01', lastLogin: '2026-01-26', commissionRate: 15, suspended: false },
    { id: 3, name: 'María González', email: 'maria.gonzalez@ddtextil.com', role: 'seller', active: true, registeredAt: '2024-03-10', lastLogin: '2026-01-27', commissionRate: 12, suspended: false },
    { id: 4, name: 'Juan Pérez', email: 'juan.perez@ddtextil.com', role: 'seller', active: false, registeredAt: '2024-04-20', lastLogin: '2025-12-15', commissionRate: 10, suspended: true, suspensionReason: 'Múltiples reportes de calidad' },
    { id: 5, name: 'Ana Martínez', email: 'ana.martinez@ddtextil.com', role: 'seller', active: true, registeredAt: '2024-05-05', lastLogin: '2026-01-25', commissionRate: 18, suspended: false },

    // Clientes
    { id: 6, name: 'Cliente Demo', email: 'cliente@ddtextil.com', role: 'client', active: true, registeredAt: '2024-06-01', lastLogin: '2026-01-27' },
    { id: 7, name: 'Laura Sánchez', email: 'laura.sanchez@email.com', role: 'client', active: true, registeredAt: '2024-07-12', lastLogin: '2026-01-26' },
    { id: 8, name: 'Pedro Ramírez', email: 'pedro.ramirez@email.com', role: 'client', active: true, registeredAt: '2024-08-03', lastLogin: '2026-01-24' },
    { id: 9, name: 'Sofía Torres', email: 'sofia.torres@email.com', role: 'client', active: true, registeredAt: '2024-09-15', lastLogin: '2026-01-27' },
    { id: 10, name: 'Diego Morales', email: 'diego.morales@email.com', role: 'client', active: false, registeredAt: '2024-10-20', lastLogin: '2025-11-10' },
    { id: 11, name: 'Valentina Cruz', email: 'valentina.cruz@email.com', role: 'client', active: true, registeredAt: '2024-11-05', lastLogin: '2026-01-25' },
    { id: 12, name: 'Andrés Vargas', email: 'andres.vargas@email.com', role: 'client', active: true, registeredAt: '2024-12-01', lastLogin: '2026-01-23' },
];

// Pedidos mock con asignación de vendedor
export const mockOrders = [
    { id: 1001, clientId: 6, sellerId: 2, productIds: [1, 2], total: 245000, status: 'delivered', date: '2026-01-20', items: 2 },
    { id: 1002, clientId: 7, sellerId: 3, productIds: [3], total: 180000, status: 'delivered', date: '2026-01-21', items: 1 },
    { id: 1003, clientId: 8, sellerId: 2, productIds: [4, 5], total: 320000, status: 'shipped', date: '2026-01-22', items: 2 },
    { id: 1004, clientId: 9, sellerId: 4, productIds: [6], total: 150000, status: 'preparing', date: '2026-01-23', items: 1 },
    { id: 1005, clientId: 6, sellerId: 3, productIds: [7, 8], total: 410000, status: 'delivered', date: '2026-01-23', items: 2 },
    { id: 1006, clientId: 11, sellerId: 2, productIds: [1], total: 125000, status: 'delivered', date: '2026-01-24', items: 1 },
    { id: 1007, clientId: 12, sellerId: 5, productIds: [9, 10], total: 280000, status: 'shipped', date: '2026-01-24', items: 2 },
    { id: 1008, clientId: 7, sellerId: 2, productIds: [2, 3], total: 305000, status: 'preparing', date: '2026-01-25', items: 2 },
    { id: 1009, clientId: 8, sellerId: 3, productIds: [4], total: 165000, status: 'delivered', date: '2026-01-25', items: 1 },
    { id: 1010, clientId: 9, sellerId: 2, productIds: [5, 6, 7], total: 495000, status: 'preparing', date: '2026-01-26', items: 3 },
    { id: 1011, clientId: 6, sellerId: 3, productIds: [8], total: 190000, status: 'delivered', date: '2026-01-26', items: 1 },
    { id: 1012, clientId: 11, sellerId: 5, productIds: [9], total: 140000, status: 'preparing', date: '2026-01-27', items: 1 },
    { id: 1013, clientId: 12, sellerId: 2, productIds: [1, 2, 3], total: 430000, status: 'preparing', date: '2026-01-27', items: 3 },
    { id: 1014, clientId: 7, sellerId: 3, productIds: [4, 5], total: 285000, status: 'preparing', date: '2026-01-27', items: 2 },
];

// Datos de ventas por día (últimos 30 días)
export const mockSalesData = [
    { date: '2026-01-01', sales: 450000, orders: 5 },
    { date: '2026-01-02', sales: 380000, orders: 4 },
    { date: '2026-01-03', sales: 520000, orders: 6 },
    { date: '2026-01-04', sales: 290000, orders: 3 },
    { date: '2026-01-05', sales: 610000, orders: 7 },
    { date: '2026-01-06', sales: 470000, orders: 5 },
    { date: '2026-01-07', sales: 540000, orders: 6 },
    { date: '2026-01-08', sales: 390000, orders: 4 },
    { date: '2026-01-09', sales: 680000, orders: 8 },
    { date: '2026-01-10', sales: 510000, orders: 6 },
    { date: '2026-01-11', sales: 420000, orders: 5 },
    { date: '2026-01-12', sales: 560000, orders: 6 },
    { date: '2026-01-13', sales: 490000, orders: 5 },
    { date: '2026-01-14', sales: 630000, orders: 7 },
    { date: '2026-01-15', sales: 380000, orders: 4 },
    { date: '2026-01-16', sales: 720000, orders: 8 },
    { date: '2026-01-17', sales: 450000, orders: 5 },
    { date: '2026-01-18', sales: 590000, orders: 7 },
    { date: '2026-01-19', sales: 410000, orders: 4 },
    { date: '2026-01-20', sales: 670000, orders: 8 },
    { date: '2026-01-21', sales: 530000, orders: 6 },
    { date: '2026-01-22', sales: 480000, orders: 5 },
    { date: '2026-01-23', sales: 710000, orders: 8 },
    { date: '2026-01-24', sales: 550000, orders: 6 },
    { date: '2026-01-25', sales: 620000, orders: 7 },
    { date: '2026-01-26', sales: 490000, orders: 5 },
    { date: '2026-01-27', sales: 580000, orders: 6 },
];

// Reportes de fallos mock
export const mockBugReports = [
    {
        id: 1,
        productId: 1,
        productName: 'Algodón Premium',
        sellerId: 2,
        sellerName: 'Carlos Rodríguez',
        clientId: 6,
        clientName: 'Cliente Demo',
        title: 'Color no coincide con la foto',
        description: 'El color de la tela recibida es más oscuro que en las fotos del producto',
        status: 'open',
        priority: 'medium',
        createdAt: '2026-01-25',
        assignedTo: null
    },
    {
        id: 2,
        productId: 3,
        productName: 'Lino Natural',
        sellerId: 3,
        sellerName: 'María González',
        clientId: 7,
        clientName: 'Laura Sánchez',
        title: 'Metraje incorrecto',
        description: 'Pedí 5 metros pero solo recibí 4.5 metros',
        status: 'in_review',
        priority: 'high',
        createdAt: '2026-01-23',
        assignedTo: 1
    },
    {
        id: 3,
        productId: 5,
        productName: 'Terciopelo Luxury',
        sellerId: 2,
        sellerName: 'Carlos Rodríguez',
        clientId: 8,
        clientName: 'Pedro Ramírez',
        title: 'Defecto en la tela',
        description: 'La tela tiene una pequeña mancha que no se puede quitar',
        status: 'resolved',
        priority: 'high',
        createdAt: '2026-01-20',
        assignedTo: 1,
        resolvedAt: '2026-01-22'
    },
    {
        id: 4,
        productId: 7,
        productName: 'Satén Brillante',
        sellerId: 3,
        sellerName: 'María González',
        clientId: 9,
        clientName: 'Sofía Torres',
        title: 'Textura diferente',
        description: 'La textura no es tan suave como esperaba según la descripción',
        status: 'open',
        priority: 'low',
        createdAt: '2026-01-26',
        assignedTo: null
    },
];

// Actividad reciente del sistema
export const mockRecentActivity = [
    { id: 1, type: 'order', userId: 6, userName: 'Cliente Demo', action: 'realizó un pedido', amount: 245000, time: '10 min', icon: 'shopping' },
    { id: 2, type: 'user', userId: 12, userName: 'Andrés Vargas', action: 'se registró en el sistema', time: '25 min', icon: 'user' },
    { id: 3, type: 'order', userId: 7, userName: 'Laura Sánchez', action: 'realizó un pedido', amount: 180000, time: '45 min', icon: 'shopping' },
    { id: 4, type: 'bug', userId: 8, userName: 'Pedro Ramírez', action: 'reportó un problema', time: '1 hora', icon: 'alert' },
    { id: 5, type: 'order', userId: 9, userName: 'Sofía Torres', action: 'realizó un pedido', amount: 320000, time: '2 horas', icon: 'shopping' },
    { id: 6, type: 'product', userId: 2, userName: 'Carlos Rodríguez', action: 'agregó un nuevo producto', time: '3 horas', icon: 'package' },
];

// Productos más vendidos (global)
export const mockTopProducts = [
    { id: 1, name: 'Algodón Premium', sales: 45, revenue: 5625000, sellerId: 2 },
    { id: 2, name: 'Seda Natural', sales: 38, revenue: 4750000, sellerId: 2 },
    { id: 3, name: 'Lino Natural', sales: 35, revenue: 6300000, sellerId: 3 },
    { id: 4, name: 'Poliéster Técnico', sales: 32, revenue: 5280000, sellerId: 2 },
    { id: 5, name: 'Terciopelo Luxury', sales: 28, revenue: 5600000, sellerId: 2 },
];

// Configuración del sistema (editable por admin)
export const mockSystemConfig = {
    siteName: 'D&D Textil',
    defaultDarkMode: false,
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    accentColor: '#F59E0B',
    taxRate: 0.19,
    shippingCost: 15000,
    freeShippingThreshold: 200000,
    lowStockThreshold: 20,
    maintenanceMode: false,
    maintenanceMessage: 'Estamos realizando mejoras en el sistema. Volvemos pronto.',
    globalBanner: {
        enabled: true,
        message: '¡Envío gratis en compras superiores a $200.000!',
        type: 'info' // info, warning, success
    }
};

// Lotes de inventario (rollos de tela)
export const mockInventoryBatches = [
    { id: 'R001', fabricType: 'Algodón Premium', supplier: 'Textiles del Valle', initialMeters: 500, currentMeters: 320, status: 'active', createdAt: '2025-12-15', lastUpdate: '2026-01-27' },
    { id: 'R002', fabricType: 'Seda Natural', supplier: 'Sedas Iberia', initialMeters: 300, currentMeters: 45, status: 'low', createdAt: '2025-11-20', lastUpdate: '2026-01-25' },
    { id: 'R003', fabricType: 'Lino Natural', supplier: 'Linos Colombia', initialMeters: 600, currentMeters: 520, status: 'active', createdAt: '2026-01-05', lastUpdate: '2026-01-26' },
    { id: 'R004', fabricType: 'Poliéster Técnico', supplier: 'Sintéticos SA', initialMeters: 800, currentMeters: 780, status: 'active', createdAt: '2026-01-10', lastUpdate: '2026-01-20' },
    { id: 'R005', fabricType: 'Terciopelo Luxury', supplier: 'Premium Textiles', initialMeters: 250, currentMeters: 12, status: 'critical', createdAt: '2025-10-15', lastUpdate: '2026-01-27' },
    { id: 'R006', fabricType: 'Satén Brillante', supplier: 'Brillo y Tela', initialMeters: 400, currentMeters: 310, status: 'active', createdAt: '2025-12-01', lastUpdate: '2026-01-24' },
    { id: 'R007', fabricType: 'Denim Premium', supplier: 'Jeans Factory', initialMeters: 1000, currentMeters: 850, status: 'active', createdAt: '2025-11-10', lastUpdate: '2026-01-22' },
    { id: 'R008', fabricType: 'Algodón Premium', supplier: 'Textiles del Valle', initialMeters: 500, currentMeters: 465, status: 'active', createdAt: '2026-01-12', lastUpdate: '2026-01-23' },
    { id: 'R009', fabricType: 'Lino Natural', supplier: 'Linos Colombia', initialMeters: 450, currentMeters: 180, status: 'low', createdAt: '2025-10-20', lastUpdate: '2026-01-26' },
    { id: 'R010', fabricType: 'Seda Natural', supplier: 'Sedas Iberia', initialMeters: 350, currentMeters: 290, status: 'active', createdAt: '2025-12-28', lastUpdate: '2026-01-21' },
];

// Eventos de merma/desperdicio
export const mockWasteEvents = [
    { id: 1, rollId: 'R001', meters: 15, reason: 'factory_defect', description: 'Defecto de fábrica en el tejido', responsible: 'N/A', date: '2026-01-15', userId: 2 },
    { id: 2, rollId: 'R002', meters: 8, reason: 'cutting_error', description: 'Error al cortar medida para cliente', responsible: 'Carlos Rodríguez', date: '2026-01-20', userId: 2 },
    { id: 3, rollId: 'R005', meters: 5, reason: 'damaged', description: 'Daño durante transporte', responsible: 'N/A', date: '2026-01-10', userId: 1 },
    { id: 4, rollId: 'R003', meters: 12, reason: 'factory_defect', description: 'Manchas en la tela', responsible: 'N/A', date: '2026-01-12', userId: 3 },
    { id: 5, rollId: 'R006', meters: 6, reason: 'cutting_error', description: 'Recorte erróneo', responsible: 'María González', date: '2026-01-22', userId: 3 },
    { id: 6, rollId: 'R001', meters: 10, reason: 'quality_control', description: 'No pasó control de calidad', responsible: 'Admin Principal', date: '2026-01-25', userId: 1 },
];

// Cupones de descuento
export const mockCoupons = [
    {
        id: 1,
        code: 'VERANO2026',
        discountType: 'percentage',
        discountValue: 20,
        rules: { minPurchase: 100000, categories: ['Algodón', 'Lino'], maxUses: 100 },
        usageCount: 45,
        active: true,
        expiresAt: '2026-03-31',
        createdAt: '2026-01-01'
    },
    {
        id: 2,
        code: 'PRIMERACOMPRA',
        discountType: 'fixed',
        discountValue: 50000,
        rules: { minPurchase: 200000, firstTimeOnly: true, maxUses: 500 },
        usageCount: 234,
        active: true,
        expiresAt: '2026-12-31',
        createdAt: '2025-11-15'
    },
    {
        id: 3,
        code: 'NAVIDAD2025',
        discountType: 'percentage',
        discountValue: 25,
        rules: { minPurchase: 150000, maxUses: 200 },
        usageCount: 198,
        active: false,
        expiresAt: '2025-12-31',
        createdAt: '2025-12-01'
    },
    {
        id: 4,
        code: 'SEDAS10',
        discountType: 'percentage',
        discountValue: 10,
        rules: { minPurchase: 0, categories: ['Seda', 'Satén'], maxUses: 1000 },
        usageCount: 67,
        active: true,
        expiresAt: '2026-06-30',
        createdAt: '2026-01-10'
    },
];

// Tickets de soporte
export const mockSupportTickets = [
    {
        id: 1,
        clientId: 6,
        clientName: 'Cliente Demo',
        orderId: 1001,
        subject: 'Color no coincide con la foto',
        description: 'El color de la tela recibida es más oscuro que en las fotos del producto',
        priority: 'medium',
        status: 'open',
        category: 'quality',
        photos: [],
        assignedTo: null,
        createdAt: '2026-01-25',
        updatedAt: '2026-01-25'
    },
    {
        id: 2,
        clientId: 7,
        clientName: 'Laura Sánchez',
        orderId: 1002,
        subject: 'Metraje incorrecto',
        description: 'Pedí 5 metros pero solo recibí 4.5 metros. Necesito el metraje completo.',
        priority: 'high',
        status: 'in_progress',
        category: 'quantity',
        photos: [],
        assignedTo: 1,
        createdAt: '2026-01-23',
        updatedAt: '2026-01-24'
    },
    {
        id: 3,
        clientId: 8,
        clientName: 'Pedro Ramírez',
        orderId: 1003,
        subject: 'Defecto en la tela',
        description: 'La tela tiene una pequeña mancha que no se puede quitar',
        priority: 'high',
        status: 'resolved',
        category: 'defect',
        photos: [],
        assignedTo: 1,
        createdAt: '2026-01-20',
        updatedAt: '2026-01-22',
        resolvedAt: '2026-01-22'
    },
    {
        id: 4,
        clientId: 9,
        clientName: 'Sofía Torres',
        orderId: 1005,
        subject: 'Textura diferente',
        description: 'La textura no es tan suave como esperaba según la descripción',
        priority: 'low',
        status: 'open',
        category: 'quality',
        photos: [],
        assignedTo: null,
        createdAt: '2026-01-26',
        updatedAt: '2026-01-26'
    },
    {
        id: 5,
        clientId: 11,
        clientName: 'Valentina Cruz',
        orderId: 1006,
        subject: 'Entrega tardía',
        description: 'Mi pedido debía llegar hace 3 días y aún no ha sido despachado',
        priority: 'medium',
        status: 'in_progress',
        category: 'shipping',
        photos: [],
        assignedTo: 1,
        createdAt: '2026-01-24',
        updatedAt: '2026-01-25'
    },
];

// Ventas por región de Colombia
export const mockColombiaRegionSales = [
    { department: 'Antioquia', sales: 12500000, orders: 145, capital: 'Medellín' },
    { department: 'Cundinamarca', sales: 18200000, orders: 210, capital: 'Bogotá' },
    { department: 'Valle del Cauca', sales: 9800000, orders: 112, capital: 'Cali' },
    { department: 'Atlántico', sales: 7300000, orders: 85, capital: 'Barranquilla' },
    { department: 'Santander', sales: 5600000, orders: 68, capital: 'Bucaramanga' },
    { department: 'Bolívar', sales: 4200000, orders: 52, capital: 'Cartagena' },
    { department: 'Caldas', sales: 3100000, orders: 38, capital: 'Manizales' },
    { department: 'Risaralda', sales: 2900000, orders: 34, capital: 'Pereira' },
    { department: 'Quindío', sales: 2500000, orders: 29, capital: 'Armenia' },
    { department: 'Tolima', sales: 2200000, orders: 26, capital: 'Ibagué' },
    { department: 'Norte de Santander', sales: 1800000, orders: 22, capital: 'Cúcuta' },
    { department: 'Magdalena', sales: 1600000, orders: 19, capital: 'Santa Marta' },
    { department: 'Huila', sales: 1400000, orders: 17, capital: 'Neiva' },
    { department: 'Nariño', sales: 1200000, orders: 15, capital: 'Pasto' },
    { department: 'Cauca', sales: 1100000, orders: 13, capital: 'Popayán' },
    { department: 'Córdoba', sales: 980000, orders: 12, capital: 'Montería' },
    { department: 'Meta', sales: 850000, orders: 10, capital: 'Villavicencio' },
    { department: 'Cesar', sales: 720000, orders: 9, capital: 'Valledupar' },
    { department: 'Sucre', sales: 650000, orders: 8, capital: 'Sincelejo' },
    { department: 'Boyacá', sales: 580000, orders: 7, capital: 'Tunja' },
];

// Umbrales de stock por tipo de tela
export const mockStockThresholds = [
    { fabricType: 'Algodón Premium', minMeters: 100, alertEnabled: true },
    { fabricType: 'Seda Natural', minMeters: 50, alertEnabled: true },
    { fabricType: 'Lino Natural', minMeters: 150, alertEnabled: true },
    { fabricType: 'Poliéster Técnico', minMeters: 200, alertEnabled: true },
    { fabricType: 'Terciopelo Luxury', minMeters: 30, alertEnabled: true },
    { fabricType: 'Satén Brillante', minMeters: 80, alertEnabled: true },
    { fabricType: 'Denim Premium', minMeters: 250, alertEnabled: true },
];

// Productos pendientes de aprobación
export const mockPendingProducts = [
    {
        id: 'P_PENDING_1',
        name: 'Lino Orgánico Premium',
        description: 'Lino 100% orgánico certificado, perfecto para ropa de verano',
        price: 185000,
        category: 'Lino',
        sellerId: 2,
        sellerName: 'Carlos Rodríguez',
        images: ['https://placehold.co/400x400/e5e7eb/6b7280?text=Lino+Orgánico'],
        submittedAt: '2026-01-26',
        status: 'pending'
    },
    {
        id: 'P_PENDING_2',
        name: 'Terciopelo Italiano',
        description: 'Terciopelo importado de Italia, textura suave y elegante',
        price: 320000,
        category: 'Terciopelo',
        sellerId: 3,
        sellerName: 'María González',
        images: ['https://placehold.co/400x400/e5e7eb/6b7280?text=Terciopelo+Italiano'],
        submittedAt: '2026-01-25',
        status: 'pending'
    },
    {
        id: 'P_PENDING_3',
        name: 'Algodón Egipcio',
        description: 'Algodón de fibra larga procedente de Egipto',
        price: 165000,
        category: 'Algodón',
        sellerId: 5,
        sellerName: 'Ana Martínez',
        images: ['https://placehold.co/400x400/e5e7eb/6b7280?text=Algodón+Egipcio'],
        submittedAt: '2026-01-27',
        status: 'pending'
    },
];

