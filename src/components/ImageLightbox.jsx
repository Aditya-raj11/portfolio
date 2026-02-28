import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageLightbox = ({ isOpen, onClose, images, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setIsLoading(true);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            // document.body.style.overflow = 'unset'; // Handled by cleanup
            setIsLoading(true);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialIndex]);

    const handleNext = (e) => {
        e?.stopPropagation();
        setIsLoading(true);
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        setIsLoading(true);
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return;
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
    }, [isOpen, onClose, handleNext, handlePrev]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] bg-white/95 dark:bg-[#000000]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
                    onClick={onClose}
                >
                    {/* Close Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-4 right-4 z-50 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </motion.button>

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/40 text-black dark:text-white rounded-full backdrop-blur-sm transition-all hidden md:flex"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/40 text-black dark:text-white rounded-full backdrop-blur-sm transition-all hidden md:flex"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    {/* Main Image Container */}
                    <div
                        className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="animate-spin text-white" size={48} />
                            </div>
                        )}

                        <motion.img
                            key={currentIndex} // Re-animate on change
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            src={images[currentIndex]}
                            alt={`Project Image ${currentIndex + 1}`}
                            className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => setIsLoading(false)}
                        />

                        {/* Image Counter */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full text-sm font-medium backdrop-blur-md">
                                {currentIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>

                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ImageLightbox;
