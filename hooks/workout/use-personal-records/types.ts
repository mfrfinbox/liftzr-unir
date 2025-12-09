/**
 * Types for Personal Records Hook
 */

import { PRType } from '~/lib/services/pr-tracking/types';
import type { Exercise, ExerciseWithDetails, PersonalRecord, Workout } from '~/types';

export interface UsePersonalRecordsProps {
  exercisesWithDetails: ExerciseWithDetails[];
  setExercisesWithDetails: React.Dispatch<React.SetStateAction<ExerciseWithDetails[]>>;
  workout: Workout | null;
  allPersonalRecords: PersonalRecord[];
  allExercises: Exercise[];
  displayWeight: (value: number) => string;
  showPRToast: (exerciseName: string, message: string) => void;
}

export interface MaxValues {
  weight: number;
  reps: number;
  volume: number;
  time: number;
  distance: number;
}

export interface PRCandidate {
  type: PRType;
  value: number;
  weight?: number;
  reps?: number;
  time?: number;
  distance?: number;
}
