import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, Lock, ArrowRight, CheckCircle2, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

const LoginPage = () => {
    const [loginType, setLoginType] = useState('otp'); // 'otp' | 'password'

    // Email state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // OTP state
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpStep, setOtpStep] = useState(1); // 1 = Phone, 2 = OTP
    const [countdown, setCountdown] = useState(0);
    const [devOtp, setDevOtp] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const otpInputRefs = useRef([]);
    const { login, sendOtp, verifyOtp, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const redirect = queryParams.get('redirect') || '/';

    useEffect(() => {
        if (user) {
            if (redirect === '/' && user.isAdmin) {
                navigate('/admin');
            } else {
                navigate(redirect);
            }
        }
    }, [navigate, user, redirect]);

    // Resend countdown
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Send OTP
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
            const data = await sendOtp(cleanPhone, 'login-page-recaptcha-container');
            setOtpStep(2);
            setCountdown(60);
            if (data.devOtp) {
                setDevOtp(data.devOtp);
            }
            setTimeout(() => {
                if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
            }, 100);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to send OTP code');
        } finally {
            setLoading(false);
        }
    };

    // OTP Change
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5 && otpInputRefs.current[index + 1]) {
            otpInputRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length > 0) {
            const newOtp = [...otp];
            for (let i = 0; i < 6; i++) {
                newOtp[i] = pasted[i] || '';
            }
            setOtp(newOtp);
            const next = Math.min(pasted.length, 5);
            otpInputRefs.current[next]?.focus();
        }
    };

    // Verify OTP
    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter complete 6-digit OTP');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const cleanPhone = phone.replace(/\D/g, '').slice(-10);
            await verifyOtp(cleanPhone, otpCode, name);
            navigate(redirect);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    // Email Login
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate(redirect);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <motion.div
            className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
                <motion.div variants={itemVariants} className="text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles size={14} /> Quick & Secure Access
                    </div>
                    <h2 className="text-3xl font-extrabold text-primary font-serif">
                        Sign in to Hridved
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Access your orders, track shipments & get exclusive ayurvedic deals
                    </p>
                </motion.div>

                {error && (
                    <motion.div
                        variants={itemVariants}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Tabs */}
                <motion.div variants={itemVariants} className="flex bg-gray-100 p-1.5 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => { setLoginType('otp'); setError(''); }}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                            loginType === 'otp'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Phone size={14} className={loginType === 'otp' ? 'text-[#25D366]' : ''} />
                        Fast Mobile OTP
                    </button>
                    <button
                        type="button"
                        onClick={() => { setLoginType('password'); setError(''); }}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                            loginType === 'password'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Mail size={14} />
                        Email / Password
                    </button>
                </motion.div>

                {/* Flow 1: Mobile OTP */}
                {loginType === 'otp' ? (
                    <motion.div variants={itemVariants}>
                        {otpStep === 1 ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Enter Mobile Number
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3.5 flex items-center gap-1.5 text-gray-700 font-bold text-sm pointer-events-none border-r border-gray-200 pr-2.5">
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
                                            className="w-full pl-24 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl text-base font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary transition-all tracking-wider"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                                        <ShieldCheck size={13} className="text-green-600" />
                                        Instant OTP code will be sent to your phone
                                    </p>
                                </div>

                                {/* Firebase Invisible reCAPTCHA container */}
                                <div id="login-page-recaptcha-container"></div>

                                <button
                                    type="submit"
                                    disabled={loading || phone.length < 10}
                                    className="w-full bg-[#25D366] hover:bg-[#1da851] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <RefreshCw size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <span>Get OTP</span>
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">
                                        We sent an OTP to <span className="font-bold text-gray-900">+91 {phone}</span>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { setOtpStep(1); setOtp(['', '', '', '', '', '']); }}
                                        className="text-xs text-primary font-bold hover:underline mt-0.5"
                                    >
                                        Change Phone Number
                                    </button>
                                </div>

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
                                            <span>Verify & Sign In</span>
                                        </>
                                    )}
                                </button>

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
                    </motion.div>
                ) : (
                    /* Flow 2: Email & Password */
                    <form className="space-y-4" onSubmit={handleEmailSubmit}>
                        <div className="relative group">
                            <div className="absolute left-3.5 inset-y-0 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute left-3.5 inset-y-0 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3.5 rounded-2xl font-bold text-sm shadow hover:bg-opacity-95 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Sign In with Email'}
                        </button>
                    </form>
                )}

                {/* Divider */}
                <motion.div variants={itemVariants} className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white text-gray-400 uppercase tracking-wider font-bold">
                            Or continue with
                        </span>
                    </div>
                </motion.div>

                {/* OAuth Buttons */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <GoogleAuthButton text="Continue with Google" redirect={redirect} />
                </motion.div>

                {/* Register Link */}
                <motion.div variants={itemVariants} className="text-center pt-2">
                    <p className="text-xs text-gray-600">
                        New to Hridved?{' '}
                        <Link
                            to={redirect ? `/register?redirect=${redirect}` : '/register'}
                            className="font-bold text-secondary hover:text-primary transition-colors"
                        >
                            Create an Account
                        </Link>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoginPage;
