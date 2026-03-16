import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdEdit, MdSave } from 'react-icons/md';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AnimatedPage from '../../components/AnimatedPage';
import clientDashboardLinks from '../../data/clientDashboardLinks';
import BackButton from '../../components/dashboard/BackButton';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

function ClientProfile() {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [isEditing, setIsEditing] = useState(false);

    // Datos mock iniciales basados en el usuario
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '300 123 4567',
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        state: 'Cundinamarca'
    });

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    

    const handleSave = () => {
        // Simular guardado
        setIsEditing(false);
        showNotification('success', 'Perfil actualizado correctamente');
    };

    return (
        <DashboardLayout title="Mi Perfil" links={clientDashboardLinks}>
            <AnimatedPage>
            <BackButton to="/cliente" label="Volver a Mi Panel" />
            <div className="card shadow-sm border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 md:p-8 max-w-2xl mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl font-bold text-primary-600">
                            {profile.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{profile.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-bold ${isEditing
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/30'
                            }`}
                    >
                        {isEditing ? <><MdSave className="w-5 h-5" /> Guardar</> : <><MdEdit className="w-5 h-5"/> Editar</>}
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`input-field ${!isEditing && 'bg-gray-50 dark:bg-slate-800/50 border-transparent'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                disabled={true} // Email usualmente no editable
                                className="input-field bg-gray-50 dark:bg-slate-800/50 border-transparent opacity-70 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Teléfono</label>
                            <input
                                type="tel"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`input-field ${!isEditing && 'bg-gray-50 dark:bg-slate-800/50 border-transparent'}`}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Dirección</label>
                            <input
                                type="text"
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`input-field ${!isEditing && 'bg-gray-50 dark:bg-slate-800/50 border-transparent'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ciudad</label>
                            <input
                                type="text"
                                name="city"
                                value={profile.city}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`input-field ${!isEditing && 'bg-gray-50 dark:bg-slate-800/50 border-transparent'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Departamento</label>
                            <input
                                type="text"
                                name="state"
                                value={profile.state}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`input-field ${!isEditing && 'bg-gray-50 dark:bg-slate-800/50 border-transparent'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default ClientProfile;
