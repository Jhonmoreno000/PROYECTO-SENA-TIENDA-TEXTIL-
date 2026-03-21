import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProviders } from './components/AppProviders';
import { ProtectedRoute, ScrollToTop } from './components';

// Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// Client Dashboard - Main
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProfile from './pages/client/Profile';
import ClientOrderHistory from './pages/client/OrderHistory';

// Client Dashboard - Orders
import OrderHistoryNew from './pages/client/Orders/OrderHistory';
import OrderTracking from './pages/client/Orders/OrderTracking';

// Client Dashboard - Collection
import Wishlist from './pages/client/Collection/Wishlist';
import ProjectCalculator from './pages/client/Collection/ProjectCalculator';

// Client Dashboard - Support
import NewReport from './pages/client/Support/NewReport';
import MyTickets from './pages/client/Support/MyTickets';

// Client Dashboard - Settings
import Profile from './pages/client/Settings/Profile';
import AddressBook from './pages/client/Settings/AddressBook';

// Seller Dashboard
import SellerProducts from './pages/seller/SellerDashboard';
import SellerOrders from './pages/seller/SellerOrders';
import StockAlerts from './pages/seller/StockAlerts';

// Admin Dashboard
import AdminOverview from './pages/admin/AdminOverview';
import UserManagement from './pages/admin/UserManagement';
import SellerMetrics from './pages/admin/SellerMetrics';
import ClientMetrics from './pages/admin/ClientMetrics';
import SystemConfig from './pages/admin/SystemConfig';
import ManageCarousel from './pages/admin/ManageCarousel';
import ManageHome from './pages/admin/ManageHome';
import AdminBugReports from './pages/admin/AdminBugReports';
import AdminProducts from './pages/admin/AdminProducts';

// Admin - Inventory Management
import BatchControl from './pages/admin/Inventory/BatchControl';
import WasteCalculator from './pages/admin/Inventory/WasteCalculator';
import StockSettings from './pages/admin/Inventory/StockSettings';
import MovementHistory from './pages/admin/Inventory/MovementHistory';

// Admin - Vendor Moderation
import ApprovalQueue from './pages/admin/Vetting/ApprovalQueue';
import VendorPerformance from './pages/admin/Vetting/VendorPerformance';

// Admin - Analytics
import SalesHeatMap from './pages/admin/Analytics/SalesHeatMap';
import RotationRanking from './pages/admin/Analytics/RotationRanking';
import ReturnsAnalysis from './pages/admin/Analytics/ReturnsAnalysis';
import RevenueProjection from './pages/admin/Analytics/RevenueProjection';

// Admin - Support
import TicketManagement from './pages/admin/Support/TicketManagement';
import CouponCreation from './pages/admin/Support/CouponCreation';


// Reports
import BugReport from './pages/BugReport';

// Payment
import Payment from './pages/payment/Payment';

