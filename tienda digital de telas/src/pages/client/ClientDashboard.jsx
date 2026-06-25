/**
 * ClientDashboard.jsx — Panel Principal del Cliente
 * ===================================================
 * Este componente es la página de inicio que ve el cliente al iniciar sesión.
 * Muestra un resumen completo de su actividad: pedidos, favoritos, inversión y accesos rápidos.
 */

import React from 'react';
import { Link } from 'react-router-dom';

// Íconos de lucide-react
import {
  ShoppingBag,
  Heart,
  Settings,
  Headset,
  Truck,
  Scissors,
  ArrowRight,
  DollarSign,
  Package,
  Clock,
  Star,
  Sparkles
} from 'lucide-react';

// Layout y animación globales del dashboard
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AnimatedPage from '../../components/AnimatedPage';

// Tarjeta de métrica reutilizable
import MetricCard from '../../components/dashboard/MetricCard';

// Links de navegación lateral específicos del cliente
import clientDashboardLinks from '../../data/clientDashboardLinks';

// Contextos globales de la aplicación
import { useMetrics } from '../../context/MetricsContext';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';

// Utilidad de formato de moneda
import { formatCurrency } from '../../utils/formatters';

// ---------------------------------------------------------------------------
// Función auxiliar: devuelve el saludo según la hora del día
// ---------------------------------------------------------------------------
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '¡Buenos días';
  if (hour < 18) return '¡Buenas tardes';
  return '¡Buenas noches';
}

// ---------------------------------------------------------------------------
// Función auxiliar: devuelve clases de color para el badge de estado del pedido
// ---------------------------------------------------------------------------
function getStatusStyle(status) {
  const map = {
    delivered:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
    shipped:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50',
    packed:     'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50',
    cutting:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
    paid:       'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50',
    pending:    'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50',
    cancelled:  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50',
  };
  return map[status] || map.pending;
}

