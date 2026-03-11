import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiLogOut, FiMenu, FiChevronRight, FiSearch, FiPaperclip, FiMoreVertical, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import CommandPalette from '../dashboard/CommandPalette';

/* ──────────────────────────────────────────────
   Tenant / Store Selector
   ────────────────────────────────────────────── */
function TenantSelector({ isRailMode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState('Tienda Principal');
    const tenants = ['Tienda Principal', 'Sucursal Norte', 'Sucursal Sur', 'Bodega Central'];

    return (
        <div className="relative p-4 border-b border-gray-200 dark:border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${isRailMode ? 'justify-center' : ''
                    }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                        {selectedTenant.charAt(0)}
                    </div>
                    {!isRailMode && (
                        <div className="text-left truncate">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {selectedTenant}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">Plan Enterprise</p>
                        </div>
                    )}
                </div>
                {!isRailMode && <FiMoreVertical className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && !isRailMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        <div className="py-2">
                            {tenants.map(tenant => (
                                <button
                                    key={tenant}
                                    onClick={() => {
                                        setSelectedTenant(tenant);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <span className="text-sm font-medium">{tenant}</span>
                                    {selectedTenant === tenant && <FiCheck className="w-4 h-4 text-primary-600" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ──────────────────────────────────────────────
   Leaf node – simple link (no children)
   ────────────────────────────────────────────── */
function NavLeafNode({ link, isActive, indent = false, isRailMode, onPinToggle, isPinned }) {
    const Icon = link.icon;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="group relative flex items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Active Indicator Line */}
            {isActive && (
                <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1 bottom-1 w-1 bg-primary-600 rounded-r-full z-10"
                />
            )}

            <Link
                to={link.path}
                className={`flex-1 flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-lg transition-all duration-200 ${indent && !isRailMode ? 'pl-9' : ''
                    } ${isRailMode ? 'justify-center mx-1 px-0 py-3' : ''} ${isActive
                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                title={isRailMode ? link.label : undefined}
            >
                <div className="relative flex items-center justify-center shrink-0">
                    {Icon && <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />}
                    {/* Badge on icon for Rail Mode */}
                    {isRailMode && link.badge && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 border-none">
                            {link.badge > 99 ? '99+' : link.badge}
                        </span>
                    )}
                </div>

                {!isRailMode && (
                    <>
                        <span className="text-sm flex-1 truncate">{link.label}</span>
                        {/* Standard Badge */}
                        {link.badge && (
                            <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 px-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                                {link.badge}
                            </span>
                        )}
                    </>
                )}
            </Link>

            {/* Pin action button on hover */}
            {!isRailMode && isHovered && onPinToggle && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onPinToggle(link);
                    }}
                    className="absolute right-3 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors tooltip"
                    title={isPinned ? "Desfijar" : "Fijar a Favoritos"}
                >
                    <FiPaperclip className={`w-4 h-4 ${isPinned ? 'text-primary-500' : ''}`} />
                </button>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────
   Parent node – collapsible accordion item
   ────────────────────────────────────────────── */
function NavParentNode({ link, isOpen, onToggle, pathname, isRailMode, pinnedItems, togglePin }) {
    const Icon = link.icon;
    const hasActiveChild = link.children?.some((child) => pathname === child.path);

    // Sum badges of children
    const totalBadges = link.children?.reduce((acc, child) => acc + (child.badge || 0), 0);

    return (
        <div className="my-[2px]">
            {/* Active Indicator Line for Parent */}
            {hasActiveChild && (
                <div className="absolute left-0 mt-1 mb-1 w-1 h-10 bg-primary-600/50 rounded-r-full" />
            )}

            <button
                onClick={onToggle}
                className={`w-full flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isRailMode ? 'justify-center mx-1 px-0 py-3' : ''
                    } ${hasActiveChild
                        ? 'bg-primary-50/50 dark:bg-primary-500/5 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                title={isRailMode ? link.label : undefined}
            >
                <div className="relative flex items-center justify-center shrink-0">
                    {Icon && <Icon className={`w-5 h-5 ${hasActiveChild ? 'stroke-[2.5px]' : 'stroke-2'}`} />}
                    {isRailMode && totalBadges > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 line-clamp-1">
                            {totalBadges}
                        </span>
                    )}
                </div>

                {!isRailMode && (
                    <>
                        <span className="text-sm flex-1 text-left truncate">{link.label}</span>
                        {/* Total Badges */}
                        {totalBadges > 0 && !isOpen && (
                            <span className="ml-auto mr-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                {totalBadges}
                            </span>
                        )}
                        <FiChevronRight
                            className={`w-4 h-4 transition-transform duration-300 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 ${isOpen ? 'rotate-90' : 'rotate-0'
                                }`}
                        />
                    </>
                )}
            </button>

            {/* Children – animated expand / collapse */}
            {!isRailMode && (
                <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                        maxHeight: isOpen ? `${(link.children?.length || 0) * 44}px` : '0px',
                        opacity: isOpen ? 1 : 0,
                    }}
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
function DashboardLayout({ children, title, links, subtitle = "Dashboard Administrativo" }) {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Feature: Rail mode state
    const [isRailMode, setIsRailMode] = useState(false);

    // Feature: Pinned Items state (sync to localStorage in a real app)
    const [pinnedItems, setPinnedItems] = useState([]);

    // Feature: Command Palette state
    const [cmdOpen, setCmdOpen] = useState(false);

    // Open/Close Parent Nodes
    const [openNodes, setOpenNodes] = useState(() => {
        const initialOpen = {};
        links.forEach((link) => {
            if (link.children?.some((child) => location.pathname === child.path)) {
                initialOpen[link.label] = true;
            }
        });
        return initialOpen;
    });

    // Auto-expand parents based on active route
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

    // Command Palette Hotkey Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check for Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleNode = (label) => {
        // En rail mode, al hacer clic en un padre, podemos expandir el sidebar
        if (isRailMode) setIsRailMode(false);
        setOpenNodes((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const togglePinItem = (link) => {
        setPinnedItems(prev => {
            if (prev.some(item => item.path === link.path)) {
                return prev.filter(item => item.path !== link.path);
            } else {
                return [...prev, link];
            }
        });
    };

    // Responsive Rail width
    const sidebarWidth = isRailMode ? 'w-20' : 'w-64';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex font-sans">
            {/* Command Palette Global Element */}
            <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} links={links} />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-[70] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shadow-sm
                    ${sidebarWidth}
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* 1. Feature: Tenant Selector Header */}
                <TenantSelector isRailMode={isRailMode} />

                {/* Search Bar / Command Palette Trigger */}
                <div className="px-3 py-3 border-b border-gray-200 dark:border-slate-800">
                    <button
                        onClick={() => setCmdOpen(true)}
                        className={`w-full flex items-center ${isRailMode ? 'justify-center p-2' : 'px-3 py-2 gap-2'} bg-gray-100/80 dark:bg-slate-800/80 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 rounded-lg transition-colors border border-transparent dark:border-slate-700/50`}
                        title={isRailMode ? "Buscar (Ctrl+K)" : undefined}
                    >
                        <FiSearch className="w-5 h-5 shrink-0" />
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

                {/* Shared User Menu inside nav for Rail Mode logic (optional) */}

                <nav className="flex-1 overflow-y-auto scrollbar-hide py-3">
                    {/* 2. Feature: Favoritos (Pinned Items) */}
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

                    {/* Main Links */}
                    {!isRailMode && (
                        <p className="px-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                            Menú Principal
                        </p>
                    )}
                    <div className="space-y-0.5 pb-2">
                        {links.map((link) => {
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

                {/* Footer Controls */}
                <div className="p-3 border-t border-gray-200 dark:border-slate-800 flex flex-col gap-1">
                    {/* Back to Store Link */}
                    <Link
                        to="/"
                        className={`flex items-center mx-1 px-3 py-2.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors group ${isRailMode ? 'justify-center mx-1 px-0 py-3' : 'gap-3'
                            }`}
                        title={isRailMode ? "Volver a la Tienda" : undefined}
                    >
                        <FiHome className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                        {!isRailMode && <span className="text-sm font-semibold">Volver a la Tienda</span>}
                    </Link>

                    {/* Expand/Collapse Rail Mode Toggle hidden on small screens */}
                    <button
                        onClick={() => setIsRailMode(!isRailMode)}
                        className={`hidden lg:flex items-center mx-1 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${isRailMode ? 'justify-center mx-1 px-0 py-3' : 'gap-3'
                            }`}
                        title={isRailMode ? "Expandir" : "Contraer Sidebar"}
                    >
                        <FiMenu className="w-5 h-5 shrink-0" />
                        {!isRailMode && <span className="text-sm font-medium">Contraer</span>}
                    </button>

                    <button
                        onClick={logout}
                        className={`flex items-center mx-1 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group ${isRailMode ? 'justify-center mx-1 px-0 py-3' : 'gap-3'
                            }`}
                        title={isRailMode ? "Cerrar Sesión" : undefined}
                    >
                        <FiLogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                        {!isRailMode && <span className="text-sm font-medium">Cerrar Sesión</span>}
                    </button>

                    {/* User Profile avatar for Rail Mode, detailed for Full Mode */}
                    <div className={`mt-2 p-2 flex items-center gap-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 ${isRailMode ? 'justify-center p-0 bg-transparent border-transparent' : 'mx-1'}`}>
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        {!isRailMode && (
                            <div className="overflow-hidden flex-1">
                                <p className="font-semibold text-sm truncate dark:text-white leading-tight">{user?.name || 'Administrador'}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'Admin'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 dark:bg-slate-900/50">
                {/* Mobile Header */}
                <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 lg:hidden sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 transition-colors"
                        >
                            <FiMenu className="w-6 h-6" />
                        </button>
                        <span className="font-display font-bold text-lg text-gray-900 dark:text-white truncate">
                            {title}
                        </span>
                    </div>
                    {/* Mobile Command Palette Trigger */}
                    <button
                        onClick={() => setCmdOpen(true)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                        <FiSearch className="w-5 h-5" />
                    </button>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
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
