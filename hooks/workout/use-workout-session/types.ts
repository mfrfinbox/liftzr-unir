import type { ExercisePRs as GlobalExercisePRs, PRType } from '~/lib/services/pr-tracking/types';
import type { ExerciseWithDetails, Workout } from '~/types';

export interface UseWorkoutSessionProps {
  workout: Workout | null;
  workoutId: string;
  workoutName: string;
  exercisesWithDetails: ExerciseWithDetails[];
  sessionAchievedPRs: GlobalExercisePRs;
  setSessionAchievedPRs: React.Dispatch<React.SetStateAction<GlobalExercisePRs>>;
  setSessionNotifiedPRs: React.Dispatch<
    React.SetStateAction<
      Record<string, Partial<Record<PRType, { value: number; notifiedThisSession: boolean }>>>
    >
  >;
  hasChanges: boolean;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
  isEditingName: boolean;
  setIsEditingName: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface OriginalData {
  name: string;
  exercises: ExerciseWithDetails[];
}
