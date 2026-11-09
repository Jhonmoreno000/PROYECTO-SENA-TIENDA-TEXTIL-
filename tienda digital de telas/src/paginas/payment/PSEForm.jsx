import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { psePaymentSchema, colombianBanks } from './paymentSchema';
import { Info, Mail, User, DollarSign } from 'lucide-react';

function PSEForm({ onSubmit, isProcessing }) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(psePaymentSchema),
        mode: 'onChange',
    });

    return (
        <div className="space-y-6">
            {/* Info Panel con Glassmorfismo */}
            <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4.5 backdrop-blur-md">
                <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                            ¿Qué es PSE (Pagos Seguros en Línea)?
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Servicio interbancario de ACH Colombia para debitar directamente desde tu cuenta de ahorros o corriente sin comisiones adicionales.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Selección de banco */}
                <div>
                    <label htmlFor="bank" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <DollarSign className="inline w-4 h-4 mr-2" />
                        Selecciona tu Banco
                    </label>
                    <select
                        {...register('bank')}
                        id="bank"
                        className={`input-field ${errors.bank ? 'border-red-500' : ''}`}
                        aria-invalid={errors.bank ? 'true' : 'false'}
                        aria-describedby={errors.bank ? 'bank-error' : undefined}
                    >
                        <option value="">Selecciona tu banco...</option>
                        {colombianBanks.map((bank) => (
                            <option key={bank} value={bank}>
                                {bank}
                            </option>
                        ))}
                    </select>
                    {errors.bank && (
                        <p id="bank-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.bank.message}
                        </p>
                    )}
                </div>

                {/* Tipo de persona */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        <User className="inline w-4 h-4 mr-2" />
                        Tipo de Persona
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                            <input
                                {...register('personType')}
                                type="radio"
                                value="natural"
                                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Persona Natural
                            </span>
                        </label>
                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                            <input
                                {...register('personType')}
                                type="radio"
                                value="juridica"
                                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Persona Jurídica
                            </span>
                        </label>
                    </div>
                    {errors.personType && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {errors.personType.message}
                        </p>
                    )}
                </div>

                {/* Correo electrónico */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail className="inline w-4 h-4 mr-2" />
                        Correo Electrónico
                    </label>
                    <input
                        {...register('email')}
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.email.message}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Recibirás la confirmación del pago en este correo
                    </p>
                </div>

                {/* Botón de envío alineado con la marca D&D Textil */}
                <button
                    type="submit"
                    disabled={!isValid || isProcessing}
                    className="w-full py-4 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/35 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Procesando...
                        </>
                    ) : (
                        <>
                            <DollarSign className="w-5 h-5" />
                            Pagar con PSE
                        </>
                    )}
                </button>

                {/* Nota de seguridad */}
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        🔒 Transacción segura. Serás redirigido al portal de tu banco para completar el pago.
                    </p>
                </div>
            </form>
        </div>
    );
}

export default PSEForm;
