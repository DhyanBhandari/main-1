/**
 * Admin API Service - Frontend API calls to backend
 *
 * Replaces direct Firestore calls with backend API calls.
 */

import type {
  AccessRequest,
  AccessRequestFormData,
  GeneratedCredentials,
  PolygonPoint,
  ManagedAdmin,
  AdminTabPermission,
} from '@/types/admin';

// Backend API URL - adjust based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Submit access request (organization signup)
 */
export async function submitAccessRequest(formData: AccessRequestFormData): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/admin/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      organization_name: formData.organizationName,
      organization_type: formData.organizationType,
      email: formData.email,
      country_code: formData.countryCode,
      phone_number: formData.phoneNumber,
      message: formData.message,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to submit request');
  }

  const result = await response.json();
  return result.request_id;
}

/**
 * Get pending access requests
 */
export async function getPendingRequests(): Promise<AccessRequest[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/requests/pending`);

  if (!response.ok) {
    throw new Error('Failed to fetch pending requests');
  }

  const data = await response.json();
  return data.map(mapBackendRequestToFrontend);
}

/**
 * Get all access requests
 */
export async function getAllRequests(): Promise<AccessRequest[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/requests/all`);

  if (!response.ok) {
    throw new Error('Failed to fetch requests');
  }

  const data = await response.json();
  return data.map(mapBackendRequestToFrontend);
}

/**
 * Approve access request
 */
export async function approveRequest(
  requestId: number,
  polygonPoints: PolygonPoint[],
  adminEmail: string,
  password?: string // Optional: if not provided, auto-generates
): Promise<GeneratedCredentials> {
  const response = await fetch(`${API_BASE_URL}/api/admin/requests/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_id: requestId,
      polygon_points: polygonPoints,
      admin_email: adminEmail,
      password: password || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to approve request');
  }

  const result = await response.json();
  return {
    instituteId: result.institute_id,
    password: result.password,
  };
}

/**
 * Reject access request
 */
export async function rejectRequest(
  requestId: number,
  reason: string,
  adminEmail: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/requests/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_id: requestId,
      reason,
      admin_email: adminEmail,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to reject request');
  }
}

/**
 * Create institute directly (without access request)
 */
export async function createInstituteDirect(
  data: {
    organizationName: string;
    organizationType: string;
    email: string;
    countryCode: string;
    phoneNumber: string;
    polygonPoints: PolygonPoint[];
    password?: string; // Optional: if not provided, auto-generates
  },
  adminEmail: string
): Promise<GeneratedCredentials> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/institutes/create?admin_email=${encodeURIComponent(adminEmail)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organization_name: data.organizationName,
        organization_type: data.organizationType,
        email: data.email,
        country_code: data.countryCode,
        phone_number: data.phoneNumber,
        polygon_points: data.polygonPoints,
        password: data.password || null,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create institute');
  }

  const result = await response.json();
  return {
    instituteId: result.institute_id,
    password: result.password,
  };
}

/**
 * Get all institutes
 */
export async function getInstitutes(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/institutes`);

  if (!response.ok) {
    throw new Error('Failed to fetch institutes');
  }

  return response.json();
}

/**
 * Institute login
 */
export async function instituteLogin(
  instituteId: string,
  password: string
): Promise<{
  instituteId: string;
  name: string;
  email: string;
  requiresPasswordChange: boolean;
  polygonCoordinates: [number, number][];
}> {
  const response = await fetch(`${API_BASE_URL}/api/admin/institutes/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      institute_id: instituteId,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Invalid credentials');
  }

  const result = await response.json();
  return {
    instituteId: result.institute_id,
    name: result.name,
    email: result.email,
    requiresPasswordChange: result.requires_password_change,
    polygonCoordinates: result.polygon_coordinates,
  };
}

/**
 * Change institute password
 */
export async function changeInstitutePassword(
  instituteId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
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
}

/**
 * Send credentials email
 */
export async function sendCredentialsEmail(
  toEmail: string,
  organizationName: string,
  instituteId: string,
  password: string,
  loginUrl: string
): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/admin/email/send-credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to_email: toEmail,
      organization_name: organizationName,
      institute_id: instituteId,
      password,
      login_url: loginUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to send email');
  }

  const result = await response.json();
  return result.success;
}

/**
 * Get admin statistics
 */
export async function getAdminStats(): Promise<{
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalInstitutes: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/admin/stats`);

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  const result = await response.json();
  return {
    pendingRequests: result.pending_requests,
    approvedRequests: result.approved_requests,
    rejectedRequests: result.rejected_requests,
    totalInstitutes: result.total_institutes,
  };
}

/**
 * Delete institute
 */
export async function deleteInstitute(instituteId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/institutes/${encodeURIComponent(instituteId)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete institute');
  }
}

/**
 * Update institute details
 */
