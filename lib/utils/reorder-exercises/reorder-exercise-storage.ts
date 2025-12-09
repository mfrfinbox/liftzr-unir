/**
 * Reorder Exercise Storage
 * Global state storage and retrieval for exercise reorder results
 *
 * WARNING: This module uses global mutable state.
 * - Getters auto-clear values after first read
 * - Not safe for concurrent access
 * - Must be read exactly once per reorder operation
 * TODO: Migrate to React Context or state management library
 */

import type { ExerciseWithDetails } from '~/types';

// Global variable to store reorder result for quick workouts
let quickWorkoutReorderResult: string[] | null = null;

// Global variable to store reorder result for regular workouts
let exerciseReorderResult: { exercises: ExerciseWithDetails[] } | null = null;

// Global flag to indicate exercises were reordered
let exercisesReordered = false;

export function getQuickWorkoutReorderResult() {
  return quickWorkoutReorderResult;
}

export function getExerciseReorderResult() {
  return exerciseReorderResult;
}

export function getExercisesReorderedFlag() {
  return exercisesReordered;
}

export function clearQuickWorkoutReorderResult() {
  quickWorkoutReorderResult = null;
}

export function clearExerciseReorderResult() {
  exerciseReorderResult = null;
}

export function clearExercisesReorderedFlag() {
  exercisesReordered = false;
}

export function setQuickWorkoutReorderResult(result: string[]) {
  quickWorkoutReorderResult = result;
}

export function setExerciseReorderResult(result: { exercises: ExerciseWithDetails[] }) {
  exerciseReorderResult = result;
}

export function setExercisesReorderedFlag(flag: boolean) {
  exercisesReordered = flag;
}
