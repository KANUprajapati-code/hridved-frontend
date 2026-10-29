import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Lock, ArrowRight, RefreshCw, CheckCircle2, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GoogleAuthButton from './GoogleAuthButton';

const LoginModal = () => {
    const {
        authModalOpen,
        authModalConfig,
        closeAuthModal,
        sendOtp,
        verifyOtp,
        login,
    } = useAuth();
    const { addToast } = useToast() || {};

    const [activeTab, setActiveTab] = useState('otp'); // 'otp' | 'password'

    // OTP Flow State
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState(1); // 1 = Enter Phone, 2 = Enter OTP
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [devOtp, setDevOtp] = useState('');
    const [error, setError] = useState('');

    // Email Flow State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const otpInputRefs = useRef([]);

    // Reset when modal opens/closes
    useEffect(() => {
        if (!authModalOpen) {
            setStep(1);
            setPhone('');
            setOtp(['', '', '', '', '', '']);
            setError('');
            setDevOtp('');
            setLoading(false);
        }
    }, [authModalOpen]);

    // Resend countdown timer
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Handle Phone Submit / Send OTP
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);

        if (cleanPhone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const data = await sendOtp(cleanPhone, 'modal-recaptcha-container');
            setStep(2);
            setCountdown(60);
            if (data.devOtp) {
                setDevOtp(data.devOtp);
            }
            if (addToast) addToast(`OTP sent to +91 ${cleanPhone}`, 'info');
            setTimeout(() => {
                if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
            }, 100);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP Box input change
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto move to next input box
        if (value && index < 5 && otpInputRefs.current[index + 1]) {
            otpInputRefs.current[index + 1].focus();
        }
    };

    // Handle OTP key navigation
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    // Handle OTP Paste
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length > 0) {
            const newOtp = [...otp];
            for (let i = 0; i < 6; i++) {
                newOtp[i] = pastedData[i] || '';
            }
            setOtp(newOtp);
            const nextIdx = Math.min(pastedData.length, 5);
            otpInputRefs.current[nextIdx]?.focus();
        }
    };

    // Handle OTP Verification
    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter complete 6-digit OTP code');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const cleanPhone = phone.replace(/\D/g, '').slice(-10);
            const verifiedUser = await verifyOtp(cleanPhone, otpCode, name);

            if (addToast) addToast(`Welcome ${verifiedUser.name || 'User'}!`, 'success');

            const callback = authModalConfig?.onSuccess;
            closeAuthModal();

            if (callback && typeof callback === 'function') {
                setTimeout(() => {
                    callback(verifiedUser);
                }, 150);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Normal Email Login
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            if (addToast) addToast(`Welcome back, ${data.name}!`, 'success');

            const callback = authModalConfig?.onSuccess;
            closeAuthModal();

            if (callback && typeof callback === 'function') {
                setTimeout(() => {
                    callback(data);
                }, 150);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    if (!authModalOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={closeAuthModal}
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-gray-100"
                >
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-white relative">
                        <button
                            onClick={closeAuthModal}
                            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                            title="Close"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-2 mb-1 text-secondary font-bold text-xs uppercase tracking-widest">
                            <Sparkles size={14} /> Quick Verification
                        </div>
                        <h2 className="text-2xl font-bold font-serif leading-tight">
                            {authModalConfig.title || 'Login to Continue'}
                        </h2>
                        <p className="text-white/80 text-xs mt-1">
                            {authModalConfig.description || 'Fast, secure OTP verification for your order'}
                        </p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex border-b border-gray-100 bg-gray-50/50 p-1.5">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('otp'); setError(''); }}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                                activeTab === 'otp'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Phone size={14} className={activeTab === 'otp' ? 'text-[#25D366]' : ''} />
                            Mobile OTP (1-Click)
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveTab('password'); setError(''); }}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                                activeTab === 'password'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Mail size={14} />
                            Email / Password
                        </button>
                    </div>

                    {/* Form Body */}
                    <div className="p-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-medium"
                            >
                                {error}
                            </motion.div>
                        )}

                        {activeTab === 'otp' ? (
                            <div>
                                {step === 1 ? (
                                    /* Step 1: Mobile Number Input */
                                    <form onSubmit={handleSendOtp} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                                Enter Mobile Number
                                            </label>
                                            <div className="relative flex items-center">
                                                <div className="absolute left-3 flex items-center gap-1.5 text-gray-700 font-bold text-sm pointer-events-none border-r border-gray-200 pr-2">
                                                    <span>🇮🇳</span>
                                                    <span>+91</span>
                                                </div>
                                                <input
                                                    type="tel"
                                                    maxLength={10}
                                                    required
                                                    autoFocus
                                                    placeholder="98765 43210"
                                                    value={phone}
                                                    onChange={(e) => {
                                                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                                                        setError('');
                                                    }}
                                                    className="w-full pl-24 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl text-base font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary transition-all tracking-wider"
                                                />
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
                                                <ShieldCheck size={13} className="text-green-600" />
                                                We will send a 6-digit verification code via SMS
                                            </p>
                                        </div>

                                        {/* Firebase Invisible reCAPTCHA container */}
                                        <div id="modal-recaptcha-container"></div>

                                        <button
                                            type="submit"
                                            disabled={loading || phone.length < 10}
                                            className="w-full bg-[#25D366] hover:bg-[#1da851] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                                        >
                                            {loading ? (
                                                <RefreshCw size={18} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <span>Get Verification OTP</span>
                                                    <ArrowRight size={16} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    /* Step 2: 6-Digit OTP Input */
                                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">
                                                Code sent to <span className="font-bold text-gray-900">+91 {phone}</span>
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); }}
                                                className="text-xs text-primary font-bold hover:underline mt-0.5"
                                            >
                                                Edit Number
                                            </button>
                                        </div>


                                        {/* OTP Boxes */}
                                        <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                                            {otp.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    ref={(el) => (otpInputRefs.current[idx] = el)}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                                    className="w-12 h-14 text-center text-xl font-black text-gray-900 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                            ))}
                                        </div>

                                        {/* Optional Name field */}
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Your Name (Optional)"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-primary"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || otp.join('').length < 6}
                                            className="w-full bg-primary hover:bg-opacity-95 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                                        >
                                            {loading ? (
                                                <RefreshCw size={18} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={18} />
                                                    <span>Verify & Proceed</span>
                                                </>
                                            )}
                                        </button>

                                        {/* Resend OTP */}
                                        <div className="text-center pt-1">
                                            {countdown > 0 ? (
                                                <span className="text-xs text-gray-400">
                                                    Resend code in <strong className="text-gray-700">{countdown}s</strong>
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSendOtp()}
                                                    className="text-xs text-secondary font-bold hover:underline inline-flex items-center gap-1"
                                                >
                                                    <RefreshCw size={12} /> Resend OTP
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </div>
                        ) : (
                            /* Email / Password Form */
                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm shadow hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Sign In with Email'}
                                </button>
                            </form>
                        )}

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-bold">
                                <span className="px-3 bg-white text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Auth Button */}
                        <GoogleAuthButton text="Continue with Google" />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
