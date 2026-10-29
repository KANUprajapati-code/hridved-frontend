import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAGfXVjslueB7dSLqcwNGNDksMjxsKvCA4",
  authDomain: "video-clinre.firebaseapp.com",
  projectId: "video-clinre",
  storageBucket: "video-clinre.firebasestorage.app",
  messagingSenderId: "1062309898162",
  appId: "1:1062309898162:web:3133afea0459a349d026ab",
  measurementId: "G-ND56P7YT07"
};

// Initialize Firebase App as Singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

/**
 * Configure invisible reCAPTCHA for phone authentication
 * @param {string} containerId - DOM ID of the element to mount reCAPTCHA
 */
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  if (typeof window === 'undefined') return null;

  // Clear existing verifier if any
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn('Could not clear recaptchaVerifier:', e);
    }
    window.recaptchaVerifier = null;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`reCAPTCHA container #${containerId} not found in DOM. Ensure an element with id="${containerId}" exists.`);
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired, user must retry');
    }
  });

  return window.recaptchaVerifier;
};

export { app, auth, RecaptchaVerifier, signInWithPhoneNumber };
export default app;
