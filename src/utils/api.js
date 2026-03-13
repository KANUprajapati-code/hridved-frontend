import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
});

// Add a request interceptor to attach JWT from localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getImageUrl = (url) => {
    if (!url) return url;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const baseURL = import.meta.env.VITE_API_URL || '';
    // If baseURL is just /api, we need to handle it. Usually uploads are at /uploads
    // For Vercel/Production, the full URL might be needed if they are separate.
    // If relative, use environment-specific logic.
    if (baseURL.endsWith('/api')) {
        const rootURL = baseURL.replace('/api', '');
        return `${rootURL}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default api;
