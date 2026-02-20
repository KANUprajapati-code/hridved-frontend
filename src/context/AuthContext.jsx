import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ================= CHECK LOGIN ON APP LOAD =================
    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const { data } = await api.get('/users/profile', {
                withCredentials: true,
            });
            setUser(data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // ================= NORMAL LOGIN =================
    const login = async (email, password) => {
        const { data } = await api.post(
            '/users/login',
            { email, password },
            { withCredentials: true }
        );

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

        await checkUserLoggedIn();
        return data;
    };

    // ================= LOGOUT =================
    const logout = async () => {
        await api.post('/users/logout', {}, { withCredentials: true });
        setUser(null);
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
        await api.post(
            '/auth/google',
            { accessToken, idToken },
            { withCredentials: true }
        );

        // 🔥 After cookie set, fetch profile
        await checkUserLoggedIn();
    };

    // ================= FACEBOOK LOGIN =================
    const facebookLogin = async (accessToken) => {
        await api.post(
            '/auth/facebook',
            { accessToken },
            { withCredentials: true }
        );

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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};