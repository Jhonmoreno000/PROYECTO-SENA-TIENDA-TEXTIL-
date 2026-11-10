import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    Compass,
    Hash,
    FileText,
    ArrowRight,
    ShieldCheck,
    Lock,
    Sparkles,
    AlertCircle,
} from 'lucide-react';
import {
    LogoWompi,
    LogoMercadoPago,
    LogoNequi,
    LogoEpayco,
    LogoPSE,
    LogoTarjetas,
} from '../paginas/payment/LogosPasarelas';

function CheckoutForm({
    onSubmit,
    formData,
    setFormData,
    errors: externalErrors,
    setErrors: setExternalErrors,
}) {
    const [internalErrors, setInternalErrors] = useState({});
    const errors = externalErrors || internalErrors;
    const setErrors = setExternalErrors || setInternalErrors;

    const validateField = (name, value = '') => {
        const val = String(value || '');
        let error = '';
        switch (name) {
            case 'fullName':
                if (!val.trim()) error = 'El nombre completo es requerido';
                else if (val.trim().length < 3) error = 'El nombre debe tener al menos 3 caracteres';
                break;
            case 'email':
                if (!val.trim()) error = 'El correo electrónico es requerido';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) error = 'Correo electrónico inválido';
                break;
            case 'phone':
                if (!val.trim()) error = 'El teléfono móvil es requerido';
                else if (!/^\d{10}$/.test(val.replace(/\s/g, ''))) error = 'Teléfono inválido (debe tener 10 dígitos)';
                break;
            case 'address':
                if (!val.trim()) error = 'La dirección de entrega es requerida';
                else if (val.trim().length < 5) error = 'Ingresa una dirección completa (mínimo 5 caracteres)';
                break;
            case 'city':
                if (!val.trim()) error = 'La ciudad o municipio es requerida';
                break;
            case 'state':
                if (!val.trim()) error = 'El departamento es requerido';
                break;
            case 'zipCode':
                if (!val.trim()) error = 'El código postal es requerido';
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
        const newErrors = {};
        requiredFields.forEach((key) => {
            const error = validateField(key, formData[key] || '');
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            onSubmit();
        }
    };

    return (
        <form id="checkout-shipping-form" onSubmit={handleSubmit} className="space-y-8">
            {/* SECCIÓN 1: INFORMACIÓN DE CONTACTO */}
            <div>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900/5 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                            Información de Contacto
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Para facturación electrónica y notificaciones de despacho
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Nombre Completo */}
                    <div>
                        <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Nombre Completo <span className="text-rose-500">*</span>
                        </label>
                        <div
                            className={`group relative flex items-center rounded-xl bg-slate-50 dark:bg-slate-950/70 border ${
                                errors.fullName
                                    ? 'border-rose-500 ring-2 ring-rose-500/10'
                                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                            } focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/15 transition-all shadow-xs`}
                        >
                            <User className="w-4 h-4 text-slate-400 group-focus-within:text-primary-500 ml-3.5 shrink-0 transition-colors" />
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName || ''}
                                onChange={handleChange}
                                placeholder="Ej. Juan Pérez"
                                className="w-full px-3 py-3 bg-transparent text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400 focus:outline-none"
                            />
                        </div>
                        {errors.fullName && (
                            <p className="flex items-center gap-1 text-rose-500 text-xs mt-1.5 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{errors.fullName}</span>
                            </p>
                        )}
                    </div>

                    {/* Correo y Teléfono */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Correo Electrónico <span className="text-rose-500">*</span>
                            </label>
                            <div
                                className={`group relative flex items-center rounded-xl bg-slate-50 dark:bg-slate-950/70 border ${
                                    errors.email
                                        ? 'border-rose-500 ring-2 ring-rose-500/10'
                                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                                } focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/15 transition-all shadow-xs`}
                            >
                                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-primary-500 ml-3.5 shrink-0 transition-colors" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    placeholder="juan@ejemplo.com"
                                    className="w-full px-3 py-3 bg-transparent text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                            {errors.email && (
                                <p className="flex items-center gap-1 text-rose-500 text-xs mt-1.5 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errors.email}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Teléfono Móvil <span className="text-rose-500">*</span>
                            </label>
                            <div
                                className={`group relative flex items-center rounded-xl bg-slate-50 dark:bg-slate-950/70 border ${
                                    errors.phone
                                        ? 'border-rose-500 ring-2 ring-rose-500/10'
                                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                                } focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/15 transition-all shadow-xs`}
                            >
                                <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-primary-500 ml-3.5 shrink-0 transition-colors" />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    placeholder="3001234567"
                                    className="w-full px-3 py-3 bg-transparent text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                            {errors.phone && (
                                <p className="flex items-center gap-1 text-rose-500 text-xs mt-1.5 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errors.phone}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: DIRECCIÓN DE ENVÍO */}
            <div>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900/5 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                            Dirección de Envío
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Despacho de tela con corte continuo garantizado a toda Colombia
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Dirección */}
                    <div>
                        <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Dirección de Entrega <span className="text-rose-500">*</span>
                        </label>
                        <div
                            className={`group relative flex items-center rounded-xl bg-slate-50 dark:bg-slate-950/70 border ${
                                errors.address
                                    ? 'border-rose-500 ring-2 ring-rose-500/10'
                                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                            } focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/15 transition-all shadow-xs`}
                        >
                            <MapPin className="w-4 h-4 text-slate-400 group-focus-within:text-primary-500 ml-3.5 shrink-0 transition-colors" />
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                placeholder="Cra. 52 (Carabobo) # 48-30, Apto / Local"
                                className="w-full px-3 py-3 bg-transparent text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400 focus:outline-none"
                            />
                        </div>
                        {errors.address && (
                            <p className="flex items-center gap-1 text-rose-500 text-xs mt-1.5 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{errors.address}</span>
                            </p>
                        )}
                    </div>

                    {/* Ciudad, Departamento, Código Postal */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Ciudad / Municipio <span className="text-rose-500">*</span>
                            </label>
                            <div
                                className={`group relative flex items-center rounded-xl bg-slate-50 dark:bg-slate-950/70 border ${
                                    errors.city
                                        ? 'border-rose-500 ring-2 ring-rose-500/10'
                                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                                } focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/15 transition-all shadow-xs`}
                            >
                                <Building2 className="w-4 h-4 text-slate-400 group-focus-within:text-primary-500 ml-3.5 shrink-0 transition-colors" />
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city || ''}
                                    onChange={handleChange}
                                    placeholder="Medellín"
                                    className="w-full px-3 py-3 bg-transparent text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                            {errors.city && (
                                <p className="flex items-center gap-1 text-rose-500 text-xs mt-1.5 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errors.city}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="state" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Departamento <span className="text-rose-500">*</span>
                            </label>
                            <div
                                className={`group relative flex items-center rounded-xl bg-slate-50 dark:bg-slate-950/70 border ${
                                    errors.state
                                        ? 'border-rose-500 ring-2 ring-rose-500/10'
                                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                                } focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/15 transition-all shadow-xs`}
                            >
                                <Compass className="w-4 h-4 text-slate-400 group-focus-within:text-primary-500 ml-3.5 shrink-0 transition-colors" />
                                <input
                                    type="text"
                                    id="state"
                                    name="state"
                                    value={formData.state || ''}
                                    onChange={handleChange}
                                    placeholder="Antioquia"
                                    className="w-full px-3 py-3 bg-transparent text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                            {errors.state && (
                                <p className="flex items-center gap-1 text-rose-500 text-xs mt-1.5 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errors.state}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="zipCode" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Código Postal <span className="text-rose-500">*</span>
                            </label>
                            <div
                                className={`group relative flex items-center rounded-xl bg-slate-50 dark:bg-slate-950/70 border ${
                                    errors.zipCode
                                        ? 'border-rose-500 ring-2 ring-rose-500/10'
                                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                                } focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/15 transition-all shadow-xs`}
                            >
                                <Hash className="w-4 h-4 text-slate-400 group-focus-within:text-primary-500 ml-3.5 shrink-0 transition-colors" />
                                <input
                                    type="text"
                                    id="zipCode"
                                    name="zipCode"
                                    value={formData.zipCode || ''}
                                    onChange={handleChange}
                                    placeholder="050012"
                                    className="w-full px-3 py-3 bg-transparent text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                            {errors.zipCode && (
                                <p className="flex items-center gap-1 text-rose-500 text-xs mt-1.5 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{errors.zipCode}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Notas de Entrega */}
                    <div>
                        <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Notas de Entrega <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                        </label>
                        <div className="group relative flex rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-500/15 transition-all shadow-xs">
                            <FileText className="w-4 h-4 text-slate-400 group-focus-within:text-primary-500 ml-3.5 mt-3.5 shrink-0 transition-colors" />
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-3 bg-transparent text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400 focus:outline-none resize-none"
                                placeholder="Indicaciones para el portero, horario de recepción o instrucciones de corte..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* VISTA PREVIA GLASSMÓRFICA DE PASARELAS HABILITADAS */}
            <div className="rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        Pasarelas colombianas habilitadas en el siguiente paso:
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Cifrado PCI-DSS / 3D-Secure
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-xs shrink-0">
                        <LogoWompi className="h-6" />
                    </div>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-xs shrink-0">
                        <LogoMercadoPago className="h-6" />
                    </div>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-xs shrink-0">
                        <LogoNequi className="h-6" />
                    </div>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-xs shrink-0">
                        <LogoEpayco className="h-6" />
                    </div>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-xs shrink-0">
                        <LogoPSE className="h-6" />
                    </div>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-xs shrink-0">
                        <LogoTarjetas className="h-6" />
                    </div>
                </div>
            </div>

            {/* BOTÓN CTA PRINCIPAL DE D&D TEXTIL */}
            <div className="pt-2">
                <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/35 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group"
                >
                    <Lock className="w-4 h-4 opacity-90" />
                    <span>Continuar a Pasarela de Pago (Wompi • Nequi • Tarjeta • PSE)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
                    Al confirmar tu pedido, aceptas los términos de corte continuo y la Política de Tratamiento de Datos (Ley 1581 de 2012).
                </p>
            </div>
        </form>
    );
}

export default CheckoutForm;
