import { useMemo } from 'react';

import { WORKOUT_FIELDS } from '~/lib/constants';

import type { HistoricalSet, PerformanceStats } from './types';

export function usePerformanceStats(
  historicalSets: HistoricalSet[],
  exerciseType: string
): PerformanceStats {
  const isTimeBasedExercise = exerciseType === WORKOUT_FIELDS.TIME;
  const isDistanceBasedExercise = exerciseType === WORKOUT_FIELDS.DISTANCE;

  return useMemo(() => {
    if (!historicalSets.length) {
      if (isTimeBasedExercise) {
        return { maxTime: 0, avgTime: 0, totalTime: 0, hasData: false };
      } else if (isDistanceBasedExercise) {
        return { maxDistance: 0, bestTime: 0, avgPace: 0, hasData: false };
      } else {
        return { maxReps: 0, maxWeight: 0, totalVolume: 0, hasData: false };
      }
    }

    if (isTimeBasedExercise) {
      let maxTime = 0;
      let totalTime = 0;
      let count = 0;

      historicalSets.forEach((set) => {
        const time = set.time || 0;
        if (time > maxTime) maxTime = time;
        totalTime += time;
        if (time > 0) count++;
      });

      return {
        maxTime,
        avgTime: count > 0 ? Math.round(totalTime / count) : 0,
        totalTime,
        hasData: count > 0,
      };
    } else if (isDistanceBasedExercise) {
      let maxDistance = 0;
      let bestTime = Infinity;
      let totalDistance = 0;
      let totalTime = 0;
      let validSets = 0;

      historicalSets.forEach((set) => {
        const distance = set.distance || 0;
        const time = set.time || 0;

        if (distance > 0 && time > 0) {
          if (distance > maxDistance) maxDistance = distance;
          if (time < bestTime) bestTime = time;
          totalDistance += distance;
          totalTime += time;
          validSets++;
        }
      });

      // Calculate average pace (time per km)
      let avgPace = 0;
      if (totalDistance > 0 && totalTime > 0) {
        avgPace = Math.round(totalTime / (totalDistance / 1000));
      }

      if (bestTime === Infinity) bestTime = 0;

      return {
        maxDistance,
        bestTime,
        avgPace,
        hasData: validSets > 0,
      };
    } else {
      // Regular rep-based exercise
      let maxReps = 0;
      let maxWeight = 0;
      let totalVolume = 0;

      historicalSets.forEach((set) => {
        if (set.reps > maxReps) maxReps = set.reps;
        if (set.weight > maxWeight) maxWeight = set.weight;
        totalVolume += set.weight * set.reps;
      });

      return { maxReps, maxWeight, totalVolume, hasData: historicalSets.length > 0 };
    }
  }, [historicalSets, isTimeBasedExercise, isDistanceBasedExercise]);
}
