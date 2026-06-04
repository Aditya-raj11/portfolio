import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_NAV_LINKS = [
    { label: 'Home', href: '#hero' },
    { label: 'Projects', href: '#projects' }
];

const Navbar = ({ profileName, showExperience = true, showCertifications = true, showAchievements = true }) => {
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');

    const navLinks = [
        ...BASE_NAV_LINKS,
        ...(showExperience ? [{ label: 'Experience', href: '#experience' }] : []),
        ...(showCertifications ? [{ label: 'Certifications', href: '#certifications' }] : []),
        ...(showAchievements ? [{ label: 'Achievements', href: '#achievements' }] : []),
        { label: 'Contact', href: '#contact' }
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 60);

            // Determine active section
            const sections = ['hero', 'projects', 'experience', 'certifications', 'achievements', 'contact'];
            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(sections[i]);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 150) {
                        setActiveSection(sections[i]);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (href) => {
        const id = href.replace('#', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {scrolled && (
                <motion.nav
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -80, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full px-4 py-2.5 md:px-6 md:py-3 flex items-center gap-4 md:gap-8
                        bg-white/60 dark:bg-black/40
                        backdrop-blur-2xl backdrop-saturate-150
                        border border-white/50 dark:border-white/10
                        shadow-[0_8px_32px_rgba(0,0,0,0.08),_0_0_0_1px_rgba(0,0,0,0.04)]
                        dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)]
                        max-w-[92vw] md:max-w-none"
                >
                    {/* Name/Logo */}
                    <button onClick={() => scrollTo('#hero')} className="hidden sm:block font-heading font-bold text-sm text-glossy whitespace-nowrap mr-2">
                        {profileName || 'Portfolio'}
                    </button>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
                        {navLinks.map(link => (
                            <button
                                key={link.href}
                                onClick={() => scrollTo(link.href)}
                                className={`relative px-3 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${activeSection === link.href.replace('#', '')
                                        ? 'text-black dark:text-white'
                                        : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
                                    }`}
                            >
                                {activeSection === link.href.replace('#', '') && (
                                    <motion.span
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-black/10 dark:bg-white/15 rounded-full"
                                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                    />
                                )}
                                <span className="relative z-10">{link.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
};

export default Navbar;
