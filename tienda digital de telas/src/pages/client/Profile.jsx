import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiPackage, FiEdit2, FiSave } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
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
            <BackButton to="/cliente" label="Volver a Mi Panel" />
            <div className="card p-6 md:p-8 max-w-2xl">
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isEditing
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                            }`}
                    >
                        {isEditing ? <><FiSave /> Guardar</> : <><FiEdit2 /> Editar</>}
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
        </DashboardLayout>
    );
}

export default ClientProfile;
