import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ImageGallery({ images, productName }) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <motion.div
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 cursor-zoom-in"
                onClick={() => setIsZoomed(!isZoomed)}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={selectedImage}
                        src={images[selectedImage] || '/placeholder.png'}
                        alt={`${productName} - Vista ${selectedImage + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover"
                    />
                </AnimatePresence>

                {/* Zoom Indicator */}
                {isZoomed && (
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        Click para alejar
                    </div>
                )}
            </motion.div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
                {images.length > 0 ? (
                    images.map((image, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSelectedImage(index);
                                setIsZoomed(false);
                            }}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                ? 'border-primary-600 shadow-lg'
                                : 'border-gray-200 dark:border-slate-700 hover:border-primary-400'
                                }`}
                        >
                            <img
                                src={image}
                                alt={`${productName} - Miniatura ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </motion.button>
                    ))
                ) : (
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-slate-700">
                        <img src="/placeholder.png" alt="Placeholder Miniatura" className="w-full h-full object-cover opacity-50" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageGallery;
