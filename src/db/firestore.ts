/**
 * Firestore Database Initialization
 */

import { getFirestore } from 'firebase/firestore';
import app from '@/auth/firebase';

// Initialize Firestore
export const db = getFirestore(app);

// Collection names
export const COLLECTIONS = {
  INDOOR_SENSORS: 'indoor_sensors',
  OUTDOOR_SENSORS: 'outdoor_sensors',
} as const;
