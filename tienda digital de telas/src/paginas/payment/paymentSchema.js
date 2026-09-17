import { z } from 'zod';

// Validación para tarjeta de crédito/débito
export const cardPaymentSchema = z.object({
    cardholderName: z
        .string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras'),

    cardNumber: z
        .string()
        .regex(/^\d{16}$/, 'El número de tarjeta debe tener 16 dígitos'),

    expiryDate: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato inválido (MM/AA)')
        .refine((date) => {
            const [month, year] = date.split('/');
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            return expiry > new Date();
        }, 'La tarjeta está vencida'),

    cvv: z
        .string()
        .regex(/^\d{3,4}$/, 'CVV debe tener 3 o 4 dígitos'),

    documentType: z
        .string()
        .min(1, 'Selecciona un tipo de documento'),

    documentNumber: z
        .string()
        .min(6, 'Número de documento inválido')
        .regex(/^\d+$/, 'Solo se permiten números'),
});

// Validación para PSE
export const psePaymentSchema = z.object({
    bank: z
        .string()
        .min(1, 'Selecciona un banco'),

    personType: z
        .enum(['natural', 'juridica'], {
            errorMap: () => ({ message: 'Selecciona un tipo de persona' })
        }),

    email: z
        .string()
        .email('Correo electrónico inválido'),
});

// Bancos colombianos para PSE
export const colombianBanks = [
    'Bancolombia',
    'Banco de Bogotá',
    'Davivienda',
    'BBVA Colombia',
    'Banco Caja Social',
    'Banco Agrario',
    'Banco AV Villas',
    'Banco Popular',
    'Banco Occidente',
    'Colpatria',
    'Banco Falabella',
    'Banco Pichincha',
    'Banco Cooperativo Coopcentral',
];

// Tipos de documento en Colombia
export const documentTypes = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' },
    { value: 'Pasaporte', label: 'Pasaporte' },
];
