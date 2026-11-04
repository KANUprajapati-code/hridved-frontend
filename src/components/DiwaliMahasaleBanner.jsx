import { useState, useEffect } from 'react';
import { Sparkles, Gift, Clock, Tag, Check, ArrowRight, ShieldCheck, Truck, Flame } from 'lucide-react';

const DiwaliMahasaleBanner = () => {
    // 12-hour countdown timer
    const [timeLeft, setTimeLeft] = useState({
        hours: 11,
        minutes: 48,
        seconds: 35,
    });
    const [copiedCode, setCopiedCode] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else {
                    return { hours: 12, minutes: 0, seconds: 0 };
                }
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const copyCoupon = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 3000);
    };

    const scrollToShop = () => {
        const bestsellersEl = document.getElementById('bestsellers-section') || document.getElementById('products-section');
        if (bestsellersEl) {
            bestsellersEl.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = '/shop';
        }
    };

    return (
        <section className="relative my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Outer Royal Festive Container */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c382b] via-[#104a39] to-[#08291f] border-2 border-amber-400/50 shadow-2xl p-6 sm:p-10 text-white">
                
                {/* Background Festive Glowing Ornaments */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Top Badge: Festive Announcement */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-amber-400/20 pb-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/50 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-amber-300 shadow-inner">
                        <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                        <span>Shubh Deepavali Ayurvedic Mahasale</span>
                        <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                    </div>

                    {/* Live Urgency Countdown Timer */}
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-400/30">
                        <Clock size={14} className="text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                        <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider mr-1">Offer Ends In:</span>
                        <div className="flex items-center gap-1 font-mono text-sm font-black text-white">
                            <span className="bg-amber-500/30 px-1.5 py-0.5 rounded text-amber-300">{String(timeLeft.hours).padStart(2, '0')}h</span>
                            <span>:</span>
                            <span className="bg-amber-500/30 px-1.5 py-0.5 rounded text-amber-300">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                            <span>:</span>
                            <span className="bg-amber-500/30 px-1.5 py-0.5 rounded text-amber-300">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                        </div>
                    </div>
                </div>

                {/* Main Festive Banner Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left Column: Festive Heading & Value Proposition */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center gap-2 text-amber-400">
                            <Flame size={20} className="animate-bounce" />
                            <span className="text-xs font-black tracking-widest uppercase">Special Festive Privilege</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                            Light Up Your Life with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-sm">
                                Pure Vedic Health & Glow
                            </span>
                        </h2>

                        <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl font-normal leading-relaxed">
                            This Diwali, gift your family authentic wellness. Get up to <span className="text-amber-300 font-bold">40% OFF</span> on clinically-backed ayurvedic formulations + <span className="text-amber-300 font-bold">Free Ayurvedic Gift</span> on orders above ₹999!
                        </p>

                        {/* 4 Trust Festive Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
                                <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
                                <span className="text-[11px] font-semibold text-gray-200">100% Shuddh</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
                                <Gift size={16} className="text-amber-400 flex-shrink-0" />
                                <span className="text-[11px] font-semibold text-gray-200">Free Gift 🎁</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
                                <Truck size={16} className="text-amber-400 flex-shrink-0" />
                                <span className="text-[11px] font-semibold text-gray-200">Express Ship</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
                                <ShieldCheck size={16} className="text-amber-400 flex-shrink-0" />
                                <span className="text-[11px] font-semibold text-gray-200">COD Available</span>
                            </div>
                        </div>

                        {/* Direct Shop Button */}
                        <div className="pt-2">
                            <button
                                onClick={scrollToShop}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(251,191,36,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                <span>Claim Diwali Discount & Shop Now</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Click-to-Copy Diwali Coupons */}
                    <div className="lg:col-span-5 bg-black/30 backdrop-blur-md border border-amber-400/30 rounded-2xl p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Tag size={16} className="text-amber-400" />
                                <span className="text-xs font-black uppercase tracking-wider text-amber-200">Diwali Exclusive Coupons</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">Tap to copy code</span>
                        </div>

                        {/* Coupon 1: DIWALI25 */}
                        <div 
                            onClick={() => copyCoupon('DIWALI25')}
                            className="cursor-pointer group relative overflow-hidden bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 border border-amber-400/40 rounded-xl p-3.5 transition-all duration-200"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-base font-black text-amber-300 tracking-wider">DIWALI25</span>
                                        <span className="bg-amber-400 text-gray-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">25% OFF</span>
                                    </div>
                                    <p className="text-[11px] text-gray-300 mt-0.5">Flat 25% OFF on all Ayurvedic medicines & oils</p>
                                </div>
                                <button className="flex-shrink-0 flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                                    {copiedCode === 'DIWALI25' ? (
                                        <>
                                            <Check size={12} className="text-emerald-400" />
                                            <span className="text-emerald-400">Copied!</span>
                                        </>
                                    ) : (
                                        <span>Copy</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Coupon 2: SHUBH100 */}
                        <div 
                            onClick={() => copyCoupon('SHUBH100')}
                            className="cursor-pointer group relative overflow-hidden bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-400/40 rounded-xl p-3.5 transition-all duration-200"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-base font-black text-emerald-300 tracking-wider">SHUBH100</span>
                                        <span className="bg-emerald-400 text-gray-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">₹100 OFF</span>
                                    </div>
                                    <p className="text-[11px] text-gray-300 mt-0.5">Flat ₹100 instant discount on orders above ₹999</p>
                                </div>
                                <button className="flex-shrink-0 flex items-center gap-1 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300 border border-emerald-400/40 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                                    {copiedCode === 'SHUBH100' ? (
                                        <>
                                            <Check size={12} className="text-emerald-400" />
                                            <span className="text-emerald-400">Copied!</span>
                                        </>
                                    ) : (
                                        <span>Copy</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Special Perk Note */}
                        <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-xl p-2.5 text-[11px] text-amber-200">
                            <Gift size={15} className="text-amber-400 flex-shrink-0 animate-bounce" />
                            <span>Surprise Festive Ayurvedic Immunity Booster gift included with orders above ₹999!</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default DiwaliMahasaleBanner;
