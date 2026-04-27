import { useScroll, useSpring, motion } from 'framer-motion';

const ScrollProgressBar = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30, restDelta: 0.001 });

    return (
        <motion.div
            style={{ scaleX }}
            className="fixed top-0 left-0 right-0 h-[3px] bg-black dark:bg-white origin-left z-[9999] rounded-r-full"
        />
    );
};

export default ScrollProgressBar;
