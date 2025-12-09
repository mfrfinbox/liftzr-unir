import { useEffect } from 'react';

import { useLocalSearchParams } from 'expo-router';

import { WORKOUT_FIELDS } from '~/lib/constants';
import { SimpleWorkoutState } from '~/lib/services/workout-persistence';
import type { ExerciseWithDetails } from '~/types';

interface UseWorkoutRecoveryParams {
  setWorkoutName: React.Dispatch<React.SetStateAction<string>>;
  setExercisesWithDetails: React.Dispatch<React.SetStateAction<ExerciseWithDetails[]>>;
}

export function useWorkoutRecovery({
  setWorkoutName,
  setExercisesWithDetails,
}: UseWorkoutRecoveryParams) {
  const { recovery } = useLocalSearchParams<{
    recovery?: string;
  }>();

  // Handle workout recovery from saved state
  useEffect(() => {
    if (!recovery) return;

    try {
      const savedState = JSON.parse(recovery) as SimpleWorkoutState;
      setWorkoutName(savedState.workoutName || '');

      const recoveredExercises = savedState.exercises.map((ex) => ({
        ...ex,
        // Explicitly preserve exercise notes
        exerciseNotes: ex.exerciseNotes || '',
        setsData: ex.setsData.map((set) => ({
          ...set,
          completed: set.completed || false,
        })),
        details: {
          ...(ex.details as any),
          type: (ex.details as any).type || WORKOUT_FIELDS.REPS,
        },
      })) as ExerciseWithDetails[];

      setExercisesWithDetails(recoveredExercises);
    } catch (_error) {
      // Recovery failed in hook
    }
  }, [recovery, setWorkoutName, setExercisesWithDetails]);
}
