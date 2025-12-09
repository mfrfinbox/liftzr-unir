import { useCallback } from 'react';

import { useToastMessage } from '~/components/ui/toast-message';
import { usePersonalRecords, useWorkouts, useWorkoutHistory } from '~/hooks/data';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';
import { workoutHistoryOperations } from '~/lib/legend-state/stores/workoutHistoryStore';
import { generateId } from '~/lib/legend-state/utils/idGenerator';
import { dismissAllRestTimerNotifications } from '~/lib/services/notifications';
import type {
  ExercisePRs as GlobalExercisePRs,
  PersonalRecord,
  PRType,
} from '~/lib/services/pr-tracking/types';
import { convertWeight } from '~/lib/utils/measurement';
import type { ExerciseWithDetails, Workout } from '~/types';

interface UseWorkoutFinishProps {
  workout: Workout | null;
  exercisesWithDetails: ExerciseWithDetails[];
  workoutName: string;
  sessionAchievedPRs: GlobalExercisePRs;
  setSessionAchievedPRs: React.Dispatch<React.SetStateAction<GlobalExercisePRs>>;
  setSessionNotifiedPRs: React.Dispatch<
    React.SetStateAction<
      Record<string, Partial<Record<PRType, { value: number; notifiedThisSession: boolean }>>>
    >
  >;
}

export function useWorkoutFinish({
  workout,
  exercisesWithDetails,
  workoutName,
  sessionAchievedPRs,
  setSessionAchievedPRs,
  setSessionNotifiedPRs,
}: UseWorkoutFinishProps) {
  const { addPersonalRecord } = usePersonalRecords();
  const { workouts } = useWorkouts();
  const { workoutHistory } = useWorkoutHistory();
  const { showSuccessToast, showErrorToast, showToast } = useToastMessage();
  const { unit: measurementUnit } = useMeasurement();

  const handleFinishWorkout = useCallback(
    async (finalWorkoutTime: number, customWorkoutName?: string, newWorkoutId?: string) => {
      const currentWID = workout ? workout.id : 'quick';
      if (!currentWID) return;

      try {
        const currentUnit = measurementUnit || 'kg';

        const historyExercises = exercisesWithDetails
          .filter((ex) => ex.setsData && ex.setsData.some((set) => set.completed))
          .map((ex) => {
            const actualExerciseId = ex.details?.id || ex.id;
            const exerciseName = ex.details?.name || ex.name;

            return {
              exerciseId: actualExerciseId,
              exerciseName,
              sets: (ex.setsData || [])
                .filter((set) => set.completed)
                .map((set) => {
                  const rawWeight = parseFloat(set.weight || '0') || 0;
                  const weightInKg =
                    currentUnit === 'lbs' ? convertWeight(rawWeight, 'lbs', 'kg') : rawWeight;

                  return {
                    weight: weightInKg,
                    reps: parseInt(set.reps || '0') || 0,
                    time: parseInt(set.time || '0') || 0,
                    distance: parseInt(set.distance || '0') || 0,
                    rest: ex.rest || 0,
                  };
                }),
            };
          });

        if (historyExercises.length === 0 && currentWID === 'quick') {
          // Allow quick workouts with 0 exercises
        } else if (historyExercises.length === 0) {
          return;
        }

        const historyWorkoutId =
          newWorkoutId || (currentWID === 'quick' ? generateId() : currentWID);

        let actualWorkoutName: string | undefined;
        if (currentWID === 'quick') {
          actualWorkoutName = customWorkoutName || workoutName || 'Quick Workout';
        } else {
          const foundWorkout = workouts.find((w) => w.id === currentWID);
          actualWorkoutName = workoutName || foundWorkout?.title || 'Unknown Workout';
        }

        const workoutTitleForHistory =
          currentWID === 'quick' ? customWorkoutName || workoutName || 'Quick Workout' : undefined;

        let uniqueHistoryInstanceId: string;

        try {
          if (!historyWorkoutId) {
            showErrorToast('Failed to save workout - invalid ID');
            return;
          }

          if (!Array.isArray(historyExercises)) {
            showErrorToast('Failed to save workout - invalid exercises');
            return;
          }

          const newEntry = await workoutHistoryOperations.addWorkoutEntry({
            workoutId: historyWorkoutId,
            workoutName: actualWorkoutName,
            date: new Date().toISOString(),
            duration: finalWorkoutTime,
            exercises: historyExercises,
            customName: workoutTitleForHistory,
          });

          uniqueHistoryInstanceId = newEntry.id;
        } catch {
          showErrorToast('Failed to save workout history');
          return;
        }

        // Save PRs
        const strictlyNewOrImprovedPRsFromSession: PersonalRecord[] = [];

        for (const exerciseId in sessionAchievedPRs) {
          if (Object.prototype.hasOwnProperty.call(sessionAchievedPRs, exerciseId)) {
            const exerciseSessionPRs = sessionAchievedPRs[exerciseId];
            for (const type in exerciseSessionPRs) {
              if (Object.prototype.hasOwnProperty.call(exerciseSessionPRs, type as PRType)) {
                const originalSessionPR = sessionAchievedPRs[exerciseId][type as PRType];

                if (originalSessionPR) {
                  const databasePrVersionOfSessionPR = {
                    ...originalSessionPR,
                    workoutHistoryId: uniqueHistoryInstanceId,
                  };

                  strictlyNewOrImprovedPRsFromSession.push(databasePrVersionOfSessionPR);
                }
              }
            }
          }
        }

        // Save all PRs synchronously
        if (strictlyNewOrImprovedPRsFromSession.length > 0) {
          for (const pr of strictlyNewOrImprovedPRsFromSession) {
            try {
              await addPersonalRecord({
                exerciseId: pr.exerciseId,
                type: pr.type,
                value: pr.value,
                date: pr.date,
                workoutHistoryId: pr.workoutHistoryId,
              });
            } catch {
              // PR save error silently
            }
          }
        }

        // Show success message
        let prSummaryMessage = 'Workout completed!';
        if (strictlyNewOrImprovedPRsFromSession.length > 0) {
          prSummaryMessage = `Workout completed with ${strictlyNewOrImprovedPRsFromSession.length} new PR(s)!`;
        }
        showSuccessToast(prSummaryMessage);

        setSessionAchievedPRs({});
        setSessionNotifiedPRs({});

        // Clean up notifications
        dismissAllRestTimerNotifications();

        return {
          id: uniqueHistoryInstanceId,
          workoutId: historyWorkoutId,
        };
      } catch {
        showErrorToast('Failed to save workout and PRs');
      }
    },
    [
      workout,
      exercisesWithDetails,
      workoutName,
      sessionAchievedPRs,
      addPersonalRecord,
      showSuccessToast,
      showErrorToast,
      showToast,
      setSessionAchievedPRs,
      setSessionNotifiedPRs,
      workoutHistory,
      workouts,
      measurementUnit,
    ]
  );

  return { handleFinishWorkout };
}
