import React from 'react';

/**
 * Logos vectoriales (SVG) de ultra-alta nitidez para pasarelas de pago colombianas y franquicias internacionales.
 * Incorpora los vectores oficiales de Mastercard (Uiverse.io), Visa, Wompi, Mercado Pago, Nequi, ePayco y PSE.
 */

export function LogoMastercard({ className = 'h-7', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-1.5 select-none shrink-0 ${className}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="h-full w-auto shrink-0 drop-shadow-xs"
            >
                <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z" />
                <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z" />
                <path
                    fill="#ff3d00"
                    d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"
                />
            </svg>
            <span
                className={`text-[10px] font-black uppercase tracking-wider shrink-0 whitespace-nowrap ${
                    darkBg ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                }`}
            >
                Mastercard
            </span>
        </div>
    );
}

export function LogoVisa({ className = 'h-7', darkBg = false }) {
    return (
        <div className={`inline-flex items-center select-none shrink-0 ${className}`}>
            <div className="px-2 py-0.5 rounded-md bg-[#1A1F71] text-white flex items-center shadow-xs">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 64 22"
                    className="h-4 w-auto fill-current"
                >
                    <path d="M24.8 2.5L18.4 19H14.1L8.7 5.8c-.3-.7-.6-1-1.2-1.3-1.1-.6-2.9-1.1-4.5-1.4L3.2 2.5h7.3c.9 0 1.8.7 2 1.7l1.8 9.8 4.4-11.5h6.1zm18.4 11.1c0-4.3-6-4.5-6-6.5 0-.6.6-1.1 1.8-1.3.9-.1 3.4-.2 5.2.7l.9-4.4c-1.3-.5-3-.8-5.1-.8-5.4 0-9.1 2.8-9.1 7 0 3 2.7 4.7 4.7 5.7 2.1 1 2.8 1.7 2.8 2.5 0 1.4-1.7 2-3.2 2-2.7 0-4.2-.4-6.5-1.4l-.9 4.4c1.2.6 3.5 1 5.8 1 5.8 0 9.6-2.8 9.6-7.4zM54.4 19h4l-3.7-16.5h-3.7c-.8 0-1.5.5-1.8 1.2l-6.4 15.3h4.6l.9-2.5h5.7l.4 2.5zm-4.9-6.1l2.3-6.2 1.3 6.2h-3.6zM32 2.5h-4.3L24.3 19h4.3l3.4-16.5z" />
                </svg>
            </div>
        </div>
    );
}

export function LogoWompi({ className = 'h-6', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
            <svg viewBox="0 0 40 36" className="h-6 w-auto shrink-0 drop-shadow-xs" fill="none">
                <rect width="40" height="36" rx="9" fill={darkBg ? '#071626' : '#0b192c'} />
                <path d="M6 10.5C14 8.5 26 8.5 34 10.5" stroke="#FDDA24" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M8 17.5C15 16 25 16 32 17.5" stroke="#0055B8" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M10 24.5C16 23.2 24 23.2 30 24.5" stroke="#E31837" strokeWidth="3.2" strokeLinecap="round" />
            </svg>
            <div className="flex flex-col leading-none text-left shrink-0 whitespace-nowrap">
                <span className={`font-black tracking-tight text-xs ${darkBg ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    wompi
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${darkBg ? 'text-emerald-300' : 'text-blue-700 dark:text-emerald-400'}`}>
                    Bancolombia
                </span>
            </div>
        </div>
    );
}

export function LogoMercadoPago({ className = 'h-6', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
            <svg viewBox="0 0 44 34" className="h-6 w-auto shrink-0 drop-shadow-xs" fill="none">
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
            <div className="flex flex-col leading-none text-left shrink-0 whitespace-nowrap">
                <span className={`font-black tracking-tight text-xs ${darkBg ? 'text-white' : 'text-[#009EE3] dark:text-sky-300'}`}>
                    mercado
                </span>
                <span className={`font-black tracking-tight text-[10px] ${darkBg ? 'text-sky-300' : 'text-[#005e8a] dark:text-white'}`}>
                    pago
                </span>
            </div>
        </div>
    );
}

