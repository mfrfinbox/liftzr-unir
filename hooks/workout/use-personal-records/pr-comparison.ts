/**
 * PR comparison and candidate generation
 */

import { WORKOUT_FIELDS } from '~/lib/constants';
import { PR_TYPES, PRType } from '~/lib/services/pr-tracking/types';
import type { PersonalRecord } from '~/types';

import type { MaxValues, PRCandidate } from './types';

/**
 * Generate PR candidates based on exercise type and max values
 */
export function generatePRCandidates(maxValues: MaxValues, exerciseType: string): PRCandidate[] {
  const isTimeBasedExercise = exerciseType === WORKOUT_FIELDS.TIME;
  const isDistanceBasedExercise = exerciseType === WORKOUT_FIELDS.DISTANCE;

  if (isTimeBasedExercise) {
    return [
      {
        type: PR_TYPES.TIME,
        value: maxValues.time,
        time: maxValues.time,
      },
    ];
  } else if (isDistanceBasedExercise) {
    return [
      {
        type: PR_TYPES.DISTANCE,
        value: maxValues.distance,
        distance: maxValues.distance,
      },
      {
        type: PR_TYPES.TIME,
        value: maxValues.time,
        time: maxValues.time,
      },
    ];
  } else {
    return [
      {
        type: PR_TYPES.WEIGHT,
        value: maxValues.weight,
        weight: maxValues.weight,
        reps: maxValues.reps,
      },
      {
        type: PR_TYPES.REPS,
        value: maxValues.reps,
        weight: maxValues.weight,
        reps: maxValues.reps,
      },
      {
        type: PR_TYPES.VOLUME,
        value: maxValues.volume,
        weight: maxValues.weight,
        reps: maxValues.reps,
      },
    ];
  }
}

/**
 * Get global PRs for an exercise from the personal records array
 */
export function getGlobalPRs(
  allPersonalRecords: PersonalRecord[],
  exerciseId: string
): Record<string, PersonalRecord> {
  return allPersonalRecords
    .filter((pr) => pr.exerciseId === exerciseId)
    .reduce(
      (acc, pr) => {
        // Keep the best PR for each type (highest value)
        if (!acc[pr.type] || pr.value > acc[pr.type].value) {
          acc[pr.type] = pr;
        }
        return acc;
      },
      {} as Record<string, PersonalRecord>
    );
}

/**
 * Check if a candidate value beats the global PR
 */
export function isGlobalPRBeaten(
  candidateValue: number,
  globalPRs: Record<string, PersonalRecord>,
  prType: string
): boolean {
  const globalPRForType = globalPRs[prType];
  const globalPRValue = globalPRForType?.value || 0;
  return !globalPRForType || candidateValue > globalPRValue;
}

/**
 * Determine which PR types to check based on exercise type
 */
export function getPRTypesToCheck(exerciseType: string): PRType[] {
  const isTimeBasedExercise = exerciseType === WORKOUT_FIELDS.TIME;
  const isDistanceBasedExercise = exerciseType === WORKOUT_FIELDS.DISTANCE;

  if (isTimeBasedExercise) {
    return [PR_TYPES.TIME];
  } else if (isDistanceBasedExercise) {
    return [PR_TYPES.DISTANCE, PR_TYPES.TIME];
  } else {
    return [PR_TYPES.WEIGHT, PR_TYPES.REPS, PR_TYPES.VOLUME];
  }
}
