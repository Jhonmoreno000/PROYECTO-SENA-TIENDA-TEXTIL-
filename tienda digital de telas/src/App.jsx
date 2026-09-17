import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProviders } from './componentes/AppProviders';
import { ProtectedRoute, DesplazarArriba, SmoothScrollProvider } from './componentes';
import CursorFoco from './componentes/CursorFoco';
import TruckLoader from './componentes/TruckLoader';

// Pages (eager - always needed)
import Inicio from './paginas/Inicio';
import Catalogo from './paginas/Catalogo';
import DetalleProducto from './paginas/DetalleProducto';
import Carrito from './paginas/Carrito';
import Pago from './paginas/Pago';
import ConfirmacionPedido from './paginas/ConfirmacionPedido';
import About from './paginas/About';
import IniciarSesion from './paginas/IniciarSesion';
import Registro from './paginas/Registro';
import BugReport from './paginas/BugReport';
import Payment from './paginas/payment/Payment';

// Dashboard paginas (lazy - only loaded when needed)
const PanelCliente = lazy(() => import('./paginas/cliente/PanelCliente'));
const ClientOrderHistory = lazy(() => import('./paginas/cliente/Orders/HistorialPedidos'));
const SeguimientoPedido = lazy(() => import('./paginas/cliente/Orders/SeguimientoPedido'));
const Wishlist = lazy(() => import('./paginas/cliente/Collection/Wishlist'));
const ProjectCalculator = lazy(() => import('./paginas/cliente/Collection/ProjectCalculator'));
const NewReport = lazy(() => import('./paginas/cliente/Soporte/NewReport'));
const MyTickets = lazy(() => import('./paginas/cliente/Soporte/MyTickets'));
const Perfil = lazy(() => import('./paginas/cliente/Settings/Perfil'));
const AddressBook = lazy(() => import('./paginas/cliente/Settings/AddressBook'));

const ProductosVendedor = lazy(() => import('./paginas/vendedor/PanelVendedor'));
const PedidosVendedor = lazy(() => import('./paginas/vendedor/PedidosVendedor'));
const StockAlerts = lazy(() => import('./paginas/vendedor/StockAlerts'));

const ResumenAdmin = lazy(() => import('./paginas/admin/ResumenAdmin'));
const GestionUsuarios = lazy(() => import('./paginas/admin/GestionUsuarios'));
const MetricasVendedor = lazy(() => import('./paginas/admin/MetricasVendedor'));
const MetricasCliente = lazy(() => import('./paginas/admin/MetricasCliente'));
const ConfiguracionSistema = lazy(() => import('./paginas/admin/ConfiguracionSistema'));
const GestionarCarrusel = lazy(() => import('./paginas/admin/GestionarCarrusel'));
const GestionarInicio = lazy(() => import('./paginas/admin/GestionarInicio'));
const ReportesAdmin = lazy(() => import('./paginas/admin/ReportesAdmin'));
const ProductosAdmin = lazy(() => import('./paginas/admin/ProductosAdmin'));
const ActividadAdmin = lazy(() => import('./paginas/admin/ActividadAdmin'));
const ControlLotes = lazy(() => import('./paginas/admin/Inventario/ControlLotes'));
const CalculadoraMerma = lazy(() => import('./paginas/admin/Inventario/CalculadoraMerma'));
const ConfiguracionStock = lazy(() => import('./paginas/admin/Inventario/ConfiguracionStock'));
const HistorialMovimientos = lazy(() => import('./paginas/admin/Inventario/HistorialMovimientos'));
const ColaAprobacion = lazy(() => import('./paginas/admin/Moderacion/ColaAprobacion'));
const RendimientoVendedores = lazy(() => import('./paginas/admin/Moderacion/RendimientoVendedores'));
const MapaVentas = lazy(() => import('./paginas/admin/Analiticas/MapaVentas'));
const RankingRotacion = lazy(() => import('./paginas/admin/Analiticas/RankingRotacion'));
const AnalisisDevoluciones = lazy(() => import('./paginas/admin/Analiticas/AnalisisDevoluciones'));
const ProyeccionIngresos = lazy(() => import('./paginas/admin/Analiticas/ProyeccionIngresos'));
const GestionTickets = lazy(() => import('./paginas/admin/Soporte/GestionTickets'));
const CreacionCupones = lazy(() => import('./paginas/admin/Soporte/CreacionCupones'));
const Contact = lazy(() => import('./paginas/Contact'));
const FacturasAdmin = lazy(() => import('./paginas/admin/FacturasAdmin'));

function DashboardFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
            <TruckLoader text="Cargando panel..." />
        </div>
    );
}

