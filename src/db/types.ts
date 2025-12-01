/**
 * Database Types for Sensor Data
 */

export interface SensorReading {
  id: string;
  co2: number;
  humidity: number;
  light: number;
  pressure: number;
  temperature: number;
  device: 'indoor' | 'outdoor';
  time: string;
  createdAt: Date;
}

export interface DailyAggregate {
  date: string;
  avgCo2: number;
  avgTemperature: number;
  avgHumidity: number;
  avgPressure: number;
  avgLight: number;
  readings: number;
}

export type SensorType = 'indoor' | 'outdoor';

export interface SensorDataState {
  data: SensorReading[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