export async function updateInstitute(
  instituteId: string,
  updates: {
    organizationName?: string;
    organizationType?: string;
    email?: string;
    countryCode?: string;
    phoneNumber?: string;
    polygonPoints?: PolygonPoint[];
    newPassword?: string; // "auto" for auto-generate, or custom password
  }
): Promise<GeneratedCredentials | null> {
  const body: any = {};

  if (updates.organizationName) body.organization_name = updates.organizationName;
  if (updates.organizationType) body.organization_type = updates.organizationType;
  if (updates.email) body.email = updates.email;
  if (updates.countryCode) body.country_code = updates.countryCode;
  if (updates.phoneNumber) body.phone_number = updates.phoneNumber;
  if (updates.polygonPoints) body.polygon_points = updates.polygonPoints;
  if (updates.newPassword) body.new_password = updates.newPassword;

  const response = await fetch(`${API_BASE_URL}/api/admin/institutes/${encodeURIComponent(instituteId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update institute');
  }

  const result = await response.json();

  // If password was changed, return new credentials
  if (result.credentials) {
    return {
      instituteId: result.credentials.institute_id,
      password: result.credentials.password,
    };
  }

  return null;
}

/**
 * Reset institute password
 */
export async function resetInstitutePassword(
  instituteId: string,
  password?: string // "auto" for auto-generate, or custom password, undefined for auto
): Promise<GeneratedCredentials> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/institutes/${encodeURIComponent(instituteId)}/reset-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: password || null,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to reset password');
  }

  const result = await response.json();
  return {
    instituteId: result.institute_id,
    password: result.password,
  };
}

/**
 * Get dashboard preview data for admin
 */
export async function getDashboardPreview(instituteId: string): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/institutes/${encodeURIComponent(instituteId)}/dashboard-data`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch dashboard data');
  }

  return response.json();
}

// ==================== Baseline Assessment ====================

export interface BaselineAssessmentData {
  admin_email: string;
  label?: string;
  organization_name?: string;
  organization_type?: string;
  email?: string;
  phone?: string;
  polygon_points: { lat: number; lng: number; label?: string }[];
  phi_response: any;
  overall_score?: number;
  pillar_scores?: Record<string, number>;
  location_name?: string;
}

export interface BaselineAssessmentRecord {
  id: string;
  admin_email: string;
  label?: string;
  organization_name?: string;
  organization_type?: string;
  contact_email?: string;
  contact_phone?: string;
  polygon_points: { lat: number; lng: number; label?: string }[];
  phi_response?: any;
  overall_score?: number;
  pillar_scores?: Record<string, number>;
  location_name?: string;
  created_at: string;
}

/**
 * Save a baseline assessment
 */
export async function saveBaselineAssessment(data: BaselineAssessmentData): Promise<string | null> {
  const response = await fetch(`${API_BASE_URL}/api/admin/baseline/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to save baseline assessment');
  }

  const result = await response.json();
  return result.id;
}

/**
 * Get baseline assessment history
 */
export async function getBaselineHistory(adminEmail?: string): Promise<BaselineAssessmentRecord[]> {
  const params = adminEmail ? `?admin_email=${encodeURIComponent(adminEmail)}` : '';
  const response = await fetch(`${API_BASE_URL}/api/admin/baseline/history${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch baseline history');
  }

  return response.json();
}

// ==================== Admin User Management ====================

/**
 * Get all managed admin users
 */
export async function getAdminUsers(): Promise<ManagedAdmin[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/admins`);
  if (!response.ok) {
    throw new Error('Failed to fetch admin users');
  }
  return response.json();
}

/**
 * Create a new admin user
 */
export async function createAdminUser(data: {
  email: string;
  password: string;
  permissions: AdminTabPermission[];
  created_by: string;
}): Promise<ManagedAdmin> {
  const response = await fetch(`${API_BASE_URL}/api/admin/admins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create admin user');
  }
  return response.json();
}

/**
 * Update an admin user's permissions or password
 */
export async function updateAdminUser(
  adminId: number,
  updates: { permissions?: AdminTabPermission[]; password?: string }
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/admins/${adminId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update admin user');
  }
}

/**
 * Delete an admin user
 */
export async function deleteAdminUser(adminId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/admins/${adminId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete admin user');
  }
}

// ==================== Helper Functions ====================

/**
 * Map backend request format to frontend format
 */
function mapBackendRequestToFrontend(backendRequest: any): AccessRequest {
  return {
    id: String(backendRequest.id),
    organizationName: backendRequest.organization_name,
    organizationType: backendRequest.organization_type,
    email: backendRequest.email,
    countryCode: backendRequest.country_code,
    phoneNumber: backendRequest.phone_number,
    fullPhone: backendRequest.full_phone,
    message: backendRequest.message,
    status: backendRequest.status,
    createdAt: new Date(backendRequest.created_at),
    updatedAt: new Date(backendRequest.updated_at),
    approvedBy: backendRequest.approved_by,
    approvedAt: backendRequest.approved_at ? new Date(backendRequest.approved_at) : undefined,
    instituteId: backendRequest.institute_id,
    rejectionReason: backendRequest.rejection_reason,
  };
}
