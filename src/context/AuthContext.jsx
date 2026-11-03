import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    // ================= OTP LOGIN / SEND VIA DIRECT APITXT SMS GATEWAY =================
    const sendOtp = async (phone) => {
        const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
        if (cleanPhone.length !== 10) {
            throw new Error('Please enter a valid 10-digit mobile number');
        }

        try {
            const { data } = await api.post('/users/otp/send', { phone: cleanPhone });
            return { ...data, phone: cleanPhone };
        } catch (serverErr) {
            const errorMsg = serverErr?.response?.data?.message || serverErr.message || 'Failed to send OTP code';
            throw new Error(errorMsg);
        }
    };

    // ================= OTP VERIFY & LOGIN =================
    const verifyOtp = async (phone, otp, name) => {
        const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
        const enteredOtp = otp.toString().trim();

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