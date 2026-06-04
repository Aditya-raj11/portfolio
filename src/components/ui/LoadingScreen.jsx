import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const LETTERS = ['A', 'd', 'i', 't', 'y', 'a', '.'];

const LoadingScreen = ({ dataReady, onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [readyToScroll, setReadyToScroll] = useState(false);
    const [exiting, setExiting] = useState(false);
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const dataReadyRef = useRef(dataReady);
    const progressDoneRef = useRef(false);
    const exitingRef = useRef(false);

    // Apply theme immediately on toggle
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    // Lock scrolling (both body and Lenis) during the loading process and exit transition
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        if (window.__lenis) {
            window.__lenis.stop();
        }

        const checkLenisInterval = setInterval(() => {
            if (window.__lenis) {
                window.__lenis.stop();
                clearInterval(checkLenisInterval);
            }
        }, 50);

        return () => {
            clearInterval(checkLenisInterval);
            document.body.style.overflow = originalOverflow || 'unset';
            if (window.__lenis) {
                window.__lenis.start();
            }
        };
    }, []);

    useEffect(() => {
        dataReadyRef.current = dataReady;
        if (dataReady && progressDoneRef.current && !exitingRef.current) {
            setTimeout(() => setReadyToScroll(true), 0);
        }
    }, [dataReady]);

    // Progress ticker
    useEffect(() => {
        let rafId;
        let current = 0;
        const STALL_AT = 88;

        const tick = () => {
            const ready = dataReadyRef.current;
            if (current < STALL_AT) {
                current = Math.min(current + 0.7, STALL_AT);
                setProgress(Math.floor(current));
                rafId = requestAnimationFrame(tick);
            } else if (!ready) {
                const pulse = STALL_AT + Math.sin(Date.now() / 300) * 1.5;
                setProgress(Math.floor(pulse));
                rafId = requestAnimationFrame(tick);
            } else {
                if (current < 100) {
                    current = Math.min(current + 2.5, 100);
                    setProgress(Math.floor(current));
                    rafId = requestAnimationFrame(tick);
                } else {
                    setProgress(100);
                    progressDoneRef.current = true;
                    setReadyToScroll(true);
                }
            }
        };

        const startTimeout = setTimeout(() => { rafId = requestAnimationFrame(tick); }, 200);
        return () => { clearTimeout(startTimeout); if (rafId) cancelAnimationFrame(rafId); };
    }, []);

    // Scroll/wheel listener
    useEffect(() => {
        if (!readyToScroll || exitingRef.current) return;

        const triggerExit = () => {
            if (exitingRef.current) return;
            exitingRef.current = true;
            setExiting(true);
            setTimeout(() => onComplete(), 900);
        };

        const handleWheel = (e) => { if (e.deltaY > 0) triggerExit(); };
        let touchStartY = 0;
        const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
        const handleTouchMove = (e) => {
            if (touchStartY - e.touches[0].clientY > 30) triggerExit();
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [readyToScroll, onComplete]);

    const [visibleCount, setVisibleCount] = useState(0);

    // Typewriter effect for spelling "Aditya."
    useEffect(() => {
        let timerId;
        const typeNext = (index) => {
            if (index <= LETTERS.length) {
                setVisibleCount(index);
                const randomDelay = index === 0
                    ? 300 // Initial delay before typing starts
                    : Math.random() * 80 + 100; // Snappy human-like speed
                timerId = setTimeout(() => typeNext(index + 1), randomDelay);
            }
        };
        typeNext(0);
        return () => {
            if (timerId) clearTimeout(timerId);
        };
    }, []);

    const bg = isDark ? '#000' : '#f8fafc';
    const textPrimary = isDark ? '#ffffff' : '#000000';
    const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
    const barBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const barFill = isDark ? '#ffffff' : '#000000';
    const glowColor = isDark
        ? 'radial-gradient(circle, #ffffff 0%, #888 60%, transparent 100%)'
        : 'radial-gradient(circle, #000000 0%, #555 60%, transparent 100%)';

    return (
        <AnimatePresence>
            {!exiting && (
                <motion.div
                    key="loader"
                    initial={{ y: 0, opacity: 1 }}
                    exit={{ y: '-100vh', opacity: 0.6 }}
                    transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                    style={{ backgroundColor: bg }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Theme toggle — top right */}
                    <button
                        onClick={() => setIsDark(d => !d)}
                        className="absolute top-6 right-6 z-10 p-2.5 rounded-full border transition-all duration-300"
                        style={{
                            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            color: isDark ? '#facc15' : '#374151',
                        }}
                        title="Toggle theme"
                    >
                        <motion.div
                            key={isDark ? 'sun' : 'moon'}
                            initial={{ rotate: -30, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ duration: 0.25 }}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </motion.div>
                    </button>

                    {/* Ambient glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px] opacity-[0.12]"
                            style={{
                                width: `${Math.min(progress * 5, 500)}px`,
                                height: `${Math.min(progress * 5, 500)}px`,
                                background: glowColor,
                                transition: 'width 0.3s, height 0.3s',
                            }}
                        />
                    </div>

                    {/* Name */}
                    <div className="relative flex items-end gap-1 mb-16">
                        {LETTERS.map((letter, i) => {
                            const isVisible = i < visibleCount;
                            if (!isVisible) return null;

                            return (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.08, ease: 'easeOut' }}
                                    className="select-none"
                                    style={{
                                        fontFamily: '"Archivo Black", sans-serif',
                                        fontSize: i === 0 ? '5rem' : (i === 6 ? '4rem' : '3.5rem'),
                                        lineHeight: 1,
                                        color: (i === 0 || i === 6) ? textPrimary : textMuted,
                                    }}
                                >
                                    {letter}
                                </motion.span>
                            );
                        })}
                        {/* Typing Cursor */}
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
                            className="w-[4px] inline-block ml-1"
                            style={{
                                height: visibleCount <= 1 ? '4rem' : '2.8rem',
                                backgroundColor: textPrimary,
                                marginBottom: visibleCount === 7 ? '0.2rem' : '0.4rem',
                            }}
                        />
                    </div>

                    {/* Progress bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="w-64 flex flex-col items-center gap-3"
                    >
                        <div className="w-full h-px rounded-full overflow-hidden" style={{ backgroundColor: barBg }}>
                            <div
                                className="h-full rounded-full"
                                style={{ width: `${progress}%`, backgroundColor: barFill, transition: 'width 0.12s linear' }}
                            />
                        </div>
                        <div className="flex justify-between w-full">
                            <span className="text-xs tracking-widest uppercase font-medium" style={{ color: textMuted }}>
                                {progress < 89 ? 'Loading' : progress < 100 ? 'Fetching data' : 'Ready'}
                            </span>
                            <span className="text-xs font-mono tabular-nums" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>
                                {String(progress).padStart(3, '0')}%
                            </span>
                        </div>
                    </motion.div>

                    {/* Scroll prompt */}
                    <AnimatePresence>
                        {readyToScroll && (
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="absolute bottom-12 flex flex-col items-center gap-3 select-none pointer-events-none"
                            >
                                <span className="text-xs tracking-[0.25em] uppercase font-medium" style={{ color: textMuted }}>
                                    Scroll to explore
                                </span>
                                <div
                                    className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
                                    style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}` }}
                                >
                                    <motion.div
                                        className="w-1 h-1.5 rounded-full"
                                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}
                                        animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bottom tagline */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: readyToScroll ? 0 : 1 }}
                        transition={{ duration: 0.4 }}
                        className="absolute bottom-10 text-xs tracking-[0.3em] uppercase"
                        style={{ color: textMuted }}
                    >
                        Portfolio
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
