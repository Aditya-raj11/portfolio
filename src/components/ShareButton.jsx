
import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

const ShareButton = ({ title, text, url }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: title || 'Aditya Raj - Portfolio',
            text: text || 'Check out this portfolio!',
            url: url || window.location.href,
        };

        // Try native share first (Mobile)
        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                console.log('Share canceled or failed', err);
            }
        }

        // Fallback to Copy to Clipboard
        try {
            await navigator.clipboard.writeText(shareData.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#303134] hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-all shadow-sm hover:shadow active:scale-95 group"
            title="Share Portfolio"
        >
            {copied ? (
                <>
                    <Check size={16} className="text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Copied!</span>
                </>
            ) : (
                <>
                    <Share2 size={16} className="text-blue-500 group-hover:-rotate-12 transition-transform" />
                    <span>Share</span>
                </>
            )}
        </button>
    );
};

export default ShareButton;
