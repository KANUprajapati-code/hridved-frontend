
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
                const increment = Math.floor(Math.random() * 5) + 1;
                return Math.min(prev + increment, 100);
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // Staggered panels for the exit animation
    const panelVariants = {
        initial: { y: 0 },
        exit: (i) => ({
            y: "-100%",
            transition: {
                duration: 1,
                ease: [0.645, 0.045, 0.355, 1], // easeInOutQuint
                delay: i * 0.1,
            }
        })
    };

    return (
        <motion.div
            className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
        >
            <AnimatePresence>
                {/* Background Panels */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        variants={panelVariants}
                        initial="initial"
                        exit="exit"
                        className="absolute top-0 bottom-0 bg-primary"
                        style={{
                            left: `${i * 20}%`,
                            width: "20.5%", // Slight overlap to prevent gaps
                            zIndex: 10
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Content Layer */}
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ 
                    opacity: 0,
                    transition: { duration: 0.5 } 
                }}
                className="relative z-20 flex h-full w-full flex-col items-center justify-center bg-transparent"
            >
                <div className="container mx-auto px-10 flex flex-col justify-between h-full py-20">
                    {/* Top Section */}
                    <div className="flex justify-between items-start">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        >
                            <span className="text-secondary font-bold tracking-[0.3em] uppercase text-xs">
                                Hridved Ayurveda
                            </span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="text-right"
                        >
                            <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase">
                                Est. 2020
                            </span>
                        </motion.div>
                    </div>

                    {/* Middle Section: Logo and Counter */}
                    <div className="flex flex-col items-center justify-center flex-grow">
                        <div className="overflow-hidden mb-6">
                            <motion.img
                                initial={{ y: "110%" }}
                                animate={{ y: 0 }}
                                transition={{ 
                                    duration: 1.5, 
                                    ease: [0.16, 1, 0.3, 1] 
                                }}
                                src="/logo-asset4.png"
                                alt="HRIDVED"
                                className="h-20 md:h-32 w-auto brightness-0 invert"
                            />
                        </div>
                        
                        <div className="flex items-baseline gap-2">
                            <motion.span 
                                className="text-white text-6xl md:text-9xl font-sans font-black tracking-tighter"
                            >
                                {counter}
                            </motion.span>
                            <span className="text-secondary text-2xl font-bold">%</span>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex justify-between items-end">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1 }}
                            className="max-w-[200px]"
                        >
                            <p className="text-white/60 text-[10px] uppercase leading-loose tracking-widest">
                                Crafting authentic products with ancient wisdom.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.2 }}
                        >
                             <div className="h-12 w-12 border border-white/10 rounded-full flex items-center justify-center group">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="w-1.5 h-1.5 bg-secondary rounded-full"
                                />
                             </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LoadingScreen;
