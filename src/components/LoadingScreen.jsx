
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ 
                y: "-100%",
                transition: { 
                    duration: 1.2, 
                    ease: [0.76, 0, 0.24, 1], // Custom cinematic easing
                    delay: 0.2
                } 
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary overflow-hidden"
        >
            {/* Dark Layer for depth */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            <div className="relative flex flex-col items-center">
                {/* Logo with sophisticated reveal */}
                <div className="overflow-hidden mb-8">
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ 
                            y: 0, 
                            opacity: 1,
                            transition: { 
                                duration: 1.5, 
                                ease: [0.16, 1, 0.3, 1] 
                            } 
                        }}
                    >
                        <img src="/logo-asset4.png" alt="HRIDVED" className="h-24 md:h-32 w-auto brightness-0 invert" />
                    </motion.div>
                </div>

                {/* Brand Text with letter spacing animation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: 1,
                        transition: { delay: 0.8, duration: 2 } 
                    }}
                    className="text-center"
                >
                    <motion.h2 
                        initial={{ letterSpacing: "1em", opacity: 0 }}
                        animate={{ letterSpacing: "0.3em", opacity: 1 }}
                        transition={{ delay: 0.5, duration: 2.5, ease: "easeOut" }}
                        className="text-white text-xl md:text-3xl font-serif font-bold uppercase mb-4"
                    >
                        Hridved Ayurveda
                    </motion.h2>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 1.5, duration: 2, ease: "easeInOut" }}
                        className="h-[1px] bg-secondary/50 mx-auto mb-4"
                    />
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.6, y: 0 }}
                        transition={{ delay: 2, duration: 1.5 }}
                        className="text-white text-[10px] md:text-xs tracking-[0.5em] uppercase font-light"
                    >
                        Authentic • Pure • Ancient
                    </motion.p>
                </motion.div>

                {/* Progress Indicator */}
                <div className="mt-16 w-64 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
                    <motion.div
                        initial={{ left: "-100%" }}
                        animate={{ 
                            left: "0%",
                            transition: { 
                                duration: 4, 
                                ease: [0.45, 0, 0.55, 1] 
                            } 
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-secondary/50 via-secondary to-secondary/50"
                    />
                </div>
            </div>

            {/* Cinematic Background Orbs */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.1, 1],
                    x: [0, 20, 0],
                    y: [0, -20, 0],
                    opacity: [0.1, 0.15, 0.1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-secondary/15 rounded-full blur-[140px]"
            />
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    x: [0, -30, 0],
                    y: [0, 30, 0],
                    opacity: [0.05, 0.1, 0.05]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[180px]"
            />
        </motion.div>
    );
};

export default LoadingScreen;
