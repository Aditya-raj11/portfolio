import React, { useRef, useState } from 'react';

const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255,255,255,0.06)', onClick }) => {
    const cardRef = useRef(null);
    const [spotlightStyle, setSpotlightStyle] = useState({ opacity: 0 });

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setSpotlightStyle({
            opacity: 1,
            background: `radial-gradient(600px circle at ${x}px ${y}px, ${spotlightColor}, transparent 40%)`,
        });
    };

    const handleMouseLeave = () => {
        setSpotlightStyle({ opacity: 0 });
    };

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            {/* Spotlight overlay */}
            <div
                className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
                style={spotlightStyle}
            />
            {children}
        </div>
    );
};

export default SpotlightCard;
