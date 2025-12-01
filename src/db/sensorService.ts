/**
 * Sensor Data Service - Firestore CRUD Operations
 */

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firestore';
import { SensorReading, SensorType, DailyAggregate } from './types';

/**
 * Get the collection name based on sensor type
 */
const getCollectionName = (type: SensorType): string => {
  return type === 'indoor' ? COLLECTIONS.INDOOR_SENSORS : COLLECTIONS.OUTDOOR_SENSORS;
};

/**
 * Parse Firestore document to SensorReading
 */
const parseDocument = (doc: any): SensorReading => {
  const data = doc.data();
  return {
    id: doc.id,
    co2: data.co2 || 0,
    humidity: data.humidity || 0,
    light: data.light || 0,
    pressure: data.pressure || 0,
    temperature: data.temperature || 0,
    device: data.device || 'outdoor',
    time: data.time || '',
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

/**
 * Get latest sensor readings
 */
export const getLatestReadings = async (
  type: SensorType,
  limitCount: number = 50
): Promise<SensorReading[]> => {
  try {
    const collectionName = getCollectionName(type);
    const q = query(
      collection(db, collectionName),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(parseDocument);
  } catch (error) {
    console.error('Error fetching latest readings:', error);
    return [];
  }
};

/**
 * Get readings by date range
 */
export const getReadingsByDateRange = async (
  type: SensorType,
  startDate: Date,
  endDate: Date
): Promise<SensorReading[]> => {
  try {
    const collectionName = getCollectionName(type);
    const q = query(
      collection(db, collectionName),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(parseDocument);
  } catch (error) {
    console.error('Error fetching readings by date range:', error);
    return [];
  }
};

/**
 * Get daily aggregates for charts
 */
export const getDailyAggregates = async (
  type: SensorType,
  days: number = 7
): Promise<DailyAggregate[]> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const readings = await getReadingsByDateRange(type, startDate, endDate);

    // Group by date
    const grouped = readings.reduce((acc, reading) => {
      const date = new Date(reading.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(reading);
      return acc;
    }, {} as Record<string, SensorReading[]>);

    // Calculate aggregates
    return Object.entries(grouped)
      .map(([date, dayReadings]) => ({
        date,
        avgCo2: dayReadings.reduce((sum, r) => sum + r.co2, 0) / dayReadings.length,
        avgTemperature: dayReadings.reduce((sum, r) => sum + r.temperature, 0) / dayReadings.length,
        avgHumidity: dayReadings.reduce((sum, r) => sum + r.humidity, 0) / dayReadings.length,
        avgPressure: dayReadings.reduce((sum, r) => sum + r.pressure, 0) / dayReadings.length,
        avgLight: dayReadings.reduce((sum, r) => sum + r.light, 0) / dayReadings.length,
        readings: dayReadings.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error calculating daily aggregates:', error);
    return [];
  }
};

/**
 * Subscribe to real-time updates (for live data)
 */
export const subscribeToLatest = (
  type: SensorType,
  callback: (readings: SensorReading[]) => void,
  limitCount: number = 10
): Unsubscribe => {
  const collectionName = getCollectionName(type);
  const q = query(
    collection(db, collectionName),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const readings = snapshot.docs.map(parseDocument);
    callback(readings);
  });
};

/**
 * Get the most recent reading
 */
export const getLatestReading = async (type: SensorType): Promise<SensorReading | null> => {
  const readings = await getLatestReadings(type, 1);
  return readings.length > 0 ? readings[0] : null;
};