function AppRoutes() {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/catalogo" element={<Catalog />} />
                    <Route path="/producto/:id" element={<ProductDetail />} />
                    <Route path="/carrito" element={<Cart />} />
                    <Route path="/nosotros" element={<About />} />
                    <Route path="/contacto" element={<Contact />} />
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

                    {/* Client Dashboard */}
                    <Route
                        path="/cliente"
                        element={
                            <ProtectedRoute roles="client">
                                <ClientDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/perfil"
                        element={
                            <ProtectedRoute roles="client">
                                <ClientProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/mis-pedidos"
                        element={
                            <ProtectedRoute roles="client">
                                <ClientOrderHistory />
                            </ProtectedRoute>
                        }
                    />

                    {/* Client - Orders */}
                    <Route
                        path="/cliente/pedidos"
                        element={
                            <ProtectedRoute roles="client">
                                <OrderHistoryNew />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/pedidos/rastreo"
                        element={
                            <ProtectedRoute roles="client">
                                <OrderTracking />
                            </ProtectedRoute>
                        }
                    />

                    {/* Client - Collection */}
                    <Route
                        path="/cliente/coleccion"
                        element={
                            <ProtectedRoute roles="client">
                                <Wishlist />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/coleccion/calculadora"
                        element={
                            <ProtectedRoute roles="client">
                                <ProjectCalculator />
                            </ProtectedRoute>
                        }
                    />

                    {/* Client - Support */}
                    <Route
                        path="/cliente/soporte/nuevo"
                        element={
                            <ProtectedRoute roles="client">
                                <NewReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/soporte/tickets"
                        element={
                            <ProtectedRoute roles="client">
                                <MyTickets />
                            </ProtectedRoute>
                        }
                    />

                    {/* Client - Settings */}
                    <Route
                        path="/cliente/configuracion"
                        element={
                            <ProtectedRoute roles="client">
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente/configuracion/direcciones"
                        element={
                            <ProtectedRoute roles="client">
                                <AddressBook />
                            </ProtectedRoute>
                        }
                    />

                    {/* Seller Dashboard */}
                    <Route
                        path="/vendedor"
                        element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <SellerProducts />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/productos"
                        element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <SellerProducts />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/pedidos"
                        element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <SellerOrders />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/stock"
                        element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <StockAlerts />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/vendedor/configuracion"
                        element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Dashboard */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute roles="admin">
                                <AdminOverview />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/usuarios"
                        element={
                            <ProtectedRoute roles="admin">
                                <UserManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/vendedores"
                        element={
                            <ProtectedRoute roles="admin">
                                <SellerMetrics />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/clientes"
                        element={
                            <ProtectedRoute roles="admin">
                                <ClientMetrics />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/productos"
                        element={
                            <ProtectedRoute roles="admin">
                                <AdminProducts />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/carrusel"
                        element={
                            <ProtectedRoute roles="admin">
                                <ManageCarousel />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/home"
                        element={
                            <ProtectedRoute roles="admin">
                                <ManageHome />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/reportes"
                        element={
                            <ProtectedRoute roles="admin">
                                <AdminBugReports />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin - Inventory Management */}
                    <Route
                        path="/admin/inventario/lotes"
                        element={
                            <ProtectedRoute roles="admin">
                                <BatchControl />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/inventario/merma"
                        element={
                            <ProtectedRoute roles="admin">
                                <WasteCalculator />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/inventario/alertas"
                        element={
                            <ProtectedRoute roles="admin">
                                <StockSettings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/inventario/historial"
                        element={
                            <ProtectedRoute roles="admin">
                                <MovementHistory />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin - Vendor Moderation */}
                    <Route
                        path="/admin/moderacion/aprobacion"
                        element={
                            <ProtectedRoute roles="admin">
                                <ApprovalQueue />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/moderacion/vendedores"
                        element={
                            <ProtectedRoute roles="admin">
                                <VendorPerformance />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin - Analytics */}
                    <Route
                        path="/admin/analytics/mapa-ventas"
                        element={
                            <ProtectedRoute roles="admin">
                                <SalesHeatMap />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/analytics/rotacion"
                        element={
                            <ProtectedRoute roles="admin">
                                <RotationRanking />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/analytics/devoluciones"
                        element={
                            <ProtectedRoute roles="admin">
                                <ReturnsAnalysis />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/analytics/proyeccion"
                        element={
                            <ProtectedRoute roles="admin">
                                <RevenueProjection />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin - Support */}
                    <Route
                        path="/admin/soporte/tickets"
                        element={
                            <ProtectedRoute roles="admin">
                                <TicketManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/soporte/cupones"
                        element={
                            <ProtectedRoute roles="admin">
                                <CouponCreation />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/configuracion"
                        element={
                            <ProtectedRoute roles="admin">
                                <SystemConfig />
                            </ProtectedRoute>
                        }
                    />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <AppProviders>
            <Router>
                <ScrollToTop />
                <AppRoutes />
            </Router>
        </AppProviders>
    );
}

export default App;

