import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const BackToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ y: -3 }}
                    onClick={scrollToTop}
                    className="fixed bottom-24 right-6 z-50 p-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-white/50 dark:border-white/10 text-black dark:text-white hover:bg-white dark:hover:bg-[#111] transition-colors group"
                    aria-label="Back to top"
                >
                    <div className="absolute inset-0 rounded-full border border-black/20 dark:border-white/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50 pointer-events-none" />
                    <ArrowUp size={20} className="relative z-10 transition-transform group-hover:-translate-y-0.5" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
