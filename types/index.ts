/**
 * Central type definitions for Liftzr app
 */

import type { PRType } from '~/lib/constants';

// =============================================================================
// MUSCLE GROUP TYPES
// =============================================================================

export interface MuscleGroup {
  id: string;
  name: string;
  displayName: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MuscleGroupCategory {
  id: string;
  name: string;
  color: string;
  muscleGroups: string[];
}

// =============================================================================
// EXERCISE TYPES
// =============================================================================

export interface Exercise {
  id: string;
  name: string;
  type: 'reps' | 'time' | 'distance';
  primaryMuscleGroup?: string | null;
  secondaryMuscleGroups?: string[];
  isCustom?: boolean;
  usesPlates?: boolean;
}

// =============================================================================
// WORKOUT TYPES
// =============================================================================

export interface SetData {
  id?: string;
  reps: string;
  weight: string;
  time?: string;
  distance?: string;
  completed?: boolean;
}

export interface WorkoutExercise {
  id?: string;
  exerciseId?: string;
  exerciseName?: string;
  name?: string;
  isCustom?: boolean;
  sets: number;
  reps?: string;
  rest?: number;
  nextExerciseRest?: number;
  orderIndex?: number;
  setsData?: SetData[];
  exerciseNotes?: string;
  workoutExerciseId?: string;
}

export interface ExerciseWithDetails {
  id: string;
  workoutExerciseId?: string;
  exerciseId?: string;
  exerciseName?: string;
  name?: string;
  sets: number;
  reps?: string;
  rest?: number;
  nextExerciseRest?: number;
  orderIndex?: number;
  setsData?: SetData[];
  exerciseNotes?: string;
  details: Exercise;
}

export interface Workout {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  exercises: WorkoutExercise[];
  created: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  orderIndex?: number;
}

// =============================================================================
// ACTIVE WORKOUT TYPES
// =============================================================================

export interface ActiveWorkoutSet {
  id: string;
  reps: string;
  weight: string;
  time?: string;
  distance?: string;
  completed: boolean;
}

export interface ActiveWorkoutExercise {
  id: string;
  exerciseId: string;
  sets: ActiveWorkoutSet[];
  restTime: number;
  nextExerciseRestTime: number;
  exerciseNotes?: string;
}

export interface ActiveWorkout {
  id: string;
  workoutId?: string;
  title: string;
  startTime: string;
  endTime?: string;
  exercises: ActiveWorkoutExercise[];
  isPaused: boolean;
  pausedAt?: string;
  totalPausedTime: number;
  isHidden: boolean;
}

// =============================================================================
// WORKOUT HISTORY TYPES
// =============================================================================

export interface WorkoutHistorySet {
  reps: number;
  weight: number;
  time?: number;
  duration?: number;
  distance?: number;
  rest?: number;
  completed?: boolean;
}

export interface WorkoutHistoryExercise {
  exerciseId: string;
  exerciseName?: string;
  sets: WorkoutHistorySet[];
  orderIndex?: number;
}

export interface HistoryExercise {
  exerciseId: string;
  exerciseName?: string;
  sets: {
    reps: number;
    weight: number;
    time?: number;
    distance?: number;
    completed?: boolean;
  }[];
  orderIndex?: number;
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string;
  duration: number;
  exercises: WorkoutHistoryExercise[];
  customName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  completedAt?: string;
}

// =============================================================================
// PERSONAL RECORD TYPES
// =============================================================================

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName?: string;
  type: PRType;
  value: number;
  date: string;
  workoutHistoryId: string;
  reps?: number;
  weight?: number;
  time?: number;
  distance?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PersonalRecordInput {
  exerciseId: string;
  exerciseName?: string;
  type: PRType;
  value: number;
  date: string;
  workoutHistoryId: string;
  reps?: number;
  weight?: number;
  time?: number;
  distance?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ExercisePRs {
  [exerciseId: string]: {
    [K in PRType]?: PersonalRecord | null;
  };
}

export interface PRCheckResult {
  isNewPR: boolean;
  prType?: PRType;
  currentValue?: number;
  previousValue?: number;
  improvement?: number;
}

// =============================================================================
// USER PREFERENCES TYPES
// =============================================================================

export interface UserPreferences {
  measurementSystem: 'metric' | 'imperial';
  defaultSetRest: number;
  defaultExerciseRest: number;
  weekStartDay: number;
  bodyweight?: number;
  showWorkoutCompletionAlerts?: boolean;
}

// =============================================================================
// UI TYPES
// =============================================================================

export type ViewMode = 'compact' | 'detailed';

export interface NumberFormattingConfig {
  DISTANCE_KM_CONVERSION: number;
  WEIGHT_DECIMALS: number;
  TIME_FORMAT: string;
}

// =============================================================================
// BAR TYPES (for exercises)
// =============================================================================

export type BarType = 'olympic' | 'womens' | 'ez' | 'trap' | 'safety' | 'custom';
