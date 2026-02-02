/**
 * Institute Authentication Service
 *
 * Handles institute login/logout using backend API
 */

import type { InstituteSession, InstituteLoginCredentials } from '@/types/institute';

const SESSION_KEY = 'institute_session';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Authenticate institute with ID and password
 */
export async function loginInstitute(credentials: InstituteLoginCredentials): Promise<InstituteSession> {
  const { id, password } = credentials;

  const response = await fetch(`${API_BASE_URL}/api/admin/institutes/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      institute_id: id,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Invalid institute ID or password');
  }

  const result = await response.json();

  // Create session
  const session: InstituteSession = {
    instituteId: result.institute_id,
    instituteName: result.name,
    polygon: {
      type: 'Polygon',
      coordinates: result.polygon_coordinates,
    },
    loginTime: Date.now(),
    requiresPasswordChange: result.requires_password_change || false,
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
 * Change institute password
 */
export async function changeInstitutePassword(
  instituteId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  // Validate new password
  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/admin/institutes/change-password?institute_id=${encodeURIComponent(instituteId)}&current_password=${encodeURIComponent(currentPassword)}&new_password=${encodeURIComponent(newPassword)}`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to change password');
  }

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
