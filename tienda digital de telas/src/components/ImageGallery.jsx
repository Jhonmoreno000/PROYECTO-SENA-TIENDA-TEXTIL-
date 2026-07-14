import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';



function ImageGallery({ images, productName }) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0, percX: 50, percY: 50 });
    const mainImageRef = useRef(null);

    const magnifierSize = 180;
    const zoomScale = 8;

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        const percX = Math.max(0, Math.min(100, (x / width) * 100));
        const percY = Math.max(0, Math.min(100, (y / height) * 100));
        setMousePos({ x, y, percX, percY });
    };

    // Animación de crossfade al cambiar de imagen
    useGSAP(() => {
        if (mainImageRef.current) {
            gsap.fromTo(mainImageRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: "power2.out" }
            );
        }
    }, { dependencies: [selectedImage] });

    return (
        <div className="space-y-4">
            {/* Main Image Container */}
            <div
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 cursor-crosshair group shadow-sm border border-gray-200 dark:border-slate-800"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMove}
            >
                <img
                    ref={mainImageRef}
                    key={selectedImage}
                    src={images[selectedImage] || '/placeholder.png'}
                    alt={`${productName} - Vista principal`}
                    className="w-full h-full object-cover"
                />

                {/* LENTE DE AUMENTO (LUPA FÍSICA) */}
                {isHovered && (
                    <div
                        className="absolute rounded-full border-[3px] border-white/60 dark:border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] pointer-events-none z-50 bg-no-repeat bg-white"
                        style={{
                            width: `${magnifierSize}px`,
                            height: `${magnifierSize}px`,
                            left: mousePos.x - magnifierSize / 2,
                            top: mousePos.y - magnifierSize / 2,
                            backgroundImage: `url(${images[selectedImage] || '/placeholder.png'})`,
                            backgroundSize: `${100 * zoomScale}%`,
                            backgroundPosition: `${mousePos.percX}% ${mousePos.percY}%`,
                        }}
                    >
                        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"></div>
                        <div className="absolute top-1 left-2 w-1/2 h-1/4 bg-white/20 rounded-full blur-[2px] rotate-[-45deg]"></div>
                    </div>
                )}

                {/* Helper Indicator */}
                {!isHovered && (
                    <div className="absolute top-4 right-4 bg-white/70 dark:bg-black/60 backdrop-blur-md text-gray-800 dark:text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/20 shadow-sm pointer-events-none transition-opacity duration-300">
                        Pasa el cursor para inspeccionar
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
                {images.length > 0 ? (
                    images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSelectedImage(index);
                                setIsHovered(false);
                            }}
                            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${selectedImage === index
                                ? 'border-primary-600 shadow-md ring-2 ring-primary-600/20'
                                : 'border-gray-200 dark:border-slate-700 hover:border-primary-400'
                                }`}
                        >
                            <img
                                src={image}
                                alt={`${productName} - Miniatura ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))
                ) : (
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-slate-700">
                        <img src="/placeholder.png" alt="Placeholder Miniatura" className="w-full h-full object-cover opacity-50" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageGallery;
