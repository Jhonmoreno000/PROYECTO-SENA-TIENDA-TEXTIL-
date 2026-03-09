import React, { useState } from 'react';
import { FiUsers, FiSearch, FiEdit2, FiToggleLeft, FiToggleRight, FiFilter } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useMetrics } from '../../context/MetricsContext';
import { useNotification } from '../../context/NotificationContext';

function UserManagement() {
    const { users, updateUserRole, toggleUserActive } = useMetrics();
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    const dashboardLinks = [
        { label: 'Resumen', path: '/admin', icon: FiUsers },
        { label: 'Usuarios', path: '/admin/usuarios', icon: FiUsers },
    ];

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = (userId) => {
        if (newRole && newRole !== editingUser.role) {
            updateUserRole(userId, newRole);
            showNotification('success', `Rol actualizado a ${getRoleLabel(newRole)}`);
        }
        setEditingUser(null);
        setNewRole('');
    };

    const handleToggleActive = (userId, userName, isActive) => {
        toggleUserActive(userId);
        showNotification('success', `Usuario ${userName} ${isActive ? 'desactivado' : 'activado'}`);
    };

    const getRoleLabel = (role) => {
        const labels = {
            admin: 'Administrador',
            seller: 'Vendedor',
            client: 'Cliente'
        };
        return labels[role] || role;
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            seller: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            client: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    return (
        <DashboardLayout title="Gestión de Usuarios" links={dashboardLinks}>
            <BackButton />
            <div className="card">
                {/* Header con filtros */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Usuarios del Sistema</h2>
                            <p className="text-sm text-gray-500">Total: {filteredUsers.length} usuarios</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            {/* Búsqueda */}
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-10 pr-4 py-2 w-full sm:w-64"
                                />
                            </div>

                            {/* Filtro por rol */}
                            <div className="relative">
                                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="input-field pl-10 pr-4 py-2 appearance-none cursor-pointer"
                                >
                                    <option value="all">Todos los roles</option>
                                    <option value="admin">Administradores</option>
                                    <option value="seller">Vendedores</option>
                                    <option value="client">Clientes</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de usuarios */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 uppercase font-bold text-left">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Registro</th>
                                <th className="px-6 py-4">Último Acceso</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingUser?.id === user.id ? (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={newRole}
                                                    onChange={(e) => setNewRole(e.target.value)}
                                                    className="input-field py-1 text-sm"
                                                    autoFocus
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="admin">Administrador</option>
                                                    <option value="seller">Vendedor</option>
                                                    <option value="client">Cliente</option>
                                                </select>
                                                <button
                                                    onClick={() => handleRoleChange(user.id)}
                                                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(null);
                                                        setNewRole('');
                                                    }}
                                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.active
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {user.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.registeredAt).toLocaleDateString('es-CO')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.lastLogin).toLocaleDateString('es-CO')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingUser(user);
                                                    setNewRole(user.role);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 p-2"
                                                title="Cambiar rol"
                                            >
                                                <FiEdit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(user.id, user.name, user.active)}
                                                className={`p-2 ${user.active ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}
                                                title={user.active ? 'Desactivar' : 'Activar'}
                                            >
                                                {user.active ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center">
                        <FiUsers className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
                    </div>
                )}
            </div>

            {/* Estadísticas por rol */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase mb-1">Administradores</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {users.filter(u => u.role === 'admin').length}
                            </h3>
                        </div>
                        <div className="p-4 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                            <FiUsers className="w-8 h-8" />
                        </div>
                    </div>
                </div>
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase mb-1">Vendedores</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {users.filter(u => u.role === 'seller').length}
                            </h3>
                        </div>
                        <div className="p-4 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <FiUsers className="w-8 h-8" />
                        </div>
                    </div>
                </div>
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase mb-1">Clientes</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {users.filter(u => u.role === 'client').length}
                            </h3>
                        </div>
                        <div className="p-4 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <FiUsers className="w-8 h-8" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default UserManagement;
