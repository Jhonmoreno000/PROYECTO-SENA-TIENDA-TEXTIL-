import React from 'react';

/**
 * Ilustraciones con trazo humano, cálido y artesanal (estilo ilustración orgánica a mano alzada),
 * diseñadas para las pasarelas de pago de D&D Textil Medellín (sin PSE ni ePayco).
 */

export function IconoHumanoWompi({ className = 'w-8 h-8' }) {
    return (
        <svg viewBox="0 0 44 44" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Acuarela orgánica cálida de fondo */}
            <path
                d="M8 23.5C6.2 14.2 13.4 6.8 22.8 7.2C32.2 7.6 38.4 14.5 36.8 23.8C35.2 33.1 27.6 37.5 18.2 36.4C10.4 35.4 9.5 30.4 8 23.5Z"
                fill="#FFEDD5"
            />
            <path
                d="M12 28C10.5 21 15.5 12 24 12.5C31 13 34.5 19.5 33 26.5C31.5 33.5 24.5 35 18 33.5"
                stroke="#FDBA74"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeDasharray="3 3"
            />
            {/* Mano humana cálida recibiendo / entregando con confianza */}
            <path
                d="M9.5 28.5C12.2 26.3 15.6 26.1 19.2 27.2L25.4 28.6C28.2 29.1 31.2 27.4 32.8 24.8"
                stroke="#9A3412"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M7.5 31.2C11.5 30.2 15.8 31.5 21.2 31.8C26.6 32.1 30.8 29.6 33.5 26.5"
                stroke="#EA580C"
                strokeWidth="2"
                strokeLinecap="round"
            />
            {/* Chispa / corazón tejido a mano */}
            <path
                d="M23.2 9.5C21 13.5 18.4 17 16.5 19.8C15.9 20.7 16.5 21.8 17.6 21.6L23.6 20.8L21 28.2C20.6 29.2 21.8 29.8 22.6 28.9C25.8 25.1 28.8 21.1 30.8 17.6C31.3 16.7 30.6 15.7 29.6 15.9L23.9 16.7L25.6 10.4C25.9 9.4 24.5 8.8 23.2 9.5Z"
                fill="#FB923C"
                fillOpacity="0.35"
                stroke="#EA580C"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Destellos artesanales */}
            <path d="M11.5 14C12.6 13.6 13.6 12.8 14.1 11.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <circle cx="33" cy="13" r="1.8" fill="#F59E0B" />
        </svg>
    );
}

export function IconoHumanoMercadoPago({ className = 'w-8 h-8' }) {
    return (
        <svg viewBox="0 0 44 44" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Mancha acuarela celeste cálida */}
            <path
                d="M7.8 22.2C7 13.8 14.2 8.2 22.6 8.6C31 9 37.2 15.2 36.1 23.4C35 31.6 27.9 36.4 19.5 35.7C11.9 35 8.4 29.2 7.8 22.2Z"
                fill="#E0F2FE"
            />
            {/* Dos manos estrechándose con calidez humana */}
            <path
                d="M8.5 22.5C11.4 19.2 14.8 18.2 18.2 20.5L22 23L25.8 20.5C29.2 18.2 32.6 19.2 35.5 22.5"
                stroke="#0369A1"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M13 26.5L17.5 29.8C20 31.4 24 31.4 26.5 29.8L31 26.5"
                stroke="#0284C7"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Corazón humano de trato justo */}
            <path
                d="M22 15.2C20.8 13.6 18.4 13.3 17.2 14.6C16 15.9 16.4 18 18.2 19.4L22 22.2L25.8 19.4C27.6 18 28 15.9 26.8 14.6C25.6 13.3 23.2 13.6 22 15.2Z"
                fill="#FBBF24"
                fillOpacity="0.45"
                stroke="#D97706"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="15" r="1.5" fill="#38BDF8" />
            <circle cx="32" cy="15" r="1.5" fill="#38BDF8" />
        </svg>
    );
}

