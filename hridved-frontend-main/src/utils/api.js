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

export const getImageUrl = (url, { width = 1200 } = {}) => {
    if (!url) return url;
    if (url.startsWith('data:')) return url;

    // Let Cloudinary send a browser-friendly format and compressed image.
    // c_limit keeps the original aspect ratio and prevents upscaling small assets.
    if (url.startsWith('http')) {
        if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
        // Signed/private delivery URLs require their original signature and transformation.
        if (/\/s--[^/]+--\//.test(url)) return url;
        const transform = [`c_limit,w_${width}`];
        if (!url.includes('f_auto')) transform.push('f_auto');
        if (!url.includes('q_auto')) transform.push('q_auto:best');
        if (!url.includes('dpr_auto')) transform.push('dpr_auto');
        const insertion = transform.join(',');
        return url.replace('/image/upload/', `/image/upload/${insertion}/`);
    }

    const baseURL = import.meta.env.VITE_API_URL || '';
    // Uploaded files on the app server remain on their current URL path.
    if (baseURL.endsWith('/api')) {
        const rootURL = baseURL.replace('/api', '');
        return `${rootURL}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default api;
