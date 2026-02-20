import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const { data } = await api.get('/users/profile');
            setUser(data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await api.post('/users/login', { email, password });
        setUser(data);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/users', { name, email, password });
        setUser(data);
        return data;
    };

    const logout = async () => {
        await api.post('/users/logout');
        setUser(null);
    };

    const updateProfile = async (userData) => {
        const { data } = await api.put('/users/profile', userData);
        setUser(data);
        return data;
    };

    const googleLogin = async (accessToken, idToken) => {
        const { data } = await api.post('/auth/google', { accessToken, idToken });
        setUser(data.user);
        return data;
    };

    const facebookLogin = async (accessToken) => {
        const { data } = await api.post('/auth/facebook', { accessToken });
        setUser(data.user);
        return data;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateProfile,
            googleLogin,
            facebookLogin
        }}>
            {children}
        </AuthContext.Provider>
    );
};
