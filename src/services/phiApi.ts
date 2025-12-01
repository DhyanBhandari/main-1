/**
 * PHI API Service
 * Handles communication with the FastAPI backend for Planetary Health Index queries
 */

import { PHIQueryRequest, PHIResponse } from '@/types/phi';
import { transformPHIResponse } from './apiMiddleware';

// API Base URL - update this when deployed
const API_BASE_URL = import.meta.env.VITE_PHI_API_URL || 'http://localhost:8000';

/**
 * Fetch PHI report for a given location
 * @param request - Query parameters (latitude, longitude, mode, etc.)
 * @returns PHI response with pillars, metrics, and summary
 */
export const fetchPHIReport = async (request: PHIQueryRequest): Promise<PHIResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lat: request.latitude,
      lon: request.longitude,
      mode: request.mode || 'comprehensive',
      include_scores: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Handle Pydantic validation errors (array of objects)
    let errorMessage = `API error: ${response.status}`;
    if (errorData.detail) {
      if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail
          .map((err: { msg?: string; loc?: string[] }) => err.msg || JSON.stringify(err))
          .join(', ');
      } else if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      }
    }
    throw new Error(errorMessage);
  }

  // Get raw response and transform through middleware
  const rawData = await response.json();

  // Use middleware to unwrap and validate response
  return transformPHIResponse(rawData);
};

/**
 * Check API health status
 * @returns Health check response
 */
export const checkAPIHealth = async (): Promise<{
  status: string;
  message: string;
  timestamp: string;
  gee_initialized: boolean;
}> => {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
};

/**
 * Get available metrics for a given mode
 * @param mode - 'simple' or 'comprehensive'
 * @returns Metrics available for each pillar
 */
export const getAvailableMetrics = async (
  mode: 'simple' | 'comprehensive' = 'comprehensive'
): Promise<Record<string, string[]>> => {
  const response = await fetch(`${API_BASE_URL}/api/datasets?mode=${mode}`);

  if (!response.ok) {
    throw new Error(`Failed to get metrics: ${response.status}`);
  }

  return response.json();
};

/**
 * Custom hook helper - formats error messages for user display
 */
export const formatAPIError = (error: unknown): string => {
  if (error instanceof Error) {
    // Parse common error messages
    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please ensure the backend is running.';
    }
    if (error.message.includes('Latitude must be')) {
      return 'Invalid latitude. Please enter a value between -90 and 90.';
    }
    if (error.message.includes('Longitude must be')) {
      return 'Invalid longitude. Please enter a value between -180 and 180.';
    }
    if (error.message.includes('Earth Engine')) {
      return 'Satellite data service unavailable. Please try again later.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Estimate query time based on mode
 */
export const estimateQueryTime = (mode: 'simple' | 'comprehensive'): string => {
  return mode === 'simple' ? '15-20 seconds' : '25-35 seconds';
};
