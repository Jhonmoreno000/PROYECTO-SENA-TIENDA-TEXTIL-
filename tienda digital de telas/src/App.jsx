import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProviders } from './components/AppProviders';
import { ProtectedRoute, ScrollToTop, SmoothScrollProvider } from './components';
import SpotlightCursor from './components/SpotlightCursor';
import TruckLoader from './components/TruckLoader';

// Pages (eager - always needed)
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import BugReport from './pages/BugReport';
import Payment from './pages/payment/Payment';

// Dashboard pages (lazy - only loaded when needed)
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const ClientOrderHistory = lazy(() => import('./pages/client/Orders/OrderHistory'));
const OrderTracking = lazy(() => import('./pages/client/Orders/OrderTracking'));
const Wishlist = lazy(() => import('./pages/client/Collection/Wishlist'));
const ProjectCalculator = lazy(() => import('./pages/client/Collection/ProjectCalculator'));
const NewReport = lazy(() => import('./pages/client/Support/NewReport'));
const MyTickets = lazy(() => import('./pages/client/Support/MyTickets'));
const Profile = lazy(() => import('./pages/client/Settings/Profile'));
const AddressBook = lazy(() => import('./pages/client/Settings/AddressBook'));

const SellerProducts = lazy(() => import('./pages/seller/SellerDashboard'));
const SellerOrders = lazy(() => import('./pages/seller/SellerOrders'));
const StockAlerts = lazy(() => import('./pages/seller/StockAlerts'));

const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SellerMetrics = lazy(() => import('./pages/admin/SellerMetrics'));
const ClientMetrics = lazy(() => import('./pages/admin/ClientMetrics'));
const SystemConfig = lazy(() => import('./pages/admin/SystemConfig'));
const ManageCarousel = lazy(() => import('./pages/admin/ManageCarousel'));
const ManageHome = lazy(() => import('./pages/admin/ManageHome'));
const AdminBugReports = lazy(() => import('./pages/admin/AdminBugReports'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminActivity = lazy(() => import('./pages/admin/AdminActivity'));
const BatchControl = lazy(() => import('./pages/admin/Inventory/BatchControl'));
const WasteCalculator = lazy(() => import('./pages/admin/Inventory/WasteCalculator'));
const StockSettings = lazy(() => import('./pages/admin/Inventory/StockSettings'));
const MovementHistory = lazy(() => import('./pages/admin/Inventory/MovementHistory'));
const ApprovalQueue = lazy(() => import('./pages/admin/Vetting/ApprovalQueue'));
const VendorPerformance = lazy(() => import('./pages/admin/Vetting/VendorPerformance'));
const SalesHeatMap = lazy(() => import('./pages/admin/Analytics/SalesHeatMap'));
const RotationRanking = lazy(() => import('./pages/admin/Analytics/RotationRanking'));
const ReturnsAnalysis = lazy(() => import('./pages/admin/Analytics/ReturnsAnalysis'));
const RevenueProjection = lazy(() => import('./pages/admin/Analytics/RevenueProjection'));
const TicketManagement = lazy(() => import('./pages/admin/Support/TicketManagement'));
const CouponCreation = lazy(() => import('./pages/admin/Support/CouponCreation'));
const Contact = lazy(() => import('./pages/Contact'));

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
                <Route path="/" element={<Home />} />
                    <Route path="/catalogo" element={<Catalog />} />
                    <Route path="/producto/:id" element={<ProductDetail />} />
                    <Route path="/carrito" element={<Cart />} />
                    <Route path="/nosotros" element={<About />} />
                    <Route path="/contacto" element={<Suspense fallback={<TruckLoader text="Cargando..." />}><Contact /></Suspense>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Register />} />
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
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/confirmacion"
                        element={
                            <ProtectedRoute>
                                <OrderConfirmation />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cliente"
                        element={
                            <ProtectedRoute roles="client">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ClientDashboard />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/perfil"
                        element={
                            <ProtectedRoute roles="client">
                                <Suspense fallback={<DashboardFallback />}>
                                    <Profile />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cliente/pedidos"
                        element={
                            <ProtectedRoute roles="client">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ClientOrderHistory />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/pedidos/rastreo"
                        element={
                            <ProtectedRoute roles="client">
                                <Suspense fallback={<DashboardFallback />}>
                                    <OrderTracking />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cliente/coleccion"
                        element={
                            <ProtectedRoute roles="client">
                                <Suspense fallback={<DashboardFallback />}>
                                    <Wishlist />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/coleccion/calculadora"
                        element={
                            <ProtectedRoute roles="client">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ProjectCalculator />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cliente/soporte/nuevo"
                        element={
                            <ProtectedRoute roles="client">
                                <Suspense fallback={<DashboardFallback />}>
                                    <NewReport />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/soporte/tickets"
                        element={
                            <ProtectedRoute roles="client">
                                <Suspense fallback={<DashboardFallback />}>
                                    <MyTickets />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cliente/configuracion"
                        element={
                            <ProtectedRoute roles="client">
                                <Suspense fallback={<DashboardFallback />}>
                                    <Profile />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/configuracion/direcciones"
                        element={
                            <ProtectedRoute roles="client">
                                <Suspense fallback={<DashboardFallback />}>
                                    <AddressBook />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/vendedor"
                        element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <Suspense fallback={<DashboardFallback />}>
                                    <SellerProducts />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/productos"
                        element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <Suspense fallback={<DashboardFallback />}>
                                    <SellerProducts />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/pedidos"
                        element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <Suspense fallback={<DashboardFallback />}>
                                    <SellerOrders />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/stock"
                        element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <Suspense fallback={<DashboardFallback />}>
                                    <StockAlerts />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/configuracion"
                        element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <Suspense fallback={<DashboardFallback />}>
                                    <Profile />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <AdminOverview />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/usuarios"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <UserManagement />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/vendedores"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <SellerMetrics />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/clientes"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ClientMetrics />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/productos"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <AdminProducts />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/carrusel"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ManageCarousel />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/home"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ManageHome />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/reportes"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <AdminBugReports />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/actividad"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <AdminActivity />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/inventario/lotes"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <BatchControl />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/inventario/merma"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <WasteCalculator />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/inventario/alertas"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <StockSettings />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/inventario/historial"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <MovementHistory />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/moderacion/aprobacion"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ApprovalQueue />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/moderacion/vendedores"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <VendorPerformance />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/analytics/mapa-ventas"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <SalesHeatMap />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/analytics/rotacion"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <RotationRanking />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/analytics/devoluciones"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <ReturnsAnalysis />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/analytics/proyeccion"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <RevenueProjection />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/soporte/tickets"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <TicketManagement />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/soporte/cupones"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <CouponCreation />
                                </Suspense>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/configuracion"
                        element={
                            <ProtectedRoute roles="admin">
                                <Suspense fallback={<DashboardFallback />}>
                                    <SystemConfig />
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
                <ScrollToTop />
                <SpotlightCursor />
                <SmoothScrollProvider>
                    <AppRoutes />
                </SmoothScrollProvider>
            </Router>
        </AppProviders>
    );
}

export default App;
