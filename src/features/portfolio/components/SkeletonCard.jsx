import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="bg-white dark:bg-[#303134] rounded-2xl overflow-hidden shadow-sm border border-[#dadce0] dark:border-[#3c4043] h-full flex flex-col relative animate-pulse">
            {/* Image Placeholder */}
            <div className="h-52 bg-[#f1f3f4] dark:bg-[#202124] w-full border-b border-[#dadce0] dark:border-[#3c4043]"></div>

            <div className="p-6 flex flex-col flex-grow relative">
                {/* Title Placeholder */}
                <div className="h-6 bg-[#e8eaed] dark:bg-[#5f6368] rounded-md mb-4 w-3/4"></div>

                {/* Description Placeholder */}
                <div className="space-y-3 mb-6 flex-grow">
                    <div className="h-4 bg-[#f1f3f4] dark:bg-[#3c4043] rounded md w-full"></div>
                    <div className="h-4 bg-[#f1f3f4] dark:bg-[#3c4043] rounded md w-5/6"></div>
                    <div className="h-4 bg-[#f1f3f4] dark:bg-[#3c4043] rounded md w-4/6"></div>
                </div>

                {/* Links Placeholder */}
                <div className="flex gap-4 mt-auto pt-4 border-t border-[#dadce0] dark:border-[#3c4043]">
                    <div className="h-10 w-28 bg-[#e8eaed] dark:bg-[#5f6368] rounded-full"></div>
                    <div className="h-10 w-28 bg-[#e8eaed] dark:bg-[#5f6368] rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
