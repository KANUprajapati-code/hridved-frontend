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
        <svg className="w-5 h-5" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
        {loading ? 'Signing in...' : text}
      </motion.button>
    </div>
  );
};

export default GoogleAuthButton;