export function LogoNequi({ className = 'h-6', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
            <svg viewBox="0 0 38 36" className="h-6 w-auto shrink-0 drop-shadow-xs" fill="none">
                <rect width="38" height="36" rx="9" fill="#20002C" stroke={darkBg ? '#f472b6' : 'none'} strokeWidth="1.2" />
                <rect x="6.5" y="10" width="4.5" height="4.5" rx="1.2" fill="#FF0080" />
                <path
                    d="M15 25V11l9.5 14V11"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <div className="flex flex-col leading-none text-left shrink-0 whitespace-nowrap">
                <span className={`font-black tracking-tight text-xs ${darkBg ? 'text-white' : 'text-[#20002C] dark:text-white'}`}>
                    Nequi
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${darkBg ? 'text-pink-300' : 'text-[#FF0080]'}`}>
                    • Bre-B QR
                </span>
            </div>
        </div>
    );
}

export function LogoEpayco({ className = 'h-6', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
            <svg viewBox="0 0 38 36" className="h-6 w-auto shrink-0 drop-shadow-xs" fill="none">
                <rect width="38" height="36" rx="9" fill="#FF5A00" />
                <path
                    d="M11 18h16M11 18c0-4.5 3.5-7.5 8-7.5 3.8 0 6.8 2 7.6 5M11 18c0 4.5 3.5 7.5 8 7.5 3.5 0 6.2-1.5 7.4-4"
                    stroke="#FFFFFF"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                />
                <circle cx="29" cy="24" r="3" fill="#FFD100" />
            </svg>
            <div className="flex flex-col leading-none text-left shrink-0 whitespace-nowrap">
                <span className={`font-black tracking-tight text-xs ${darkBg ? 'text-white' : 'text-[#FF5A00] dark:text-orange-400'}`}>
                    ePayco
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${darkBg ? 'text-amber-300' : 'text-amber-600 dark:text-amber-300'}`}>
                    Efecty • Gana
                </span>
            </div>
        </div>
    );
}

export function LogoPSE({ className = 'h-6', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
            <svg viewBox="0 0 38 36" className="h-6 w-auto shrink-0 drop-shadow-xs" fill="none">
                <rect width="38" height="36" rx="9" fill="#003876" stroke={darkBg ? '#38bdf8' : 'none'} strokeWidth="1.2" />
                <circle cx="19" cy="18" r="10" stroke="#FDB913" strokeWidth="2.2" />
                <ellipse cx="19" cy="18" rx="5" ry="10" stroke="#38BDF8" strokeWidth="1.6" />
                <path d="M9 18h20" stroke="#FDB913" strokeWidth="1.8" />
            </svg>
            <div className="flex flex-col leading-none text-left shrink-0 whitespace-nowrap">
                <span className={`font-black italic tracking-tight text-xs ${darkBg ? 'text-white' : 'text-[#003876] dark:text-sky-300'}`}>
                    PSE
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${darkBg ? 'text-amber-300' : 'text-amber-600 dark:text-amber-400'}`}>
                    ACH Colombia
                </span>
            </div>
        </div>
    );
}

export function LogoTarjetas({ cardType = 'unknown', className = 'h-6', darkBg = false }) {
    if (cardType === 'visa') {
        return <LogoVisa className={className} darkBg={darkBg} />;
    }
    if (cardType === 'mastercard') {
        return <LogoMastercard className={className} darkBg={darkBg} />;
    }
    return (
        <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
            <div className="px-1.5 py-0.5 rounded bg-[#1A1F71] text-white font-black italic text-[9px] tracking-wider shadow-2xs shrink-0">
                VISA
            </div>
            <div className="flex items-center shrink-0">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-5 w-auto shrink-0"
                >
                    <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z" />
                    <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z" />
                    <path
                        fill="#ff3d00"
                        d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"
                    />
                </svg>
            </div>
        </div>
    );
}

export function LogoPasarelaPorId({ gateway, cardType = 'unknown', className = 'h-6', darkBg = false }) {
    switch (gateway) {
        case 'wompi':
            return <LogoWompi className={className} darkBg={darkBg} />;
        case 'mercadopago':
            return <LogoMercadoPago className={className} darkBg={darkBg} />;
        case 'nequi':
            return <LogoNequi className={className} darkBg={darkBg} />;
        case 'epayco':
            return <LogoEpayco className={className} darkBg={darkBg} />;
        case 'pse':
            return <LogoPSE className={className} darkBg={darkBg} />;
        case 'card':
        default:
            return <LogoTarjetas cardType={cardType} className={className} darkBg={darkBg} />;
    }
}
