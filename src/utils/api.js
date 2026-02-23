import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api', // Use env var or proxy path
    withCredentials: true, // Enable sending cookies with requests
    headers: {},
});

export default api;
