/**
 * Firebase Configuration
 * Project: erthaloka
 * Project ID: erthaloka-5853f
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0r6VWjAfXXjFbddClJ12MsisVzyJsonI",
  authDomain: "erthaloka-5853f.firebaseapp.com",
  projectId: "erthaloka-5853f",
  storageBucket: "erthaloka-5853f.firebasestorage.app",
  messagingSenderId: "433955500624",
  appId: "1:433955500624:web:27f7b3529fb3e809129755",
  measurementId: "G-83LDHV28SK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only when supported (avoids deprecation warnings)
let analytics: Analytics | null = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics };

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
