/**
 * Admin Types for Organization Access Management
 */

// Access Request Status
export type AccessRequestStatus = 'pending' | 'approved' | 'rejected';

// Notification Types
export type NotificationType = 'new_request' | 'approval' | 'rejection' | 'login';

// Access Request from organizations
export interface AccessRequest {
  id: string;
  organizationName: string;
  organizationType: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  fullPhone: string;
  message: string;
  status: AccessRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  // Populated on approval/rejection
  approvedBy?: string;
  approvedAt?: Date;
  instituteId?: string;
  rejectionReason?: string;
}

// Form data for creating access request
export interface AccessRequestFormData {
  organizationName: string;
  organizationType: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  message: string;
}

// Admin Notification
export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  metadata: {
    requestId?: string;
    instituteId?: string;
    email?: string;
  };
}

// Generated Credentials (shown only once)
export interface GeneratedCredentials {
  instituteId: string;
  password: string; // Plain text - only shown once, then hashed
}

// Polygon Point for admin approval
export interface PolygonPoint {
  lat: number;
  lng: number;
  label?: string;
}

// Admin auth method
export type AdminAuthMethod = 'google' | 'email';

// Admin user info
export interface AdminUser {
  email: string;
  displayName: string | null;
  photoURL?: string | null;
  authMethod?: AdminAuthMethod;
}
