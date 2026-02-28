
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
            className="flex items-center gap-2 px-6 py-3 btn-3d rounded-full group cursor-pointer"
            title="Share Portfolio"
        >
            {copied ? (
                <>
                    <Check size={16} className="text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Copied!</span>
                </>
            ) : (
                <>
                    <Share2 size={16} className="text-black dark:text-white group-hover:-rotate-12 transition-transform" />
                    <span>Share</span>
                </>
            )}
        </button>
    );
};

export default ShareButton;
