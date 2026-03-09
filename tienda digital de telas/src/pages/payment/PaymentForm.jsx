import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cardPaymentSchema, documentTypes } from './paymentSchema';
import { FiCreditCard, FiUser, FiCalendar, FiLock, FiFileText, FiHash } from 'react-icons/fi';

function PaymentForm({ onSubmit, onCardDataChange, onCVVFocus, onCVVBlur, isProcessing }) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(cardPaymentSchema),
        mode: 'onChange',
    });

    const watchedFields = watch();

    // Actualizar datos de la tarjeta en tiempo real
    React.useEffect(() => {
        onCardDataChange(watchedFields);
    }, [watchedFields, onCardDataChange]);

    // Formatear número de tarjeta
    const formatCardNumber = (e) => {
        let value = e.target.value.replace(/\s/g, '');
        value = value.replace(/\D/g, '');
        value = value.slice(0, 16);
        e.target.value = value;
    };

    // Formatear fecha de expiración
    const formatExpiryDate = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value.slice(0, 5);
    };

    // Formatear CVV
    const formatCVV = (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre del titular */}
            <div>
                <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiUser className="inline w-4 h-4 mr-2" />
                    Nombre del Titular
                </label>
                <input
                    {...register('cardholderName')}
                    id="cardholderName"
                    type="text"
                    placeholder="NOMBRE APELLIDO"
                    className={`input-field uppercase ${errors.cardholderName ? 'border-red-500' : ''}`}
                    aria-invalid={errors.cardholderName ? 'true' : 'false'}
                    aria-describedby={errors.cardholderName ? 'cardholderName-error' : undefined}
                />
                {errors.cardholderName && (
                    <p id="cardholderName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.cardholderName.message}
                    </p>
                )}
            </div>

            {/* Número de tarjeta */}
            <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiCreditCard className="inline w-4 h-4 mr-2" />
                    Número de Tarjeta
                </label>
                <input
                    {...register('cardNumber')}
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    onInput={formatCardNumber}
                    className={`input-field font-mono ${errors.cardNumber ? 'border-red-500' : ''}`}
                    aria-invalid={errors.cardNumber ? 'true' : 'false'}
                    aria-describedby={errors.cardNumber ? 'cardNumber-error' : undefined}
                />
                {errors.cardNumber && (
                    <p id="cardNumber-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.cardNumber.message}
                    </p>
                )}
            </div>

            {/* Fecha y CVV */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FiCalendar className="inline w-4 h-4 mr-2" />
                        Vencimiento
                    </label>
                    <input
                        {...register('expiryDate')}
                        id="expiryDate"
                        type="text"
                        placeholder="MM/AA"
                        maxLength="5"
                        onInput={formatExpiryDate}
                        className={`input-field font-mono ${errors.expiryDate ? 'border-red-500' : ''}`}
                        aria-invalid={errors.expiryDate ? 'true' : 'false'}
                        aria-describedby={errors.expiryDate ? 'expiryDate-error' : undefined}
                    />
                    {errors.expiryDate && (
                        <p id="expiryDate-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.expiryDate.message}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FiLock className="inline w-4 h-4 mr-2" />
                        CVV
                    </label>
                    <input
                        {...register('cvv')}
                        id="cvv"
                        type="text"
                        placeholder="123"
                        maxLength="4"
                        onInput={formatCVV}
                        onFocus={onCVVFocus}
                        onBlur={onCVVBlur}
                        className={`input-field font-mono ${errors.cvv ? 'border-red-500' : ''}`}
                        aria-invalid={errors.cvv ? 'true' : 'false'}
                        aria-describedby={errors.cvv ? 'cvv-error' : undefined}
                    />
                    {errors.cvv && (
                        <p id="cvv-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.cvv.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Tipo de documento */}
            <div>
                <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiFileText className="inline w-4 h-4 mr-2" />
                    Tipo de Documento
                </label>
                <select
                    {...register('documentType')}
                    id="documentType"
                    className={`input-field ${errors.documentType ? 'border-red-500' : ''}`}
                    aria-invalid={errors.documentType ? 'true' : 'false'}
                    aria-describedby={errors.documentType ? 'documentType-error' : undefined}
                >
                    <option value="">Selecciona...</option>
                    {documentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
                {errors.documentType && (
                    <p id="documentType-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.documentType.message}
                    </p>
                )}
            </div>

            {/* Número de documento */}
            <div>
                <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiHash className="inline w-4 h-4 mr-2" />
                    Número de Documento
                </label>
                <input
                    {...register('documentNumber')}
                    id="documentNumber"
                    type="text"
                    placeholder="1234567890"
                    className={`input-field ${errors.documentNumber ? 'border-red-500' : ''}`}
                    aria-invalid={errors.documentNumber ? 'true' : 'false'}
                    aria-describedby={errors.documentNumber ? 'documentNumber-error' : undefined}
                />
                {errors.documentNumber && (
                    <p id="documentNumber-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.documentNumber.message}
                    </p>
                )}
            </div>

            {/* Botón de envío */}
            <button
                type="submit"
                disabled={!isValid || isProcessing}
                className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando...
                    </>
                ) : (
                    <>
                        <FiLock className="w-5 h-5" />
                        Pagar de forma segura
                    </>
                )}
            </button>
        </form>
    );
}

export default PaymentForm;
