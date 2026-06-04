import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SecureViewerModal = ({ isOpen, onClose, fileUrl }) => {
    useEffect(() => {
        if (isOpen && fileUrl) {
            document.body.style.overflow = 'hidden';
            if (window.__lenis) window.__lenis.stop();
        } else {
            document.body.style.overflow = 'unset';
            if (window.__lenis) window.__lenis.start();
        }
        return () => {
            document.body.style.overflow = 'unset';
            if (window.__lenis) window.__lenis.start();
        };
    }, [isOpen, fileUrl]);

    if (!isOpen || !fileUrl) return null;

    const isPdf = fileUrl.toLowerCase().includes('.pdf');

    // For PDFs, append #toolbar=0 to disable the native PDF controls
    const secureUrl = isPdf 
        ? `${fileUrl}${fileUrl.includes('?') ? '&' : '?'}#toolbar=0&navpanes=0&scrollbar=0` 
        : fileUrl;

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    style={{ overscrollBehavior: 'contain' }}
                    data-lenis-prevent
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[210]"
                    >
                        <X size={24} />
                    </button>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-5xl h-[85vh] bg-black rounded-xl overflow-hidden shadow-2xl relative select-none"
                        onContextMenu={(e) => e.preventDefault()} // Disable right-click
                    >
                        {/* Overlay to catch drag events for images */}
                        <div className="absolute inset-0 z-[205] pointer-events-none"></div>

                        {isPdf ? (
                            <iframe 
                                src={secureUrl}
                                className="w-full h-full border-none"
                                title="Secure Document Viewer"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                <img 
                                    src={secureUrl} 
                                    alt="Secure Preview"
                                    className="max-w-full max-h-full object-contain select-none"
                                    draggable="false"
                                />
                            </div>
                        )}
                        
                        {/* Watermark to deter screenshots slightly */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-45deg] z-[206]">
                            <p className="text-[10rem] font-bold text-white uppercase whitespace-nowrap">Protected View</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SecureViewerModal;
