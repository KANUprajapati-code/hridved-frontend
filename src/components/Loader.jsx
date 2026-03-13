import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = ({ isLoading }) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                >
                    <div className="relative">
                        {/* Elegant Pulsating Rings */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.3, 0.1, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-primary/10 rounded-full scale-150 blur-xl"
                        />
                        
                        {/* Logo / Icon */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="relative z-10 flex flex-col items-center"
                        >
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mb-6">
                                <motion.path
                                    d="M12 2L4.5 9C4.5 9 1.5 12 1.5 15.5C1.5 19.0899 4.41015 22 8 22C10.5 22 12 21 12 21M12 2L19.5 9C19.5 9 22.5 12 22.5 15.5C22.5 19.0899 19.5899 22 16 22C13.5 22 12 21 12 21M12 2V21"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </svg>
                            
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-3xl font-sans font-black text-primary tracking-[0.3em] uppercase"
                            >
                                HRIDVED
                            </motion.h1>
                            
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "60px" }}
                                transition={{ delay: 1, duration: 1 }}
                                className="h-0.5 bg-secondary mt-3 rounded-full"
                            />
                            
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 1.5, duration: 0.8 }}
                                className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mt-4 font-bold"
                            >
                                Ancient Wisdom • Modern Purity
                            </motion.p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Loader;
