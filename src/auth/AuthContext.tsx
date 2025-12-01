/**
 * Authentication Context
 * Provides global auth state management
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthUser,
  onAuthChange,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  resetPassword,
} from './authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const authUser = await signInWithEmail(email, password);
      setUser(authUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      setLoading(true);
      const authUser = await signUpWithEmail(email, password, displayName);
      setUser(authUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      const authUser = await signInWithGoogle();
      setUser(authUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    googleSignIn,
    logout,
    forgotPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
