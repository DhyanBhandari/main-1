/**
 * Institute Authentication Service
 *
 * Handles institute login/logout using Firestore for data storage
 * and bcryptjs for password verification.
 */

import { doc, getDoc, getDocs, updateDoc, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/auth/firebase';
import bcrypt from 'bcryptjs';
import type { Institute, InstituteSession, InstituteLoginCredentials } from '@/types/institute';

const SESSION_KEY = 'institute_session';
const INSTITUTES_COLLECTION = 'institutes';

/**
 * Find institute document by ID field
 */
async function findInstituteByIdField(instituteId: string): Promise<{ docId: string; data: Institute } | null> {
  // First try direct document lookup (for backwards compatibility)
  const directRef = doc(db, INSTITUTES_COLLECTION, instituteId);
  const directSnap = await getDoc(directRef);
  if (directSnap.exists()) {
    return { docId: directSnap.id, data: directSnap.data() as Institute };
  }

  // Query by 'id' field (for admin-created institutes)
  const q = query(collection(db, INSTITUTES_COLLECTION), where('id', '==', instituteId));
  const querySnap = await getDocs(q);
  if (!querySnap.empty) {
    const doc = querySnap.docs[0];
    return { docId: doc.id, data: doc.data() as Institute };
  }

  return null;
}

/**
 * Authenticate institute with ID and password
 */
export async function loginInstitute(credentials: InstituteLoginCredentials): Promise<InstituteSession> {
  const { id, password } = credentials;

  // Find institute by ID
  const result = await findInstituteByIdField(id);

  if (!result) {
    throw new Error('Invalid institute ID or password');
  }

  const { data: instituteData } = result;

  // Verify password
  const isValid = await bcrypt.compare(password, instituteData.password_hash);
  if (!isValid) {
    throw new Error('Invalid institute ID or password');
  }

  // Create session
  const session: InstituteSession = {
    instituteId: id,
    instituteName: instituteData.name,
    polygon: instituteData.polygon,
    loginTime: Date.now(),
    requiresPasswordChange: instituteData.requiresPasswordChange || false,
  };

  // Store session in sessionStorage
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
}

/**
 * Get current institute session
 */
export function getInstituteSession(): InstituteSession | null {
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;

  try {
    return JSON.parse(sessionData) as InstituteSession;
  } catch {
    return null;
  }
}

/**
 * Check if institute is logged in
 */
export function isInstituteLoggedIn(): boolean {
  return getInstituteSession() !== null;
}

/**
 * Logout institute
 */
export function logoutInstitute(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Utility: Hash a password (for admin use when creating institutes)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Change institute password
 */
export async function changeInstitutePassword(
  instituteId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  // Find institute
  const result = await findInstituteByIdField(instituteId);
  if (!result) {
    throw new Error('Institute not found');
  }

  const { docId, data: instituteData } = result;

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, instituteData.password_hash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Validate new password
  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters');
  }

  // Hash new password
  const newHash = await hashPassword(newPassword);

  // Update password and clear requiresPasswordChange flag
  const instituteRef = doc(db, INSTITUTES_COLLECTION, docId);
  await updateDoc(instituteRef, {
    password_hash: newHash,
    requiresPasswordChange: false,
    updated_at: serverTimestamp(),
  });

  // Update session to clear password change requirement
  const session = getInstituteSession();
  if (session && session.instituteId === instituteId) {
    session.requiresPasswordChange = false;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Clear password change requirement (after successful change)
 */
export async function clearPasswordChangeRequired(instituteId: string): Promise<void> {
  const result = await findInstituteByIdField(instituteId);
  if (!result) return;

  const { docId } = result;
  const instituteRef = doc(db, INSTITUTES_COLLECTION, docId);
  await updateDoc(instituteRef, {
    requiresPasswordChange: false,
    updated_at: serverTimestamp(),
  });

  // Update session
  const session = getInstituteSession();
  if (session && session.instituteId === instituteId) {
    session.requiresPasswordChange = false;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Update session in storage
 */
export function updateInstituteSession(updates: Partial<InstituteSession>): void {
  const session = getInstituteSession();
  if (session) {
    const updatedSession = { ...session, ...updates };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
  }
}
