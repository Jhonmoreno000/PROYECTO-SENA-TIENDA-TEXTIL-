import React, { useState } from 'react';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiHome, FiTool, FiBriefcase } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import clientDashboardLinks from '../../../data/clientDashboardLinks';
import BackButton from '../../../components/dashboard/BackButton';

const COLOMBIA_DEPARTMENTS = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá',
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca',
    'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño',
    'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia',
    'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
];

const ADDRESS_LABELS = [
    { value: 'home', label: 'Casa', icon: FiHome },
    { value: 'workshop', label: 'Taller', icon: FiTool },
    { value: 'office', label: 'Oficina', icon: FiBriefcase },
    { value: 'other', label: 'Otro', icon: FiMapPin }
];

function AddressBook() {
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            label: 'home',
            fullName: 'María García',
            phone: '3001234567',
            department: 'Cundinamarca',
            city: 'Bogotá',
            neighborhood: 'Chapinero',
            address: 'Cra 7 #45-23',
            additionalInfo: 'Apto 502',
            isDefault: true
        },
        {
            id: 2,
            label: 'workshop',
            fullName: 'María García - Taller',
            phone: '3009876543',
            department: 'Cundinamarca',
            city: 'Bogotá',
            neighborhood: 'Zona Industrial',
            address: 'Calle 13 #68-45',
            additionalInfo: 'Bodega 12',
            isDefault: false
        }
    ]);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        label: 'home',
        fullName: '',
        phone: '',
        department: '',
        city: '',
        neighborhood: '',
        address: '',
        additionalInfo: '',
        isDefault: false
    });

    

    const resetForm = () => {
        setFormData({
            label: 'home',
            fullName: '',
            phone: '',
            department: '',
            city: '',
            neighborhood: '',
            address: '',
            additionalInfo: '',
            isDefault: false
        });
        setShowForm(false);
        setEditingId(null);
    };

    const handleEdit = (address) => {
        setFormData(address);
        setEditingId(address.id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar esta dirección?')) {
            setAddresses(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleSetDefault = (id) => {
        setAddresses(prev => prev.map(a => ({
            ...a,
            isDefault: a.id === id
        })));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.department || !formData.city || !formData.address) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        if (editingId) {
            setAddresses(prev => prev.map(a =>
                a.id === editingId
                    ? { ...formData, id: editingId }
                    : formData.isDefault
                        ? { ...a, isDefault: false }
                        : a
            ));
        } else {
            const newAddress = {
                ...formData,
                id: Date.now()
            };
            if (formData.isDefault) {
                setAddresses(prev => [...prev.map(a => ({ ...a, isDefault: false })), newAddress]);
            } else {
                setAddresses(prev => [...prev, newAddress]);
            }
        }

        resetForm();
    };

    const getLabelInfo = (labelValue) => {
        return ADDRESS_LABELS.find(l => l.value === labelValue) || ADDRESS_LABELS[3];
    };

    return (
        <DashboardLayout title="Libreta de Direcciones" links={clientDashboardLinks}>
            <BackButton to="/cliente" label="Volver a Mi Panel" />
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-gray-500">Gestiona tus direcciones de envío en Colombia</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                        Nueva Dirección
                    </button>
                )}
            </div>

            {/* Address Form */}
            {showForm && (
                <div className="card p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {editingId ? 'Editar Dirección' : 'Nueva Dirección'}
                        </h3>
                        <button
                            onClick={resetForm}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Label Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Tipo de dirección
                            </label>
                            <div className="flex gap-3">
                                {ADDRESS_LABELS.map(labelOption => {
                                    const Icon = labelOption.icon;
                                    return (
                                        <button
                                            key={labelOption.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, label: labelOption.value }))}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${formData.label === labelOption.value
                                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 ring-2 ring-primary-500'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {labelOption.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Name and Phone */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre del destinatario *
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                    placeholder="María García"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Teléfono *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="300 123 4567"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                        </div>

                        {/* Department and City */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Departamento *
                                </label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                >
                                    <option value="">Selecciona...</option>
                                    {COLOMBIA_DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ciudad *
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                    placeholder="Bogotá"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                        </div>

                        {/* Neighborhood and Address */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Barrio
                                </label>
                                <input
                                    type="text"
                                    value={formData.neighborhood}
                                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                                    placeholder="Chapinero"
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dirección *
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Cra 7 #45-23"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Información adicional
                            </label>
                            <input
                                type="text"
                                value={formData.additionalInfo}
                                onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                                placeholder="Apto 502, Torre B, Entrada por la calle 45..."
                                className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>

                        {/* Default Checkbox */}
                        <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg cursor-pointer mb-6">
                            <input
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                                className="w-5 h-5 text-primary-600 rounded"
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                                Usar como dirección predeterminada
                            </span>
                        </label>

                        {/* Form Actions */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            >
                                <FiCheck className="w-5 h-5" />
                                {editingId ? 'Guardar Cambios' : 'Agregar Dirección'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Addresses List */}
            {addresses.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Sin direcciones guardadas
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Agrega una dirección para tus envíos
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <FiPlus className="w-5 h-5" />
                        Agregar Dirección
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {addresses.map(address => {
                        const labelInfo = getLabelInfo(address.label);
                        const LabelIcon = labelInfo.icon;

                        return (
                            <div
                                key={address.id}
                                className={`card p-6 relative ${address.isDefault
                                        ? 'ring-2 ring-primary-500'
                                        : ''
                                    }`}
                            >
                                {address.isDefault && (
                                    <div className="absolute -top-2 -right-2 px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                                        Predeterminada
                                    </div>
                                )}

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-full">
                                        <LabelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                {labelInfo.label}
                                            </h3>
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {address.fullName}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                            {address.address}
                                            {address.additionalInfo && `, ${address.additionalInfo}`}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {address.neighborhood && `${address.neighborhood}, `}
                                            {address.city}, {address.department}
                                        </p>
                                        <p className="text-gray-500 text-sm mt-1">
                                            📱 {address.phone}
                                        </p>

                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => handleEdit(address)}
                                                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                                Editar
                                            </button>
                                            {!address.isDefault && (
                                                <>
                                                    <button
                                                        onClick={() => handleSetDefault(address.id)}
                                                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                                                    >
                                                        <FiCheck className="w-4 h-4" />
                                                        Predeterminar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(address.id)}
                                                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}

export default AddressBook;
