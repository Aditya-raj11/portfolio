import React, { useState } from 'react';
import { Download, ExternalLink, Globe, Smartphone, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

const ProjectCard = ({ project }) => {
    const { title, description, imageUrl, imageUrls, category, projectUrl, downloadUrl } = project;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
            alert("No image available to preview.");
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

    return (
        <>
            <div className="group bg-white dark:bg-[#303134] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#1a73e8] dark:hover:border-[#8AB4F8] transition-all duration-300 border border-[#dadce0] dark:border-[#3c4043] flex flex-col h-full" style={{ transform: 'translateZ(0)', webkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                {/* Image Area */}
                <div
                    className="h-52 bg-[#f8f9fa] dark:bg-[#202124] relative overflow-hidden cursor-zoom-in group-image"
                    onClick={toggleLightbox}
                >
                    {currentImage ? (
                        <div className="w-full h-full relative">
                            <img
                                src={currentImage}
                                alt={`${title}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                    if (e.target.src.includes('wsrv.nl')) {
                                        e.target.src = uniqueImages[currentIndex];
                                    } else {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                    }
                                }}
                            />

                            {/* Overlay Gradient (Dark mode mostly) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/60 dark:to-transparent opacity-60"></div>

                            {/* Icons (Category) */}
                            <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/40 backdrop-blur-md p-2 rounded-full text-[#202124] dark:text-white/90 border border-gray-200 dark:border-white/10 shadow-sm">
                                {category === 'app' ? <Smartphone size={16} /> : <Globe size={16} />}
                            </div>

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
                        <div className="w-full h-full flex items-center justify-center text-[#9AA0A6] bg-[#f8f9fa] dark:bg-[#202124]">
                            No Preview
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-[#202124] dark:text-[#E8EAED] mb-2">{title}</h3>
                    <p className="text-[#5f6368] dark:text-[#9AA0A6] text-sm leading-relaxed mb-6 line-clamp-3">
                        {description}
                    </p>

                    <div className="mt-auto flex gap-3 pt-4 border-t border-[#dadce0] dark:border-[#3c4043]">
                        {category === 'app' && downloadUrl && (
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 px-4 rounded-full bg-[#1a73e8] dark:bg-[#8AB4F8] hover:bg-[#1557b0] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] text-sm font-medium text-center transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Download size={16} /> APK
                            </a>
                        )}

                        {category === 'website' && projectUrl && (
                            <a
                                href={projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 px-4 rounded-full bg-[#1a73e8] dark:bg-[#8AB4F8] hover:bg-[#1557b0] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] text-sm font-medium text-center transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <ExternalLink size={16} /> Visit
                            </a>
                        )}

                        {(!downloadUrl && !projectUrl) && (
                            <div className="text-[#9AA0A6] text-sm italic w-full text-center">Coming Soon</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            <ImageLightbox
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                images={uniqueImages}
                initialIndex={currentIndex}
            />
        </>
    );
};

export default ProjectCard;
