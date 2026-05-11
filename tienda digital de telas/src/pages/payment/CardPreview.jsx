import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

function CardPreview({ cardNumber, cardHolder, expiryDate, cvv, isFlipped, cardType }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef(null);

    const formatCardNumber = (number) => {
        if (!number) return '#### #### #### ####';
        const cleaned = number.replace(/\s/g, '');
        return (cleaned.match(/.{1,4}/g)?.join(' ') || cleaned).padEnd(19, '#').slice(0, 19);
    };

    const formatCardNumberBlocks = (number) => formatCardNumber(number).split(' ');

    const handleMouseMove = (e) => {
        if (!isHovered) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: (e.clientX - rect.left - rect.width / 2) / rect.width,
            y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
    };

    const getCardLogo = () => {
        if (cardType === 'visa') return <div className="text-white font-bold text-2xl">VISA</div>;
        if (cardType === 'mastercard') return (
            <div className="flex gap-1">
                <div className="w-8 h-8 rounded-full bg-red-500 opacity-80"></div>
                <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80 -ml-4"></div>
            </div>
        );
        return null;
    };

    // Flip animation
    useEffect(() => {
        if (containerRef.current) {
            gsap.to(containerRef.current, { rotateY: isFlipped ? 180 : 0, duration: 0.6, ease: "power2.inOut" });
        }
    }, [isFlipped]);

    // Initial entrance
    useGSAP(() => {
        if (containerRef.current) gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
    }, { scope: containerRef });

    // Tilt on hover
    useEffect(() => {
        if (!containerRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (isHovered) {
            gsap.to(containerRef.current, { rotateX: -mousePosition.y * 8, duration: 0.3, ease: "power2.out", overwrite: 'auto' });
        } else {
            gsap.to(containerRef.current, { rotateX: 0, duration: 0.3, overwrite: 'auto' });
        }
    }, [isHovered, mousePosition]);

    return (
        <div className="card-perspective w-full max-w-md mx-auto">
            <div
                ref={containerRef}
                className="card-container relative"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => { setIsHovered(false); setMousePosition({ x: 0, y: 0 }); }}
                style={{ transformStyle: 'preserve-3d', width: '100%', aspectRatio: '1.586' }}
            >
                {/* Card Front */}
                <div
                    className="card-face card-front absolute inset-0 rounded-2xl p-6 md:p-8 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"
                    style={{ backfaceVisibility: 'hidden', boxShadow: isHovered ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 20px 25px -5px rgba(0,0,0,0.3)', transition: 'box-shadow 0.3s' }}
                >
                    <div className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md mb-6" />
                    <div className="mb-6">
                        <div className="flex gap-3 text-white text-xl md:text-2xl font-mono tracking-wider">
                            {formatCardNumberBlocks(cardNumber).map((block, i) => (
                                <span key={i}>{block}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-gray-400 text-xs uppercase mb-1">Titular</p>
                            <p className="text-white text-sm md:text-base font-medium uppercase">{cardHolder || 'NOMBRE APELLIDO'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-xs uppercase mb-1">Vence</p>
                            <p className="text-white text-sm md:text-base font-mono">{expiryDate || 'MM/AA'}</p>
                        </div>
                    </div>
                    <div className="absolute top-6 right-6 md:top-8 md:right-8">{getCardLogo()}</div>
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    {cardNumber && cardHolder && expiryDate && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400/20 to-transparent pointer-events-none opacity-10"></div>
                    )}
                </div>

                {/* Card Back */}
                <div
                    className="card-face card-back absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}
                >
                    <div className="w-full h-12 bg-black mt-6" />
                    <div className="px-6 md:px-8 mt-6">
                        <div className="bg-white h-10 rounded flex items-center justify-end px-4">
                            <span className="text-black font-mono text-lg">{cvv || '***'}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-2">CVV</p>
                    </div>
                    <div className="px-6 md:px-8 mt-6">
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Esta tarjeta es propiedad del titular. El uso no autorizado está prohibido. En caso de pérdida o robo, notifique inmediatamente a su banco.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardPreview;
