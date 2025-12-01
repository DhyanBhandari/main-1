/**
 * Firebase Authentication Service
 * Handles user authentication for PHI reports
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

// Types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

// Convert Firebase User to AuthUser
const formatUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
});

// Format Firebase error messages
const formatAuthError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
  return 'An unexpected error occurred.';
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  try {
    const result: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return formatUser(result.user);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};

/**
 * Create new account with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<AuthUser> => {
  try {
    const result: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update display name if provided
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }

    return formatUser(result.user);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    return formatUser(result.user);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): AuthUser | null => {
  const user = auth.currentUser;
  return user ? formatUser(user) : null;
};

/**
 * Subscribe to auth state changes
 */
export const onAuthChange = (
  callback: (user: AuthUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? formatUser(user) : null);
  });
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};
