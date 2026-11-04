import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

const DiwaliDecorations = () => {
    const [celebrate, setCelebrate] = useState(false);
    const [visible, setVisible] = useState(true);

    const triggerCelebration = () => {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 3000);
    };

    if (!visible) return null;

    return (
        <>
            {/* Top Traditional Hanging Toran Garland */}
            <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none overflow-hidden h-6 sm:h-8 flex justify-around items-start opacity-90 select-none">
                {Array.from({ length: 18 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="flex flex-col items-center animate-toran-swing"
                        style={{ animationDelay: `${(i % 5) * 0.25}s` }}
                    >
                        {/* Mango Leaf */}
                        <div className="w-3 sm:w-4 h-4 sm:h-5 bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-b-full shadow-xs transform rotate-2"></div>
                        {/* Marigold Flower */}
                        <div className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-sm -mt-1 ring-1 ring-amber-300/40"></div>
                    </div>
                ))}
            </div>

            {/* Floating Left Animated Burning Diya */}
            <div 
                onClick={triggerCelebration}
                title="Shubh Deepavali! Click to celebrate!"
                className="fixed bottom-24 left-4 z-40 cursor-pointer group flex items-center gap-2 bg-gradient-to-r from-amber-950/90 to-yellow-950/90 text-amber-200 backdrop-blur-md px-3 py-2 rounded-full border border-amber-500/40 shadow-xl hover:scale-105 transition-all duration-300"
            >
                {/* SVG Animated Diya */}
                <div className="relative w-7 h-7 flex-shrink-0">
                    {/* Glowing Aura */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400/40 blur-xs animate-ping"></div>
                    {/* Flame */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-4 bg-gradient-to-t from-orange-600 via-yellow-400 to-amber-100 rounded-full animate-diya-flame shadow-[0_0_12px_#f59e0b]"></div>
                    {/* Diya Clay Pot */}
                    <svg viewBox="0 0 32 20" className="w-7 h-5 absolute bottom-0 text-amber-600 drop-shadow-md">
                        <path d="M2 10 Q16 22 30 10 Q28 6 16 8 Q4 6 2 10 Z" fill="#b45309" stroke="#d97706" strokeWidth="1" />
                        <ellipse cx="16" cy="9" rx="10" ry="2.5" fill="#78350f" />
                        <circle cx="16" cy="8.5" r="1.5" fill="#fef08a" />
                    </svg>
                </div>
                <div className="hidden sm:block text-left pr-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                        <span>Shubh Deepavali</span>
                        <Sparkles size={10} className="text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
                    </p>
                    <p className="text-[9px] text-amber-100/90 font-medium">Flat 25% OFF | Code: <b>DIWALI25</b></p>
                </div>
            </div>

            {/* Floating Right Festive Corner Badge */}
            <div 
                onClick={triggerCelebration}
                title="Tap for Diwali Sparkles!"
                className="fixed bottom-24 right-4 z-40 cursor-pointer group flex items-center gap-2 bg-gradient-to-r from-yellow-950/90 to-amber-950/90 text-amber-200 backdrop-blur-md px-3 py-2 rounded-full border border-amber-500/40 shadow-xl hover:scale-105 transition-all duration-300"
            >
                <div className="hidden sm:block text-right pl-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">Diwali Mahasale</p>
                    <p className="text-[9px] text-amber-100/90 font-medium">Free Gift on Orders ₹999+ 🎁</p>
                </div>
                {/* SVG Animated Diya */}
                <div className="relative w-7 h-7 flex-shrink-0">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400/40 blur-xs animate-ping"></div>
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-4 bg-gradient-to-t from-orange-600 via-yellow-400 to-amber-100 rounded-full animate-diya-flame shadow-[0_0_12px_#f59e0b]"></div>
                    <svg viewBox="0 0 32 20" className="w-7 h-5 absolute bottom-0 text-amber-600 drop-shadow-md">
                        <path d="M2 10 Q16 22 30 10 Q28 6 16 8 Q4 6 2 10 Z" fill="#b45309" stroke="#d97706" strokeWidth="1" />
                        <ellipse cx="16" cy="9" rx="10" ry="2.5" fill="#78350f" />
                        <circle cx="16" cy="8.5" r="1.5" fill="#fef08a" />
                    </svg>
                </div>
            </div>

            {/* Sparkles / Firecracker Celebration Shower when clicked */}
            {celebrate && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {Array.from({ length: 40 }).map((_, i) => {
                        const left = Math.random() * 100;
                        const animDelay = Math.random() * 0.5;
                        const size = 6 + Math.random() * 12;
                        const colors = ['#f59e0b', '#fbbf24', '#ef4444', '#10b981', '#ec4899', '#f97316'];
                        const color = colors[Math.floor(Math.random() * colors.length)];
                        return (
                            <div
                                key={i}
                                className="absolute animate-diwali-confetti"
                                style={{
                                    left: `${left}%`,
                                    top: '-20px',
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    backgroundColor: color,
                                    borderRadius: i % 2 === 0 ? '50%' : '2px',
                                    boxShadow: `0 0 10px ${color}`,
                                    animationDelay: `${animDelay}s`,
                                }}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default DiwaliDecorations;
