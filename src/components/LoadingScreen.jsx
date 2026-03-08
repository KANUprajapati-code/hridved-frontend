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

    const brandName = "Hridved";
    const brandLetters = brandName.split("");

    const containerVariants = {
        exit: {
            opacity: 0,
            transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const logoVariants = {
        initial: { scale: 0.8, opacity: 0, rotateY: -180, y: 50 },
        animate: { 
            scale: 1, 
            opacity: 1, 
            rotateY: 0,
            y: [0, -15, 0],
            rotateZ: [0, 2, 0, -2, 0],
            transition: { 
                opacity: { duration: 2.5, ease: "easeOut" },
                scale: { duration: 2.5, ease: [0.16, 1, 0.3, 1] },
                rotateY: { duration: 3, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                rotateZ: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }
        }
    };

    const letterVariants = {
        initial: (i) => ({ 
            opacity: 0, 
            y: i % 2 === 0 ? 60 : -60,
            x: i % 2 === 0 ? -40 : 40,
            scale: 0.4,
            rotate: 15
        }),
        animate: (i) => ({ 
            opacity: 1, 
            y: 0, 
            x: 0, 
            scale: 1,
            rotate: 0,
            transition: { 
                duration: 2, 
                delay: 1 + (i * 0.12),
                ease: [0.16, 1, 0.3, 1]
            }
        })
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
                        y: [0, -70, 0],
                        x: [0, 40, 0],
                        opacity: [0.1, 0.5, 0.1],
                        scale: [1, 1.4, 1]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: p.delay
                    }}
                />
            ))}

            <div className="relative flex flex-col md:flex-row items-center gap-10 md:gap-6">
                {/* Logo Icon with Anti-Gravity Motion */}
                <motion.div
                    variants={logoVariants}
                    initial="initial"
                    animate="animate"
                    className="relative"
                >
                    {/* Golden Glow Behind Logo */}
                    <motion.div 
                        className="absolute inset-[-40%] bg-[#D4AF37]/15 blur-[50px] rounded-full"
                        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    <img 
                        src="/logo-modified.png" 
                        alt="Hridved Icon" 
                        className="h-24 md:h-32 w-auto relative z-10"
                        style={{ 
                            filter: "brightness(0) invert(1) sepia(100%) saturate(600%) hue-rotate(15deg) brightness(1.1) drop-shadow(0 0 15px rgba(212,175,55,0.5))" 
                        }} 
                    />
                    
                    {/* Metallic Reflection Sweep */}
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full skew-x-[-25deg] z-20"
                        animate={{ x: ["-150%", "250%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: [0.4, 0, 0.2, 1], repeatDelay: 2 }}
                    />
                </motion.div>

                {/* Animated Brand Name */}
                <div className="flex select-none">
                    {brandLetters.map((letter, i) => (
                        <motion.span
                            key={i}
                            custom={i}
                            variants={letterVariants}
                            initial="initial"
                            animate="animate"
                            className="text-5xl md:text-8xl font-serif font-extrabold tracking-tighter inline-block relative"
                            style={{
                                color: "#D4AF37",
                                textShadow: "0 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.3)",
                                background: "linear-gradient(to bottom, #FFD700 0%, #D4AF37 50%, #B8860B 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            {/* Subtle individual float per letter */}
                            <motion.span
                                className="inline-block"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ 
                                    duration: 4, 
                                    repeat: Infinity, 
                                    ease: "easeInOut", 
                                    delay: 1.5 + (i * 0.2) 
                                }}
                            >
                                {letter}
                            </motion.span>
                        </motion.span>
                    ))}
                </div>
            </div>

            {/* Cinematic Sparkles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={`sparkle-${i}`}
                    className="absolute w-1 h-1 bg-[#FFD700] rounded-full shadow-[0_0_8px_#fff]"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        opacity: [0, 0.9, 0],
                        scale: [0, 1.4, 0],
                    }}
                    transition={{
                        duration: 4 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 5
                    }}
                />
            ))}
        </motion.div>
    );
};

export default LoadingScreen;
