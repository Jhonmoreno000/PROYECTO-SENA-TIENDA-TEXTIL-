import React, { useState } from 'react';
import { motion } from 'framer-motion';

function CheckoutForm({ onSubmit, formData, setFormData }) {
    const [errors, setErrors] = useState({});

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'fullName':
                if (!value.trim()) error = 'El nombre completo es requerido';
                else if (value.trim().length < 3) error = 'El nombre debe tener al menos 3 caracteres';
                break;
            case 'email':
                if (!value.trim()) error = 'El correo electrónico es requerido';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Correo electrónico inválido';
                break;
            case 'phone':
                if (!value.trim()) error = 'El teléfono es requerido';
                else if (!/^\d{10}$/.test(value.replace(/\s/g, ''))) error = 'Teléfono inválido (10 dígitos)';
                break;
            case 'address':
                if (!value.trim()) error = 'La dirección es requerida';
                break;
            case 'city':
                if (!value.trim()) error = 'La ciudad es requerida';
                break;
            case 'state':
                if (!value.trim()) error = 'El departamento es requerido';
                break;
            case 'zipCode':
                if (!value.trim()) error = 'El código postal es requerido';
                break;
            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validar en tiempo real
        const error = validateField(name, value);
        setErrors({ ...errors, [name]: error });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar todos los campos
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            if (key !== 'notes') { // notes es opcional
                const error = validateField(key, formData[key]);
                if (error) newErrors[key] = error;
            }
        });

        setErrors(newErrors);

        // Si no hay errores, enviar
        if (Object.keys(newErrors).length === 0) {
            onSubmit();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>

                {/* Full Name */}
                <div className="mb-4">
                    <label htmlFor="fullName" className="block font-semibold mb-2">
                        Nombre Completo *
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`input-field ${errors.fullName ? 'border-red-500' : ''}`}
                        placeholder="Juan Pérez"
                    />
                    {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                </div>

                {/* Email and Phone */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="email" className="block font-semibold mb-2">
                            Correo Electrónico *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="juan@ejemplo.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block font-semibold mb-2">
                            Teléfono *
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                            placeholder="3001234567"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-6">Dirección de Envío</h2>

                {/* Address */}
                <div className="mb-4">
                    <label htmlFor="address" className="block font-semibold mb-2">
                        Dirección *
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                        placeholder="Calle 123 #45-67"
                    />
                    {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                </div>

                {/* City, State, Zip */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor="city" className="block font-semibold mb-2">
                            Ciudad *
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                            placeholder="Bogotá"
                        />
                        {errors.city && (
                            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="state" className="block font-semibold mb-2">
                            Departamento *
                        </label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                            placeholder="Cundinamarca"
                        />
                        {errors.state && (
                            <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="zipCode" className="block font-semibold mb-2">
                            Código Postal *
                        </label>
                        <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            className={`input-field ${errors.zipCode ? 'border-red-500' : ''}`}
                            placeholder="110111"
                        />
                        {errors.zipCode && (
                            <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div className="mb-4">
                    <label htmlFor="notes" className="block font-semibold mb-2">
                        Notas de Entrega (Opcional)
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        className="input-field resize-none"
                        placeholder="Instrucciones especiales para la entrega..."
                    ></textarea>
                </div>
            </div>

            <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-primary w-full text-lg py-4"
            >
                Confirmar Pedido
            </motion.button>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Al confirmar tu pedido, aceptas nuestros términos y condiciones
            </p>
        </form>
    );
}

export default CheckoutForm;
