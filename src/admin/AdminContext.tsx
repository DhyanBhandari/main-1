/**
 * Admin Context - Provides admin authentication state
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthChange, getCurrentUser } from '@/auth/authService';
import { isAdminEmail, initializeAdminAccounts } from '@/services/adminService';
import { adminSignIn, adminSignInWithEmail, adminSignOut, checkAdminAccess } from './adminAuth';
import type { AdminUser } from '@/types/admin';

interface AdminContextType {
  admin: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize admin accounts and check auth status on mount
  useEffect(() => {
    // Initialize admin accounts in Firestore (runs once)
    initializeAdminAccounts().catch(console.error);

    // Check for existing admin session (email/password or Google)
    const checkExistingSession = async () => {
      const existingAdmin = await checkAdminAccess();
      if (existingAdmin) {
        setAdmin(existingAdmin);
        setIsAdmin(true);
      }
      setLoading(false);
    };

    checkExistingSession();

    // Subscribe to Google auth changes
    const unsubscribe = onAuthChange(async (user) => {
      if (user?.email) {
        const adminStatus = await isAdminEmail(user.email);
        if (adminStatus) {
          setAdmin({
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            authMethod: 'google',
          });
          setIsAdmin(true);
        }
      }
      // Note: Don't clear admin state here as it might be email/password session
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminUser = await adminSignIn();
      setAdmin(adminUser);
      setIsAdmin(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      setAdmin(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const adminUser = await adminSignInWithEmail(email, password);
      setAdmin(adminUser);
      setIsAdmin(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      setAdmin(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await adminSignOut();
      setAdmin(null);
      setIsAdmin(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAdmin,
        loading,
        error,
        signIn,
        signInWithEmail,
        signOut,
        clearError,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export default AdminContext;
