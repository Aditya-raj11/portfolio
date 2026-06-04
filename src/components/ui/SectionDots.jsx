import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = [
    { id: 'hero', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'certifications', label: 'Certs' },
    { id: 'achievements', label: 'Awards' },
    { id: 'contact', label: 'Contact' },
];

const SectionDots = () => {
    const [active, setActive] = useState('hero');
    const [visible, setVisible] = useState(false);
    const [hoveredId, setHoveredId] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 400);

            // Find active section
            for (let i = SECTIONS.length - 1; i >= 0; i--) {
                const el = document.getElementById(SECTIONS[i].id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 200) {
                        setActive(SECTIONS[i].id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    // Only show sections that exist in the DOM
    const availableSections = SECTIONS.filter(s => document.getElementById(s.id));

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3"
                >
                    {availableSections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => scrollTo(section.id)}
                            onMouseEnter={() => setHoveredId(section.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="group flex items-center gap-2 relative"
                            aria-label={`Go to ${section.label}`}
                        >
                            {/* Label tooltip */}
                            <AnimatePresence>
                                {hoveredId === section.id && (
                                    <motion.span
                                        initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
                                        className="text-[10px] uppercase tracking-wider font-bold text-black/80 dark:text-white/80 bg-white/60 dark:bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md shadow-sm border border-black/5 dark:border-white/10 whitespace-nowrap mr-2"
                                    >
                                        {section.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {/* Dot */}
                            <div
                                className={`rounded-full transition-all duration-300 ${
                                    active === section.id
                                        ? 'w-3 h-3 bg-black dark:bg-white shadow-md'
                                        : 'w-2 h-2 bg-black/20 dark:bg-white/20 group-hover:bg-black/50 dark:group-hover:bg-white/50'
                                }`}
                            />
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SectionDots;