export function IconoHumanoNequi({ className = 'w-8 h-8' }) {
    return (
        <svg viewBox="0 0 44 44" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Acuarela rosa/ciruela suave */}
            <path
                d="M9.5 21.5C9.5 13 15.2 7.2 22.6 8C30 8.8 35.2 15.2 34.1 23.6C33 32 26.6 37.2 18.9 36.4C12 35.7 9.5 28.8 9.5 21.5Z"
                fill="#FCE7F3"
            />
            {/* Teléfono dibujado a mano con curvas orgánicas */}
            <path
                d="M15.8 9.8C19.5 9.3 24.5 9.3 28.2 9.8C30 10 31.1 11.4 31.2 13.1C31.6 18.8 31.6 24.5 31.2 30.1C31.1 31.8 29.9 33.1 28.1 33.4C24.4 33.9 19.6 33.9 15.9 33.4C14.1 33.1 12.9 31.8 12.8 30.1C12.4 24.4 12.4 18.7 12.8 13.1C12.9 11.4 14 10 15.8 9.8Z"
                fill="#FDF2F8"
                stroke="#9D174D"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Rostro amable / sonrisa cercana */}
            <circle cx="18.8" cy="17.5" r="1.6" fill="#BE185D" />
            <circle cx="25.2" cy="17.5" r="1.6" fill="#BE185D" />
            <path
                d="M18.2 22.2C20 24.4 24 24.4 25.8 22.2"
                stroke="#DB2777"
                strokeWidth="2.3"
                strokeLinecap="round"
            />
            {/* Mejillas cálidas */}
            <circle cx="16.5" cy="20.5" r="1.5" fill="#F472B6" fillOpacity="0.55" />
            <circle cx="27.5" cy="20.5" r="1.5" fill="#F472B6" fillOpacity="0.55" />
            {/* Onda de cercanía */}
            <path d="M34.5 16.5C36.2 19 36.2 23 34.5 25.5" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 29.5H24" stroke="#9D174D" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}

export function IconoHumanoTarjeta({ className = 'w-8 h-8' }) {
    return (
        <svg viewBox="0 0 44 44" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Acuarela esmeralda/ámbar artesanal */}
            <path
                d="M7.5 22.5C7.9 14 14.8 8.8 23.5 9.2C32.2 9.6 37.8 16.2 36.6 24.2C35.4 32.2 28.2 36.4 19.4 35.7C11.2 35 7.1 29.5 7.5 22.5Z"
                fill="#FEF3C7"
            />
            {/* Billetera / tarjeta textil con costura artesanal */}
            <path
                d="M9.2 14.8C17.4 14.2 26.6 14.2 34.8 14.8C36.5 14.9 37.6 16.3 37.8 18C38.1 21.8 38.1 25.6 37.8 29.4C37.6 31.1 36.4 32.4 34.7 32.5C26.5 33.1 17.5 33.1 9.3 32.5C7.6 32.4 6.4 31.1 6.2 29.4C5.9 25.6 5.9 21.8 6.2 18C6.4 16.3 7.5 14.9 9.2 14.8Z"
                fill="#FFFBEB"
                stroke="#B45309"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Pespunte de hilo textil */}
            <path
                d="M7 20C17 19.5 27 19.5 37 20"
                stroke="#D97706"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="4 3"
            />
            {/* Sello dorado artesanal y trazo de firma humana */}
            <rect x="11" y="24" width="6.5" height="4.8" rx="1.8" fill="#F59E0B" fillOpacity="0.45" stroke="#B45309" strokeWidth="1.8" />
            <path
                d="M22 26.8C24.2 25.2 25.8 28 28 26.2C29.5 25 31 27.1 32.8 26"
                stroke="#059669"
                strokeWidth="2.1"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function IconoHumanoBancolombia({ className = 'w-8 h-8' }) {
    return (
        <svg viewBox="0 0 44 44" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="15" fill="#FEF3C7" />
            {/* Arco humano protector */}
            <path
                d="M10.5 18.5L20.8 11.2C21.6 10.6 22.6 10.6 23.4 11.2L33.5 18.5"
                stroke="#1E293B"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Tres pinceladas orgánicas cálidas */}
            <path d="M13 22.2C18.5 20.6 25.5 20.6 31 22.2" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <path d="M14.5 26.5C19.5 25.2 24.5 25.2 29.5 26.5" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
            <path d="M16 30.8C20 29.8 24 29.8 28 30.8" stroke="#E11D48" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

export function LogoWompi({ className = 'h-7', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-2 select-none ${className}`}>
            <svg viewBox="0 0 40 36" className="h-full w-auto shrink-0" fill="none">
                <rect width="40" height="36" rx="11" fill={darkBg ? '#00C389' : '#0b192c'} />
                <path d="M7 11C14.5 8.5 25.5 8.5 33 11" stroke="#FDDA24" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M9 18C15.5 16 24.5 16 31 18" stroke="#0055B8" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M11 25C16.5 23.4 23.5 23.4 29 25" stroke="#E31837" strokeWidth="3.2" strokeLinecap="round" />
            </svg>
            <div className="flex flex-col leading-none text-left">
                <span className={`font-black tracking-tight text-sm ${darkBg ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    wompi
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-widest ${darkBg ? 'text-emerald-300' : 'text-blue-700 dark:text-emerald-400'}`}>
                    Bancolombia
                </span>
            </div>
        </div>
    );
}

export function LogoMercadoPago({ className = 'h-7', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-2 select-none ${className}`}>
            <svg viewBox="0 0 44 34" className="h-full w-auto shrink-0" fill="none">
                <ellipse cx="22" cy="17" rx="21" ry="15" fill="#009EE3" stroke={darkBg ? '#7dd3fc' : 'none'} strokeWidth="1.2" />
                <path
                    d="M11 18.5c2.5-3 5.2-3.5 8-1.2l3 2.3 3-2.3c2.8-2.3 5.5-1.8 8 1.2"
                    stroke="#FFFFFF"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M15 21.5l3.5 2.5c1.8 1.2 5.2 1.2 7 0L29 21.5"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                />
                <circle cx="15.5" cy="14" r="1.8" fill="#FFE600" />
                <circle cx="28.5" cy="14" r="1.8" fill="#FFE600" />
            </svg>
            <div className="flex flex-col leading-none text-left">
                <span className={`font-black tracking-tight text-xs ${darkBg ? 'text-white' : 'text-[#009EE3] dark:text-sky-300'}`}>
                    mercado
                </span>
                <span className={`font-black tracking-tight text-xs ${darkBg ? 'text-sky-300' : 'text-[#005e8a] dark:text-white'}`}>
                    pago
                </span>
            </div>
        </div>
    );
}

export function LogoNequi({ className = 'h-7', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-2 select-none ${className}`}>
            <svg viewBox="0 0 38 36" className="h-full w-auto shrink-0" fill="none">
                <rect width="38" height="36" rx="11" fill="#20002C" stroke={darkBg ? '#f472b6' : 'none'} strokeWidth="1.2" />
                <rect x="6.5" y="10" width="4.5" height="4.5" rx="1.6" fill="#FF0080" />
                <path
                    d="M15 25V11l9.5 14V11"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <div className="flex flex-col leading-none text-left">
                <span className={`font-black tracking-tight text-sm ${darkBg ? 'text-white' : 'text-[#20002C] dark:text-white'}`}>
                    Nequi
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${darkBg ? 'text-pink-300' : 'text-[#FF0080]'}`}>
                    • Bre-B QR
                </span>
            </div>
        </div>
    );
}

