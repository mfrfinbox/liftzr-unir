/**
 * Home Screen Types
 * Type definitions for home screen components
 */

import type { MutableRefObject } from 'react';

import type { View } from 'react-native';

import type { Workout } from '~/types';

export interface WorkoutCardProps {
  workout: Workout;
  index: number;
  onPress: () => void;
  onMenuPress: (e: any) => void;
  onStartPress: (e: any) => void;
  completionStats:
    | {
        completionCount: number;
        lastCompleted: string | null;
      }
    | null
    | undefined;
  menuButtonRef: (ref: View | null) => void;
}

export interface EmptyStateProps {
  onCreateWorkout: () => void;
  onStartQuickWorkout: () => void;
}

export interface TopActionLinksProps {
  onStartQuickWorkout: () => void;
  onCreateNew: () => void;
}

export interface UseHomeMenuReturn {
  selectedWorkout: Workout | null;
  selectedWorkoutIndex: number | undefined;
  menuButtonRefs: MutableRefObject<{ [id: string]: View | null }>;
  showMenu: (workout: Workout, workoutId: string, index: number) => void;
  closeMenu: () => void;
}

export interface UseReorderNavigationReturn {
  handleOpenReorderModal: () => void;
}
