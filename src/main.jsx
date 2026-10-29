
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { HelmetProvider } from 'react-helmet-async';

// Handle dynamic module chunk load failures after fresh deployments
if (typeof window !== 'undefined') {
    window.addEventListener('vite:preloadError', (event) => {
        console.warn('[Vite] Chunk preload error detected, refreshing page with latest assets...', event);
        event.preventDefault();
        window.location.reload();
    });

    window.addEventListener('error', (event) => {
        if (event?.message && (
            event.message.includes('Failed to fetch dynamically imported module') ||
            event.message.includes('Expected a JavaScript-or-Wasm module script')
        )) {
            console.warn('[Vite] Module script error detected, auto-refreshing...', event.message);
            event.preventDefault();
            const lastReload = sessionStorage.getItem('last_module_reload');
            const now = Date.now();
            if (!lastReload || now - Number(lastReload) > 10000) {
                sessionStorage.setItem('last_module_reload', String(now));
                window.location.reload();
            }
        }
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </React.StrictMode>,
)
