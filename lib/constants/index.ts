/**
 * Unified Constants File
 * All application constants consolidated in one place for better maintainability
 */

// =============================================================================
// WORKOUT FIELD TYPES - The main hardcoded strings scattered across 20+ files
// =============================================================================
export const WORKOUT_FIELDS = {
  WEIGHT: 'weight',
  REPS: 'reps',
  VOLUME: 'volume',
  TIME: 'time',
  DISTANCE: 'distance',
  SETS: 'sets',
  REST: 'rest',
} as const;

// Type for workout field values
export type WorkoutField = (typeof WORKOUT_FIELDS)[keyof typeof WORKOUT_FIELDS];

// =============================================================================
// PR (PERSONAL RECORD) TYPES - Migrated from pr-tracking/types.ts
// =============================================================================
export const PR_TYPES = {
  WEIGHT: 'weight' as const,
  REPS: 'reps' as const,
  VOLUME: 'volume' as const,
  TIME: 'time' as const,
  DISTANCE: 'distance' as const,
} as const;

export type PRType = (typeof PR_TYPES)[keyof typeof PR_TYPES];

// =============================================================================
// TIMING & TIMEOUT VALUES - Scattered setTimeout and delay values
// =============================================================================
export const TIMEOUTS = {
  NAVIGATION_FALLBACK: 100, // active-workout.tsx:113 - fallback navigation delay
  TOAST_DISPLAY: 1000, // workout-details.tsx:51 - toast visibility delay
  EXERCISE_LOADING: 30000, // select-exercises.tsx:113 - exercise loading timeout
} as const;

// =============================================================================
// STORAGE KEYS - AsyncStorage keys used multiple times
// =============================================================================
export const STORAGE_KEYS = {
  EXERCISE_SORT_METHOD: '@LiftzrSync:exerciseSortMethod',
} as const;

// =============================================================================
// NUMBER FORMATTING - Thresholds for weight/distance display
// =============================================================================
export const NUMBER_FORMATTING = {
  WEIGHT_THOUSAND_THRESHOLD: 1000, // statistics.tsx - for K display
  WEIGHT_MILLION_THRESHOLD: 1000000, // statistics.tsx - for M display
  DISTANCE_KM_CONVERSION: 1000, // statistics.tsx - meters to km
  TIME_MS_TO_SECONDS: 1000, // various files - time conversions
  WEIGHT_DECIMALS: 1, // decimal places for weight display
  TIME_FORMAT: 'mm:ss', // format for time display
} as const;

// =============================================================================
// APP CONSTANTS - Default values and app-specific strings
// =============================================================================
export const APP_CONSTANTS = {
  QUICK_WORKOUT_ID: 'quick',
  QUICK_WORKOUT_SESSION: 'quick-workout-session',
  DEFAULT_SORT_METHOD: 'manual',
  DEFAULT_EXERCISE_TYPE: 'reps',
  ENVIRONMENT_DEV: 'development',
  ENVIRONMENT_PROD: 'production',
} as const;

// =============================================================================
// EXERCISE DEFAULTS - Migrated from exercise-defaults.ts
// =============================================================================
export const EXERCISE_DEFAULTS = {
  // Time-based exercises
  DURATION: 1800, // 30 minutes in seconds
  DISTANCE: 5000, // 5km in meters

  // Common defaults
  REST: 60, // 1 minute rest between sets
  SETS: 3, // default number of sets
} as const;

// Helper functions for getting defaults based on exercise type
export const getExerciseDefaults = (exerciseType: 'reps' | 'time' | 'distance') => {
  const base = {
    rest: EXERCISE_DEFAULTS.REST,
    sets: EXERCISE_DEFAULTS.SETS,
  };

  switch (exerciseType) {
    case WORKOUT_FIELDS.REPS:
      return {
        ...base,
        // No default reps or weight - users must enter manually
      };
    case WORKOUT_FIELDS.TIME:
      return {
        ...base,
        duration: EXERCISE_DEFAULTS.DURATION,
      };
    case WORKOUT_FIELDS.DISTANCE:
      return {
        ...base,
        distance: EXERCISE_DEFAULTS.DISTANCE,
      };
    default:
      return base;
  }
};

// Type-safe access to defaults
export type ExerciseDefaults = ReturnType<typeof getExerciseDefaults>;

// =============================================================================
// UI & THEME CONSTANTS - Migrated from config/constants.ts
// =============================================================================
export const NAV_THEME = {
  light: {
    background: 'rgb(225, 230, 235)',
    border: 'rgb(200, 205, 215)',
    card: 'rgb(235, 238, 242)',
    notification: 'rgb(226, 58, 47)',
    primary: 'rgb(47, 110, 240)',
    text: 'rgb(30, 35, 40)',
  },
  dark: {
    background: 'rgb(35, 36, 37)',
    border: 'rgba(255, 255, 255, 0.1)',
    card: 'rgb(52, 53, 55)',
    notification: 'rgb(239, 68, 68)',
    primary: 'rgb(47, 110, 240)',
    text: 'rgb(251, 251, 251)',
  },
  'dark-high-contrast': {
    background: 'rgb(0, 0, 0)',
    border: 'rgba(255, 255, 255, 0.3)',
    card: 'rgb(15, 15, 15)',
    notification: 'rgb(248, 113, 113)',
    primary: 'rgb(59, 130, 246)',
    text: 'rgb(255, 255, 255)',
  },
} as const;

export const APP_PADDING = {
  horizontal: 12,
  vertical: 10,
} as const;

export const TOAST_DURATION = {
  shorter: 1000,
  short: 2000,
  long: 5000,
} as const;

// =============================================================================
// API CONFIGURATION
// =============================================================================
export const API_CONFIG = {
  BASE_URL: '', // For local Expo Router API routes, use empty string
} as const;

// =============================================================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// =============================================================================

// All constants are already exported above - no need for additional re-exports
