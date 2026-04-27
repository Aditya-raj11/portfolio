import React, { useCallback, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const ParticleBackground = () => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = (container) => {
        // console.log(container);
    };

    if (init) {
        return (
            <Particles
                id="tsparticles"
                particlesLoaded={particlesLoaded}
                className="absolute inset-0 -z-10"
                options={{
                    fullScreen: { enable: false }, // We contain it in a div
                    background: {
                        color: {
                            value: "transparent",
                        },
                    },
                    fpsLimit: 120,
                    interactivity: {
                        events: {
                            onClick: {
                                enable: true,
                                mode: "push", // Restored 'generate' functionality
                            },
                            onHover: {
                                enable: true,
                                mode: "repulse",
                            },
                        },
                        modes: {
                            push: {
                                quantity: 3, 
                            },
                            repulse: {
                                distance: 100,
                                duration: 0.4,
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: "#6366f1", 
                        },
                        links: {
                            color: "#6366f1",
                            distance: 150,
                            enable: true,
                            opacity: 0.2, // Slightly lighter so connecting lines fade smoothly
                            width: 1,
                        },
                        move: {
                            direction: "none",
                            enable: true,
                            outModes: {
                                default: "out", // **MAGIC FIX:** Particles now drift off the screen instead of being trapped, naturally and smoothly reducing the count without "popping"
                            },
                            random: true,
                            speed: 0.8, 
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 800,
                            },
                            value: 60, 
                            limit: { value: 150 } // Increased limit so you can generate a lot before any safety bounds kick in
                        },
                        opacity: {
                            value: { min: 0.1, max: 0.5 },
                            animation: {
                                enable: true,
                                speed: 0.5,
                                sync: false, // Creates a beautiful twinkling "fade in/fade out" effect
                            }
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            value: { min: 1, max: 3 },
                        },
                    },
                    detectRetina: true,
                }}
            />
        );
    }

    return <></>;
};

export default ParticleBackground;
