import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Wifi, ShieldCheck, RotateCw, Sparkles, Lock } from 'lucide-react';
import { formatCurrency } from '../../utilidades/formateadores';
import { LogoPasarelaPorId } from './LogosPasarelas';

gsap.registerPlugin(useGSAP);

const TEMAS_PASARELA = {
    wompi: {
        gradiente: 'from-[#0b192c] via-[#132e53] to-[#07111e]',
        borde: 'border-emerald-400/35',
        glow: 'rgba(0, 195, 137, 0.38)',
        marca: 'D&D TEXTIL × WOMPI',
        subtitulo: 'PASARELA OFICIAL GRUPO BANCOLOMBIA',
        numeroDefault: '3027  0589  5100  2026',
        etiquetaNumero: 'REFERENCIA COMERCIO VERIFICADO',
        badgeTexto: 'SHA-256 ACTIVO',
    },
    mercadopago: {
        gradiente: 'from-[#003f6e] via-[#0077b6] to-[#00294d]',
        borde: 'border-sky-300/40',
        glow: 'rgba(0, 158, 227, 0.42)',
        marca: 'D&D TEXTIL × MERCADO PAGO',
        subtitulo: 'CHECKOUT PRO • COMPRA PROTEGIDA',
        numeroDefault: '5490  1200  8842  2026',
        etiquetaNumero: 'CREDENCIAL SANDBOX ACTIVA',
        badgeTexto: 'HASTA 12 CUOTAS',
    },
    nequi: {
        gradiente: 'from-[#1a0024] via-[#3c065f] to-[#6b0942]',
        borde: 'border-pink-400/45',
        glow: 'rgba(255, 0, 128, 0.42)',
        marca: 'D&D TEXTIL × NEQUI',
        subtitulo: 'TRANSFERENCIA INMEDIATA 0% COMISIÓN',
        numeroDefault: '302   705   8951   D&D',
        etiquetaNumero: 'CELULAR / LLAVE OFICIAL D&D TEXTIL',
        badgeTexto: 'QR INMEDIATO',
    },
    epayco: {
        gradiente: 'from-[#3b1105] via-[#8a2c0e] to-[#b83b0a]',
        borde: 'border-amber-400/40',
        glow: 'rgba(255, 90, 0, 0.4)',
        marca: 'D&D TEXTIL × ePAYCO',
        subtitulo: 'EFECTY • GANA ANTIOQUIA • BALOTO',
        numeroDefault: '1104  5200  3027  0589',
        etiquetaNumero: 'CONVENIO NACIONAL #110452',
        badgeTexto: 'MULTICAJA ACTIVO',
    },
    card: {
        gradiente: 'from-slate-900 via-slate-800 to-amber-950',
        borde: 'border-amber-400/35',
        glow: 'rgba(245, 158, 11, 0.38)',
        marca: 'D&D TEXTIL PLATINUM',
        subtitulo: 'TARJETA CRÉDITO / DÉBITO',
        numeroDefault: '####  ####  ####  ####',
        etiquetaNumero: 'NÚMERO DE TARJETA',
        badgeTexto: '3D SECURE 2.0',
    },
    pse: {
        gradiente: 'from-[#001d3d] via-[#003566] to-[#042f2e]',
        borde: 'border-amber-300/35',
        glow: 'rgba(56, 189, 248, 0.38)',
        marca: 'D&D TEXTIL × PSE ACH',
        subtitulo: 'DÉBITO BANCARIO & CONTRAENTREGA',
        numeroDefault: 'ACH   COL   3027   0589',
        etiquetaNumero: 'CÁMARA INTERBANCARIA COLOMBIA',
        badgeTexto: 'TODOS LOS BANCOS',
    },
};

