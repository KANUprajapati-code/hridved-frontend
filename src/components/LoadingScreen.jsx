
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = () => {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCounter((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Slower, more deliberate luxury counting
                const increment = Math.floor(Math.random() * 3) + 1;
                return Math.min(prev + increment, 100);
            });
        }, 120);
        return () => clearInterval(interval);
    }, []);

    // Staggered panels for the "Curtain" exit animation
    const panelVariants = {
        initial: { height: "100%" },
        exit: (i) => ({
            height: "0%",
            transition: {
                duration: 1.2,
                ease: [0.76, 0, 0.24, 1], // Cinematic easeInOutExpo
                delay: i * 0.1,
            }
        })
    };

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
            {/* Background Panels (The Curtain) */}
            <div className="absolute inset-0 flex">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        variants={panelVariants}
                        initial="initial"
                        exit="exit"
                        className="bg-primary relative"
                        style={{ width: "20%" }}
                    >
                        {/* Subtle line between panels for texture */}
                        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/5 h-full" />
                    </motion.div>
                ))}
            </div>

            {/* Content Layer */}
            <AnimatePresence>
                {counter < 100 && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ 
                            opacity: 0,
                            y: -50,
                            transition: { duration: 0.8, ease: "easeInOut" } 
                        }}
                        className="relative z-20 flex h-full w-full flex-col items-center justify-center"
                    >
                        <div className="container mx-auto px-12 flex flex-col justify-between h-full py-16 md:py-24">
                            {/* Top Info */}
                            <div className="flex justify-between items-start w-full overflow-hidden">
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="flex flex-col"
                                >
                                    <span className="text-secondary font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs">
                                        Pure Ayurveda
                                    </span>
                                    <span className="text-white/40 text-[9px] tracking-[0.2em] mt-1 font-medium italic">
                                        Crafting Wellness
                                    </span>
                                </motion.div>
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                                    className="text-right"
                                >
                                    <span className="text-white/60 text-[10px] md:text-xs tracking-[0.3em] uppercase font-bold">
                                        Hridved • 2020
                                    </span>
                                </motion.div>
                            </div>

                            {/* Center Section: The Bold Counter */}
                            <div className="flex flex-col items-center justify-center flex-grow">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1 }}
                                    className="relative"
                                >
                                    <div className="flex items-baseline justify-center">
                                        <motion.h1 
                                            className="text-white text-[25vw] sm:text-[20vw] lg:text-[18vw] font-serif font-black leading-none tracking-tighter"
                                        >
                                            {counter}
                                        </motion.h1>
                                        <span className="text-secondary text-2xl md:text-5xl font-bold ml-2">%</span>
                                    </div>
                                    
                                    {/* Logo floating subtly below counter */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, duration: 1 }}
                                        className="mt-4 md:mt-0 flex justify-center"
                                    >
                                        <img src="/logo-asset4.png" alt="Logo" className="h-10 md:h-16 w-auto brightness-0 invert opacity-40" />
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Bottom Info */}
                            <div className="flex justify-between items-end w-full">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                    className="flex flex-col"
                                >
                                    <span className="text-white/20 text-[8px] md:text-[10px] tracking-[0.6em] uppercase mb-4">
                                        Interface Loading
                                    </span>
                                    <div className="flex gap-2">
                                        {[...Array(3)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ 
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.3, 1, 0.3]
                                                }}
                                                transition={{ 
                                                    duration: 1.5, 
                                                    repeat: Infinity, 
                                                    delay: i * 0.2 
                                                }}
                                                className="w-1.5 h-1.5 bg-secondary rounded-full"
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                                
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: 1 }}
                                    className="text-right max-w-[200px] md:max-w-xs"
                                >
                                    <p className="text-white/60 text-[9px] md:text-[11px] uppercase leading-loose tracking-[0.2em] font-light">
                                        "Ancient wisdom for the modern soul."
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoadingScreen;
