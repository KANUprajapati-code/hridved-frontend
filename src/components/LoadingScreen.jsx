
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary overflow-hidden"
        >
            {/* Background Grain/Noise Overlay for Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            <div className="relative flex flex-col items-center">
                {/* Animated Logo Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        transition: { 
                            duration: 1.2, 
                            ease: [0.16, 1, 0.3, 1] 
                        } 
                    }}
                    className="mb-8"
                >
                    <img src="/logo-asset4.png" alt="HRIDVED" className="h-20 md:h-28 w-auto brightness-0 invert" />
                </motion.div>

                {/* Brand Name Text Animation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: 1,
                        transition: { delay: 0.5, duration: 1 } 
                    }}
                    className="text-center"
                >
                    <h2 className="text-white text-xl md:text-2xl font-serif font-bold tracking-[0.3em] uppercase mb-2">
                        Hridved Ayurveda
                    </h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="text-white text-[10px] md:text-xs tracking-[0.5em] uppercase"
                    >
                        Authentic • Pure • Ancient
                    </motion.p>
                </motion.div>

                {/* Premium Progress Bar */}
                <div className="mt-12 w-48 h-[1px] bg-white/10 relative overflow-hidden">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ 
                            x: "0%",
                            transition: { 
                                duration: 2.5, 
                                ease: "easeInOut" 
                            } 
                        }}
                        className="absolute inset-0 bg-secondary"
                    />
                </div>
            </div>

            {/* Subtle Glowing Background Orbs */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]"
            />
            <motion.div 
                animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.05, 0.15, 0.05]
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[150px]"
            />
        </motion.div>
    );
};

export default LoadingScreen;
