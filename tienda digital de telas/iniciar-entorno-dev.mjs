/**
 * iniciar-entorno-dev.mjs
 * Inicia automáticamente el servidor API de respaldo en el puerto 8081 (si el backend Java no está activo)
 * y levanta el servidor de desarrollo de Vite en http://localhost:3001
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootRepoDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(__dirname, 'backend-java', 'servidor-api', 'uploads');
const publicDir = path.join(__dirname, 'public');

// 1. Liberar cualquier listener previo de PowerShell que esté ocupando el puerto 3001 o 8081
if (process.platform === 'win32') {
    try {
        execSync(
            `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name = 'powershell.exe' AND CommandLine LIKE '%servidor_local_demostracion.ps1%'\\" | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`,
            { stdio: 'ignore' }
        );
    } catch {
        // Ignorar si no había procesos previos
    }
}

const PRODUCTOS = [
    { id: 1, name: 'Algodón Premium', nombre: 'Algodón Premium', price: 25000, precio: 25000, stock: 100, existencias: 100, category: 'Algodón', categoria: 'Algodón', description: 'Tela de algodón 100% natural, ideal para camisas y blusas.', descripcion: 'Tela de algodón 100% natural, ideal para camisas y blusas.', featured: true, destacado: true, isNewCollection: true, esNuevaColeccion: true, isExclusive: false, esExclusivo: false, isOffer: false, esOferta: false, sellerId: 2, images: ['/uploads/product_12_1775767112691.jpg'], material: 'Algodón 100%', width: '1.50 m', weight: '150 g/m²', care: 'Lavar en frío, no blanquear' },
    { id: 2, name: 'Seda Italiana', nombre: 'Seda Italiana', price: 85000, precio: 85000, stock: 50, existencias: 50, category: 'Seda', categoria: 'Seda', description: 'Seda pura con acabado brillante, perfecta para vestidos de gala.', descripcion: 'Seda pura con acabado brillante, perfecta para vestidos de gala.', featured: true, destacado: true, isNewCollection: false, esNuevaColeccion: false, isExclusive: true, esExclusivo: true, isOffer: false, esOferta: false, sellerId: 2, images: ['/uploads/product_16_1775766690228.webp'], material: 'Seda pura', width: '1.40 m', weight: '80 g/m²', care: 'Limpieza en seco únicamente' },
    { id: 3, name: 'Lino Orgánico', nombre: 'Lino Orgánico', price: 45000, precio: 45000, stock: 80, existencias: 80, category: 'Lino', categoria: 'Lino', description: 'Lino fresco y transpirable para ropa de verano y cortinería.', descripcion: 'Lino fresco y transpirable para ropa de verano y cortinería.', featured: true, destacado: true, isNewCollection: true, esNuevaColeccion: true, isExclusive: false, esExclusivo: false, isOffer: false, esOferta: false, sellerId: 3, images: ['/uploads/product_14_1775766898975.webp'], material: 'Lino orgánico', width: '1.50 m', weight: '200 g/m²', care: 'No usar secadora' },
    { id: 4, name: 'Lana Merino', nombre: 'Lana Merino', price: 65000, precio: 65000, stock: 30, existencias: 30, category: 'Lana', categoria: 'Lana', description: 'Lana suave y cálida, ideal para abrigos y sastrería de invierno.', descripcion: 'Lana suave y cálida, ideal para abrigos y sastrería de invierno.', featured: true, destacado: true, isNewCollection: false, esNuevaColeccion: false, isExclusive: true, esExclusivo: true, isOffer: false, esOferta: false, sellerId: 3, images: ['/uploads/product_14_1775766898975.webp'], material: 'Lana merino', width: '1.60 m', weight: '300 g/m²', care: 'Lavar a mano con agua tibia' },
    { id: 5, name: 'Dril Elástico', nombre: 'Dril Elástico', price: 35000, precio: 35000, stock: 120, existencias: 120, category: 'Dril', categoria: 'Dril', description: 'Dril resistente con toque de elasticidad para pantalones y dotación.', descripcion: 'Dril resistente con toque de elasticidad para pantalones y dotación.', featured: false, destacado: false, isNewCollection: false, esNuevaColeccion: false, isExclusive: false, esExclusivo: false, isOffer: true, esOferta: true, sellerId: 2, images: ['/uploads/product_10_1775767265179.jpg'], material: 'Algodón/Lycra 95/5', width: '1.50 m', weight: '250 g/m²', care: 'Lavar a máquina en ciclo suave' },
    { id: 6, name: 'Gasa de Seda', nombre: 'Gasa de Seda', price: 72000, precio: 72000, stock: 60, existencias: 60, category: 'Seda', categoria: 'Seda', description: 'Gasa ligera y elegante para pañuelos, blusas y alta costura.', descripcion: 'Gasa ligera y elegante para pañuelos, blusas y alta costura.', featured: true, destacado: true, isNewCollection: false, esNuevaColeccion: false, isExclusive: true, esExclusivo: true, isOffer: false, esOferta: false, sellerId: 3, images: ['/uploads/product_16_1775766690228.webp'], material: 'Seda/Poliéster', width: '1.40 m', weight: '45 g/m²', care: 'Lavar a mano' },
    { id: 7, name: 'Tela Polar Suave', nombre: 'Tela Polar Suave', price: 22000, precio: 22000, stock: 150, existencias: 150, category: 'Poliéster', categoria: 'Poliéster', description: 'Tela polar térmica de tacto suave para cobijas y chaquetas.', descripcion: 'Tela polar térmica de tacto suave para cobijas y chaquetas.', featured: false, destacado: false, isNewCollection: false, esNuevaColeccion: false, isExclusive: false, esExclusivo: false, isOffer: true, esOferta: true, sellerId: 2, images: ['/uploads/product_15_1775767332095.jpg'], material: 'Poliéster 100%', width: '1.50 m', weight: '280 g/m²', care: 'Lavar a máquina, no planchar' },
    { id: 8, name: 'Oxford Camisería', nombre: 'Oxford Camisería', price: 38000, precio: 38000, stock: 90, existencias: 90, category: 'Algodón', categoria: 'Algodón', description: 'Tejido Oxford clásico de alta durabilidad para camisas formales.', descripcion: 'Tejido Oxford clásico de alta durabilidad para camisas formales.', featured: true, destacado: true, isNewCollection: true, esNuevaColeccion: true, isExclusive: false, esExclusivo: false, isOffer: false, esOferta: false, sellerId: 3, images: ['/uploads/product_12_1775767112691.jpg'], material: 'Algodón peinado', width: '1.50 m', weight: '130 g/m²', care: 'Planchar a temperatura media' },
    { id: 9, name: 'Retazo Algodón Premium', nombre: 'Retazo Algodón Premium', price: 12000, precio: 12000, stock: 3, existencias: 3, category: 'Algodón', categoria: 'Algodón', description: 'Retazo de algodón premium en liquidación (-40%) para proyectos pequeños.', descripcion: 'Retazo de algodón premium en liquidación (-40%) para proyectos pequeños.', featured: false, destacado: false, isNewCollection: false, esNuevaColeccion: false, isExclusive: false, esExclusivo: false, isOffer: true, esOferta: true, sellerId: 2, images: ['/uploads/product_9_1775766848979.jpg'], material: 'Algodón 100%', width: '1.40 m', weight: '150 g/m²', care: 'Lavar a máquina' },
];

const CARRUSEL = [
    { id: 1, title: 'Nueva Colección 2026', titulo: 'Nueva Colección 2026', subtitle: 'Tendencias exclusivas en telas premium', subtitulo: 'Tendencias exclusivas en telas premium', image: '/images/carousel-nueva-coleccion.png', imagen: '/images/carousel-nueva-coleccion.png', cta: 'Ver Más', sectionKey: 'nuevas', section_key: 'nuevas', claveSeccion: 'nuevas', active: true, order: 1 },
    { id: 2, title: 'Telas Exclusivas', titulo: 'Telas Exclusivas', subtitle: 'Diseños únicos para proyectos especiales', subtitulo: 'Diseños únicos para proyectos especiales', image: '/images/carousel-telas-exclusivas.png', imagen: '/images/carousel-telas-exclusivas.png', cta: 'Explorar', sectionKey: 'exclusivas', section_key: 'exclusivas', claveSeccion: 'exclusivas', active: true, order: 2 },
    { id: 3, title: 'Ofertas Especiales', titulo: 'Ofertas Especiales', subtitle: 'Descuentos por metraje y retazos en liquidación', subtitulo: 'Descuentos por metraje y retazos en liquidación', image: '/images/carousel-ofertas-especiales.png', imagen: '/images/carousel-ofertas-especiales.png', cta: 'Ver Ofertas', sectionKey: 'ofertas', section_key: 'ofertas', claveSeccion: 'ofertas', active: true, order: 3 },
];

const SECCIONES_INICIO = [
    { key: 'nuevas', title: 'Nuevas Colecciones', subtitle: 'Descubre las telas más recientes que llegan a la tienda', active: true },
    { key: 'exclusivas', title: 'Telas Exclusivas', subtitle: 'Diseños únicos seleccionados para tus proyectos especiales', active: true },
    { key: 'ofertas', title: 'Ofertas Especiales', subtitle: 'Precios especiales en telas seleccionadas por tiempo limitado', active: true },
];

const USUARIOS = [
    { id: 1, name: 'Anderson Moreno', nombre: 'Anderson Moreno', email: 'admin@ddtextil.com', correo: 'admin@ddtextil.com', role: 'admin', rol: 'admin', phone: '3027058951', active: true, activo: true, commissionRate: 0, createdAt: '2026-01-15' },
    { id: 2, name: 'Carlos Vendedor', nombre: 'Carlos Vendedor', email: 'vendedor@ddtextil.com', correo: 'vendedor@ddtextil.com', role: 'vendedor', rol: 'vendedor', phone: '3017654321', active: true, activo: true, commissionRate: 0.10, createdAt: '2026-02-10' },
    { id: 3, name: 'María González', nombre: 'María González', email: 'maria.gonzalez@ddtextil.com', correo: 'maria.gonzalez@ddtextil.com', role: 'vendedor', rol: 'vendedor', phone: '3109876543', active: true, activo: true, commissionRate: 0.12, createdAt: '2026-03-01' },
    { id: 4, name: 'Laura Martínez', nombre: 'Laura Martínez', email: 'cliente@ddtextil.com', correo: 'cliente@ddtextil.com', role: 'cliente', rol: 'cliente', phone: '3154443322', active: true, activo: true, commissionRate: 0, createdAt: '2026-04-12' },
];

const PEDIDOS = [
    { id: 1001, clientId: 4, idCliente: 4, sellerId: 2, idVendedor: 2, status: 'delivered', estado: 'entregado', total: 250000, montoTotal: 250000, date: '2026-10-20T14:30:00Z', clientName: 'Laura Martínez', clientEmail: 'cliente@ddtextil.com', items: [{ productId: 1, name: 'Algodón Premium', quantity: 10, price: 25000 }] },
    { id: 1002, clientId: 5, idCliente: 5, sellerId: 2, idVendedor: 2, status: 'shipped', estado: 'enviado', total: 425000, montoTotal: 425000, date: '2026-10-25T10:15:00Z', clientName: 'David Vélez', clientEmail: 'cliente@gmail.com', items: [{ productId: 2, name: 'Seda Italiana', quantity: 5, price: 85000 }] },
];

const CUPONES = [
    { id: 1, code: 'BIENVENIDO10', codigo: 'BIENVENIDO10', discountType: 'percentage', tipoDescuento: 'porcentaje', discountValue: 10, valorDescuento: 10, active: true, activo: true, usageCount: 14, expiresAt: '2027-12-31' },
    { id: 2, code: 'MAYORISTA15', codigo: 'MAYORISTA15', discountType: 'percentage', tipoDescuento: 'porcentaje', discountValue: 15, valorDescuento: 15, active: true, activo: true, usageCount: 8, expiresAt: '2027-12-31' },
];

const LOTES = [
    { id: 1, batchCode: 'ROL-ALG-001', codigoLote: 'ROL-ALG-001', fabricType: 'Algodón Premium', tipoTela: 'Algodón Premium', color: 'Blanco Óptico', initialMeters: 100, metrosIniciales: 100, currentMeters: 72.5, metrosActuales: 72.5, status: 'active', estado: 'DISPONIBLE', supplier: 'Textiles Andinos S.A.S.', entryDate: '2026-10-01' },
    { id: 2, batchCode: 'ROL-SED-002', codigoLote: 'ROL-SED-002', fabricType: 'Seda Italiana', tipoTela: 'Seda Italiana', color: 'Champaña', initialMeters: 50, metrosIniciales: 50, currentMeters: 38.0, metrosActuales: 38.0, status: 'active', estado: 'DISPONIBLE', supplier: 'Importadora Milano', entryDate: '2026-10-05' },
];

const VENTAS = [
    { saleDate: '2026-10-25', totalSales: 1240000, totalOrders: 8 },
    { saleDate: '2026-10-26', totalSales: 980000, totalOrders: 6 },
    { saleDate: '2026-10-27', totalSales: 1650000, totalOrders: 11 },
    { saleDate: '2026-10-28', totalSales: 1420000, totalOrders: 9 },
    { saleDate: '2026-10-29', totalSales: 1890000, totalOrders: 12 },
];

const REGIONES = [
    { region: 'Antioquia (Medellín)', sales: 4250000, orders: 28, percentage: 45 },
    { region: 'Cundinamarca (Bogotá)', sales: 2650000, orders: 17, percentage: 28 },
    { region: 'Valle del Cauca (Cali)', sales: 1420000, orders: 9, percentage: 15 },
    { region: 'Atlántico (Barranquilla)', sales: 1130000, orders: 7, percentage: 12 },
];

function sendJson(res, data, status = 200) {
    const json = JSON.stringify(data);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Correlation-ID',
    });
    res.end(json);
}

function readBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString('utf8');
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                resolve({});
            }
        });
        req.on('error', () => resolve({}));
    });
}

function iniciarApiRespaldo() {
    const server = http.createServer(async (req, res) => {
        if (req.method === 'OPTIONS') {
            res.writeHead(204, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Correlation-ID',
            });
            res.end();
            return;
        }

        const parsedUrl = new URL(req.url || '/', 'http://localhost:8081');
        const urlPath = parsedUrl.pathname;

        // Archivos de imágenes de productos (/uploads/*)
        if (urlPath.startsWith('/uploads/')) {
            const fileName = urlPath.replace(/^\/uploads\//, '');
            const candidates = [
                path.join(uploadsDir, fileName),
                path.join(publicDir, 'uploads', fileName),
                path.join(rootRepoDir, 'uploads', fileName),
            ];
            for (const candidate of candidates) {
                if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                    const ext = path.extname(candidate).toLowerCase();
                    const mime =
                        ext === '.webp'
                            ? 'image/webp'
                            : ext === '.png'
                              ? 'image/png'
                              : 'image/jpeg';
                    res.writeHead(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' });
                    fs.createReadStream(candidate).pipe(res);
                    return;
                }
            }
        }

        if (urlPath === '/health/live' || urlPath === '/api/health/live' || urlPath === '/api/health') {
            return sendJson(res, { status: 'UP', service: 'ddtextil-backend', uptime_ms: 360000 });
        }
        if (urlPath === '/health/ready' || urlPath === '/api/health/ready') {
            return sendJson(res, { status: 'UP', database: 'CONNECTED', checks: [{ name: 'postgresql', status: 'UP' }] });
        }
        if (urlPath === '/api/pagos/config' || urlPath === '/api/payments/config') {
            return sendJson(res, {
                configured: true,
                publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAUr19rhZCQSQ',
                currency: 'COP',
                environment: 'sandbox',
            });
        }
        if (urlPath === '/api/pagos/intencion') {
            const refCode = `DD-${Math.floor(10000000 + Math.random() * 90000000)}`;
            const sig = crypto
                .createHash('sha256')
                .update(`${refCode}10000000COPtest_integrity_secret`)
                .digest('hex');
            return sendJson(res, {
                success: true,
                reference: refCode,
                currency: 'COP',
                publicKey: 'pub_test_Q5yDA9xoKdePzhSGeVe9HAUr19rhZCQSQ',
                integritySignature: sig,
            });
        }
        if (urlPath === '/api/products' || urlPath === '/api/productos') {
            return sendJson(res, PRODUCTOS);
        }
        if (urlPath === '/api/productos/pendientes') {
            return sendJson(res, []);
        }
        if (urlPath === '/api/carousel' || urlPath === '/api/carrusel') {
            return sendJson(res, CARRUSEL);
        }
        if (urlPath === '/api/secciones-inicio') {
            return sendJson(res, SECCIONES_INICIO);
        }
        if (urlPath === '/api/iniciar-sesion' || urlPath === '/api/auth/login' || urlPath === '/api/login') {
            const body = await readBody(req);
            const correo = String(body.correo || body.email || 'cliente@ddtextil.com').toLowerCase();
            let user = { id: 4, name: 'Laura Martínez', nombre: 'Laura Martínez', email: correo, correo, role: 'cliente', rol: 'cliente' };
            if (correo.includes('admin@ddtextil.com')) {
                user = { id: 1, name: 'Anderson Moreno', nombre: 'Anderson Moreno', email: 'admin@ddtextil.com', correo: 'admin@ddtextil.com', role: 'admin', rol: 'admin' };
            } else if (correo.includes('vendedor@ddtextil.com') || correo.includes('maria.gonzalez@ddtextil.com')) {
                user = { id: 2, name: 'Carlos Vendedor', nombre: 'Carlos Vendedor', email: 'vendedor@ddtextil.com', correo: 'vendedor@ddtextil.com', role: 'vendedor', rol: 'vendedor' };
            }
            return sendJson(res, { success: true, token: 'demo-jwt-token-sena-adso-2026', user });
        }
        if (urlPath === '/api/registro' || urlPath === '/api/autenticacion/sso') {
            const body = await readBody(req);
            const email = body.email || body.correo || 'cliente@ddtextil.com';
            const name = body.nombre || body.name || 'Cliente D&D Textil';
            return sendJson(res, {
                success: true,
                token: 'demo-jwt-token-sena-adso-2026',
                user: { id: 4, name, nombre: name, email, correo: email, role: 'cliente', rol: 'cliente' },
            });
        }
        if (urlPath === '/api/usuarios') return sendJson(res, USUARIOS);
        if (urlPath === '/api/pedidos') return sendJson(res, PEDIDOS);
        if (urlPath === '/api/cupones') return sendJson(res, CUPONES);
        if (urlPath === '/api/inventario/lotes') return sendJson(res, LOTES);
        if (urlPath === '/api/metricas/ventas' || urlPath === '/api/metricas/ventas-erp') return sendJson(res, VENTAS);
        if (urlPath === '/api/metricas/regiones') return sendJson(res, REGIONES);
        if (urlPath === '/api/banner') {
            return sendJson(res, {
                enabled: true,
                message: 'Envío gratis en pedidos superiores a $200.000 COP en todo Colombia',
                type: 'info',
            });
        }
        if (urlPath.startsWith('/api/configuracion/')) return sendJson(res, {});
        if (urlPath.startsWith('/api/')) {
            return sendJson(res, req.method === 'GET' ? [] : { success: true });
        }

        res.writeHead(404);
        res.end();
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log('✓ Backend API ya se encuentra activo en http://localhost:8081');
        } else {
            console.warn('Aviso API respaldo:', err.message);
        }
    });

    server.listen(8081, '0.0.0.0', () => {
        console.log('✓ API REST D&D Textil activa en http://localhost:8081');
    });
}

iniciarApiRespaldo();

// 2. Iniciar Vite en el directorio del frontend
const viteBin = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
const viteProc = spawn(process.execPath, [viteBin, ...process.argv.slice(2)], {
    cwd: __dirname,
    stdio: 'inherit',
});

viteProc.on('exit', (code) => {
    process.exit(code ?? 0);
});