export function LogoTarjetas({ cardType = 'unknown', className = 'h-7', darkBg = false }) {
    if (cardType === 'visa') {
        return (
            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg bg-[#1A1F71] text-white font-black italic text-base tracking-wider shadow-sm ${className}`}>
                VISA
            </div>
        );
    }
    if (cardType === 'mastercard') {
        return (
            <div className={`inline-flex items-center gap-1 ${className}`}>
                <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#EB001B]" />
                    <div className="w-6 h-6 rounded-full bg-[#F79E1B] -ml-2.5 mix-blend-screen" />
                </div>
                <span className={`text-[10px] font-bold ${darkBg ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    Mastercard
                </span>
            </div>
        );
    }
    return (
        <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
            <span className="px-2 py-0.5 rounded bg-[#1A1F71] text-white font-black italic text-[11px] tracking-wider">
                VISA
            </span>
            <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-[#EB001B]" />
                <div className="w-5 h-5 rounded-full bg-[#F79E1B] -ml-2 opacity-90" />
            </div>
        </div>
    );
}

export function LogoPasarelaPorId({ gateway, cardType = 'unknown', className = 'h-7', darkBg = false }) {
    switch (gateway) {
        case 'wompi':
            return <LogoWompi className={className} darkBg={darkBg} />;
        case 'mercadopago':
            return <LogoMercadoPago className={className} darkBg={darkBg} />;
        case 'nequi':
            return <LogoNequi className={className} darkBg={darkBg} />;
        case 'card':
        default:
            return <LogoTarjetas cardType={cardType} className={className} darkBg={darkBg} />;
    }
}
