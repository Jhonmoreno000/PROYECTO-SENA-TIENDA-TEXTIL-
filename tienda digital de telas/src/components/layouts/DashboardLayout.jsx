/**
 * DashboardLayout.jsx — Layout principal de los dashboards (Admin, Vendedor, Cliente)
 *
 * Este componente define la estructura visual compartida para todos los paneles
 * de administración. Incluye:
 * - Sidebar con navegación jerárquica (nodos padre e hijo)
 * - Modo "Rail" (sidebar colapsado) para más espacio de trabajo
 * - Selector de tienda/sucursal (TenantSelector)
 * - Sistema de favoritos (pinned items) para acceso rápido
 * - Command Palette (Ctrl+K) para búsqueda rápida
 * - Header móvil con menú hamburguesa
 * - Perfil de usuario y botones de acción en el footer del sidebar
 *
 * Dependencias de íconos (lucide-react):
 * - Home          → enlace a la tienda (reemplaza MdHome)
 * - LogOut        → cerrar sesión (reemplaza MdLogout)
 * - Menu          → menú hamburguesa (reemplaza MdMenu)
 * - ChevronRight  → expandir/colapsar nodos (reemplaza MdChevronRight)
 * - Search        → barra de búsqueda (reemplaza MdSearch)
 * - Pin           → fijar elementos favoritos (reemplaza MdPushPin)
 * - MoreVertical  → menú de opciones (reemplaza MdMoreVert)
 * - Check         → indicador de selección (reemplaza MdCheck)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
    Home, LogOut, Menu, ChevronRight, Search, Pin, MoreVertical, Check,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuth } from '../../context/AuthContext';
import CommandPalette from '../dashboard/CommandPalette';

gsap.registerPlugin(useGSAP);

/* ──────────────────────────────────────────────
   Tenant / Store Selector
   ────────────────────────────────────────────── */
/**
 * TenantSelector — Selector de tienda/sucursal
 * Permite cambiar entre diferentes tiendas o sucursales.
 * Se muestra en la parte superior del sidebar.
 *
 * @param {boolean} isRailMode - Si el sidebar está en modo colapsado (rail)
 */
