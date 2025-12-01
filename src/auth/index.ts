/**
 * Authentication Module
 * Export all auth-related functions and components
 */

// Firebase instance
export { auth, googleProvider } from './firebase';

// Auth service functions
export {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  resetPassword,
  getCurrentUser,
  onAuthChange,
  isAuthenticated,
} from './authService';

// Auth types
export type { AuthUser, AuthError } from './authService';

// Auth context and hook
export { AuthProvider, useAuth } from './AuthContext';
