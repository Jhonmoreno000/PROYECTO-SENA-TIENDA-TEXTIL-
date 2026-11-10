import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Save, Lock, Mail, Phone, User, Bell, Check } from 'lucide-react';
import LayoutPanel from '../../../componentes/layouts/LayoutPanel';
import PaginaAnimada from '../../../componentes/PaginaAnimada';
import enlacesCliente from '../../../datos/enlacesCliente';
import enlacesVendedor from '../../../datos/enlacesVendedor';
import enlacesAdmin from '../../../datos/enlacesAdmin';
import BackButton from '../../../componentes/dashboard/BackButton';
import { useAutenticacion } from '../../../contextos/ContextoAutenticacion';
import { useNotificacion } from '../../../contextos/ContextoNotificacion';
import { getApiUrl } from '../../../config';

function Perfil() {
    const { user, updateUser } = useAutenticacion();
    const { showNotification } = useNotificacion();
    const location = useLocation();

    const isVendor = location.pathname.startsWith('/vendedor') || user?.role === 'vendedor' || user?.rol === 'vendedor';
    const isAdmin = location.pathname.startsWith('/admin') || user?.role === 'admin' || user?.rol === 'administrador';
    const panelLinks = isVendor ? enlacesVendedor : (isAdmin ? enlacesAdmin : enlacesCliente);
    const backTarget = isVendor ? '/vendedor' : (isAdmin ? '/admin' : '/cliente');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || user?.telefono || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        newCollections: true,
        offers: true,
        orders: true,
        newsletter: false
    });

    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaveSuccess(false);
    };

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        setSaveSuccess(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Validate passwords if changing
        if (showPasswordChange) {
            if (formData.newPassword !== formData.confirmPassword) {
                showNotification('error', 'Las contraseñas no coinciden');
                setIsSaving(false);
                return;
            }
            if (formData.newPassword.length < 8) {
                showNotification('warning', 'La contraseña debe tener al menos 8 caracteres');
                setIsSaving(false);
                return;
            }
        }

        try {
            const payload = {
                name: formData.name,
                nombre: formData.name,
                email: formData.email,
                correo: formData.email,
                phone: formData.phone,
                telefono: formData.phone,
                ...(showPasswordChange && formData.newPassword
                    ? { password: formData.newPassword, contrasena: formData.newPassword }
                    : {})
            };

            const res = await fetch(getApiUrl(`/api/usuarios/${user.id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error('No se pudo actualizar el perfil');
            }

            if (updateUser) {
                updateUser({
                    name: formData.name,
                    nombre: formData.name,
                    email: formData.email,
                    correo: formData.email,
                    phone: formData.phone,
                    telefono: formData.phone
                });
            }

            setSaveSuccess(true);
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            setShowPasswordChange(false);
            showNotification('success', 'Perfil actualizado exitosamente');
        } catch (err) {
            console.error('Error al actualizar perfil:', err);
            showNotification('error', 'No se pudo actualizar el perfil en el servidor');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <LayoutPanel title="Mi Perfil" links={panelLinks}>
            <PaginaAnimada>
            <BackButton to={backTarget} label="Volver a Mi Panel" />
            <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSave}>
                    {/* Perfil Picture */}
                    <div className="card shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 mb-6">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold">
                                {formData.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {formData.name}
                                </h3>
                                <p className="text-gray-500">{formData.email}</p>
                                <button
                                    type="button"
                                    className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Cambiar foto de perfil
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="card shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 mb-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">
                            Información Personal
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <User className="inline w-4 h-4 mr-2" />
                                    Nombre completo
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Mail className="inline w-4 h-4 mr-2" />
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Phone className="inline w-4 h-4 mr-2" />
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="300 123 4567"
                                    className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Change */}
                    <div className="card shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                <Lock className="inline w-5 h-5 mr-2" />
                                Seguridad
                            </h3>
                            {!showPasswordChange && (
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordChange(true)}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Cambiar contraseña
                                </button>
                            )}
                        </div>

                        {showPasswordChange ? (
                            <div className="space-y-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Contraseña actual
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nueva contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirmar nueva contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordChange(false);
                                        setFormData(prev => ({
                                            ...prev,
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        }));
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancelar cambio de contraseña
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                Tu contraseña está configurada. Haz clic en "Cambiar contraseña" para actualizarla.
                            </p>
                        )}
                    </div>

                    {/* Notification Preferences */}
                    <div className="card shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 mb-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">
                            <Bell className="inline w-5 h-5 mr-2" />
                            Preferencias de Notificación
                        </h3>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Nuevas colecciones</p>
                                    <p className="text-sm text-gray-500">Recibe alertas cuando lleguen telas nuevas</p>
                                </div>
                                <div className={`w-12 h-7 rounded-full transition-colors ${notifications.newCollections ? 'bg-primary-600' : 'bg-gray-300'} relative`}>
                                    <input
                                        type="checkbox"
                                        checked={notifications.newCollections}
                                        onChange={() => handleNotificationChange('newCollections')}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${notifications.newCollections ? 'right-1' : 'left-1'}`} />
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Ofertas y descuentos</p>
                                    <p className="text-sm text-gray-500">Promociones exclusivas y cupones</p>
                                </div>
                                <div className={`w-12 h-7 rounded-full transition-colors ${notifications.offers ? 'bg-primary-600' : 'bg-gray-300'} relative`}>
                                    <input
                                        type="checkbox"
                                        checked={notifications.offers}
                                        onChange={() => handleNotificationChange('offers')}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${notifications.offers ? 'right-1' : 'left-1'}`} />
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Actualizaciones de pedidos</p>
                                    <p className="text-sm text-gray-500">Estado de tus envíos y entregas</p>
                                </div>
                                <div className={`w-12 h-7 rounded-full transition-colors ${notifications.orders ? 'bg-primary-600' : 'bg-gray-300'} relative`}>
                                    <input
                                        type="checkbox"
                                        checked={notifications.orders}
                                        onChange={() => handleNotificationChange('orders')}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${notifications.orders ? 'right-1' : 'left-1'}`} />
                                </div>
                            </label>

                            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Newsletter</p>
                                    <p className="text-sm text-gray-500">Consejos de costura y tendencias</p>
                                </div>
                                <div className={`w-12 h-7 rounded-full transition-colors ${notifications.newsletter ? 'bg-primary-600' : 'bg-gray-300'} relative`}>
                                    <input
                                        type="checkbox"
                                        checked={notifications.newsletter}
                                        onChange={() => handleNotificationChange('newsletter')}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${notifications.newsletter ? 'right-1' : 'left-1'}`} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-lg disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Guardando...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <Check className="w-5 h-5" />
                                ¡Cambios guardados!
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </form>
            </div>
            </PaginaAnimada>
        </LayoutPanel>
    );
}

export default Perfil;
