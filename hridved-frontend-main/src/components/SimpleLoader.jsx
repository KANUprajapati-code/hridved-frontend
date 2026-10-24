
import { motion } from 'framer-motion';

const SimpleLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full bg-background animate-fade-in">
            <div className="relative">
                {/* Outer spin */}
                <motion.div 
                    className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                {/* Inner pulse */}
                <motion.div 
                    className="absolute inset-0 m-auto w-2 h-2 bg-secondary rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
            <p className="mt-4 text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] animate-pulse">
                Hridved Loading
            </p>
        </div>
    );
};

export default SimpleLoader;
