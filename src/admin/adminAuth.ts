/**
 * Admin Authentication Utilities
 */

import { isAdminEmail, verifyAdminCredentials } from '@/services/adminService';
import { signInWithGoogle, getCurrentUser, signOut as firebaseSignOut } from '@/auth/authService';
import type { AdminUser } from '@/types/admin';

// Session storage key for email/password admin login
const ADMIN_SESSION_KEY = 'admin_session';

/**
 * Sign in with Google and verify admin status
 */
export async function adminSignIn(): Promise<AdminUser> {
  const user = await signInWithGoogle();

  if (!user.email) {
    await firebaseSignOut();
    throw new Error('Email is required for admin access');
  }

  const isAdmin = await isAdminEmail(user.email);
  if (!isAdmin) {
    await firebaseSignOut();
    throw new Error('You do not have admin access');
  }

  return {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    authMethod: 'google',
  };
}

/**
 * Sign in with email and password
 */
export async function adminSignInWithEmail(email: string, password: string): Promise<AdminUser> {
  const result = await verifyAdminCredentials(email, password);

  const adminUser: AdminUser = {
    email: result.email,
    displayName: result.email.split('@')[0],
    authMethod: 'email',
  };

  // Store session in sessionStorage
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));

  return adminUser;
}

/**
 * Get admin session from sessionStorage (for email/password login)
 */
export function getAdminSession(): AdminUser | null {
  const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session) as AdminUser;
  } catch {
    return null;
  }
}

/**
 * Clear admin session
 */
export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

/**
 * Check if current user is admin (supports both auth methods)
 */
export async function checkAdminAccess(): Promise<AdminUser | null> {
  // First check session storage (email/password login)
  const sessionAdmin = getAdminSession();
  if (sessionAdmin) {
    return sessionAdmin;
  }

  // Then check Firebase Google auth
  const user = getCurrentUser();
  if (!user?.email) return null;

  const isAdmin = await isAdminEmail(user.email);
  if (!isAdmin) return null;

  return {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    authMethod: 'google',
  };
}

/**
 * Sign out admin (handles both auth methods)
 */
export async function adminSignOut(): Promise<void> {
  // Clear session storage
  clearAdminSession();
  // Sign out from Firebase
  await firebaseSignOut();
}
