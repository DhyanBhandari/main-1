/**
 * API Response Middleware
 * Normalizes backend responses to match frontend interfaces
 *
 * This middleware handles the transformation between different backend
 * response formats and the expected frontend TypeScript interfaces.
 */

import { PHIResponse, PillarData, PHISummary } from '@/types/phi';

/**
 * Wrapped API Response (from Hello-/backend/app/api/routes.py)
 */
interface WrappedResponse {
  success: boolean;
  data?: PHIResponse;
  error?: string | null;
}

/**
 * Check if response is wrapped in QueryResponse format
 */
const isWrappedResponse = (response: unknown): response is WrappedResponse => {
  if (typeof response !== 'object' || response === null) return false;
  const obj = response as Record<string, unknown>;
  return 'success' in obj && typeof obj.success === 'boolean';
};

/**
 * Unwrap PHI API response
 * Handles both wrapped {success, data} and unwrapped {query, pillars} formats
 *
 * @param response - Raw API response
 * @returns Normalized PHIResponse
 */
export const unwrapPHIResponse = (response: unknown): PHIResponse => {
  // Check if response is wrapped in QueryResponse format
  if (isWrappedResponse(response)) {
    if (!response.success) {
      throw new Error(response.error || 'API request failed');
    }
    if (!response.data) {
      throw new Error('API returned success but no data');
    }
    return response.data;
  }

  // Already in PHIResponse format (from Hello-/app.py)
  return response as PHIResponse;
};

/**
 * Validate PHI response has required fields
 *
 * @param data - PHI response to validate
 * @returns true if valid, false otherwise
 */
export const validatePHIResponse = (data: PHIResponse): boolean => {
  // Check top-level fields
  if (!data || typeof data !== 'object') return false;
  if (!data.pillars || typeof data.pillars !== 'object') return false;
  if (!data.summary || typeof data.summary !== 'object') return false;

  // Check summary has required fields
  const summary = data.summary as PHISummary;
  if (typeof summary.overall_score !== 'number') return false;
  if (!summary.pillar_scores || typeof summary.pillar_scores !== 'object') return false;

  // Check at least one pillar exists
  const pillarKeys = Object.keys(data.pillars);
  if (pillarKeys.length === 0) return false;

  return true;
};

/**
 * Get detailed validation errors for debugging
 *
 * @param data - PHI response to validate
 * @returns Array of validation error messages
 */
export const getValidationErrors = (data: unknown): string[] => {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Response is not an object');
    return errors;
  }

  const response = data as Partial<PHIResponse>;

  if (!response.pillars) {
    errors.push('Missing pillars field');
  } else if (typeof response.pillars !== 'object') {
    errors.push('Pillars is not an object');
  } else if (Object.keys(response.pillars).length === 0) {
    errors.push('Pillars is empty');
  }

  if (!response.summary) {
    errors.push('Missing summary field');
  } else if (typeof response.summary !== 'object') {
    errors.push('Summary is not an object');
  } else {
    if (typeof response.summary.overall_score !== 'number') {
      errors.push('Missing or invalid overall_score');
    }
    if (!response.summary.pillar_scores) {
      errors.push('Missing pillar_scores');
    }
  }

  return errors;
};

/**
 * Transform and validate API response
 * Combines unwrapping and validation in one step
 *
 * @param response - Raw API response
 * @returns Validated PHIResponse
 * @throws Error if response is invalid
 */
export const transformPHIResponse = (response: unknown): PHIResponse => {
  // Unwrap if needed
  const data = unwrapPHIResponse(response);

  // Validate
  if (!validatePHIResponse(data)) {
    const errors = getValidationErrors(data);
    throw new Error(`Invalid API response: ${errors.join(', ')}`);
  }

  return data;
};
