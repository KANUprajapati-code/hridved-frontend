
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://hridved-opal.vercel.app',
                changeOrigin: true,
                secure: false,
            },
            '/uploads': {
                target: 'https://hridved-opal.vercel.app',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-ui': ['framer-motion', 'lucide-react'],
                    'vendor-auth': ['@react-oauth/google'],
                    'vendor-payments': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
                    'vendor-utils': ['axios'],
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
})
