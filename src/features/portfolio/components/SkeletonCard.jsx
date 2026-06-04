import React from 'react';

const SkeletonCard = ({ large = false }) => {
    return (
        <div className={`glass-panel rounded-3xl overflow-hidden flex flex-col ${large ? 'h-full' : 'h-full'}`}>
            {/* Image Placeholder */}
            <div className={`${large ? 'h-72' : 'h-52'} bg-black/5 dark:bg-white/5 w-full skeleton-pulse`}></div>

            <div className="p-6 flex flex-col flex-grow">
                {/* Title Placeholder */}
                <div className="h-6 bg-black/10 dark:bg-white/10 rounded-lg mb-4 w-3/4 skeleton-pulse"></div>

                {/* Description Placeholder */}
                <div className="space-y-3 mb-6 flex-grow">
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-full skeleton-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-5/6 skeleton-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-4/6 skeleton-pulse" style={{ animationDelay: '0.3s' }}></div>
                </div>

                {/* Tag Placeholders */}
                <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-black/5 dark:bg-white/5 rounded-full skeleton-pulse" style={{ animationDelay: '0.15s' }}></div>
                    <div className="h-6 w-20 bg-black/5 dark:bg-white/5 rounded-full skeleton-pulse" style={{ animationDelay: '0.25s' }}></div>
                    <div className="h-6 w-14 bg-black/5 dark:bg-white/5 rounded-full skeleton-pulse" style={{ animationDelay: '0.35s' }}></div>
                </div>

                {/* Links Placeholder */}
                <div className="flex gap-4 mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="h-10 w-28 bg-black/5 dark:bg-white/5 rounded-full skeleton-pulse"></div>
                    <div className="h-10 w-28 bg-black/5 dark:bg-white/5 rounded-full skeleton-pulse" style={{ animationDelay: '0.1s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
