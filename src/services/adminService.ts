/**
 * Admin Service - CRUD operations for access requests, notifications, and approvals
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/auth/firebase';
import { hashPassword } from '@/services/instituteAuth';
import type {
  AccessRequest,
  AccessRequestFormData,
  AdminNotification,
  GeneratedCredentials,
  PolygonPoint,
} from '@/types/admin';
import type { Institute } from '@/types/institute';

// Collection references
const ACCESS_REQUESTS_COLLECTION = 'access_requests';
const INSTITUTES_COLLECTION = 'institutes';
const NOTIFICATIONS_COLLECTION = 'admin_notifications';
const CONFIG_COLLECTION = 'config';

/**
 * Hardcoded admin accounts (no Firestore dependency)
 * These are the authorized admin emails and their passwords
 */
const ADMIN_ACCOUNTS = [
  { email: 'dhyanbhandari200@gmail.com', password: 'Dhyan3016#' },
  { email: 'erthaloka@gmail.com', password: 'Freshstart4ever' },
];

/**
 * List of admin emails for Google sign-in verification
 */
const ADMIN_EMAILS = ADMIN_ACCOUNTS.map((a) => a.email.toLowerCase());

/**
 * Check if an email is an admin (uses hardcoded list, no Firestore)
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Initialize admin accounts - no-op since we use hardcoded credentials
 */
export async function initializeAdminAccounts(): Promise<void> {
  // No-op - credentials are hardcoded
  console.log('Admin accounts configured (hardcoded)');
}

/**
 * Verify admin email/password login (uses hardcoded credentials)
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; email: string }> {
  // Find matching admin account
  const adminAccount = ADMIN_ACCOUNTS.find(
    (account) => account.email.toLowerCase() === email.toLowerCase()
  );

  if (!adminAccount) {
    throw new Error('Invalid email or password');
  }

  // Direct password comparison (credentials are hardcoded)
  if (password !== adminAccount.password) {
    throw new Error('Invalid email or password');
  }

  return { success: true, email: adminAccount.email };
}

/**
 * Generate unique institute ID (ORG-XXXXXX)
 */
export function generateInstituteId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ORG-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate secure password (12 characters)
 */
export function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Submit new access request (public)
 */
export async function submitAccessRequest(formData: AccessRequestFormData): Promise<string> {
  const docRef = await addDoc(collection(db, ACCESS_REQUESTS_COLLECTION), {
    ...formData,
    fullPhone: `${formData.countryCode}${formData.phoneNumber}`,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Create notification for admin
  await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    type: 'new_request',
    title: 'New Access Request',
    message: `${formData.organizationName} has requested dashboard access`,
    read: false,
    createdAt: serverTimestamp(),
    metadata: {
      requestId: docRef.id,
      email: formData.email,
    },
  });

  return docRef.id;
}

/**
 * Get all pending access requests
 */
export async function getPendingRequests(): Promise<AccessRequest[]> {
  const q = query(
    collection(db, ACCESS_REQUESTS_COLLECTION),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
  })) as AccessRequest[];
}

/**
 * Get all access requests (for history)
 */
export async function getAllRequests(): Promise<AccessRequest[]> {
  const q = query(
    collection(db, ACCESS_REQUESTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date(),
    approvedAt: doc.data().approvedAt ? (doc.data().approvedAt as Timestamp).toDate() : undefined,
  })) as AccessRequest[];
}

/**
 * Get all approved organizations (institutes)
 */
export async function getApprovedOrganizations(): Promise<Institute[]> {
  const q = query(
    collection(db, INSTITUTES_COLLECTION),
    orderBy('created_at', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    created_at: (doc.data().created_at as Timestamp)?.toDate() || new Date(),
    updated_at: (doc.data().updated_at as Timestamp)?.toDate() || new Date(),
  })) as Institute[];
}

/**
 * Approve access request and create institute
 */
export async function approveRequest(
  requestId: string,
  polygonPoints: PolygonPoint[],
  adminEmail: string
): Promise<GeneratedCredentials> {
  // Get the request
  const requestRef = doc(db, ACCESS_REQUESTS_COLLECTION, requestId);
  const requestSnap = await getDoc(requestRef);

  if (!requestSnap.exists()) {
    throw new Error('Access request not found');
  }

  const requestData = requestSnap.data();

  // Generate credentials
  const instituteId = generateInstituteId();
  const plainPassword = generateSecurePassword();
  const hashedPassword = await hashPassword(plainPassword);

  // Convert polygon points to coordinates array
  const coordinates: [number, number][] = polygonPoints.map((p) => [p.lat, p.lng]);

  // Create institute document
  await addDoc(collection(db, INSTITUTES_COLLECTION), {
    id: instituteId,
    name: requestData.organizationName,
    organizationType: requestData.organizationType,
    email: requestData.email,
    phone: requestData.fullPhone,
    password_hash: hashedPassword,
    polygon: { coordinates },
    requiresPasswordChange: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    createdBy: adminEmail,
    accessRequestId: requestId,
  });

  // Update request status
  await updateDoc(requestRef, {
    status: 'approved',
    approvedBy: adminEmail,
    approvedAt: serverTimestamp(),
    instituteId: instituteId,
    updatedAt: serverTimestamp(),
  });

  // Create notification
  await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    type: 'approval',
    title: 'Request Approved',
    message: `${requestData.organizationName} has been approved`,
    read: false,
    createdAt: serverTimestamp(),
    metadata: {
      requestId,
      instituteId,
      email: requestData.email,
    },
  });

  return {
    instituteId,
    password: plainPassword,
  };
}

/**
 * Reject access request
 */
export async function rejectRequest(
  requestId: string,
  reason: string,
  adminEmail: string
): Promise<void> {
  const requestRef = doc(db, ACCESS_REQUESTS_COLLECTION, requestId);
  const requestSnap = await getDoc(requestRef);

  if (!requestSnap.exists()) {
    throw new Error('Access request not found');
  }

  const requestData = requestSnap.data();

  await updateDoc(requestRef, {
    status: 'rejected',
    rejectionReason: reason,
    approvedBy: adminEmail,
    updatedAt: serverTimestamp(),
  });

  // Create notification
  await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    type: 'rejection',
    title: 'Request Rejected',
    message: `${requestData.organizationName} request was rejected`,
    read: false,
    createdAt: serverTimestamp(),
    metadata: {
      requestId,
      email: requestData.email,
    },
  });
}

/**
 * Get admin notifications
 */
export async function getNotifications(limit = 20): Promise<AdminNotification[]> {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, limit).map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
  })) as AdminNotification[];
}

/**
 * Subscribe to notifications (real-time)
 */
export function subscribeToNotifications(
  callback: (notifications: AdminNotification[]) => void
): () => void {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.slice(0, 20).map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
    })) as AdminNotification[];
    callback(notifications);
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(notifRef, { read: true });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<void> {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);

  const updates = snapshot.docs.map((doc) =>
    updateDoc(doc.ref, { read: true })
  );

  await Promise.all(updates);
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Subscribe to pending requests count (real-time)
 */
export function subscribeToPendingCount(callback: (count: number) => void): () => void {
  const q = query(
    collection(db, ACCESS_REQUESTS_COLLECTION),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}
