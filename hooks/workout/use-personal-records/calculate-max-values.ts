/**
 * Calculate maximum values from workout sets
 */

import { WORKOUT_FIELDS } from '~/lib/constants';

import { parseAndConvertWeight, parseIntValue } from './pr-helpers';

import type { MaxValues } from './types';

interface CalculateMaxValuesParams {
  setsData: any[];
  exerciseType: string;
  measurementUnit: string;
}

/**
 * Calculate max values from all completed sets
 * Handles all exercise types: time-based, distance-based, and weight/reps-based
 */
export function calculateMaxValues({
  setsData,
  exerciseType,
  measurementUnit,
}: CalculateMaxValuesParams): MaxValues {
  const isTimeBasedExercise = exerciseType === WORKOUT_FIELDS.TIME;
  const isDistanceBasedExercise = exerciseType === WORKOUT_FIELDS.DISTANCE;

  let maxWeight = 0;
  let maxReps = 0;
  let maxVolume = 0;
  let maxTime = 0;
  let maxDistance = 0;

  setsData.forEach((set) => {
    if (!set.completed) return;

    if (isTimeBasedExercise) {
      // For time-based exercises, only track max time
      const time = parseIntValue(set.time);
      if (time > 0) {
        maxTime = Math.max(maxTime, time);
      }
    } else if (isDistanceBasedExercise) {
      // For distance-based exercises, track both distance and time
      const distance = parseIntValue(set.distance);
      const time = parseIntValue(set.time);
      if (distance > 0) {
        maxDistance = Math.max(maxDistance, distance);
      }
      if (time > 0) {
        maxTime = Math.max(maxTime, time);
      }
    } else {
      // For weight/reps exercises, track weight, reps, and volume
      const weight = parseAndConvertWeight(set.weight, measurementUnit);
      const reps = parseIntValue(set.reps);
      if (weight >= 0 && reps > 0) {
        maxWeight = Math.max(maxWeight, weight);
        maxReps = Math.max(maxReps, reps);
        maxVolume = Math.max(maxVolume, weight * reps);
      }
    }
  });

  return {
    weight: maxWeight,
    reps: maxReps,
    volume: maxVolume,
    time: maxTime,
    distance: maxDistance,
  };
}

/**
 * Check if all relevant values are zero based on exercise type
 */
export function hasNoValidValues(maxValues: MaxValues, exerciseType: string): boolean {
  const isTimeBasedExercise = exerciseType === WORKOUT_FIELDS.TIME;
  const isDistanceBasedExercise = exerciseType === WORKOUT_FIELDS.DISTANCE;

  if (isTimeBasedExercise) {
    return maxValues.time === 0;
  } else if (isDistanceBasedExercise) {
    return maxValues.distance === 0 && maxValues.time === 0;
  } else {
    return maxValues.weight === 0 && maxValues.reps === 0 && maxValues.volume === 0;
  }
}