function CardPreview({
    cardNumber,
    cardHolder,
    expiryDate,
    cvv,
    isFlipped = false,
    cardType = 'unknown',
    gateway = 'card',
    totalAmount = 0,
    reference = 'DD-2026',
}) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);
    const [manualFlip, setManualFlip] = useState(false);
    const containerRef = useRef(null);

    const tema = TEMAS_PASARELA[gateway] || TEMAS_PASARELA.card;
    const volteada = isFlipped || manualFlip;

    useEffect(() => {
        setManualFlip(false);
        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { rotateY: -22, scale: 0.94, opacity: 0.85 },
                { rotateY: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.6)' }
            );
        }
    }, [gateway]);

    const formatCardNumber = (number) => {
        if (!number) {
            return gateway === 'card' ? '4532 •••• •••• 8951' : tema.numeroDefault;
        }
        const cleaned = number.replace(/\s/g, '');
        return (cleaned.match(/.{1,4}/g)?.join(' ') || cleaned).padEnd(19, '•').slice(0, 19);
    };

    const formatCardNumberBlocks = (number) =>
        formatCardNumber(number)
            .split(/\s+/)
            .filter(Boolean);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;
        setMousePosition({
            x: relX - 0.5,
            y: relY - 0.5,
        });
        setGlarePos({
            x: Math.round(relX * 100),
            y: Math.round(relY * 100),
        });
    };

    useEffect(() => {
        if (containerRef.current) {
            gsap.to(containerRef.current, {
                rotateY: volteada ? 180 : 0,
                duration: 0.65,
                ease: 'power2.inOut',
            });
        }
    }, [volteada]);

    useEffect(() => {
        if (!containerRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        if (isHovered) {
            gsap.to(containerRef.current, {
                rotateX: -mousePosition.y * 14,
                rotateY: (volteada ? 180 : 0) + mousePosition.x * 16,
                scale: 1.02,
                duration: 0.25,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        } else {
            gsap.to(containerRef.current, {
                rotateX: 0,
                rotateY: volteada ? 180 : 0,
                scale: 1,
                duration: 0.45,
                ease: 'power2.out',
                overwrite: 'auto',
            });
        }
    }, [isHovered, mousePosition, volteada]);

    return (
        <div className="w-full max-w-md mx-auto select-none">
            <div className="relative" style={{ perspective: '1200px' }}>
                {/* Resplandor ambiental animado detrás de la tarjeta */}
                <div
                    className="absolute -inset-3 rounded-3xl blur-2xl opacity-65 transition-all duration-500 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, ${tema.glow}, transparent 70%)`,
                    }}
                />

                <div
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => {
                        setIsHovered(false);
                        setMousePosition({ x: 0, y: 0 });
                    }}
                    onClick={() => setManualFlip((prev) => !prev)}
                    title="Haz clic para girar la tarjeta 3D"
                    className="relative cursor-pointer"
                    style={{
                        transformStyle: 'preserve-3d',
                        width: '100%',
                        aspectRatio: '1.586',
                    }}
                >
                    {/* ================= CARA FRONTAL ================= */}
                    <div
                        className={`absolute inset-0 rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${tema.gradiente} border ${tema.borde} overflow-hidden flex flex-col justify-between text-white`}
                        style={{
                            backfaceVisibility: 'hidden',
                            boxShadow: isHovered
                                ? `0 25px 50px -12px rgba(0,0,0,0.65), 0 0 30px ${tema.glow}`
                                : '0 20px 30px -10px rgba(0,0,0,0.45)',
                        }}
                    >
                        {/* Brillo holográfico interactivo */}
                        <div
                            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                            style={{
                                opacity: isHovered ? 0.35 : 0.12,
                                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 35%, transparent 65%)`,
                            }}
                        />

                        {/* Textura de hebras textiles de fondo */}
                        <div
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{
                                backgroundImage:
                                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 10px)',
                            }}
                        />

                        {/* Fila superior: Co-branding D&D Textil + Logo Oficial de la Pasarela */}
                        <div className="relative z-10 flex items-start justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                    <span className="text-[11px] font-black tracking-widest uppercase text-white/95">
                                        {tema.marca}
                                    </span>
                                </div>
                                <p className="text-[9px] tracking-wider text-white/65 uppercase mt-0.5">
                                    {tema.subtitulo}
                                </p>
                            </div>

                            {/* Logo vectorial adaptado a la esquina superior derecha de la tarjeta */}
                            <div className="bg-black/25 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/15 shadow-sm">
                                <LogoPasarelaPorId
                                    gateway={gateway}
                                    cardType={cardType}
                                    className="h-6"
                                    darkBg={true}
                                />
                            </div>
                        </div>

                        {/* Fila central: Chip EMV metálico + NFC + Monto autorizado */}
                        <div className="relative z-10 flex items-center justify-between my-1">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 p-1.5 shadow-inner border border-amber-100/50 flex flex-col justify-between">
                                    <div className="w-full h-px bg-amber-900/40" />
                                    <div className="w-2/3 h-2.5 border border-amber-900/40 rounded-xs mx-auto" />
                                    <div className="w-full h-px bg-amber-900/40" />
                                </div>
                                <Wifi className="w-4 h-4 text-white/75 rotate-90" />
                            </div>

                            {totalAmount > 0 && (
                                <div className="text-right bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15">
                                    <span className="text-[8px] uppercase tracking-wider text-white/70 block">
                                        Total Orden
                                    </span>
                                    <span className="text-sm font-black text-emerald-300 font-mono">
                                        {formatCurrency(totalAmount)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Número principal animado por bloques */}
                        <div className="relative z-10">
                            <p className="text-[8px] uppercase tracking-widest text-white/60 mb-0.5">
                                {tema.etiquetaNumero}
                            </p>
                            <div className="flex items-center justify-between gap-2 text-white text-base sm:text-lg font-mono font-bold tracking-widest drop-shadow">
                                {formatCardNumberBlocks(cardNumber).map((block, i) => (
                                    <span key={i}>{block}</span>
                                ))}
                            </div>
                        </div>

                        {/* Fila inferior: Titular + Vigencia / Seguridad */}
                        <div className="relative z-10 flex justify-between items-end pt-1 border-t border-white/10">
                            <div className="min-w-0 pr-3">
                                <p className="text-white/60 text-[8px] uppercase tracking-wider">
                                    Titular / Cliente
                                </p>
                                <p className="text-white text-xs sm:text-sm font-bold uppercase truncate">
                                    {cardHolder || 'D&D TEXTIL MEDELLÍN'}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-white/60 text-[8px] uppercase tracking-wider">
                                    {expiryDate ? 'Vence' : 'Certificación'}
                                </p>
                                <p className="text-amber-300 text-[11px] font-mono font-bold">
                                    {expiryDate || tema.badgeTexto}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ================= CARA POSTERIOR (REVERSO) ================= */}
                    <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tema.gradiente} border ${tema.borde} overflow-hidden flex flex-col justify-between text-white`}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            boxShadow: '0 20px 30px -10px rgba(0,0,0,0.5)',
                        }}
                    >
                        <div className="w-full h-10 bg-slate-950/90 mt-4 border-y border-white/10" />

                        <div className="px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-9 rounded-lg bg-white/95 flex items-center justify-between px-3">
                                    <span className="text-[10px] font-mono text-slate-600 italic">
                                        D&amp;D Textil • {reference}
                                    </span>
                                    <span className="text-slate-900 font-mono font-black text-sm tracking-widest bg-amber-100 px-2 py-0.5 rounded">
                                        {cvv || '895'}
                                    </span>
                                </div>
                                <div className="bg-black/30 px-2.5 py-1.5 rounded-xl border border-white/15">
                                    <LogoPasarelaPorId
                                        gateway={gateway}
                                        cardType={cardType}
                                        className="h-5"
                                        darkBg={true}
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-white/70 mt-1.5 flex items-center justify-between">
                                <span>Código de Verificación / CVV</span>
                                <span className="font-mono text-emerald-300 flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" /> TLS 1.3 • PCI-DSS
                                </span>
                            </p>
                        </div>

                        <div className="px-6 pb-4 text-[10px] text-white/75 leading-relaxed border-t border-white/10 pt-2 flex items-center justify-between">
                            <div>
                                <p className="font-bold text-white">
                                    Soporte Oficial D&amp;D Textil Medellín
                                </p>
                                <p>WhatsApp: +57 302 705 8951 • dydtextil222medellin@gmail.com</p>
                            </div>
                            <Lock className="w-4 h-4 text-amber-300 shrink-0" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Controles interactivos debajo de la tarjeta 3D */}
            <div className="mt-3 flex items-center justify-between px-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Tarjeta 3D con logo adaptado a cada pasarela
                </span>
                <button
                    type="button"
                    onClick={() => setManualFlip((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold hover:underline cursor-pointer"
                >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{volteada ? 'Ver frente' : 'Girar reverso'}</span>
                </button>
            </div>
        </div>
    );
}

export default CardPreview;
