import { useState, useEffect } from 'react';

const TypewriterText = ({ texts = [], speed = 80, deleteSpeed = 40, pauseTime = 2000 }) => {
    const [displayText, setDisplayText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!texts.length) return;
        const current = texts[textIndex % texts.length];

        let timeout;
        if (!isDeleting) {
            if (displayText.length < current.length) {
                timeout = setTimeout(() => setDisplayText(current.slice(0, displayText.length + 1)), speed);
            } else {
                timeout = setTimeout(() => setIsDeleting(true), pauseTime);
            }
        } else {
            if (displayText.length > 0) {
                timeout = setTimeout(() => setDisplayText(current.slice(0, displayText.length - 1)), deleteSpeed);
            } else {
                setIsDeleting(false);
                setTextIndex(i => (i + 1) % texts.length);
            }
        }
        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, textIndex, texts, speed, deleteSpeed, pauseTime]);

    return (
        <span>
            {displayText}
            <span className="animate-pulse">|</span>
        </span>
    );
};

export default TypewriterText;
