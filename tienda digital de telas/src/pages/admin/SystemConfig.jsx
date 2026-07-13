import React, { useState, useEffect, useRef } from 'react';
import { Save, Undo2, Palette, DollarSign, LayoutTemplate, Info, ChevronDown, Percent, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useMetrics } from '../../context/MetricsContext';
import { useNotification } from '../../context/NotificationContext';
import adminDashboardLinks from '../../data/adminDashboardLinks';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl overflow-hidden";
const glassInput = "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#f97316] rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all px-4 py-3 text-sm w-full";

function Tooltip({ children, text }) {
    return (
        <div className="relative flex items-center group cursor-help">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl">
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
            </div>
        </div>
    );
}

function Accordion({ id, title, icon: Icon, openSection, setOpenSection, children }) {
    const isOpen = openSection === id;
    const contentRef = useRef(null);
    
    useGSAP(() => {
        if (isOpen) {
            gsap.fromTo(contentRef.current, 
                { height: 0, opacity: 0 }, 
                { height: 'auto', opacity: 1, duration: 0.4, ease: "power2.out" }
            );
        } else {
            gsap.to(contentRef.current, 
                { height: 0, opacity: 0, duration: 0.3, ease: "power2.in" }
            );
        }
    }, { dependencies: [isOpen] });

    return (
        <div className={`border border-slate-200 dark:border-slate-700 rounded-2xl mb-4 overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white dark:bg-slate-800 shadow-lg' : 'bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'}`}>
            <button
                onClick={() => setOpenSection(isOpen ? null : id)}
                className="w-full flex items-center justify-between p-6 text-left"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${isOpen ? 'bg-orange-50 dark:bg-orange-500/10 text-[#ea580c] border border-orange-200 dark:border-orange-500/20' : 'bg-white dark:bg-slate-700 text-slate-500 border border-slate-200 dark:border-slate-600 shadow-sm'}`}>
                        <Icon size={20} />
                    </div>
                    <h3 className={`font-black text-lg ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{title}</h3>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div ref={contentRef} className="overflow-hidden h-0 opacity-0">
                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-700/50 mt-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

function SystemConfig() {
    const { systemConfig, updateSystemConfig } = useMetrics();
    const { showNotification } = useNotification();
    
    const [config, setConfig] = useState(systemConfig);
    const [originalConfig, setOriginalConfig] = useState(systemConfig);
    const [openSection, setOpenSection] = useState('brand');
    const [isSaving, setIsSaving] = useState(false);
    const [taxWarning, setTaxWarning] = useState(false);
    
    const warningRef = useRef(null);
    const undoBtnRef = useRef(null);
    const saveBtnRef = useRef(null);
    const bannerPreviewRef = useRef(null);

    useEffect(() => {
        // Warning si se cambia el impuesto para las proyecciones
        if (config.taxRate !== originalConfig.taxRate) {
            setTaxWarning(true);
        } else {
            setTaxWarning(false);
        }
    }, [config.taxRate, originalConfig.taxRate]);

    useGSAP(() => {
        if (taxWarning) {
            gsap.fromTo(warningRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
        }
    }, { dependencies: [taxWarning] });

    useGSAP(() => {
        const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);
        if (hasChanges) {
            gsap.fromTo(undoBtnRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3 });
            gsap.fromTo(saveBtnRef.current, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.4)" });
        }
    }, { dependencies: [config, originalConfig] });

    const handleChange = (field, value) => setConfig({ ...config, [field]: value });
    
    const handleBannerChange = (field, value) => {
        setConfig(prev => ({ ...prev, globalBanner: { ...prev.globalBanner, [field]: value } }));
    };

    const handleFinanceChange = (field, value) => {
        let val = parseFloat(value) || 0;
        if (field === 'taxRate') {
            if (val > 100) val = 100; // Máximo 100%
            if (val < 0) val = 0;
            handleChange(field, val / 100);
        } else {
            if (val < 0) val = 0;
            handleChange(field, val);
        }
    };

    const handleUndo = () => {
        if (window.confirm('¿Deshacer todos los cambios no guardados?')) {
            setConfig(originalConfig);
            showNotification('info', 'Cambios revertidos al último estado guardado');
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            updateSystemConfig(config);
            setOriginalConfig(config);
            setTaxWarning(false);
            setIsSaving(false);
            showNotification('success', 'Configuración de élite guardada y aplicada');
        }, 800); // Simulando red
    };

    const savedConfigRef = useRef(systemConfig);
    useEffect(() => {
        savedConfigRef.current = systemConfig;
    }, [systemConfig]);

    useEffect(() => {
        document.documentElement.style.setProperty('--theme-primary', config.primaryColor);
        document.documentElement.style.setProperty('--theme-secondary', config.secondaryColor);
        document.documentElement.style.setProperty('--theme-accent', config.accentColor);
    }, [config.primaryColor, config.secondaryColor, config.accentColor]);

    useEffect(() => {
        return () => {
            if (savedConfigRef.current) {
                document.documentElement.style.setProperty('--theme-primary', savedConfigRef.current.primaryColor);
                document.documentElement.style.setProperty('--theme-secondary', savedConfigRef.current.secondaryColor);
                document.documentElement.style.setProperty('--theme-accent', savedConfigRef.current.accentColor);
            }
        };
    }, []);

    const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

    useGSAP(() => {
        if (config.globalBanner.enabled) {
            gsap.fromTo(bannerPreviewRef.current, { height: 0 }, { height: 'auto', duration: 0.3 });
        } else {
            gsap.to(bannerPreviewRef.current, { height: 0, duration: 0.3 });
        }
    }, { dependencies: [config.globalBanner.enabled] });

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div className="-m-6 p-6 min-h-screen relative pb-24">
                <div className="relative z-10 max-w-5xl mx-auto">
                    <BackButton />
                    <div className="mb-10 mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Central de Control <span className="text-[#f97316]">de Marca</span></h1>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Gestiona la identidad visual, finanzas y comportamiento global del sitio.</p>
                        </div>
                        {hasChanges && (
                            <button ref={undoBtnRef} onClick={handleUndo} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                                <Undo2 size={14} /> Deshacer Cambios
                            </button>
                        )}
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Secciones Collapsables */}
                        <div className="lg:col-span-8">
                            <Accordion id="brand" title="Identidad de Marca" icon={Palette} openSection={openSection} setOpenSection={setOpenSection}>
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">Colores de Marca D&D Textil</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Restaura la paleta original del e-commerce (Naranja Élite).</p>
                                        </div>
                                        <button 
                                            onClick={() => setConfig(prev => ({
                                                ...prev,
                                                primaryColor: '#f97316',
                                                secondaryColor: '#1e293b',
                                                accentColor: '#ea580c',
                                            }))}
                                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm shrink-0"
                                        >
                                            Restaurar Valores de Fábrica
                                        </button>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Nombre del E-Commerce</label>
                                        <input type="text" value={config.siteName} onChange={(e) => handleChange('siteName', e.target.value)} className={glassInput} />
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-6">
                                        {[
                                            { id: 'primaryColor', label: 'Primario', val: config.primaryColor, original: originalConfig.primaryColor },
                                            { id: 'secondaryColor', label: 'Secundario', val: config.secondaryColor, original: originalConfig.secondaryColor },
                                            { id: 'accentColor', label: 'Acento (CTA)', val: config.accentColor, original: originalConfig.accentColor }
                                        ].map(color => (
                                            <div key={color.id}>
                                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                                                    {color.label}
                                                    {color.val !== color.original && (
                                                        <button 
                                                            onClick={() => handleChange(color.id, color.original)}
                                                            className="text-[9px] text-[#ea580c] hover:underline flex items-center gap-1"
                                                            title="Restaurar color original"
                                                        >
                                                            <Undo2 size={10} /> Restaurar
                                                        </button>
                                                    )}
                                                </label>
                                                <div className="relative group cursor-pointer">
                                                    <input type="color" value={color.val} onChange={(e) => handleChange(color.id, e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl group-hover:border-[#f97316] transition-colors">
                                                        <div className="w-8 h-8 rounded-lg shadow-inner border border-black/10" style={{ backgroundColor: color.val }}></div>
                                                        <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">{color.val}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3 flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Color Guardado:</span>
                                                    <button 
                                                        onClick={() => handleChange(color.id, color.original)}
                                                        className="w-5 h-5 rounded shadow-sm border border-black/10 hover:scale-110 transition-transform" 
                                                        style={{ backgroundColor: color.original }}
                                                        title={`Volver al color guardado (${color.original})`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">Modo Oscuro por Defecto</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Activar para nuevos usuarios visitantes.</p>
                                        </div>
                                        <button onClick={() => handleChange('defaultDarkMode', !config.defaultDarkMode)} className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${config.defaultDarkMode ? 'bg-[#ea580c]' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${config.defaultDarkMode ? 'translate-x-8' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </Accordion>

                            <Accordion id="finance" title="Parámetros Financieros & Stock" icon={DollarSign} openSection={openSection} setOpenSection={setOpenSection}>
                                {taxWarning && (
                                    <div ref={warningRef} className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl flex items-start gap-3 opacity-0">
                                        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Aviso Estratégico</p>
                                            <p className="text-xs text-indigo-700 dark:text-indigo-400/80 mt-1">Al guardar, el modelo de <strong>Proyección de Ingresos (BI)</strong> se recalculará automáticamente con la nueva tasa impositiva.</p>
                                        </div>
                                    </div>
                                )}
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">Tasa de Impuesto <Percent size={12}/></label>
                                        <div className="relative">
                                            <input type="number" value={(config.taxRate * 100).toFixed(1)} onChange={(e) => handleFinanceChange('taxRate', e.target.value)} className={glassInput} />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">Costo Envío <DollarSign size={12}/></label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</div>
                                            <input type="number" value={config.shippingCost} onChange={(e) => handleFinanceChange('shippingCost', e.target.value)} className={`pl-8 ${glassInput}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Umbral Envío Gratis</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</div>
                                            <input type="number" value={config.freeShippingThreshold} onChange={(e) => handleFinanceChange('freeShippingThreshold', e.target.value)} className={`pl-8 ${glassInput}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <Tooltip text="Los rollos por debajo de este metraje dispararán alertas rojas en el panel de inventario.">
                                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1 w-full">Umbral Stock Bajo <AlertCircle size={12}/></label>
                                        </Tooltip>
                                        <div className="relative">
                                            <input type="number" value={config.lowStockThreshold} onChange={(e) => handleFinanceChange('lowStockThreshold', e.target.value)} className={glassInput} />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">metros</div>
                                        </div>
                                    </div>
                                </div>
                            </Accordion>

                            <Accordion id="banner" title="Banner de Conversión" icon={LayoutTemplate} openSection={openSection} setOpenSection={setOpenSection}>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">Activar Banner Global</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Muestra un aviso fijo en la parte superior de la tienda.</p>
                                        </div>
                                        <button onClick={() => handleBannerChange('enabled', !config.globalBanner.enabled)} className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${config.globalBanner.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${config.globalBanner.enabled ? 'translate-x-8' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    
                                    {config.globalBanner.enabled && (
                                        <div className="grid sm:grid-cols-3 gap-6">
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Mensaje Comercial</label>
                                                <input type="text" value={config.globalBanner.message} onChange={(e) => handleBannerChange('message', e.target.value)} className={glassInput} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Impacto Visual</label>
                                                <select value={config.globalBanner.type} onChange={(e) => handleBannerChange('type', e.target.value)} className={`${glassInput} cursor-pointer`}>
                                                    <option value="info">Azul (Informativo)</option>
                                                    <option value="success">Verde (Éxito/Promo)</option>
                                                    <option value="warning">Naranja (Urgencia)</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Accordion>
                        </div>

                        {/* Live Preview Panel */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24">
                                <h3 className="font-black text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2"><LayoutTemplate size={20} className="text-[#f97316]"/> Live Preview</h3>
                                
                                <div className={`${glassCard} bg-slate-50 dark:bg-slate-900 p-4 border-[4px] border-slate-200 dark:border-slate-700/50`}>
                                    {/* Mock Browser Header */}
                                    <div className="flex gap-1.5 mb-4 px-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                                    </div>

                                    {/* Mini Site Preview */}
                                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-64">
                                        
                                        {/* Mock Global Banner */}
                                        <div ref={bannerPreviewRef} className="overflow-hidden h-0">
                                            <div className={`py-1.5 px-2 text-center text-[8px] font-bold truncate ${config.globalBanner.type === 'info' ? 'bg-blue-600 text-white' : config.globalBanner.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-orange-500 text-white'}`}>
                                                {config.globalBanner.message || 'Mensaje promocional aquí...'}
                                            </div>
                                        </div>

                                        {/* Mock Navbar */}
                                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800" style={{ borderBottomColor: config.primaryColor + '30' }}>
                                            <div className="font-black text-[10px]" style={{ color: config.primaryColor }}>{config.siteName || 'Logo'}</div>
                                            <div className="flex gap-2">
                                                <div className="w-8 h-2 rounded bg-slate-100 dark:bg-slate-700"></div>
                                                <div className="w-8 h-2 rounded bg-slate-100 dark:bg-slate-700"></div>
                                            </div>
                                        </div>

                                        {/* Mock Hero */}
                                        <div className="flex-1 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ backgroundColor: config.primaryColor + '08' }}>
                                            <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10" style={{ backgroundColor: config.secondaryColor }}></div>
                                            <div className="w-3/4 h-3 rounded bg-slate-200 dark:bg-slate-600 mb-2"></div>
                                            <div className="w-1/2 h-2 rounded bg-slate-200 dark:bg-slate-600 mb-4"></div>
                                            <div className="px-4 py-1.5 rounded-md text-[9px] font-bold shadow-sm transition-colors" style={{ backgroundColor: config.accentColor, color: '#fff' }}>
                                                Comprar Ahora
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Save Button */}
                    {hasChanges && (
                        <div ref={saveBtnRef} className="fixed bottom-8 right-8 z-50 opacity-0">
                            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white rounded-2xl font-black text-sm shadow-[0_8px_30px_rgba(234,88,12,0.4)] hover:shadow-[0_8px_40px_rgba(234,88,12,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer">
                                {isSaving ? (
                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando en DB...</>
                                ) : (
                                    <><Save size={20} /> Guardar Configuración</>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default SystemConfig;

