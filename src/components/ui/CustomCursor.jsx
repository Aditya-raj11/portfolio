import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    const [isHovering, setIsHovering] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Use Framer Motion's useMotionValue and useSpring for ultra-smooth hardware-accelerated movement
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Configure spring settings for trailing effect
    const ringSpringConfig = { stiffness: 220, damping: 28, mass: 0.4 };
    const dotSpringConfig = { stiffness: 700, damping: 40 };

    const ringX = useSpring(mouseX, ringSpringConfig);
    const ringY = useSpring(mouseY, ringSpringConfig);

    const dotX = useSpring(mouseX, dotSpringConfig);
    const dotY = useSpring(mouseY, dotSpringConfig);

    // Handle normal cursor class toggle for Admin dashboard
    useEffect(() => {
        if (isAdminRoute) {
            document.body.classList.add('use-normal-cursor');
        } else {
            document.body.classList.remove('use-normal-cursor');
        }
        return () => {
            document.body.classList.remove('use-normal-cursor');
        };
    }, [isAdminRoute]);

    useEffect(() => {
        if (isAdminRoute) return;

        const updateMousePosition = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            if (!target) return;
            if (
                target.tagName.toLowerCase() === 'button' ||
                target.tagName.toLowerCase() === 'a' ||
                target.closest('button') ||
                target.closest('a') ||
                (target.classList && target.classList.contains('cursor-pointer')) ||
                window.getComputedStyle(target).cursor === 'pointer'
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isVisible, mouseX, mouseY, isAdminRoute]);

    if (isAdminRoute) {
        return null;
    }

    if (typeof window !== 'undefined' && window.matchMedia("(any-hover: none)").matches) {
        return null;
    }

    return (
        <>
            {/* Outer Ring */}
            <motion.div
                className="fixed top-0 left-0 rounded-full pointer-events-none z-[99999] mix-blend-difference hidden md:block border"
                style={{
                    x: ringX,
                    y: ringY,
                    translateX: '-55%',
                    translateY: '-55%',
                    width: isHovering ? 56 : 28,
                    height: isHovering ? 56 : 28,
                    borderColor: isHovering ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: isHovering ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    boxShadow: isHovering ? '0 0 12px rgba(255, 255, 255, 0.15)' : 'none',
                    opacity: isVisible ? 1 : 0,
                    scale: isClicked ? 0.85 : 1,
                }}
                transition={{
                    scale: { type: 'spring', stiffness: 400, damping: 15 },
                    width: { type: 'spring', stiffness: 220, damping: 20 },
                    height: { type: 'spring', stiffness: 220, damping: 20 },
                }}
            />

            {/* Inner Dot */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[99999] mix-blend-difference hidden md:block"
                style={{
                    x: dotX,
                    y: dotY,
                    translateX: '-50%',
                    translateY: '-50%',
                    opacity: isVisible ? 1 : 0,
                    scale: isHovering ? 0.35 : (isClicked ? 0.65 : 1),
                }}
                transition={{
                    scale: { type: 'spring', stiffness: 500, damping: 15 }
                }}
            />
        </>
    );
};

export default CustomCursor;
