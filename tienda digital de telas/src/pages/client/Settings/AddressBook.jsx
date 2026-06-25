import React, { useState } from 'react';
import { 
    MapPin, 
    Plus, 
    Edit2, 
    Trash2, 
    Check, 
    X, 
    Home, 
    Wrench, 
    Briefcase,
    Building2,
    Phone,
    Map
} from 'lucide-react';

import DashboardLayout from '../../../components/layouts/DashboardLayout';
import AnimatedPage from '../../../components/AnimatedPage';
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
    { value: 'home', label: 'Casa', icon: Home },
    { value: 'workshop', label: 'Taller', icon: Wrench },
    { value: 'office', label: 'Oficina', icon: Briefcase },
    { value: 'other', label: 'Otro', icon: Building2 }
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar esta dirección de forma permanente?')) {
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
            alert('Por favor completa todos los campos requeridos (*).');
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
            <AnimatedPage>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <BackButton to="/cliente/configuracion" label="Volver a Configuración" />
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4 tracking-tight flex items-center gap-3">
                            Libreta de Direcciones
                            <span className="bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                Envíos
                            </span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                            Gestiona tus ubicaciones frecuentes para facilitar tus compras.
                        </p>
                    </div>
                    
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-900/10 dark:shadow-white/10 hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            Agregar Nueva Dirección
                        </button>
                    )}
                </div>

                {/* ================================================================
                    FORMULARIO
                ================================================================ */}
                {showForm && (
                    <div className="card p-6 md:p-8 mb-8 border-2 border-sky-500 shadow-xl shadow-sky-500/10">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                                </div>
                                {editingId ? 'Editar Dirección Existente' : 'Registrar Nueva Dirección'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Etiqueta */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Identifica esta ubicación
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {ADDRESS_LABELS.map(labelOption => {
                                        const Icon = labelOption.icon;
                                        return (
                                            <button
                                                key={labelOption.value}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, label: labelOption.value }))}
                                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-300 border-2 ${
                                                    formData.label === labelOption.value
                                                        ? 'bg-sky-50 border-sky-500 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 shadow-sm'
                                                        : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-500 hover:border-sky-300 dark:hover:border-slate-500'
                                                }`}
                                            >
                                                <Icon className={`w-6 h-6 ${formData.label === labelOption.value ? 'text-sky-500' : ''}`} />
                                                <span className="font-bold text-sm">{labelOption.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Nombre */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Nombre de quien recibe *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                        placeholder="Ej: María García"
                                        required
                                        className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all font-medium"
                                    />
                                </div>
                                {/* Teléfono */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Número de Contacto *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="Ej: 300 123 4567"
                                        required
                                        className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Departamento */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Departamento *
                                    </label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                                        required
                                        className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all font-medium appearance-none"
                                    >
                                        <option value="" disabled>Selecciona tu departamento...</option>
                                        {COLOMBIA_DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Ciudad */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Ciudad o Municipio *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        placeholder="Ej: Bogotá"
                                        required
                                        className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Dirección */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Dirección Principal *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        placeholder="Ej: Cra 7 #45-23"
                                        required
                                        className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all font-medium"
                                    />
                                </div>
                                {/* Barrio */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Barrio o Localidad
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.neighborhood}
                                        onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                                        placeholder="Ej: Chapinero"
                                        className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Info Adicional */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Información adicional de entrega (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.additionalInfo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                                    placeholder="Ej: Apto 502, Torre B, Dejar en portería..."
                                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition-all font-medium"
                                />
                            </div>

                            {/* Predeterminada */}
                            <label className="flex items-center gap-4 p-5 bg-sky-50 dark:bg-sky-900/10 rounded-xl border border-sky-100 dark:border-sky-900/30 cursor-pointer group hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-colors">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                                        className="peer sr-only"
                                    />
                                    <div className="w-6 h-6 border-2 border-sky-300 dark:border-sky-700 rounded-md peer-checked:bg-sky-500 peer-checked:border-sky-500 transition-colors flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white block">
                                        Definir como dirección principal
                                    </span>
                                    <span className="text-sm font-medium text-gray-500">
                                        Usaremos esta dirección por defecto en tus próximos pedidos.
                                    </span>
                                </div>
                            </label>

                            {/* Botones */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all font-bold text-lg shadow-lg shadow-sky-500/30 hover:-translate-y-0.5"
                                >
                                    <Check className="w-5 h-5" />
                                    {editingId ? 'Guardar Cambios' : 'Confirmar Dirección'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-bold text-lg"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ================================================================
                    LISTADO DE DIRECCIONES
                ================================================================ */}
                {!showForm && addresses.length === 0 ? (
                    <div className="card p-16 text-center border-dashed border-2 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-sky-50 dark:bg-sky-900/10 flex items-center justify-center mb-6">
                            <MapPin className="w-10 h-10 text-sky-400 dark:text-sky-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Aún no tienes direcciones
                        </h3>
                        <p className="text-gray-500 font-medium mb-6">
                            Guarda una dirección para que tus próximas compras en D&D Textil sean más rápidas.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-500/30 hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            Agregar mi primera dirección
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {addresses.map(address => {
                            const labelInfo = getLabelInfo(address.label);
                            const LabelIcon = labelInfo.icon;

                            return (
                                <div
                                    key={address.id}
                                    className={`card overflow-hidden transition-all duration-300 flex flex-col ${
                                        address.isDefault
                                            ? 'ring-2 ring-sky-500 shadow-xl shadow-sky-500/5'
                                            : 'hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                                >
                                    {/* Cabecera Tarjeta */}
                                    <div className={`p-5 flex justify-between items-start border-b ${
                                        address.isDefault 
                                            ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800/30' 
                                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                                                address.isDefault 
                                                    ? 'bg-sky-600 text-white shadow-sky-500/30' 
                                                    : 'bg-white dark:bg-slate-700 text-slate-500'
                                            }`}>
                                                <LabelIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-none">
                                                    {labelInfo.label}
                                                </h3>
                                                {address.isDefault && (
                                                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                                                        Principal
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cuerpo Tarjeta */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="space-y-3 mb-6 flex-1">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {address.fullName}
                                                </p>
                                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                    {address.phone}
                                                </p>
                                            </div>

                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <p className="text-gray-900 dark:text-white font-medium text-sm leading-relaxed flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                                                    <span>
                                                        {address.address}
                                                        {address.additionalInfo && <span className="block text-slate-500 mt-0.5">{address.additionalInfo}</span>}
                                                    </span>
                                                </p>
                                            </div>
                                            
                                            <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                                <Map className="w-4 h-4 text-slate-400" />
                                                <span>
                                                    {address.neighborhood && `${address.neighborhood}, `}
                                                    {address.city}, {address.department}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            <button
                                                onClick={() => handleEdit(address)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Editar
                                            </button>
                                            
                                            {!address.isDefault && (
                                                <button
                                                    onClick={() => handleSetDefault(address.id)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:hover:bg-sky-900/50 transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Predeterminar
                                                </button>
                                            )}
                                            
                                            <button
                                                onClick={() => handleDelete(address.id)}
                                                className="flex items-center justify-center w-10 px-0 py-2 text-sm font-bold bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 transition-colors flex-shrink-0"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default AddressBook;
