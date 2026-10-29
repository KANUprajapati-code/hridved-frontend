import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { auth, signInWithPhoneNumber, setupRecaptcha } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Auth Modal State for gating actions (Add to Cart, WhatsApp Order, etc.)
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalConfig, setAuthModalConfig] = useState({
        title: 'Sign in to continue',
        description: 'Please verify your phone number to proceed.',
        onSuccess: null,
    });

    const openAuthModal = ({ title, description, onSuccess } = {}) => {
        setAuthModalConfig({
            title: title || 'Sign in to continue',
            description: description || 'Please verify your phone number to proceed.',
            onSuccess: onSuccess || null,
        });
        setAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setAuthModalOpen(false);
        setAuthModalConfig({
            title: 'Sign in to continue',
            description: 'Please verify your phone number to proceed.',
            onSuccess: null,
        });
    };

    // ================= CHECK LOGIN ON APP LOAD =================
    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setUser(null);
            setLoading(false);
            return null;
        }
        try {
            const { data } = await api.get('/users/profile', {
                withCredentials: true,
            });
            setUser(data);
            return data;
        } catch (error) {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ================= OTP LOGIN / SEND VIA DIRECT FAST2SMS / SMS GATEWAY =================
    const sendOtp = async (phone, containerId = 'recaptcha-container') => {
        const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
        if (cleanPhone.length !== 10) {
            throw new Error('Please enter a valid 10-digit mobile number');
        }

        try {
            // 1. Direct Server OTP dispatch (Fast2SMS / Live SMS Gateway)
            const { data } = await api.post('/users/otp/send', { phone: cleanPhone });
            return { ...data, method: 'server', phone: cleanPhone };
        } catch (serverErr) {
            console.warn('Server sendOtp notice, attempting Firebase fallback:', serverErr?.response?.data || serverErr.message);
            // 2. Firebase fallback if server is unreachable
            try {
                const appVerifier = setupRecaptcha(containerId);
                const formattedPhone = `+91${cleanPhone}`;
                const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
                window.confirmationResult = result;
                setConfirmationResult(result);
                return { success: true, method: 'firebase', phone: cleanPhone };
            } catch (firebaseErr) {
                const msg = serverErr?.response?.data?.message || firebaseErr.message || 'Failed to send OTP code';
                throw new Error(msg);
            }
        }
    };

    // ================= OTP VERIFY & LOGIN VIA FIREBASE =================
    const verifyOtp = async (phone, otp, name) => {
        const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
        const enteredOtp = otp.toString().trim();

        // 1. Check if Firebase confirmationResult is active
        const activeConfirmation = window.confirmationResult || confirmationResult;
        if (activeConfirmation) {
            try {
                const userCredential = await activeConfirmation.confirm(enteredOtp);
                const firebaseUser = userCredential.user;
                const idToken = await firebaseUser.getIdToken();

                const { data } = await api.post(
                    '/users/firebase-login',
                    {
                        phone: firebaseUser.phoneNumber || `+91${cleanPhone}`,
                        idToken,
                        uid: firebaseUser.uid,
                        name: name || undefined,
                    },
                    { withCredentials: true }
                );

                if (data.token) {
                    localStorage.setItem('jwtToken', data.token);
                }

                window.confirmationResult = null;
                setConfirmationResult(null);

                const freshUser = await checkUserLoggedIn();
                return freshUser || data;
            } catch (fbConfirmErr) {
                console.warn('Firebase confirmation failed, trying server verify:', fbConfirmErr);
                if (fbConfirmErr.code === 'auth/invalid-verification-code') {
                    throw new Error('Invalid OTP code. Please enter the correct 6-digit code.');
                }
                if (fbConfirmErr.code === 'auth/code-expired') {
                    throw new Error('OTP expired. Please request a new code.');
                }
                // Try server OTP fallback
                try {
                    const { data } = await api.post(
                        '/users/otp/verify',
                        { phone: cleanPhone, otp: enteredOtp, name },
                        { withCredentials: true }
                    );
                    if (data.token) localStorage.setItem('jwtToken', data.token);
                    const freshUser = await checkUserLoggedIn();
                    return freshUser || data;
                } catch (e) {
                    throw fbConfirmErr;
                }
            }
        }

        // 2. Standard server OTP verification
        const { data } = await api.post(
            '/users/otp/verify',
            { phone: cleanPhone, otp: enteredOtp, name },
            { withCredentials: true }
        );

        if (data.token) {
            localStorage.setItem('jwtToken', data.token);
        }

        const freshUser = await checkUserLoggedIn();
        return freshUser || data;
    };

    // ================= NORMAL LOGIN =================
    const login = async (email, password) => {
        const { data } = await api.post(
            '/users/login',
            { email, password },
            { withCredentials: true }
        );

        if (data.token) {
            localStorage.setItem('jwtToken', data.token);
        }

        await checkUserLoggedIn(); // 🔥 important
        return data;
    };

    // ================= REGISTER =================
    const register = async (name, email, password) => {
        const { data } = await api.post(
            '/users',
            { name, email, password },
            { withCredentials: true }
        );

        if (data.token) {
            localStorage.setItem('jwtToken', data.token);
        }

        await checkUserLoggedIn();
        return data;
    };

    // ================= LOGOUT =================
    const logout = async () => {
        await api.post('/users/logout', {}, { withCredentials: true });
        localStorage.removeItem('jwtToken');
        setUser(null);
        window.location.reload(); // 🔥 Force reload to clear all state
    };

    // ================= UPDATE PROFILE =================
    const updateProfile = async (userData) => {
        const { data } = await api.put(
            '/users/profile',
            userData,
            { withCredentials: true }
        );

        setUser(data);
        return data;
    };

    // ================= GOOGLE LOGIN =================
    const googleLogin = async (accessToken, idToken) => {
        const { data } = await api.post(
            '/auth/google',
            { accessToken, idToken },
            { withCredentials: true }
        );

        if (data.token) {
            localStorage.setItem('jwtToken', data.token);
        }

        // 🔥 After cookie set, fetch profile
        await checkUserLoggedIn();
    };

    // ================= FACEBOOK LOGIN =================
    const facebookLogin = async (accessToken) => {
        const { data } = await api.post(
            '/auth/facebook',
            { accessToken },
            { withCredentials: true }
        );

        if (data.token) {
            localStorage.setItem('jwtToken', data.token);
        }

        await checkUserLoggedIn();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                updateProfile,
                googleLogin,
                facebookLogin,
                sendOtp,
                verifyOtp,
                authModalOpen,
                authModalConfig,
                openAuthModal,
                closeAuthModal,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};