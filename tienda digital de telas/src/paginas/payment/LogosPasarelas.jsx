import React from 'react';

/**
 * Logos vectoriales (SVG) de alta nitidez para las pasarelas de pago en Colombia.
 * Garantizan carga instantánea sin depender de imágenes externas y se adaptan a las tarjetas 3D.
 */

export function LogoWompi({ className = 'h-7', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-2 select-none ${className}`}>
            {/* Isotipo Bancolombia / Wompi */}
            <svg viewBox="0 0 40 36" className="h-full w-auto shrink-0" fill="none">
                <rect width="40" height="36" rx="9" fill={darkBg ? '#00C389' : '#0b192c'} />
                {/* Franjas Bancolombia estilizadas */}
                <path d="M6 10.5C14 8.5 26 8.5 34 10.5" stroke="#FDDA24" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M8 17.5C15 16 25 16 32 17.5" stroke="#0055B8" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M10 24.5C16 23.2 24 23.2 30 24.5" stroke="#E31837" strokeWidth="3.2" strokeLinecap="round" />
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
            {/* Óvalo oficial de Mercado Pago con apretón de manos estilizado */}
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
            {/* Isotipo Nequi (Punto rosa + N geométrica sobre ciruela oscuro) */}
            <svg viewBox="0 0 38 36" className="h-full w-auto shrink-0" fill="none">
                <rect width="38" height="36" rx="9" fill="#20002C" stroke={darkBg ? '#f472b6' : 'none'} strokeWidth="1.2" />
                {/* Punto fucsia característico de Nequi a la izquierda */}
                <rect x="6.5" y="10" width="4.5" height="4.5" rx="1.2" fill="#FF0080" />
                {/* Letra N de Nequi */}
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

export function LogoEpayco({ className = 'h-7', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-2 select-none ${className}`}>
            {/* Isotipo ePayco / Efecty */}
            <svg viewBox="0 0 38 36" className="h-full w-auto shrink-0" fill="none">
                <rect width="38" height="36" rx="9" fill="#FF5A00" />
                <path
                    d="M11 18h16M11 18c0-4.5 3.5-7.5 8-7.5 3.8 0 6.8 2 7.6 5M11 18c0 4.5 3.5 7.5 8 7.5 3.5 0 6.2-1.5 7.4-4"
                    stroke="#FFFFFF"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                />
                <circle cx="29" cy="24" r="3" fill="#FFD100" />
            </svg>
            <div className="flex flex-col leading-none text-left">
                <span className={`font-black tracking-tight text-sm ${darkBg ? 'text-white' : 'text-[#FF5A00] dark:text-orange-400'}`}>
                    ePayco
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${darkBg ? 'text-amber-300' : 'text-amber-600 dark:text-amber-300'}`}>
                    Efecty • Gana
                </span>
            </div>
        </div>
    );
}

export function LogoPSE({ className = 'h-7', darkBg = false }) {
    return (
        <div className={`inline-flex items-center gap-2 select-none ${className}`}>
            {/* Isotipo PSE (Globo interbancario azul/dorado ACH Colombia) */}
            <svg viewBox="0 0 38 36" className="h-full w-auto shrink-0" fill="none">
                <rect width="38" height="36" rx="9" fill="#003876" stroke={darkBg ? '#38bdf8' : 'none'} strokeWidth="1.2" />
                <circle cx="19" cy="18" r="10" stroke="#FDB913" strokeWidth="2.2" />
                <ellipse cx="19" cy="18" rx="5" ry="10" stroke="#38BDF8" strokeWidth="1.6" />
                <path d="M9 18h20" stroke="#FDB913" strokeWidth="1.8" />
            </svg>
            <div className="flex flex-col leading-none text-left">
                <span className={`font-black italic tracking-tight text-sm ${darkBg ? 'text-white' : 'text-[#003876] dark:text-sky-300'}`}>
                    PSE
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${darkBg ? 'text-amber-300' : 'text-amber-600 dark:text-amber-400'}`}>
                    ACH Colombia
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
        case 'epayco':
            return <LogoEpayco className={className} darkBg={darkBg} />;
        case 'pse':
            return <LogoPSE className={className} darkBg={darkBg} />;
        case 'card':
        default:
            return <LogoTarjetas cardType={cardType} className={className} darkBg={darkBg} />;
    }
}

