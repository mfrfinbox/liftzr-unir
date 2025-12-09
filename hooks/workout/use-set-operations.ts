import { useCallback } from 'react';

import type { ExerciseWithDetails, Workout } from '~/types';

interface UseSetOperationsProps {
  exercisesWithDetails: ExerciseWithDetails[];
  setExercisesWithDetails: React.Dispatch<React.SetStateAction<ExerciseWithDetails[]>>;
  workout: Workout | null;
}

export function useSetOperations({
  exercisesWithDetails,
  setExercisesWithDetails,
  workout,
}: UseSetOperationsProps) {
  // Enhanced addSetToExercise that can pre-fill from previous performance
  const addSetToExercise = useCallback(
    (
      exerciseIndex: number,
      markAsCompleted = false,
      setData?: { weight?: string; reps?: string; time?: string; distance?: string }
    ) => {
      setExercisesWithDetails((prev) => {
        const updated = [...prev];
        const exercise = { ...updated[exerciseIndex] };

        if (!exercise.setsData) {
          exercise.setsData = Array(exercise.sets)
            .fill(0)
            .map(() => ({
              reps: '', // No default reps - user must enter manually
              weight: '', // No default weight - user must enter manually
              time: '', // No default time
              distance: '', // No default distance
              completed: false,
            }));
        } else {
          // Get the last set's values for better UX, or use provided setData
          const lastSet = exercise.setsData[exercise.setsData.length - 1];
          const newSetReps = setData?.reps || (lastSet ? lastSet.reps : ''); // No default reps
          const newSetWeight = setData?.weight || (lastSet ? lastSet.weight : ''); // No default weight
          const newSetTime = setData?.time || (lastSet ? lastSet.time : ''); // No default time
          const newSetDistance = setData?.distance || (lastSet ? lastSet.distance : ''); // No default distance

          exercise.setsData = [
            ...exercise.setsData,
            {
              reps: newSetReps,
              weight: newSetWeight,
              time: newSetTime,
              distance: newSetDistance,
              completed: markAsCompleted, // Use the provided completion state
            },
          ];
        }

        exercise.sets = exercise.setsData.length;

        // Keep the sets array (with IDs) in sync with setsData
        // Preserve existing IDs and add undefined for new sets
        if (!Array.isArray((exercise as any).sets)) {
          (exercise as any).sets = [];
        }
        while ((exercise as any).sets.length < exercise.setsData.length) {
          (exercise as any).sets.push({}); // Empty object for new sets without IDs
        }

        updated[exerciseIndex] = exercise;

        return updated;
      });
    },
    [setExercisesWithDetails]
  );

  // New function to add set with previous performance pre-fill
  const addSetWithPreviousPerformance = useCallback(
    (exerciseIndex: number, previousPerformance: any) => {
      if (!previousPerformance?.lastSets?.length) {
        // No previous performance, just add empty set
        return addSetToExercise(exerciseIndex);
      }

      const exercise = exercisesWithDetails[exerciseIndex];
      const currentSetCount = exercise.setsData?.length || 0;

      // If this is the first set, pre-fill from first set of last workout
      if (currentSetCount === 0 && previousPerformance.lastSets[0]) {
        const firstPreviousSet = previousPerformance.lastSets[0];
        // Add the set with pre-filled data and mark it as pre-filled
        setExercisesWithDetails((prev) => {
          const updated = [...prev];
          const exercise = { ...updated[exerciseIndex] };

          const newSet = {
            weight: firstPreviousSet.weight?.toString() || '',
            reps: firstPreviousSet.reps?.toString() || '',
            time: '',
            distance: '',
            completed: false,
            isPreFilled: true, // Mark as pre-filled
          };

          exercise.setsData = exercise.setsData ? [...exercise.setsData, newSet] : [newSet];
          exercise.sets = exercise.setsData.length;

          updated[exerciseIndex] = exercise;
          return updated;
        });
        return;
      }

      // If we have more previous sets, use the corresponding one
      if (currentSetCount < previousPerformance.lastSets.length) {
        const correspondingSet = previousPerformance.lastSets[currentSetCount];
        setExercisesWithDetails((prev) => {
          const updated = [...prev];
          const exercise = { ...updated[exerciseIndex] };

          const newSet = {
            weight: correspondingSet.weight?.toString() || '',
            reps: correspondingSet.reps?.toString() || '',
            time: '',
            distance: '',
            completed: false,
            isPreFilled: true, // Mark as pre-filled
          };

          exercise.setsData = exercise.setsData ? [...exercise.setsData, newSet] : [newSet];
          exercise.sets = exercise.setsData.length;

          updated[exerciseIndex] = exercise;
          return updated;
        });
        return;
      }

      // Otherwise just add regular set (copy from last set in current workout)
      return addSetToExercise(exerciseIndex);
    },
    [exercisesWithDetails, addSetToExercise, setExercisesWithDetails]
  );

  const removeSetFromExercise = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      setExercisesWithDetails((prev) => {
        const updated = [...prev];
        const exercise = { ...updated[exerciseIndex] };

        if (!exercise.setsData || exercise.setsData.length <= 1) {
          return prev;
        }

        exercise.setsData = exercise.setsData.filter((_, idx) => idx !== setIndex);
        exercise.sets = exercise.setsData.length;

        // Keep the sets array (with IDs) in sync when removing
        if (Array.isArray((exercise as any).sets)) {
          (exercise as any).sets = (exercise as any).sets.filter(
            (_: any, idx: number) => idx !== setIndex
          );
        }

        updated[exerciseIndex] = exercise;

        return updated;
      });
    },
    [workout, exercisesWithDetails, setExercisesWithDetails]
  );

  const updateSetData = useCallback(
    (
      exerciseIndex: number,
      setIndex: number,
      field: 'weight' | 'reps' | 'time' | 'distance',
      value: string
    ) => {
      setExercisesWithDetails((prev) => {
        const updated = [...prev];
        const exercise = { ...updated[exerciseIndex] };

        if (!exercise.setsData) {
          exercise.setsData = Array(exercise.sets)
            .fill(0)
            .map(() => ({ reps: '', weight: '', time: '', distance: '', completed: false }));
        }

        const setsData = [...exercise.setsData];

        // For time and distance fields, always allow updates (including to '0' or empty)
        // For reps and weight, prevent accidental clearing of non-empty values
        if (field === 'weight' || field === 'reps') {
          const oldValue = setsData[setIndex]?.[field];
          // Don't overwrite non-empty values with empty strings for weight/reps unless it's intentional
          if (value === '' && oldValue && oldValue !== '' && oldValue !== '0') {
            return prev; // Don't update if we're trying to replace a good value with empty
          }
        }

        setsData[setIndex] = { ...setsData[setIndex], [field]: value };

        exercise.setsData = setsData;
        updated[exerciseIndex] = exercise;

        return updated;
      });
    },
    [exercisesWithDetails, setExercisesWithDetails]
  );

  return {
    addSetToExercise,
    addSetWithPreviousPerformance,
    removeSetFromExercise,
    updateSetData,
  };
}
