/**
 * Helper functions for PR tracking
 */

import { PRType, PR_TYPES } from '~/lib/services/pr-tracking/types';
import { convertWeight } from '~/lib/utils/measurement';

/**
 * Convert PR type enum to human-readable label
 */
export function PRTypeToLabel(type: PRType): string {
  switch (type) {
    case PR_TYPES.WEIGHT:
      return 'Weight';
    case PR_TYPES.REPS:
      return 'Reps';
    case PR_TYPES.VOLUME:
      return 'Volume';
    case PR_TYPES.TIME:
      return 'Time';
    case PR_TYPES.DISTANCE:
      return 'Distance';
    default:
      return '';
  }
}

/**
 * Parse and convert weight value from set data
 * Always converts to kg for consistent PR tracking
 */
export function parseAndConvertWeight(rawWeight: string | undefined, currentUnit: string): number {
  const weight = parseFloat(rawWeight || '0') || 0;
  return currentUnit === 'lbs' ? convertWeight(weight, 'lbs', 'kg') : weight;
}

/**
 * Parse integer value from string (reps, time, distance)
 */
export function parseIntValue(value: string | undefined): number {
  return parseInt(value || '0', 10) || 0;
}

/**
 * Get the actual exercise ID from exercise data
 * Prefers the details ID over the workout exercise ID
 */
export function getActualExerciseId(exerciseData: any): string {
  return exerciseData.details?.id || exerciseData.id;
}
