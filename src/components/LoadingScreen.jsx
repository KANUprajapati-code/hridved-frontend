
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = () => {
    // Generate particles for the anti-gravity effect
    const particles = [...Array(30)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5
    }));

    const brandLetters = "Hridved".split("");

    const containerVariants = {
        exit: {
            opacity: 0,
            transition: { duration: 1, ease: "easeInOut" }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            exit="exit"
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            style={{ 
                background: "radial-gradient(circle at center, #0a4a0b 0%, #063807 70%, #031c03 100%)" // Deep herbal green CMYK calculated
            }}
        >
            {/* Subtle Light Rays / Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(212,175,55,0.05)_0%,rgba(6,56,7,0)_100%)]"></div>
            
            {/* Anti-Gravity Floating Particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-gradient-to-br from-secondary to-yellow-600 opacity-40 shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                    }}
                    animate={{
                        y: [0, -40, 0],
                        x: [0, 20, 0],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: p.delay
                    }}
                />
            ))}

            <div className="relative flex flex-col md:flex-row items-center gap-8">
                {/* Metallic Golden Logo with Anti-Gravity Motion */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
                    animate={{ 
                        scale: 1, 
                        opacity: 1, 
                        rotateY: 0,
                        y: [0, -15, 0],
                        rotateZ: [0, 2, 0, -2, 0]
                    }}
                    transition={{ 
                        opacity: { duration: 2 },
                        scale: { duration: 1.5 },
                        rotateY: { duration: 2, ease: "easeOut" },
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        rotateZ: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="relative group"
                >
                    {/* Golden Glow Behind Logo */}
                    <div className="absolute inset-[-20%] bg-secondary/20 blur-[40px] rounded-full animate-pulse"></div>
                    
                    <img 
                        src="/logo-asset4.png" 
                        alt="Hridved Logo" 
                        className="h-24 md:h-32 w-auto brightness-0 invert sepia(100%) saturate(500%) hue-rotate(10deg) drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]"
                        style={{ filter: "brightness(0) invert(1) sepia(100%) saturate(1000%) hue-rotate(10deg) brightness(1.2)" }} 
                    />
                    
                    {/* Metallic Reflection Sweep */}
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full skew-x-[-20deg]"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                    />
                </motion.div>

                {/* Staggered Floating Brand Name */}
                <div className="flex">
                    {brandLetters.map((letter, i) => (
                        <motion.span
                            key={i}
                            initial={{ 
                                opacity: 0, 
                                y: i % 2 === 0 ? 50 : -50,
                                x: i % 2 === 0 ? -30 : 30,
                                scale: 0.5,
                                rotate: 20
                            }}
                            animate={{ 
                                opacity: 1, 
                                y: 0, 
                                x: 0, 
                                scale: 1,
                                rotate: 0
                            }}
                            transition={{ 
                                duration: 1.5, 
                                delay: 0.5 + (i * 0.1),
                                ease: [0.16, 1, 0.3, 1]
                            }}
                            className="text-4xl md:text-7xl font-serif font-bold tracking-tight inline-block"
                            style={{
                                color: "#D4AF37", // Base gold
                                textShadow: "0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(212,175,55,0.4)",
                                background: "linear-gradient(to bottom, #FFD700 0%, #D4AF37 50%, #B8860B 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            {letter}
                        </motion.span>
                    ))}
                </div>
            </div>

            {/* Cinematic Sparkles */}
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={`sparkle-${i}`}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 5
                    }}
                />
            ))}
        </motion.div>
    );
};

export default LoadingScreen;
