import React, { useState } from 'react';
import { Download, ExternalLink, Globe, Smartphone, ChevronLeft, ChevronRight, Github, ImageOff } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageLightbox from '../../../components/ui/ImageLightbox';
import SpotlightCard from '../../../components/ui/SpotlightCard';
import DetailModal from '../../../components/ui/DetailModal';
import { useToast } from '../../../components/ui/Toast';

const ProjectCard = ({ project, large = false }) => {
    const { title, description, imageUrl, imageUrls, category, projectUrl, downloadUrl, githubUrl, techStack } = project;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const toast = useToast();

    // Combine single imageUrl and imageUrls array into one list for the carousel
    const images = [imageUrl, ...(imageUrls || [])].filter(Boolean);
    const uniqueImages = [...new Set(images)];

    const handlePrev = (e) => {
        e && e.preventDefault();
        e && e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? uniqueImages.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        e && e.preventDefault();
        e && e.stopPropagation();
        setCurrentIndex((prev) => (prev === uniqueImages.length - 1 ? 0 : prev + 1));
    };

    const toggleLightbox = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (uniqueImages.length === 0) {
            toast({ message: 'No image available to preview.', type: 'info' });
            return;
        }
        setIsLightboxOpen(!isLightboxOpen);
    };

    // Helper to convert Google Drive links
    const getDirectImageUrl = (url) => {
        if (!url) return null;
        try {
            if (url.includes('drive.google.com')) {
                let id = '';
                if (url.includes('/file/d/')) {
                    id = url.split('/file/d/')[1].split('/')[0];
                } else {
                    const urlObj = new URL(url);
                    id = urlObj.searchParams.get("id");
                }
                if (id) {
                    return `https://wsrv.nl/?url=https://drive.google.com/uc?id=${id}`;
                }
            }
        } catch (e) {
            console.error("Error parsing URL:", e);
        }
        return url;
    };

    const currentImage = getDirectImageUrl(uniqueImages[currentIndex]);

    // Parse tech stack – can be a comma-separated string or an array
    const stackTags = Array.isArray(techStack)
        ? techStack
        : typeof techStack === 'string' && techStack.trim()
            ? techStack.split(',').map(t => t.trim()).filter(Boolean)
            : [];

    const handleCardClick = (e) => {
        // Don't open detail modal if clicking on interactive elements
        if (e.target.closest('a') || e.target.closest('button')) return;
        setIsDetailOpen(true);
    };

    return (
        <>
            <SpotlightCard
                className="group glass-panel rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 cursor-pointer"
                spotlightColor="rgba(120,120,255,0.07)"
            >
                <div onClick={handleCardClick} className="flex flex-col h-full">
                    {/* Image Area */}
                    <div
                        className={`${large ? 'h-72 md:h-80' : 'h-52'} bg-gray-100 dark:bg-black/40 relative overflow-hidden`}
                    >
                        {uniqueImages.length > 0 ? (
                            <div className="w-full h-full relative overflow-hidden">
                                <motion.div
                                    className="flex h-full w-full"
                                    animate={{ x: `-${currentIndex * 100}%` }}
                                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                                >
                                    {uniqueImages.map((imgUrl, idx) => (
                                        <div key={idx} className="w-full h-full flex-shrink-0 relative">
                                            <img
                                                src={getDirectImageUrl(imgUrl)}
                                                alt={`${title} - ${idx + 1}`}
                                                className="w-full h-full object-cover img-reveal"
                                                loading="eager"
                                                onError={(e) => {
                                                    if (e.target.src && e.target.src.includes('wsrv.nl')) {
                                                        e.target.src = imgUrl;
                                                    } else {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Category Icon Badge */}
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/40 backdrop-blur-md p-2 rounded-full text-[#202124] dark:text-white/90 border border-gray-200 dark:border-white/10 shadow-sm">
                                    {category === 'app' ? <Smartphone size={16} /> : category === 'github' ? <Github size={16} /> : <Globe size={16} />}
                                </div>

                                {/* Click to expand hint */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                    <span className="px-4 py-2 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md text-xs font-bold text-black/80 dark:text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg border border-black/5 dark:border-white/10">
                                        Click to view details
                                    </span>
                                </div>

                                {/* Image Dot Indicators */}
                                {uniqueImages.length > 1 && (
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                        {uniqueImages.map((_, i) => (
                                            <span
                                                key={i}
                                                className={`block rounded-full transition-all duration-300 ${i === currentIndex
                                                    ? 'w-4 h-1.5 bg-white'
                                                    : 'w-1.5 h-1.5 bg-white/50'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Navigation Buttons (on hover) */}
                                {uniqueImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrev}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Styled No Preview State */
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-[#111]">
                                <ImageOff size={32} strokeWidth={1.5} />
                                <span className="text-xs font-medium tracking-wide uppercase">No Preview</span>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex flex-col flex-grow relative z-10">
                        <h3 className={`${large ? 'text-2xl' : 'text-xl'} font-heading text-black dark:text-white font-bold mb-2`}>{title}</h3>
                        <p className={`text-black/80 dark:text-gray-200 text-sm leading-relaxed mb-4 ${large ? 'line-clamp-5' : 'line-clamp-3'}`}>
                            {description}
                        </p>

                        {/* Tech Stack Tags */}
                        {stackTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {stackTags.map(tag => (
                                    <span
                                        key={tag}
                                        className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 border border-black/10 dark:border-white/10"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mt-auto flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                            {/* GitHub button (small) - only show if not github category */}
                            {githubUrl && category !== 'github' && (
                                <a
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-xl glass-panel hover:bg-slate-100 dark:hover:bg-white/10 text-black dark:text-white transition-all flex items-center justify-center"
                                    title="View on GitHub"
                                >
                                    <Github size={18} />
                                </a>
                            )}

                            {category === 'app' && downloadUrl && (
                                <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold text-center transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                                >
                                    <Download size={16} /> APK
                                </a>
                            )}

                            {category === 'website' && projectUrl && (
                                <a
                                    href={projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 px-4 rounded-xl glass-panel hover:bg-slate-50 dark:hover:bg-white/10 text-black dark:text-white text-sm font-bold text-center transition-all flex items-center justify-center gap-2"
                                >
                                    <ExternalLink size={16} /> Visit
                                </a>
                            )}

                            {category === 'github' && githubUrl && (
                                <a
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 px-4 rounded-xl glass-panel hover:bg-slate-50 dark:hover:bg-white/10 text-black dark:text-white text-sm font-bold text-center transition-all flex items-center justify-center gap-2"
                                >
                                    <Github size={16} /> Repository
                                </a>
                            )}

                            {(!downloadUrl && !projectUrl && !githubUrl) && (
                                <div className="text-slate-400 dark:text-slate-500 text-sm italic w-full text-center">Coming Soon</div>
                            )}
                        </div>
                    </div>
                </div>
            </SpotlightCard>

            {/* Lightbox Modal */}
            <ImageLightbox
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                images={uniqueImages}
                initialIndex={currentIndex}
            />

            {/* Detail Modal */}
            <DetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                item={project}
                type="project"
            />
        </>
    );
};

export default ProjectCard;
