/**
 * Institute Types for Multi-Tenant Dashboard System
 */

export interface InstitutePolygon {
  coordinates: [number, number][]; // Array of [lat, lng] pairs (4 points)
}

export interface Institute {
  id: string;
  name: string;
  password_hash: string;
  polygon: InstitutePolygon;
  created_at: Date;
  updated_at: Date;
  // Extended fields for admin-created institutes
  organizationType?: string;
  email?: string;
  phone?: string;
  requiresPasswordChange?: boolean;
  createdBy?: string;
  accessRequestId?: string;
}

export interface InstituteSession {
  instituteId: string;
  instituteName: string;
  polygon: InstitutePolygon;
  loginTime: number;
  requiresPasswordChange?: boolean;
}

export interface InstituteLoginCredentials {
  id: string;
  password: string;
}
