/* global google */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GoogleAuthButton = ({ text = 'Continue with Google', redirect = '/' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleClientId, setGoogleClientId] = useState(null);
  const { user, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Get Google Client ID from backend
    const fetchGoogleClientId = async () => {
      try {
        const response = await api.get('/auth/status');
        if (response.data.googleClientId && response.data.googleClientId !== 'NOT_CONFIGURED') {
          setGoogleClientId(response.data.googleClientId);
        }
      } catch (err) {
        console.error('Failed to fetch Google Client ID:', err);
      }
    };

    fetchGoogleClientId();

    // Load Google Identity Services (New)
    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src = 'https://accounts.google.com/gsi/client';
      document.head.appendChild(script);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        throw new Error('Google Identity Services not loaded');
      }

      // Use Token Model for custom buttons
      const client = google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              // Use googleLogin from AuthContext
              await googleLogin(tokenResponse.access_token);

              // Redirect to specified page with FULL REFRESH to ensure state is clean
              // This satisfies the user's request for "auto metic refresh"
              window.location.href = redirect;
            } catch (err) {
              console.error('Backend Google auth error:', err);
              setError(err.response?.data?.message || 'Google authentication failed with backend.');
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        },
        error_callback: (err) => {
          console.error('Google token client error:', err);
          setError('Google sign-in failed.');
          setLoading(false);
        }
      });

      // Trigger the popup
      client.requestAccessToken();

    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  if (!googleClientId || googleClientId === 'NOT_CONFIGURED') {
    return null;
  }

  return (
    <div className="w-full">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        onClick={handleGoogleSignIn}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg font-medium transition-all ${loading
          ? 'bg-gray-100 cursor-not-allowed text-gray-600'
          : 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-md'
          }`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <image
            href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0xMS43OCA2LjI2SDEyLjA2TDEyLjA2IDEwLjc0SDEyLjA2SDE2LjEyVjE2LjEySDEyLjA2SDEyLjA2VjExLjU4SDEyLjA2SDE2LjEyVjYuMjZIMTEuNzhWNi4yNloiIGZpbGw9IiM0Mzg1RjQiLz4KPHBhdGggZD0iTTExLjc4IDcuNzJIMTIuMDZWMTAuNzRMMTIuMDYgMTYuMTJIMTAuOVYxMi45SDEwLjcyQzEwLjMzIDEyLjkgOS45OSAxMi41NiA5Ljk5IDEyLjE3VjExLjA4QzkuOTkgMTAuNjkgMTAuMzMgMTAuMzUgMTAuNzIgMTAuMzVIMTEuNzh2MjVWNy43MloiIGZpbGw9IiMzNDczRTYiLz4KPC9zdmc+"
            width="24"
            height="24"
          />
        </svg>
        {loading ? 'Signing in...' : text}
      </motion.button>
    </div>
  );
};

export default GoogleAuthButton;
