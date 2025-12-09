/**
 * Types for Workout Details Screen
 */

import type { MutableRefObject } from 'react';

import type { ExerciseSortMethod } from '~/components/workout/exercise-sort-menu';
import type { ExerciseWithDetails, Workout } from '~/types';

export interface ModalInteractionState {
  isModalInteractionInProgress: MutableRefObject<boolean>;
  hasProcessedModalResult: MutableRefObject<boolean>;
}

export interface SortMethodState {
  currentSortMethod: ExerciseSortMethod;
  savedSortMethod: ExerciseSortMethod;
  sortMethodInitialized: boolean;
}

export interface UseModalManagementProps {
  exercisesWithDetails: ExerciseWithDetails[];
  workout: Workout | null;
  workoutName: string;
  isModalInteractionInProgress: MutableRefObject<boolean>;
  hasProcessedModalResult: MutableRefObject<boolean>;
  reorderRegularWorkoutExercises: (exercises: ExerciseWithDetails[]) => void;
  refreshWorkoutData: () => void;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

export interface UseSortMethodProps {
  workout: Workout | null;
  hasChanges: boolean;
}

export interface UseWorkoutEditabilityProps {
  workout: Workout | null;
  workouts: Workout[];
}
