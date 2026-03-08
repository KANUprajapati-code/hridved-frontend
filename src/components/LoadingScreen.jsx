import { motion } from 'framer-motion';

const LoadingScreen = () => {
    // Generate particles for a more luxurious anti-gravity effect
    const particles = [...Array(40)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 12 + 15,
        delay: Math.random() * 8
    }));

    const containerVariants = {
        exit: {
            opacity: 0,
            transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            exit="exit"
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            style={{ 
                background: "radial-gradient(circle at center, #0a4a0b 0%, #063807 70%, #031c03 100%)"
            }}
        >
            {/* Subtle Light Rays / Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_50%,rgba(212,175,55,0.08)_0%,rgba(6,56,7,0)_100%)]"></div>
            
            {/* Anti-Gravity Floating Particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] opacity-30 shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                    }}
                    animate={{
                        y: [0, -60, 0],
                        x: [0, 30, 0],
                        opacity: [0.1, 0.5, 0.1],
                        scale: [1, 1.5, 1]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: p.delay
                    }}
                />
            ))}

            <div className="relative flex flex-col items-center justify-center">
                {/* Metallic Golden Logo with Anti-Gravity Motion */}
                <motion.div
                    initial={{ scale: 0.85, opacity: 0, rotateY: -90, y: 30 }}
                    animate={{ 
                        scale: 1, 
                        opacity: 1, 
                        rotateY: 0,
                        y: [0, -20, 0],
                        rotateZ: [0, 1, 0, -1, 0]
                    }}
                    transition={{ 
                        opacity: { duration: 2.5, ease: "easeOut" },
                        scale: { duration: 2.5, ease: [0.22, 1, 0.36, 1] },
                        rotateY: { duration: 3, ease: [0.22, 1, 0.36, 1] },
                        y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                        rotateZ: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="relative"
                >
                    {/* Golden Glow Behind Logo */}
                    <motion.div 
                        className="absolute inset-[-40%] bg-[#D4AF37]/10 blur-[60px] rounded-full"
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    <img 
                        src="/logo-asset4.png" 
                        alt="Hridved Logo" 
                        className="h-32 md:h-48 w-auto relative z-10"
                        style={{ 
                            filter: "brightness(0) invert(1) sepia(100%) saturate(800%) hue-rotate(10deg) brightness(1.1) drop-shadow(0 0 20px rgba(212,175,55,0.6))" 
                        }} 
                    />
                    
                    {/* Metallic Reflection Sweep */}
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full skew-x-[-25deg] z-20"
                        animate={{ x: ["-150%", "250%"] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1], repeatDelay: 1.5 }}
                    />
                </motion.div>
            </div>

            {/* Cinematic Sparkles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={`sparkle-${i}`}
                    className="absolute w-1 h-1 bg-[#FFD700] rounded-full shadow-[0_0_5px_#fff]"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.2, 0],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 5
                    }}
                />
            ))}
        </motion.div>
    );
};

export default LoadingScreen;
