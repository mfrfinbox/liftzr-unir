/**
 * Types for My Exercises Settings
 */

import type { Exercise } from '~/types';

/**
 * Extended exercise type that includes muscle group IDs
 */
export interface ExerciseWithIds extends Exercise {
  primaryMuscleGroupId?: string;
  secondaryMuscleGroupIds?: string[];
}

/**
 * Props for ExerciseItem component
 */
export interface ExerciseItemProps {
  exercise: ExerciseWithIds;
  onEdit: (exercise: ExerciseWithIds) => void;
  onDelete: (exercise: ExerciseWithIds) => void;
  index: number;
}

/**
 * Exercise type filter options
 */
export type ExerciseTypeFilter = 'all' | 'reps' | 'time' | 'distance';
