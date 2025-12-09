import { useCallback, useRef } from 'react';

import { useToastMessage } from '~/components/ui/toast-message';
import { useUpdateWorkout } from '~/hooks/data';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';
import { workoutsStore$ } from '~/lib/legend-state/stores/workoutsStore';
import { convertWeight } from '~/lib/utils/measurement';
import type { ExerciseWithDetails } from '~/types';

import type { OriginalData } from './types';

interface UseWorkoutSaveProps {
  workoutId: string;
  workoutName: string;
  exercisesWithDetails: ExerciseWithDetails[];
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useWorkoutSave({
  workoutId,
  workoutName,
  exercisesWithDetails,
  setHasChanges,
}: UseWorkoutSaveProps) {
  const { updateWorkout } = useUpdateWorkout();
  const { showErrorToast } = useToastMessage();
  const { unit: measurementUnit } = useMeasurement();

  const originalDataRef = useRef<OriginalData>({
    name: '',
    exercises: [],
  });

  const saveWorkout = useCallback(async () => {
    if (workoutId === 'quick') return;

    // Check if we need to use a mapped ID
    let actualWorkoutId = workoutId;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- Intentional: Avoids circular dependency with sync-manager
      const { syncManager } = require('~/lib/services/sync');
      actualWorkoutId = syncManager.getCorrectId(workoutId);
    } catch {
      // Sync manager not available, use original ID
    }

    // Verify the workout exists before trying to update
    const workouts = workoutsStore$.workouts.peek();
    let workoutExists = workouts.some((w) => w.id === actualWorkoutId);

    // If not found, check all workouts for one with matching title
    if (!workoutExists) {
      const matchingWorkout = workouts.find((w) => w.title === workoutName);
      if (matchingWorkout) {
        actualWorkoutId = matchingWorkout.id;
        workoutExists = true;
      }
    }

    if (!workoutExists) {
      showErrorToast('Failed to save workout: Workout not found');
      return;
    }

    try {
      const currentUnit = measurementUnit || 'kg';

      const workoutExercises = exercisesWithDetails.map((ex) => {
        const actualExerciseId = ex.details?.id || ex.id;

        // Convert default weight to kg for storage
        const rawDefaultWeight = ex.setsData?.[0]?.weight || '';
        let defaultWeight = rawDefaultWeight;
        if (rawDefaultWeight && currentUnit === 'lbs') {
          const weightNum = parseFloat(rawDefaultWeight);
          if (!isNaN(weightNum)) {
            defaultWeight = convertWeight(weightNum, 'lbs', 'kg').toString();
          }
        }

        return {
          id: actualExerciseId,
          exerciseId: actualExerciseId,
          reps: ex.reps || '',
          defaultReps: ex.reps || '',
          defaultWeight,
          rest: ex.rest,
          nextExerciseRest: ex.nextExerciseRest,
          sets: ex.setsData?.map((set, index) => {
            const existingSet = (ex as any).sets?.[index];
            const setId = existingSet?.id;

            const targetDuration =
              set.time !== undefined && set.time !== '' ? parseInt(set.time, 10) : undefined;
            const targetDistance =
              set.distance !== undefined && set.distance !== ''
                ? parseInt(set.distance, 10)
                : undefined;

            // Convert weight to kg for storage
            let weightForStorage = set.weight || '';
            if (weightForStorage && currentUnit === 'lbs') {
              const weightNum = parseFloat(weightForStorage);
              if (!isNaN(weightNum)) {
                weightForStorage = convertWeight(weightNum, 'lbs', 'kg').toString();
              }
            }

            return {
              ...(setId && { id: setId }),
              setIndex: index + 1,
              targetReps: set.reps || '',
              actualReps: undefined,
              weight: weightForStorage,
              targetDuration,
              targetDistance,
              completed: false,
            };
          }) || [
            {
              ...((ex as any).sets?.[0]?.id && { id: (ex as any).sets[0].id }),
              setIndex: 1,
              targetReps: '',
              actualReps: undefined,
              weight: '',
              targetDuration: undefined,
              targetDistance: undefined,
              completed: false,
            },
          ],
          exerciseNotes: ex.exerciseNotes,
          setsData: ex.setsData?.map((set) => ({
            reps: set.reps || '',
            weight: set.weight || '',
            time: set.time || '',
            distance: set.distance || '',
            completed: false,
          })) || [{ reps: '', weight: '', time: '', distance: '', completed: false }],
        };
      });

      const result = await updateWorkout(actualWorkoutId, {
        title: workoutName,
        exercises: workoutExercises,
      });

      if (result.success) {
        setHasChanges(false);

        // Update originalDataRef immediately with a DEEP COPY of current data
        originalDataRef.current = {
          name: workoutName,
          exercises: JSON.parse(JSON.stringify(exercisesWithDetails)),
        };

        // Signal that originalDataRef should be updated when data reloads
        (globalThis as any).shouldUpdateOriginalAfterSave = true;

        setTimeout(() => {
          (globalThis as any).shouldUpdateOriginalAfterSave = false;
        }, 1000);

        // Set a flag to ignore the incoming sync update
        if ((globalThis as any).workoutJustSavedCallback) {
          (globalThis as any).workoutJustSavedCallback();
        }
      } else {
        showErrorToast('Failed to save workout');
      }
    } catch {
      showErrorToast('Failed to save workout');
    }
  }, [
    workoutId,
    workoutName,
    exercisesWithDetails,
    updateWorkout,
    setHasChanges,
    showErrorToast,
    measurementUnit,
  ]);

  return { saveWorkout, originalDataRef };
}