// ---------------------------------------------------------------------------
// Función auxiliar: traduce el status al español para mostrarlo en la UI
// ---------------------------------------------------------------------------
function translateStatus(status) {
  const labels = {
    delivered: 'Entregado',
    shipped:   'Enviado',
    packed:    'Empacado',
    cutting:   'En corte',
    paid:      'Pagado',
    pending:   'Pendiente',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
}

// ===========================================================================
// COMPONENTE PRINCIPAL
// ===========================================================================
/**
 * Componente principal del panel de cliente.
 * Muestra el resumen de la actividad del cliente, incluyendo sus métricas
 * de pedidos, favoritos, inversión total, y un listado de actividad reciente.
 *
 * @component
 * @returns {JSX.Element} Vista del Dashboard del Cliente
 */
function ClientDashboard() {
  const { user } = useAuth();
  const { getOrdersByClient, supportTickets = [], wishlistItems = [] } = useMetrics();
  const { products } = useProducts();

  // ── Derivación de datos del cliente ───────────────────────────────────────
  const allClientOrders = (getOrdersByClient(user?.id) || [])
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const clientOrders = allClientOrders.slice(0, 5);
  const pendingOrders = allClientOrders.filter(o =>
    ['paid', 'cutting', 'packed', 'shipped'].includes(o.status)
  );

  const totalSpent = allClientOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const userTickets = supportTickets.filter(
    t => String(t.clientId) === String(user?.id)
  );
  const openTickets = userTickets.filter(
    t => ['open', 'in_progress'].includes(t.status)
  ).length;

  const wishlistCount = wishlistItems.length;

  // Productos recomendados (simulados tomando 3 al azar o los primeros 3)
  const recommendedProducts = products?.filter(p => p.status === 'active').slice(0, 3) || [];

  // ── Configuración de acciones rápidas ─────────────────────────────────────
  const quickActions = [
    {
      title:       'Mis Pedidos',
      description: 'Historial de compras',
      icon:        ShoppingBag,
      link:        '/cliente/pedidos',
      iconBg:      'bg-orange-100 dark:bg-orange-900/40',
      iconColor:   'text-orange-600 dark:text-orange-400',
      stats:       allClientOrders.length > 0 ? `${allClientOrders.length} compras` : 'Sin pedidos',
      statusColor: 'text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    },
    {
      title:       'Lista de Deseos',
      description: 'Tus telas favoritas',
      icon:        Heart,
      link:        '/cliente/coleccion',
      iconBg:      'bg-rose-100 dark:bg-rose-900/40',
      iconColor:   'text-rose-600 dark:text-rose-400',
      stats:       wishlistCount > 0 ? `${wishlistCount} telas` : 'Vacía',
      statusColor: 'text-rose-700 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400',
    },
    {
      title:       'Calculadora',
      description: 'Estima tu metraje',
      icon:        Scissors,
      link:        '/cliente/coleccion/calculadora',
      iconBg:      'bg-violet-100 dark:bg-violet-900/40',
      iconColor:   'text-violet-600 dark:text-violet-400',
      stats:       'Herramienta',
      statusColor: 'text-violet-700 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400',
    },
    {
      title:       'Soporte',
      description: 'Tickets y ayuda',
      icon:        Headset,
      link:        '/cliente/soporte/tickets',
      iconBg:      'bg-blue-100 dark:bg-blue-900/40',
      iconColor:   'text-blue-600 dark:text-blue-400',
      stats:       openTickets > 0 ? `${openTickets} activo(s)` : 'Al día',
      alert:       openTickets > 0,
      statusColor: openTickets > 0 ? 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400' : 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    },
  ];

  return (
    <DashboardLayout
      title={`${getGreeting()}, ${user?.name?.split(' ')[0] || 'Cliente'}!`}
      links={clientDashboardLinks}
    >
      <AnimatedPage>

        {/* ================================================================
            BANNER DE BIENVENIDA - REDISEÑADO
        ================================================================ */}
        <div className="relative mb-8 rounded-3xl overflow-hidden shadow-lg shadow-orange-500/10">
          {/* Fondo con gradiente premium cálido */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-rose-400 to-violet-500" />
          
          {/* Orbs decorativos */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none mix-blend-overlay" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl pointer-events-none mix-blend-overlay" />

          {/* Contenido del banner */}
          <div className="relative p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
                <Sparkles className="w-4 h-4 text-yellow-100" />
                <span className="text-white text-[11px] font-bold uppercase tracking-widest">
                  Panel de Cliente
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-white tracking-tight drop-shadow-sm">
                Bienvenido a tu espacio
              </h2>
              <p className="text-white/95 text-sm md:text-base font-medium max-w-lg leading-relaxed drop-shadow-sm">
                Descubre nuevas texturas, haz seguimiento de tus pedidos y administra tus proyectos textiles en un solo lugar.
              </p>
            </div>

            <Link
              to="/catalogo"
              className="px-6 py-3.5 bg-white text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 group border border-white/50"
            >
              Explorar Catálogo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ================================================================
            TARJETAS DE ESTADÍSTICAS (KPIs)
        ================================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            label="Total Pedidos"
            value={allClientOrders.length}
            icon={ShoppingBag}
            color="orange"
            subtitle="Desde tu registro"
          />
          <MetricCard
            label="Pedidos Activos"
            value={pendingOrders.length}
            icon={Truck}
            color="violet"
            trendValue={pendingOrders.length > 0 ? 'En camino' : null}
            trend="up"
            subtitle="Pago, corte, envío"
          />
          <MetricCard
            label="Favoritos"
            value={String(wishlistCount).padStart(2, '0')}
            icon={Heart}
            color="rose"
            subtitle="Telas guardadas"
          />
          <MetricCard
            label="Inversión Total"
            value={formatCurrency(totalSpent)}
            icon={DollarSign}
            color="emerald"
            subtitle="Acumulado"
          />
        </div>

        {/* ================================================================
            ACCIONES RÁPIDAS
        ================================================================ */}
        <div className="flex items-center gap-2 mb-5">
          <Settings className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-gray-900 dark:text-white tracking-tight">Acceso Rápido</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className="card p-5 group hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden"
              >
                <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${action.iconBg.split(' ')[0]}`} />
                
                <div className={`w-12 h-12 rounded-2xl ${action.iconBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-sm relative z-10`}>
                  <Icon className={`w-6 h-6 ${action.iconColor}`} />
                </div>

                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1 relative z-10">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed relative z-10 font-medium">
                  {action.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md ${action.statusColor}`}>
                    {action.stats}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${action.iconBg} opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2`}>
                    <ArrowRight className={`w-3 h-3 ${action.iconColor}`} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ================================================================
            SECCIÓN INFERIOR: Pedidos Recientes + Recomendaciones
        ================================================================ */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Pedidos Recientes (2 columnas) ─────────────────── */}
          <div className="card lg:col-span-2 overflow-hidden flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white tracking-tight">Actividad Reciente</h3>
              </div>
              <Link
                to="/cliente/pedidos"
                className="text-sm font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 flex items-center gap-1 group bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Ver historial
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="flex-1 p-2">
              {clientOrders.length > 0 ? (
                <div className="space-y-2">
                  {clientOrders.map(order => (
                    <Link
                      key={order.id}
                      to={`/cliente/pedidos/rastreo?id=${order.id}`}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Package className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            Pedido #{String(order.id).padStart(4, '0')}
                          </p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            {new Date(order.date).toLocaleDateString('es-CO', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })} · {order.items?.length || 0} artículo(s)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                            {formatCurrency(order.total)}
                          </p>
                          <div className="mt-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${getStatusStyle(order.status)}`}>
                              {translateStatus(order.status)}
                            </span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                           <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-1">
                    Aún no tienes pedidos
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    Tus compras recientes aparecerán aquí
                  </p>
                  <Link
                    to="/catalogo"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Explorar catálogo <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Recomendados / Perfil (1 columna) ──────────────────── */}
          <div className="space-y-6">
            
            {/* Tarjeta de Perfil Compacta */}
            <div className="card p-5 flex items-center gap-4 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-orange-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                {(user?.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                  {user?.name || 'Cliente Demo'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'cliente@ejemplo.com'}
                </p>
              </div>
              <Link to="/cliente/configuracion" className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
                <Settings className="w-4 h-4 text-slate-500" />
              </Link>
            </div>

            {/* Recomendados para ti */}
            <div className="card overflow-hidden flex flex-col h-[calc(100%-5.5rem)]">
              <div className="p-5 flex items-center gap-3 border-b border-gray-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <Star className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white tracking-tight">Recomendados</h3>
              </div>
              
              <div className="p-4 flex-1 flex flex-col gap-3">
                {recommendedProducts.length > 0 ? (
                  recommendedProducts.map(product => (
                    <Link 
                      key={product.id} 
                      to={`/catalogo/producto/${product.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate mb-1">
                          {product.category}
                        </p>
                        <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                     <p className="text-sm text-gray-500 font-medium">No hay recomendaciones por ahora</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                <Link to="/catalogo" className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                  Ver todo el catálogo <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </AnimatedPage>
    </DashboardLayout>
  );
}

export default ClientDashboard;
