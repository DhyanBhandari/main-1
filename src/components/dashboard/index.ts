/**
 * Dashboard Components - Reusable Dashboard Template System
 *
 * Export all dashboard components for easy importing
 */

export { default as DashboardTemplate } from './DashboardTemplate';
export { default as DashboardOverview } from './DashboardOverview';
export { default as DashboardPillarSection } from './DashboardPillarSection';
export { default as DashboardLiveMonitoring } from './DashboardLiveMonitoring';
export { default as DashboardSidebar } from './DashboardSidebar';

// Re-export types
export type {
  DashboardTemplateProps,
  DashboardData,
  DashboardLocation,
  DashboardUser,
  DashboardOptions,
  PillarData,
  MetricData,
  WeatherData,
  AQIData,
  ImageryData,
} from '@/types/dashboard';