function AppRoutes() {
    const location = useLocation();
    
    return (
        <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route path="/" element={<Inicio />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route path="/producto/:id" element={<DetalleProducto />} />
                    <Route path="/carrito" element={<Carrito />} />
                    <Route path="/nosotros" element={<About />} />
                    <Route path="/contacto" element={<Suspense fallback={<TruckLoader text="Cargando..." />}><Contact /></Suspense>} />
                    <Route path="/login" element={<IniciarSesion />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/reportar-fallo" element={<BugReport />} />

                    {/* Payment */}
                    <Route
                        path="/pago"
                        element={
                            <ProtectedRoute>
                                <Payment />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <Pago />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/confirmacion"
                        element={
                            <ProtectedRoute>
                                <ConfirmacionPedido />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cliente"
                        element={
                            <ProtectedRoute roles="cliente">
                                <Suspense fallback={<DashboardFallback />}>
                                    <PanelCliente />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/perfil"
                        element={
                            <ProtectedRoute roles="cliente">
                                <Suspense fallback={<DashboardFallback />}>
                                    <Perfil />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cliente/pedidos"
                        element={
                            <ProtectedRoute roles="cliente">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ClientOrderHistory />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/pedidos/rastreo"
                        element={
                            <ProtectedRoute roles="cliente">
                                <Suspense fallback={<DashboardFallback />}>
                                    <SeguimientoPedido />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cliente/coleccion"
                        element={
                            <ProtectedRoute roles="cliente">
                                <Suspense fallback={<DashboardFallback />}>
                                    <Wishlist />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/coleccion/calculadora"
                        element={
                            <ProtectedRoute roles="cliente">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ProjectCalculator />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cliente/soporte/nuevo"
                        element={
                            <ProtectedRoute roles="cliente">
                                <Suspense fallback={<DashboardFallback />}>
                                    <NewReport />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/soporte/tickets"
                        element={
                            <ProtectedRoute roles="cliente">
                                <Suspense fallback={<DashboardFallback />}>
                                    <MyTickets />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cliente/configuracion"
                        element={
                            <ProtectedRoute roles="cliente">
                                <Suspense fallback={<DashboardFallback />}>
                                    <Perfil />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/configuracion/direcciones"
                        element={
                            <ProtectedRoute roles="cliente">
                                <Suspense fallback={<DashboardFallback />}>
                                    <AddressBook />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/vendedor"
                        element={
                            <ProtectedRoute roles={['vendedor', 'admin']}>
                                <Suspense fallback={<DashboardFallback />}>
                                    <ProductosVendedor />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/productos"
                        element={
                            <ProtectedRoute roles={['vendedor', 'admin']}>
                                <Suspense fallback={<DashboardFallback />}>
                                    <ProductosVendedor />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/pedidos"
                        element={
                            <ProtectedRoute roles={['vendedor', 'admin']}>
                                <Suspense fallback={<DashboardFallback />}>
                                    <PedidosVendedor />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/stock"
                        element={
                            <ProtectedRoute roles={['vendedor', 'admin']}>
                                <Suspense fallback={<DashboardFallback />}>
                                    <StockAlerts />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/configuracion"
                        element={
                            <ProtectedRoute roles={['vendedor', 'admin']}>
                                <Suspense fallback={<DashboardFallback />}>
                                    <Perfil />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ResumenAdmin />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/usuarios"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <GestionUsuarios />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/vendedores"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <MetricasVendedor />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/clientes"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <MetricasCliente />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/productos"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ProductosAdmin />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/carrusel"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <GestionarCarrusel />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/home"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <GestionarInicio />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/facturas"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <FacturasAdmin />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/reportes"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ReportesAdmin />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/actividad"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ActividadAdmin />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/inventario/lotes"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ControlLotes />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/inventario/merma"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <CalculadoraMerma />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/inventario/alertas"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ConfiguracionStock />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/inventario/historial"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <HistorialMovimientos />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/moderacion/aprobacion"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ColaAprobacion />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/moderacion/vendedores"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <RendimientoVendedores />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/analytics/mapa-ventas"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <MapaVentas />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/analytics/rotacion"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <RankingRotacion />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/analytics/devoluciones"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <AnalisisDevoluciones />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/analytics/proyeccion"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ProyeccionIngresos />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/soporte/tickets"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <GestionTickets />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/soporte/cupones"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <CreacionCupones />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/configuracion"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ConfiguracionSistema />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
            </Routes>
    );
}

function App() {
    return (
        <AppProviders>
            <Router>
                <DesplazarArriba />
                <CursorFoco />
                <SmoothScrollProvider>
                    <AppRoutes />
                </SmoothScrollProvider>
            </Router>
        </AppProviders>
    );
}

export default App;
