import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function CardPreview({ cardNumber, cardHolder, expiryDate, cvv, isFlipped, cardType }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const formatCardNumber = (number) => {
        if (!number) return '#### #### #### ####';
        const cleaned = number.replace(/\s/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted.padEnd(19, '#').slice(0, 19);
    };

    const formatCardNumberBlocks = (number) => {
        const formatted = formatCardNumber(number);
        return formatted.split(' ');
    };

    const handleMouseMove = (e) => {
        if (!isHovered) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
    };

    const getCardLogo = () => {
        if (cardType === 'visa') {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-white font-bold text-2xl"
                >
                    VISA
                </motion.div>
            );
        } else if (cardType === 'mastercard') {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-1"
                >
                    <div className="w-8 h-8 rounded-full bg-red-500 opacity-80"></div>
                    <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80 -ml-4"></div>
                </motion.div>
            );
        }
        return null;
    };

    const tiltStyle = isHovered && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? {
            rotateX: -mousePosition.y * 8,
            rotateY: mousePosition.x * 8,
        }
        : {};

    return (
        <div className="card-perspective w-full max-w-md mx-auto">
            <motion.div
                className="card-container relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    rotateY: isFlipped ? 180 : 0,
                    ...tiltStyle,
                }}
                transition={{
                    opacity: { duration: 0.5, ease: 'easeOut' },
                    y: { duration: 0.5, ease: 'easeOut' },
                    rotateY: { duration: 0.6, ease: 'easeInOut' },
                    rotateX: { duration: 0.3, ease: 'easeOut' },
                }}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setMousePosition({ x: 0, y: 0 });
                }}
                style={{
                    transformStyle: 'preserve-3d',
                    width: '100%',
                    aspectRatio: '1.586',
                }}
            >
                {/* Card Front */}
                <motion.div
                    className="card-face card-front absolute inset-0 rounded-2xl p-6 md:p-8 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"
                    style={{
                        backfaceVisibility: 'hidden',
                        boxShadow: isHovered
                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            : '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Chip with subtle animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md mb-6"
                    />

                    {/* Card Number with progressive animation */}
                    <div className="mb-6">
                        <div className="flex gap-3 text-white text-xl md:text-2xl font-mono tracking-wider">
                            {formatCardNumberBlocks(cardNumber).map((block, index) => (
                                <AnimatePresence key={index} mode="wait">
                                    <motion.span
                                        initial={{ opacity: 0, x: -4 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: index * 0.05,
                                            duration: 0.3,
                                            ease: 'easeOut',
                                        }}
                                    >
                                        {block}
                                    </motion.span>
                                </AnimatePresence>
                            ))}
                        </div>
                    </div>

                    {/* Card Holder and Expiry */}
                    <div className="flex justify-between items-end">
                        <div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                                className="text-gray-400 text-xs uppercase mb-1"
                            >
                                Titular
                            </motion.p>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={cardHolder || 'placeholder'}
                                    initial={{ opacity: 0, letterSpacing: '0.1em' }}
                                    animate={{ opacity: 1, letterSpacing: '0.05em' }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className="text-white text-sm md:text-base font-medium uppercase"
                                >
                                    {cardHolder || 'NOMBRE APELLIDO'}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                        <div className="text-right">
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                                className="text-gray-400 text-xs uppercase mb-1"
                            >
                                Vence
                            </motion.p>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={expiryDate || 'placeholder'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-white text-sm md:text-base font-mono"
                                >
                                    {expiryDate || 'MM/AA'}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Card Logo */}
                    <div className="absolute top-6 right-6 md:top-8 md:right-8">
                        {getCardLogo()}
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

                    {/* Glow effect when complete */}
                    {cardNumber && cardHolder && expiryDate && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.1 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400/20 to-transparent pointer-events-none"
                        />
                    )}
                </motion.div>

                {/* Card Back */}
                <motion.div
                    className="card-face card-back absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Magnetic Stripe */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.3, duration: 0.3, ease: 'easeOut' }}
                        className="w-full h-12 bg-black mt-6 origin-left"
                    />

                    {/* CVV Section */}
                    <div className="px-6 md:px-8 mt-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                            className="bg-white h-10 rounded flex items-center justify-end px-4"
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={cvv || 'placeholder'}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-black font-mono text-lg"
                                >
                                    {cvv || '***'}
                                </motion.span>
                            </AnimatePresence>
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                            className="text-gray-400 text-xs mt-2"
                        >
                            CVV
                        </motion.p>
                    </div>

                    {/* Info Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                        className="px-6 md:px-8 mt-6"
                    >
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Esta tarjeta es propiedad del titular. El uso no autorizado está prohibido.
                            En caso de pérdida o robo, notifique inmediatamente a su banco.
                        </p>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default CardPreview;
