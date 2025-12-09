import { useMemo } from 'react';

import { useSelector } from '@legendapp/state/react';

import { workoutHistoryStore$ } from '~/lib/legend-state/stores/workoutHistoryStore';
import { formatDistanceToNow } from '~/lib/utils/date-utils';

interface PreviousPerformanceData {
  lastDate: string | null;
  lastDateFormatted: string | null;
  lastSets: {
    weight: number;
    reps: number;
    rest?: number;
  }[];
  lastTotalVolume: number;
  lastWorkoutId: string | null;
}

export function usePreviousPerformance(
  exerciseId: string,
  currentWorkoutId?: string, // Keep for backward compatibility but unused
  exerciseName?: string // Add exercise name for fallback matching
): PreviousPerformanceData {
  const workoutHistory = useSelector(workoutHistoryStore$.workoutHistory);

  return useMemo(() => {
    if (!exerciseId) {
      return {
        lastDate: null,
        lastDateFormatted: null,
        lastSets: [],
        lastTotalVolume: 0,
        lastWorkoutId: null,
      };
    }

    // Find all workout history entries that contain this exercise
    // IMPORTANT: For custom exercises, we need to handle ID mismatches
    // This can happen when:
    // 1. Exercise was created locally with a temp ID
    // 2. Got synced to database with a different ID
    // 3. Workout history still references the old ID

    const relevantHistory = workoutHistory
      .filter((entry) => {
        // First try direct ID match
        const hasExerciseById = entry.exercises.some((ex) => ex.exerciseId === exerciseId);

        // If no match by ID and we have a name, try fallback name matching
        // This handles cases where custom exercises have ID mismatches
        const hasExerciseByName =
          !hasExerciseById && exerciseName
            ? entry.exercises.some((ex) => {
                // Check if there's a custom exercise with matching name
                // This is a fallback for when IDs don't match due to sync issues
                return ex.exerciseName === exerciseName;
              })
            : false;

        const hasExercise = hasExerciseById || hasExerciseByName;

        return hasExercise;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (relevantHistory.length === 0) {
      return {
        lastDate: null,
        lastDateFormatted: null,
        lastSets: [],
        lastTotalVolume: 0,
        lastWorkoutId: null,
      };
    }

    // Get the most recent workout with this exercise
    const lastWorkout = relevantHistory[0];
    // Match by ID first, then fallback to name if needed
    const exerciseData = lastWorkout.exercises.find(
      (ex) => ex.exerciseId === exerciseId || (exerciseName && ex.exerciseName === exerciseName)
    );

    if (!exerciseData) {
      return {
        lastDate: null,
        lastDateFormatted: null,
        lastSets: [],
        lastTotalVolume: 0,
        lastWorkoutId: null,
      };
    }

    // Calculate total volume
    const totalVolume = exerciseData.sets.reduce((sum, set) => {
      return sum + set.weight * set.reps;
    }, 0);

    // Format the date
    const lastDate = lastWorkout.date;
    const lastDateFormatted = formatDistanceToNow(new Date(lastDate));

    return {
      lastDate,
      lastDateFormatted,
      lastSets: exerciseData.sets,
      lastTotalVolume: totalVolume,
      lastWorkoutId: lastWorkout.workoutId,
    };
  }, [exerciseId, workoutHistory]); // Removed currentWorkoutId from dependencies
}

/**
 * Format previous performance for display with better clarity
 * Example: "3 sets • 8-10 reps • 135 lbs"
 */
export function formatPreviousPerformance(
  sets: { weight: number; reps: number }[],
  unit: 'kg' | 'lbs' = 'kg',
  convertWeight?: (weight: number, from: string, to: string) => number
): string {
  if (!sets || sets.length === 0) return '';

  // Get unique weights used
  const weights = sets.map((set) => {
    const displayWeight = convertWeight ? convertWeight(set.weight, 'kg', unit) : set.weight;
    return Number.isInteger(displayWeight) ? displayWeight : parseFloat(displayWeight.toFixed(1));
  });

  const uniqueWeights = [...new Set(weights)];
  const repsArray = sets.map((set) => set.reps);
  const minReps = Math.min(...repsArray);
  const maxReps = Math.max(...repsArray);

  // Format the output
  const setCount = `${sets.length} ${sets.length === 1 ? 'set' : 'sets'}`;
  const repsRange = minReps === maxReps ? `${minReps} reps` : `${minReps}-${maxReps} reps`;
  const weightText =
    uniqueWeights.length === 1
      ? `${uniqueWeights[0]} ${unit}`
      : `${Math.min(...uniqueWeights)}-${Math.max(...uniqueWeights)} ${unit}`;

  return `${setCount} • ${repsRange} • ${weightText}`;
}

/**
 * Format previous performance in compact format for limited space
 * Returns structured data for rich formatting with set numbers
 */
export function formatPreviousPerformanceCompact(
  sets: { weight: number; reps: number }[],
  unit: 'kg' | 'lbs' = 'kg',
  convertWeight?: (weight: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs') => number
): {
  sets: { setNumber: number; text: string }[];
  isUniform: boolean;
  uniformWeight?: string;
} {
  if (!sets || sets.length === 0) {
    return { sets: [], isUniform: false };
  }

  // Convert all weights to display unit
  const convertedSets = sets.map((set) => {
    const displayWeight = convertWeight ? convertWeight(set.weight, 'kg', unit) : set.weight;
    const formattedWeight = Number.isInteger(displayWeight)
      ? displayWeight
      : parseFloat(displayWeight.toFixed(1));
    return {
      reps: set.reps,
      weight: formattedWeight,
    };
  });

  // Check if all sets use the same weight
  const uniqueWeights = [...new Set(convertedSets.map((s) => s.weight))];
  const allSameWeight = uniqueWeights.length === 1;

  if (allSameWeight) {
    // Return structured data for uniform weight
    const formattedSets = convertedSets.map((set, index) => ({
      setNumber: index + 1,
      text: `${set.reps} reps`,
    }));

    return {
      sets: formattedSets,
      isUniform: true,
      uniformWeight: `${uniqueWeights[0]} ${unit}`,
    };
  } else {
    // Return structured data for progressive loading
    const formattedSets = convertedSets.map((set, index) => ({
      setNumber: index + 1,
      text: `${set.reps} × ${set.weight}${unit}`,
    }));

    return {
      sets: formattedSets,
      isUniform: false,
    };
  }
}
