import React, { useEffect } from 'react';
import { X, Download, ExternalLink, Printer, FileText } from 'lucide-react';

const ResumeModal = ({ isOpen, onClose, resumeUrl, userName }) => {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !resumeUrl) return null;

    // Handle backdrop click to close
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-[#202124] w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-[#3c4043]">
                {/* Toolbar */}
                <div className="h-16 bg-[#303134] flex items-center justify-between px-4 border-b border-[#3c4043]">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-blue-600/20 rounded text-blue-400">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-medium text-sm md:text-base">{userName}'s Resume.pdf</h3>
                            <p className="text-xs text-gray-400 hidden md:block">Aditya Raj Portfolio</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Download */}
                        <a
                            href={resumeUrl}
                            download
                            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            title="Download"
                        >
                            <Download size={20} />
                        </a>

                        {/* Open Original */}
                        <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            title="Open in New Tab"
                        >
                            <ExternalLink size={20} />
                        </a>

                        <div className="w-px h-6 bg-gray-600 mx-1"></div>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 bg-[#202124] relative">
                    <iframe
                        src={`${resumeUrl}#toolbar=0`}
                        className="w-full h-full"
                        title="Resume Viewer"
                    />
                    {/* Fallback/Loading info could go here if iframe fails, but modern browsers handle this well */}
                </div>
            </div>
        </div>
    );
};

export default ResumeModal;
