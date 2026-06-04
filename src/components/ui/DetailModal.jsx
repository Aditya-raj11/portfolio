import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Download, Github, Briefcase, Award, Star, ChevronLeft, ChevronRight, Loader2, Calendar, Building2, Globe, Smartphone, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DetailModal – a full-screen, premium detail view for portfolio items.
 * 
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - item: the data object (project / experience / cert / achievement)
 *  - type: 'project' | 'experience' | 'certification' | 'achievement'
 *  - onSecureView: (url) => void   — for opening secure viewer (achievements)
 */
const DetailModal = ({ isOpen, onClose, item, type = 'project', onSecureView }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
    }, []);

    // Gather all images for gallery
    const getImages = () => {
        if (!item) return [];
        const imgs = [];
        if (item.imageUrl) imgs.push(item.imageUrl);
        if (item.imageUrls && Array.isArray(item.imageUrls)) {
            imgs.push(...item.imageUrls);
        }
        return [...new Set(imgs.filter(Boolean))];
    };

    const images = getImages();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Stop Lenis smooth scroll so background doesn't scroll
            if (window.__lenis) window.__lenis.stop();
            setCurrentImageIndex(0);
            setImageLoading(true);
        } else {
            // Restart Lenis when modal closes
            if (window.__lenis) window.__lenis.start();
        }
        return () => {
            document.body.style.overflow = 'unset';
            if (window.__lenis) window.__lenis.start();
        };
    }, [isOpen]);

    const handlePrev = useCallback((e) => {
        e?.stopPropagation();
        setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    }, [images.length]);

    const handleNext = useCallback((e) => {
        e?.stopPropagation();
        setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    }, [images.length]);

    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return;
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight' && images.length > 1) handleNext();
        if (e.key === 'ArrowLeft' && images.length > 1) handlePrev();
    }, [isOpen, onClose, handleNext, handlePrev, images.length]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!isOpen || !item) return null;

    // Parse tech stack for projects
    const stackTags = type === 'project' 
        ? (Array.isArray(item.techStack) 
            ? item.techStack 
            : typeof item.techStack === 'string' && item.techStack.trim() 
                ? item.techStack.split(',').map(t => t.trim()).filter(Boolean)
                : [])
        : [];

    // Type-specific icon
    const TypeIcon = type === 'project' ? Globe 
        : type === 'experience' ? Briefcase 
        : type === 'certification' ? Star 
        : Award;

    // Type-specific accent colors
    const accentColors = {
        project: { from: 'from-blue-500', to: 'to-indigo-600', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
        experience: { from: 'from-indigo-500', to: 'to-purple-600', bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' },
        certification: { from: 'from-emerald-500', to: 'to-teal-600', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
        achievement: { from: 'from-amber-500', to: 'to-orange-600', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
    };
    const accent = accentColors[type] || accentColors.project;

    const isPdf = item.fileType === 'pdf';

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[150] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
                    style={{ overscrollBehavior: 'contain' }}
                    onClick={onClose}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    data-lenis-prevent
                >
                    {/* Close button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="absolute top-4 right-4 z-[160] p-2.5 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#222] transition-all shadow-lg border border-gray-200 dark:border-white/10"
                        onClick={onClose}
                    >
                        <X size={22} />
                    </motion.button>

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.97 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#0f0f0f] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-200/50 dark:border-white/[0.06] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image Gallery Area */}
                        {images.length > 0 && !isPdf && (
                            <div className="relative w-full h-56 sm:h-72 md:h-80 bg-gray-100 dark:bg-black/60 overflow-hidden shrink-0">
                                {/* Loading spinner */}
                                {imageLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100 dark:bg-black/60">
                                        <Loader2 className="animate-spin text-gray-400 dark:text-gray-500" size={36} />
                                    </div>
                                )}

                                <motion.div
                                    className="flex h-full w-full"
                                    animate={{ x: `-${currentImageIndex * 100}%` }}
                                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                                >
                                    {images.map((imgUrl, idx) => (
                                        <div key={idx} className="w-full h-full flex-shrink-0 relative">
                                            <img
                                                src={imgUrl}
                                                alt={`${item.title} - ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                                loading="eager"
                                                onLoad={() => {
                                                    if (idx === 0) setImageLoading(false);
                                                }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/800x400?text=No+Image';
                                                    if (idx === 0) setImageLoading(false);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Gradient overlay at bottom for text readability */}
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/80 dark:from-[#0f0f0f]/80 to-transparent pointer-events-none" />

                                {/* Navigation */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrev}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full transition-all shadow-md backdrop-blur-sm"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full transition-all shadow-md backdrop-blur-sm"
                                        >
                                            <ChevronRight size={20} />
                                        </button>

                                        {/* Dots */}
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                            {images.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentImageIndex(i);
                                                    }}
                                                    className={`rounded-full transition-all duration-300 ${i === currentImageIndex
                                                        ? 'w-5 h-2 bg-white shadow-md'
                                                        : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Type badge */}
                                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-sm bg-white/90 dark:bg-black/60 ${accent.text} border ${accent.border}`}>
                                    <TypeIcon size={13} />
                                    {type}
                                </div>
                            </div>
                        )}

                        {isPdf && item.imageUrl && (
                            <div className="relative w-full min-h-[220px] bg-white dark:bg-[#121212] overflow-hidden shrink-0 flex items-center justify-center p-6 text-center border-b border-gray-200/50 dark:border-white/[0.06]">
                                {isMobile ? (
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className={`p-4 ${accent.bg} rounded-full ${accent.text} border ${accent.border}`}>
                                            <Briefcase size={28} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-black dark:text-white">PDF Preview Unavailable on Mobile</h4>
                                            <p className="text-xs text-black/60 dark:text-gray-400 mt-1 max-w-xs">Mobile web browsers do not support direct PDF embedding. Click below to view or download the document.</p>
                                        </div>
                                        <div className="flex gap-2.5 mt-2">
                                            <a
                                                href={item.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold shadow-sm"
                                            >
                                                <ExternalLink size={12} /> Open Document
                                            </a>
                                            <a
                                                href={item.imageUrl}
                                                download
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/10"
                                            >
                                                <Download size={12} /> Download
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <iframe
                                        src={`${item.imageUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                                        title="Document Preview"
                                        className="w-full h-full border-none min-h-[240px]"
                                    />
                                )}
                                {/* Type badge */}
                                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-sm bg-white/90 dark:bg-black/60 ${accent.text} border ${accent.border}`}>
                                    <TypeIcon size={13} />
                                    {type}
                                </div>
                            </div>
                        )}

                        {/* No-image header for items without images */}
                        {images.length === 0 && !isPdf && (
                            <div className={`w-full h-28 bg-gradient-to-r ${accent.from} ${accent.to} relative overflow-hidden shrink-0`}>
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                                                          radial-gradient(circle at 70% 80%, rgba(255,255,255,0.15) 0%, transparent 40%)`
                                    }} />
                                </div>
                                <div className="absolute bottom-4 left-6 flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider">
                                    <TypeIcon size={16} />
                                    {type}
                                </div>
                            </div>
                        )}

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 scrollbar-thin" style={{ overscrollBehavior: 'contain' }}>
                            {/* Title & Organization */}
                            <div className="mb-6">
                                <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                    {item.title}
                                </h2>

                                {(item.organization || item.category) && (
                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                        {item.organization && (
                                            <span className="flex items-center gap-1.5 text-sm font-medium text-black/70 dark:text-gray-300">
                                                <Building2 size={14} className="text-gray-400" />
                                                {item.organization}
                                            </span>
                                        )}
                                        {item.duration && (
                                            <span className="flex items-center gap-1.5 text-sm font-medium text-black/60 dark:text-gray-400">
                                                <Calendar size={14} className="text-gray-400" />
                                                {item.duration}
                                            </span>
                                        )}
                                        {item.category && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${accent.bg} ${accent.text} border ${accent.border}`}>
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-200 dark:bg-white/[0.06] mb-6" />

                            {/* Description - full, no line clamp */}
                            {item.description && (
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-gray-500 mb-3">Description</h3>
                                    <p className="text-black/80 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                                        {item.description}
                                    </p>
                                </div>
                            )}

                            {/* Tech Stack (Projects only) */}
                            {stackTags.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-gray-500 mb-3">Tech Stack</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {stackTags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Image thumbnails gallery (if multiple) */}
                            {images.length > 1 && !isPdf && (
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-gray-500 mb-3">Gallery ({images.length} images)</h3>
                                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                                        {images.map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setImageLoading(true);
                                                    setCurrentImageIndex(i);
                                                    // Scroll to top of modal
                                                }}
                                                className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIndex
                                                    ? 'border-black dark:border-white shadow-md scale-105'
                                                    : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-white/[0.06]">
                                {/* Project-specific actions */}
                                {type === 'project' && (
                                    <>
                                        {item.projectUrl && (
                                            <a
                                                href={item.projectUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 min-w-[140px] py-3 px-5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-center transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-lg text-sm"
                                            >
                                                <Globe size={16} /> Visit Live
                                            </a>
                                        )}
                                        {item.downloadUrl && (
                                            <a
                                                href={item.downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 min-w-[140px] py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-center transition-all flex items-center justify-center gap-2 shadow-lg text-sm"
                                            >
                                                <Download size={16} /> Download APK
                                            </a>
                                        )}
                                        {item.githubUrl && (
                                            <a
                                                href={item.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 min-w-[140px] py-3 px-5 rounded-xl glass-panel hover:bg-gray-50 dark:hover:bg-white/10 text-black dark:text-white font-bold text-center transition-all flex items-center justify-center gap-2 text-sm"
                                            >
                                                <Github size={16} /> GitHub
                                            </a>
                                        )}
                                    </>
                                )}

                                {/* Experience-specific actions */}
                                {type === 'experience' && (item.linkUrl || isPdf) && (
                                    <a
                                        href={item.linkUrl || item.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 min-w-[140px] py-3 px-5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-center transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-lg text-sm"
                                    >
                                        <ExternalLink size={16} /> View Details
                                    </a>
                                )}

                                {/* Certification-specific actions */}
                                {type === 'certification' && (item.linkUrl || isPdf) && (
                                    <a
                                        href={item.linkUrl || item.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 min-w-[140px] py-3 px-5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-center transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-lg text-sm"
                                    >
                                        <ExternalLink size={16} /> View Credential
                                    </a>
                                )}

                                {/* Achievement-specific actions */}
                                {type === 'achievement' && (item.linkUrl || item.imageUrl) && (
                                    <button
                                        onClick={() => {
                                            if (item.allowDownload) {
                                                window.open(item.linkUrl || item.imageUrl, '_blank');
                                            } else if (onSecureView) {
                                                onClose();
                                                setTimeout(() => onSecureView(item.imageUrl || item.linkUrl), 300);
                                            }
                                        }}
                                        className="flex-1 min-w-[140px] py-3 px-5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-center transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-lg text-sm cursor-pointer border-none"
                                    >
                                        <ExternalLink size={16} /> View Certificate
                                    </button>
                                )}

                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="py-3 px-5 rounded-xl glass-panel hover:bg-gray-50 dark:hover:bg-white/10 text-black dark:text-white font-bold text-center transition-all flex items-center justify-center gap-2 text-sm cursor-pointer border border-gray-200 dark:border-white/10"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default DetailModal;
