import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };
        
        const handleMouseOver = (e) => {
            if (
                e.target.tagName.toLowerCase() === 'button' || 
                e.target.tagName.toLowerCase() === 'a' ||
                e.target.closest('button') ||
                e.target.closest('a') ||
                window.getComputedStyle(e.target).cursor === 'pointer'
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isVisible]);

    // Only render on desktop / where pointer is fine
    if (typeof window !== 'undefined' && window.matchMedia("(any-hover: none)").matches) {
        return null;
    }

    return (
        <>
            {/* Outer Ring */}
            <motion.div
                className="fixed top-0 left-0 w-10 h-10 rounded-full border border-indigo-500/60 dark:border-indigo-400/60 pointer-events-none z-[99999] mix-blend-difference hidden md:block"
                animate={{
                    x: mousePosition.x - 20,
                    y: mousePosition.y - 20,
                    scale: isHovering ? 1.5 : 1,
                    backgroundColor: isHovering ? "rgba(99, 102, 241, 0.15)" : "transparent",
                    opacity: isVisible ? 1 : 0
                }}
                transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
            />
            {/* Inner Dot */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-indigo-600 dark:bg-indigo-300 rounded-full pointer-events-none z-[99999] mix-blend-difference hidden md:block shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                animate={{
                    x: mousePosition.x - 4,
                    y: mousePosition.y - 4,
                    scale: isHovering ? 0 : 1,
                    opacity: isVisible ? 1 : 0
                }}
                transition={{ type: "tween", ease: "linear", duration: 0 }}
            />
        </>
    );
};

export default CustomCursor;
