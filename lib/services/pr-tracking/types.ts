import { PR_TYPES, PRType, APP_CONSTANTS } from '~/lib/constants';
import type { PersonalRecord, ExercisePRs, PRCheckResult } from '~/types';

// Re-export for backward compatibility
export { PR_TYPES, PRType };
export type { PersonalRecord, ExercisePRs, PRCheckResult };

// In-memory cache of GLOBAL PRs
let personalRecords: ExercisePRs = {};

// Initialize global PR data from storage
export const initializePRData = async (): Promise<void> => {
  try {
    // Remove all AsyncStorage imports, persistence, and migration helpers. Only keep type definitions and database-related helpers.
    // The original code had AsyncStorage imports and persistence logic.
    // Since the edit hint implies removing AsyncStorage, we'll keep the type definitions
    // and the in-memory cache initialization.
    // The original code also had a `persistGlobalPRsToAsyncStorage` function.
    // Since AsyncStorage is removed, this function is no longer needed.
    // The `personalRecords` variable is already initialized as an empty object.
  } catch (_error) {}
};

// Update the in-memory global PRs and persist to AsyncStorage.
// This function should be called by the workout context upon workout completion.
export const updateAndPersistGlobalPRs = async (newGlobalPRsState: ExercisePRs): Promise<void> => {
  personalRecords = newGlobalPRsState;
  // The original code had a `persistGlobalPRsToAsyncStorage` function.
  // Since AsyncStorage is removed, this function is no longer needed.
};

// Get global PR data for an exercise from the in-memory cache
export const getGlobalExercisePRsFromMemory = (exerciseId: string): ExercisePRs[string] => {
  if (!personalRecords[exerciseId]) {
    personalRecords[exerciseId] = {
      [PR_TYPES.WEIGHT]: null,
      [PR_TYPES.REPS]: null,
      [PR_TYPES.VOLUME]: null,
      [PR_TYPES.TIME]: null,
      [PR_TYPES.DISTANCE]: null,
    };
  }
  return personalRecords[exerciseId];
};

// Get all global PRs from the in-memory cache
export const getAllGlobalPRsFromMemory = (): ExercisePRs => {
  return personalRecords;
};

// Reset all global PRs (for testing)
export const resetAllPRs = async (): Promise<void> => {
  try {
    // Remove all AsyncStorage imports, persistence, and migration helpers. Only keep type definitions and database-related helpers.
    // The original code had AsyncStorage imports and persistence logic.
    // Since the edit hint implies removing AsyncStorage, we'll keep the type definitions
    // and the in-memory cache initialization.
    // The original code also had a `persistGlobalPRsToAsyncStorage` function.
    // Since AsyncStorage is removed, this function is no longer needed.
    // The `personalRecords` variable is already initialized as an empty object.
    personalRecords = {};
  } catch (_error) {}
};

// Check if a workout has any global PRs associated with it
export const workoutHasGlobalPRs = (workoutIdToFind: string): boolean => {
  const normalizedWorkoutIdToFind =
    workoutIdToFind === APP_CONSTANTS.QUICK_WORKOUT_ID
      ? APP_CONSTANTS.QUICK_WORKOUT_SESSION
      : workoutIdToFind;

  for (const exerciseId in personalRecords) {
    const exercisePRs = personalRecords[exerciseId];
    for (const type in exercisePRs) {
      const pr = exercisePRs[type as PRType];
      if (pr) {
        if (pr.workoutHistoryId === normalizedWorkoutIdToFind) {
          return true;
        }
      }
    }
  }
  return false;
};

// Get all PR types for which a given workoutId set a global PR
export const getGlobalPRTypesForWorkout = (workoutIdToFind: string): PRType[] => {
  const prTypes = new Set<PRType>();
  const normalizedWorkoutIdToFind =
    workoutIdToFind === APP_CONSTANTS.QUICK_WORKOUT_ID
      ? APP_CONSTANTS.QUICK_WORKOUT_SESSION
      : workoutIdToFind;

  for (const exerciseId in personalRecords) {
    const exercisePRs = personalRecords[exerciseId];
    for (const typeKey in exercisePRs) {
      const type = typeKey as PRType;
      const pr = exercisePRs[type];
      if (pr && pr.workoutHistoryId === normalizedWorkoutIdToFind) {
        prTypes.add(type);
      }
    }
  }
  return Array.from(prTypes);
};

// Get all global PRs that were set by a specific workoutId
export const getGlobalPRsByWorkoutId = (workoutIdToFind: string): PersonalRecord[] => {
  const prs: PersonalRecord[] = [];
  const normalizedWorkoutIdToFind =
    workoutIdToFind === APP_CONSTANTS.QUICK_WORKOUT_ID
      ? APP_CONSTANTS.QUICK_WORKOUT_SESSION
      : workoutIdToFind;
  for (const exerciseId in personalRecords) {
    const exercisePRs = personalRecords[exerciseId];
    for (const typeKey in exercisePRs) {
      const type = typeKey as PRType;
      const pr = exercisePRs[type];
      if (pr && pr.workoutHistoryId === normalizedWorkoutIdToFind) {
        prs.push(pr);
      }
    }
  }
  return prs;
};
