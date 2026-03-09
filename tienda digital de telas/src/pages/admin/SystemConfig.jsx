import React, { useState } from 'react';
import { FiSettings, FiSave } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useMetrics } from '../../context/MetricsContext';
import { useNotification } from '../../context/NotificationContext';

function SystemConfig() {
    const { systemConfig, updateSystemConfig } = useMetrics();
    const { showNotification } = useNotification();
    const [config, setConfig] = useState(systemConfig);

    const dashboardLinks = [
        { label: 'Resumen', path: '/admin', icon: FiSettings },
        { label: 'Configuración', path: '/admin/configuracion', icon: FiSettings },
    ];

    const handleChange = (field, value) => {
        setConfig({
            ...config,
            [field]: value
        });
    };

    const handleBannerChange = (field, value) => {
        setConfig({
            ...config,
            globalBanner: {
                ...config.globalBanner,
                [field]: value
            }
        });
    };

    const handleSave = () => {
        updateSystemConfig(config);
        showNotification('success', 'Configuración guardada correctamente');
    };

    return (
        <DashboardLayout title="Configuración del Sistema" links={dashboardLinks}>
            <BackButton />
            <div className="space-y-6">
                {/* Información General */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold mb-4">Información General</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nombre del Sitio
                            </label>
                            <input
                                type="text"
                                value={config.siteName}
                                onChange={(e) => handleChange('siteName', e.target.value)}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {/* Colores del Tema */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold mb-4">Colores del Tema</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color Primario
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={config.primaryColor}
                                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                                    className="w-12 h-12 rounded border border-gray-300 dark:border-slate-600 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={config.primaryColor}
                                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                                    className="input-field flex-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color Secundario
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={config.secondaryColor}
                                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                                    className="w-12 h-12 rounded border border-gray-300 dark:border-slate-600 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={config.secondaryColor}
                                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                                    className="input-field flex-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color de Acento
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={config.accentColor}
                                    onChange={(e) => handleChange('accentColor', e.target.value)}
                                    className="w-12 h-12 rounded border border-gray-300 dark:border-slate-600 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={config.accentColor}
                                    onChange={(e) => handleChange('accentColor', e.target.value)}
                                    className="input-field flex-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuración de Ventas */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold mb-4">Configuración de Ventas</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tasa de Impuesto (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={config.taxRate * 100}
                                onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) / 100)}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Costo de Envío ($)
                            </label>
                            <input
                                type="number"
                                value={config.shippingCost}
                                onChange={(e) => handleChange('shippingCost', parseInt(e.target.value))}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Umbral Envío Gratis ($)
                            </label>
                            <input
                                type="number"
                                value={config.freeShippingThreshold}
                                onChange={(e) => handleChange('freeShippingThreshold', parseInt(e.target.value))}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Umbral Stock Bajo (metros)
                            </label>
                            <input
                                type="number"
                                value={config.lowStockThreshold}
                                onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {/* Banner Global */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold mb-4">Banner Global</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="bannerEnabled"
                                checked={config.globalBanner.enabled}
                                onChange={(e) => handleBannerChange('enabled', e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="bannerEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Mostrar banner en el sitio
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mensaje del Banner
                            </label>
                            <input
                                type="text"
                                value={config.globalBanner.message}
                                onChange={(e) => handleBannerChange('message', e.target.value)}
                                className="input-field"
                                placeholder="Ej: ¡Envío gratis en compras superiores a $200.000!"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tipo de Banner
                            </label>
                            <select
                                value={config.globalBanner.type}
                                onChange={(e) => handleBannerChange('type', e.target.value)}
                                className="input-field"
                            >
                                <option value="info">Información (Azul)</option>
                                <option value="success">Éxito (Verde)</option>
                                <option value="warning">Advertencia (Amarillo)</option>
                            </select>
                        </div>

                        {/* Preview del banner */}
                        {config.globalBanner.enabled && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vista Previa:</p>
                                <div className={`p-3 rounded-lg text-center font-medium ${config.globalBanner.type === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                    config.globalBanner.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    }`}>
                                    {config.globalBanner.message}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modo Oscuro por Defecto */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold mb-4">Preferencias de Visualización</h3>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="defaultDarkMode"
                            checked={config.defaultDarkMode}
                            onChange={(e) => handleChange('defaultDarkMode', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="defaultDarkMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Activar modo oscuro por defecto para nuevos usuarios
                        </label>
                    </div>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        className="btn-primary flex items-center gap-2"
                    >
                        <FiSave />
                        Guardar Configuración
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default SystemConfig;
