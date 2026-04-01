import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdHome, MdLogout, MdMenu, MdChevronRight, MdSearch, MdPushPin, MdMoreVert, MdCheck } from 'react-icons/md';
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
                className={`w-full flex items-center justify-between p-2 rounded-none hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${isRailMode ? 'justify-center' : ''
                    }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
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
                {!isRailMode && <MdMoreVert className="w-5 h-5 text-gray-400" />}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && !isRailMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-none shadow-xl z-50 overflow-hidden"
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
                                    {selectedTenant === tenant && <MdCheck className="w-5 h-5 text-primary-600" />}
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

    return (
        <div className="relative mx-2 my-0.5 group/navitem">
            <Link
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-none transition-all duration-300 ${indent && !isRailMode ? 'pl-9' : ''
                    } ${isRailMode ? 'justify-center px-0 py-3' : ''} ${isActive
                        ? 'text-white font-bold bg-primary-600 dark:bg-primary-700 shadow-none'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                title={isRailMode ? link.label : undefined}
            >
                <div className="relative flex items-center justify-center shrink-0">
                    {Icon && <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-white' : 'text-gray-500 dark:text-gray-400'}`} />}
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
                        
                        {/* Right side container for Badge / Pin */}
                        <div className="flex items-center gap-1 shrink-0 relative">
                            {/* Standard Badge */}
                            {link.badge && (
                                <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 px-1.5 text-xs font-bold text-red-600 dark:text-red-400 transition-all duration-200 ${onPinToggle ? 'group-hover/navitem:opacity-0 group-hover/navitem:scale-75' : ''}`}>
                                    {link.badge}
                                </span>
                            )}
                            
                            {/* Pin button inside Link */}
                            {onPinToggle && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPinToggle(link);
                                    }}
                                    className={`absolute right-0 p-1 rounded-md transition-all duration-200 opacity-0 scale-75 group-hover/navitem:opacity-100 group-hover/navitem:scale-100 ${isActive ? 'text-white/80 hover:text-white hover:bg-white/20' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-slate-700 dark:hover:text-gray-200'}`}
                                    title={isPinned ? "Desfijar" : "Fijar a Favoritos"}
                                    aria-label="Fijar"
                                >
                                    <MdPushPin className={`w-4 h-4 ${isPinned ? (isActive ? 'text-white' : 'text-primary-500') : ''}`} />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </Link>
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
        <div className="my-[2px] relative group/parent">
            {/* Active Indicator Line for Parent */}
            {hasActiveChild && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-[3px] bg-gray-200 dark:bg-slate-700 rounded-r-full" />
            )}

            <button
                onClick={onToggle}
                className={`w-full flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-none transition-all duration-300 group ${isRailMode ? 'justify-center mx-1 px-0 py-3' : ''
                    } ${hasActiveChild
                        ? 'text-primary-600 dark:text-primary-400 font-semibold bg-transparent'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
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
                        {/* Total Badges */}
                        {totalBadges > 0 && !isOpen && (
                            <span className="ml-auto mr-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                {totalBadges}
                            </span>
                        )}
                        <MdChevronRight
                            className={`w-5 h-5 transition-transform duration-300 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 ${isOpen ? 'rotate-90' : 'rotate-0'
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
function DashboardLayout({ children, title, links, subtitle }) {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
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
                        className={`w-full flex items-center ${isRailMode ? 'justify-center p-2' : 'px-3 py-2 gap-2'} bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 rounded-none transition-all shadow-inner border border-transparent dark:border-slate-700/50`}
                        title={isRailMode ? "Buscar (Ctrl+K)" : undefined}
                    >
                        <MdSearch className="w-5 h-5 shrink-0" />
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
                <div className="p-3 border-t border-gray-200 dark:border-slate-800 flex flex-col gap-2 bg-gray-50/50 dark:bg-slate-900/50">
                    {/* User Profile avatar for Rail Mode, detailed for Full Mode */}
                    <div className={`p-2 flex items-center gap-3 rounded-none border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm ${isRailMode ? 'justify-center bg-transparent border-transparent shadow-none p-0' : 'mx-1'}`}>
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

                    <div className={`flex items-center justify-between mt-1 ${isRailMode ? 'flex-col gap-2' : ''}`}>
                         {/* Back to Store Link */}
                        <Link
                            to="/"
                            className={`flex items-center justify-center p-2 rounded-none text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors group ${!isRailMode && 'flex-1 mx-1'}`}
                            title="Volver a la Tienda"
                        >
                            <MdHome className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
                        </Link>

                        {/* Expand/Collapse Rail Mode Toggle hidden on small screens */}
                        <button
                            onClick={() => setIsRailMode(!isRailMode)}
                            className={`hidden lg:flex items-center justify-center p-2 rounded-none text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${!isRailMode && 'flex-1 mx-1'}`}
                            title={isRailMode ? "Expandir" : "Contraer Sidebar"}
                        >
                            <MdMenu className="w-6 h-6 shrink-0" />
                        </button>

                        <button
                            onClick={logout}
                            className={`flex items-center justify-center p-2 rounded-none text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group ${!isRailMode && 'flex-1 mx-1'}`}
                            title="Cerrar Sesión"
                        >
                            <MdLogout className="w-6 h-6 shrink-0 group-hover:translate-x-1 transition-transform" />
                        </button>
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
                            <MdMenu className="w-7 h-7" />
                        </button>
                        <span className="font-display font-bold text-lg text-gray-900 dark:text-white truncate">
                            {title}
                        </span>
                    </div>
                    {/* Mobile Command Palette Trigger */}
                    <button
                        onClick={() => setCmdOpen(true)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                        <MdSearch className="w-5 h-5" />
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