function TenantSelector({ isRailMode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState('Tienda Principal');
    const tenants = ['Tienda Principal', 'Sucursal Norte', 'Sucursal Sur', 'Bodega Central'];

    return (
        <div className="relative p-4 border-b border-gray-200/20 dark:border-slate-700/20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-2 rounded-none hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${isRailMode ? 'justify-center' : ''
                    }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Avatar de la tienda con la inicial */}
                    <div className="w-9 h-9 rounded-none flex items-center justify-center text-white bg-primary-600 font-bold shrink-0 border border-primary-700">
                        {selectedTenant.charAt(0)}
                    </div>
                    {!isRailMode && (
                        <div className="text-left truncate">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {selectedTenant}
                            </p>
                            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">Enterprise</p>
                        </div>
                    )}
                </div>
                {/* MoreVertical: menú de opciones del tenant (reemplaza MdMoreVert) */}
                {!isRailMode && <MoreVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
            </button>

            {/* Dropdown Menu para seleccionar tienda */}
            {isOpen && !isRailMode && (
                <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-none shadow-xl z-50 overflow-hidden animate-fade-in">
                    <div className="py-2">
                        {tenants.map(tenant => (
                            <button
                                key={tenant}
                                onClick={() => { setSelectedTenant(tenant); setIsOpen(false); }}
                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span className="text-sm font-medium">{tenant}</span>
                                {selectedTenant === tenant && <Check className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────
   Leaf node – simple link (no children)
   ────────────────────────────────────────────── */
/**
 * NavLeafNode — Enlace de navegación simple (sin hijos)
 * Renderiza un enlace individual del sidebar con soporte para:
 * - Estado activo con fondo primario
 * - Badges de notificación
 * - Botón de pin para agregar a favoritos
 * - Modo rail (colapsado)
 */
function NavLeafNode({ link, isActive, indent = false, isRailMode, onPinToggle, isPinned }) {
    const Icon = link.icon;
    const navigate = useNavigate();

    return (
        <div className="relative mx-2 my-0.5 group/navitem">
            {/* Contenedor principal que actúa como link */}
            <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 cursor-pointer ${indent && !isRailMode ? 'pl-9' : ''
                    } ${isRailMode ? 'justify-center px-0 py-3' : ''} ${isActive
                        ? 'text-primary-600 font-bold bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
                    } nav-item-anim`}
                title={isRailMode ? link.label : undefined}
                onClick={(e) => {
                    // Evitar navegación si se hizo clic en el botón de pin
                    if (e.target.closest('button.pin-btn')) return;
                    // Redirigir usando React Router
                    navigate(link.path);
                }}
            >
                <div className="relative flex items-center justify-center shrink-0">
                    {/* Ícono del enlace */}
                    {Icon && <Icon className={`w-5 h-5 transition-transform ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`} />}
                    {/* Badge en modo rail */}
                    {isRailMode && link.badge && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 border-none">
                            {link.badge > 99 ? '99+' : link.badge}
                        </span>
                    )}
                </div>

                {!isRailMode && (
                    <>
                        <span className="text-sm flex-1 truncate">{link.label}</span>
                        
                        {/* Contenedor derecho para Badge y botón Pin */}
                        <div className="flex items-center gap-1 shrink-0 relative">
                            {link.badge && (
                                <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 px-1.5 text-xs font-bold text-red-600 dark:text-red-400 transition-all duration-200 ${onPinToggle ? 'group-hover/navitem:opacity-0 group-hover/navitem:scale-75' : ''}`}>
                                    {link.badge}
                                </span>
                            )}
                            
                            {onPinToggle && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onPinToggle(link);
                                    }}
                                    className={`pin-btn absolute right-0 p-1 rounded-md transition-all duration-200 opacity-0 scale-75 group-hover/navitem:opacity-100 group-hover/navitem:scale-100 ${isActive ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-slate-700 dark:hover:text-gray-200'}`}
                                    title={isPinned ? "Desfijar" : "Fijar a Favoritos"}
                                    aria-label="Fijar"
                                >
                                    <Pin className={`w-4 h-4 ${isPinned ? (isActive ? 'text-white' : 'text-primary-500') : ''}`} />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────
   Parent node – collapsible accordion item
   ────────────────────────────────────────────── */
/**
 * NavParentNode — Nodo padre de navegación colapsable
 * Renderiza un grupo de enlaces con funcionalidad de acordeón.
 * Al hacer clic se expande/contrae para mostrar los enlaces hijos.
 */
function NavParentNode({ link, isOpen, onToggle, pathname, isRailMode, pinnedItems, togglePin }) {
    const Icon = link.icon;
    const contentRef = useRef(null);
    const hasActiveChild = link.children?.some((child) => pathname === child.path);

    const isFirstRender = useRef(true);

    // Animación del acordeón con GSAP
    useGSAP(() => {
        if (isRailMode) return;
        
        if (isFirstRender.current) {
            isFirstRender.current = false;
            // Configurar estado inicial sin animar para evitar parpadeos
            gsap.set(contentRef.current, {
                height: isOpen ? "auto" : 0,
                opacity: isOpen ? 1 : 0,
                display: isOpen ? "block" : "none"
            });
            return;
        }

        if (isOpen) {
            gsap.to(contentRef.current, {
                height: "auto",
                opacity: 1,
                duration: 0.4,
                ease: "power2.out",
                display: "block"
            });
        } else {
            gsap.to(contentRef.current, {
                height: 0,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    if (contentRef.current) contentRef.current.style.display = "none";
                }
            });
        }
    }, { dependencies: [isOpen, isRailMode] });

    // Sumar badges de todos los hijos
    const totalBadges = link.children?.reduce((acc, child) => acc + (child.badge || 0), 0);

    return (
        <div className="my-[2px] relative group/parent">
            {/* Línea indicadora cuando un hijo está activo */}
            {hasActiveChild && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-[3px] bg-gray-200 dark:bg-slate-700 rounded-r-full" />
            )}

            <button
                onClick={onToggle}
                className={`w-full flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-none transition-all duration-300 group ${isRailMode ? 'justify-center mx-1 px-0 py-3' : ''
                    } ${hasActiveChild
                        ? 'text-primary-600 dark:text-primary-400 font-semibold bg-transparent'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
                    } nav-item-anim`}
                title={isRailMode ? link.label : undefined}
            >
                <div className="relative flex items-center justify-center shrink-0">
                    {Icon && <Icon className={`w-5 h-5 transition-transform ${hasActiveChild ? 'scale-110 drop-shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`} />}
                    {isRailMode && totalBadges > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 line-clamp-1">
                            {totalBadges}
                        </span>
                    )}
                </div>

                {!isRailMode && (
                    <>
                        <span className="text-sm flex-1 text-left truncate">{link.label}</span>
                        {/* Badge total de hijos (solo visible cuando está colapsado) */}
                        {totalBadges > 0 && !isOpen && (
                            <span className="ml-auto mr-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                {totalBadges}
                            </span>
                        )}
                        {/* ChevronRight: flecha que rota 90° al expandir (reemplaza MdChevronRight) */}
                        <ChevronRight
                            className={`w-5 h-5 transition-transform duration-300 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 ${isOpen ? 'rotate-90' : 'rotate-0'
                                }`}
                        />
                    </>
                )}
            </button>

            {/* Hijos: animación de expandir/colapsar con GSAP */}
            {!isRailMode && (
                <div
                    ref={contentRef}
                    className="overflow-hidden"
                    style={{ display: isOpen ? 'block' : 'none', height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                >
                    <div className="mt-1 space-y-0.5 relative before:absolute before:left-[1.35rem] before:block before:h-full before:w-[1px] before:bg-gray-200 dark:before:bg-slate-700 before:content-['']">
                        {link.children?.map((child) => (
                            <NavLeafNode
                                key={child.path}
                                link={child}
                                isActive={pathname === child.path}
                                indent
                                isRailMode={isRailMode}
                                onPinToggle={togglePin}
                                isPinned={pinnedItems.some(item => item.path === child.path)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────
   Main layout component
   ────────────────────────────────────────────── */
/**
 * DashboardLayout — Layout principal para los paneles de administración
 * Proporciona la estructura visual compartida con sidebar, header móvil y área de contenido.
 *
 * @param {ReactNode} children - Contenido de la página actual
 * @param {string} title - Título del dashboard actual
 * @param {Array} links - Array de enlaces de navegación del sidebar
 * @param {string} subtitle - Subtítulo opcional
 */
function DashboardLayout({ children, title, links, subtitle }) {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);


    // Estado del modo Rail (sidebar colapsado)
    const [isRailMode, setIsRailMode] = useState(false);

    // Estado de elementos fijados/favoritos
    const [pinnedItems, setPinnedItems] = useState([]);

    // Referencias para animaciones GSAP
    const sidebarRef = useRef(null);
    const navRef = useRef(null);
    const containerRef = useRef(null);

    // Estado del Command Palette (Ctrl+K)
    const [cmdOpen, setCmdOpen] = useState(false);

    // Control de nodos padre abiertos/cerrados (acordeón)
    const [openNodes, setOpenNodes] = useState(() => {
        const initialOpen = {};
        links.forEach((link) => {
            if (link.children?.some((child) => location.pathname === child.path)) {
                initialOpen[link.label] = true;
            }
        });
        return initialOpen;
    });

    // Animación de entrada escalonada (Stagger) - Solo al montar por primera vez
    useGSAP(() => {
        const items = navRef.current.querySelectorAll('.nav-item-anim');
        gsap.from(items, {
            x: -20,
            opacity: 0,
            stagger: 0.05,
            duration: 0.6,
            ease: "back.out(1.7)",
            clearProps: "all"
        });
    }, { dependencies: [], scope: containerRef });

    // Animación suave de transición Rail Mode
    useGSAP(() => {
        if (!sidebarRef.current) return;
        
        gsap.to(sidebarRef.current, {
            width: isRailMode ? 80 : 256,
            duration: 0.4,
            ease: "power3.inOut"
        });
    }, { dependencies: [isRailMode], scope: containerRef });

    // Auto-expandir nodos padre cuando la ruta activa cambia
    useEffect(() => {
        setOpenNodes((prev) => {
            const next = { ...prev };
            links.forEach((link) => {
                if (link.children?.some((child) => location.pathname === child.path)) {
                    next[link.label] = true;
                }
            });
            return next;
        });
    }, [location.pathname, links]);

    // Listener de teclas para abrir el Command Palette con Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Alternar apertura/cierre de nodos padre
    const toggleNode = (label) => {
        // En rail mode, al hacer clic en un padre, expandir el sidebar
        if (isRailMode) setIsRailMode(false);
        setOpenNodes((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    // Agregar/quitar elementos de favoritos (pinned)
    const togglePinItem = (link) => {
        setPinnedItems(prev => {
            if (prev.some(item => item.path === link.path)) {
                return prev.filter(item => item.path !== link.path);
            } else {
                return [...prev, link];
            }
        });
    };

    // Ancho del sidebar según el modo
    const sidebarWidth = isRailMode ? 'w-20' : 'w-64';

    return (
        <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-slate-900 flex font-sans">
            {/* Command Palette — búsqueda global accesible con Ctrl+K */}
            <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} links={links} />

            {/* Overlay del sidebar en móvil */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ===== SIDEBAR ===== */}
            <aside
                ref={sidebarRef}
                className={`
                    fixed lg:static inset-y-0 left-0 z-[70] bg-white/25 dark:bg-slate-900/25 backdrop-blur-2xl border-r border-gray-200/20 dark:border-slate-800/20 flex flex-col transition-[transform] duration-300 ease-in-out shadow-lg shrink-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
                style={{ width: isRailMode ? 80 : 256 }}
            >
                {/* Selector de tienda/sucursal */}
                <TenantSelector isRailMode={isRailMode} />

                {/* Barra de búsqueda / Disparador del Command Palette */}
                <div className="px-3 py-3 border-b border-gray-200/20 dark:border-slate-800/20">
                    <button
                        onClick={() => setCmdOpen(true)}
                        className={`w-full flex items-center ${isRailMode ? 'justify-center p-2' : 'px-3 py-2 gap-2'} bg-white/20 dark:bg-slate-800/30 hover:bg-white/30 dark:hover:bg-slate-700/40 text-gray-500 rounded-none transition-all shadow-inner border border-white/10 dark:border-slate-700/20 backdrop-blur-sm`}
                        title={isRailMode ? "Buscar (Ctrl+K)" : undefined}
                    >
                        {/* Search: ícono de búsqueda (reemplaza MdSearch) */}
                        <Search className="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400" />
                        {!isRailMode && (
                            <div className="flex-1 flex items-center justify-between text-sm">
                                <span>Buscar...</span>
                                <kbd className="hidden sm:inline-block text-[10px] font-mono border border-gray-300 dark:border-slate-600 rounded px-1.5 py-0.5 bg-white dark:bg-slate-900">
                                    Ctrl+K
                                </kbd>
                            </div>
                        )}
                    </button>
                </div>

                {/* ===== NAVEGACIÓN DEL SIDEBAR ===== */}
                <nav ref={navRef} className="flex-1 overflow-y-auto scrollbar-hide py-3">
                    {/* Sección de Favoritos (elementos fijados) */}
                    {pinnedItems.length > 0 && (
                        <div className="mb-4">
                            {!isRailMode && (
                                <p className="px-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                                    Favoritos
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {pinnedItems.map((item) => (
                                    <NavLeafNode
                                        key={`pinned-${item.path}`}
                                        link={item}
                                        isActive={location.pathname === item.path}
                                        isRailMode={isRailMode}
                                        onPinToggle={togglePinItem}
                                        isPinned={true}
                                    />
                                ))}
                            </div>
                            {!isRailMode && <div className="mx-4 my-3 border-b border-gray-200 dark:border-slate-800" />}
                        </div>
                    )}

                    {/* Sección de enlaces principales */}
                    {!isRailMode && (
                        <p className="px-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                            Menú Principal
                        </p>
                    )}
                    <div className="space-y-0.5 pb-2">
                        {links.map((link) => {
                            // Si el enlace tiene hijos, renderizar como nodo padre (acordeón)
                            if (link.children && link.children.length > 0) {
                                return (
                                    <NavParentNode
                                        key={link.label}
                                        link={link}
                                        isOpen={!!openNodes[link.label]}
                                        onToggle={() => toggleNode(link.label)}
                                        pathname={location.pathname}
                                        isRailMode={isRailMode}
                                        pinnedItems={pinnedItems}
                                        togglePin={togglePinItem}
                                    />
                                );
                            }

                            // Si no tiene hijos, renderizar como enlace simple
                            return (
                                <NavLeafNode
                                    key={link.path}
                                    link={link}
                                    isActive={location.pathname === link.path}
                                    isRailMode={isRailMode}
                                    onPinToggle={togglePinItem}
                                    isPinned={pinnedItems.some((item) => item.path === link.path)}
                                />
                            );
                        })}
                    </div>
                </nav>

                {/* ===== FOOTER DEL SIDEBAR ===== */}
                <div className="p-3 border-t border-gray-200/20 dark:border-slate-800/20 flex flex-col gap-2 bg-white/10 dark:bg-slate-900/10 backdrop-blur-sm">
                    {/* Perfil del usuario */}
                    <div className={`p-2 flex items-center gap-3 rounded-none border border-white/15 dark:border-slate-700/20 bg-white/20 dark:bg-slate-800/30 shadow-sm backdrop-blur-sm ${isRailMode ? 'justify-center bg-transparent border-transparent shadow-none p-0' : 'mx-1'}`}>
                        <div className="w-10 h-10 rounded-none bg-gray-200 dark:bg-slate-800 flex items-center justify-center text-gray-900 dark:text-gray-100 font-bold shrink-0 border border-gray-300 dark:border-slate-700">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        {!isRailMode && (
                            <div className="overflow-hidden flex-1">
                                <p className="font-bold text-sm truncate text-gray-900 dark:text-white leading-tight">{user?.name || 'Administrador'}</p>
                                <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold truncate capitalize">{user?.role || 'Admin'}</p>
                            </div>
                        )}
                    </div>

                    {/* Botones de acción: Inicio, Rail Toggle, Logout */}
                    <div className={`flex items-center justify-between mt-1 ${isRailMode ? 'flex-col gap-2' : ''}`}>
                         {/* Enlace de vuelta a la tienda */}
                        <Link
                            to="/"
                            className={`flex items-center justify-center p-2 rounded-none text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors group ${!isRailMode && 'flex-1 mx-1'}`}
                            title="Volver a la Tienda"
                        >
                            {/* Home: ícono de casa (reemplaza MdHome) */}
                            <Home className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
                        </Link>

                        {/* Botón para expandir/contraer el sidebar (modo Rail) */}
                        <button
                            onClick={() => setIsRailMode(!isRailMode)}
                            className={`hidden lg:flex items-center justify-center p-2 rounded-none text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${!isRailMode && 'flex-1 mx-1'}`}
                            title={isRailMode ? "Expandir" : "Contraer Sidebar"}
                        >
                            {/* Menu: ícono de hamburguesa para toggle del sidebar (reemplaza MdMenu) */}
                            <Menu className="w-6 h-6 shrink-0 text-gray-500 dark:text-gray-400" />
                        </button>

                        {/* Botón de cerrar sesión */}
                        <button
                            onClick={logout}
                            className={`flex items-center justify-center p-2 rounded-none text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group ${!isRailMode && 'flex-1 mx-1'}`}
                            title="Cerrar Sesión"
                        >
                            {/* LogOut: ícono de cerrar sesión (reemplaza MdLogout) */}
                            <LogOut className="w-6 h-6 shrink-0 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ===== ÁREA DE CONTENIDO PRINCIPAL ===== */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 dark:bg-slate-900/50">
                {/* Header móvil (solo visible en pantallas pequeñas) */}
                <header className="bg-white/25 dark:bg-slate-900/25 backdrop-blur-2xl border-b border-gray-200/20 dark:border-slate-800/20 h-16 flex items-center justify-between px-4 lg:hidden sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 transition-colors"
                        >
                            {/* Menu: ícono de hamburguesa para abrir sidebar móvil */}
                            <Menu className="w-7 h-7 text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="font-display font-bold text-lg text-gray-900 dark:text-white truncate">
                            {title}
                        </span>
                    </div>
                    {/* Botón de búsqueda en móvil */}
                    <button
                        onClick={() => setCmdOpen(true)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                        {/* Search: lupa de búsqueda en header móvil */}
                        <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </header>

                {/* Contenido de la página */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {/* Header de escritorio con título */}
                        <div className="hidden lg:flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    {title}
                                </h1>
                                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
                            </div>
                        </div>
                        {children}
                    </div>
                </main>
            </div>


        </div>
    );
}

export default DashboardLayout;
