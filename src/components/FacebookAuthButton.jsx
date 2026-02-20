/* global FB */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const FacebookAuthButton = ({ text = 'Continue with Facebook', redirect = '/' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facebookAppId, setFacebookAppId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get Facebook App ID from backend
    const fetchFacebookAppId = async () => {
      try {
        const response = await api.get('/auth/status');
        if (response.data.facebookAppId && response.data.facebookAppId !== 'NOT_CONFIGURED') {
          setFacebookAppId(response.data.facebookAppId);
        }
      } catch (err) {
        console.error('Failed to fetch Facebook App ID:', err);
      }
    };

    fetchFacebookAppId();

    // Load Facebook SDK
    if (!window.FB) {
      window.fbAsyncInit = function () {
        FB.init({
          appId: facebookAppId,
          xfbml: true,
          version: 'v18.0',
        });
      };

      // Load SDK script
      (function (d, s, id) {
        var js,
          fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.async = true;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
      })(document, 'script', 'facebook-jssdk');
    }
  }, [facebookAppId]);

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.FB) {
        throw new Error('Facebook SDK not loaded');
      }

      // Request login
      window.FB.login(
        async (response) => {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken;

            // Send token to backend for verification
            const backendResponse = await api.post('/auth/facebook', {
              accessToken,
            });

            if (backendResponse.data.user) {
              navigate(redirect);
            }
          } else {
            setError('Facebook login was cancelled');
          }
          setLoading(false);
        },
        { scope: 'public_profile,email' }
      );
    } catch (err) {
      console.error('Facebook sign-in error:', err);
      setError(err.message || 'Facebook sign-in failed. Please check your credentials.');
      setLoading(false);
    }
  };

  if (!facebookAppId || facebookAppId === 'NOT_CONFIGURED') {
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
        onClick={handleFacebookSignIn}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg font-medium transition-all ${loading
            ? 'bg-gray-100 cursor-not-allowed text-gray-600'
            : 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-md'
          }`}
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            fill="#1877F2"
          />
        </svg>
        {loading ? 'Signing in...' : text}
      </motion.button>
    </div>
  );
};

export default FacebookAuthButton;
