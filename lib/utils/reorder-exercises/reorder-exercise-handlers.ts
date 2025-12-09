/**
 * Reorder Exercise Handlers
 * Event handlers for exercise reordering and modal operations
 */

import { useCallback } from 'react';

import { Alert } from 'react-native';

import { useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ExerciseWithDetails } from '~/types';

import {
  setQuickWorkoutReorderResult,
  setExerciseReorderResult,
  setExercisesReorderedFlag,
} from './reorder-exercise-storage';

export interface ReorderHandlersParams {
  workoutId: string;
  isDatabaseLoaded: boolean;
  orderedExercises: ExerciseWithDetails[];
  hasChanges: boolean;
  isSavingRef: React.MutableRefObject<boolean>;
  isClosingRef: React.MutableRefObject<boolean>;
  originalOrderRef: React.MutableRefObject<string[]>;
  setOrderedExercises: (exercises: ExerciseWithDetails[]) => void;
  setHasChanges: (hasChanges: boolean) => void;
  animateHighlight: (exerciseId: string) => void;
}

export function useReorderHandlers(params: ReorderHandlersParams) {
  const router = useRouter();
  const {
    workoutId,
    isDatabaseLoaded,
    orderedExercises,
    hasChanges,
    isSavingRef,
    isClosingRef,
    originalOrderRef,
    setOrderedExercises,
    setHasChanges,
    animateHighlight,
  } = params;

  const checkForChanges = useCallback(
    (newOrder: ExerciseWithDetails[]) => {
      const currentIds = newOrder.map((e) => e.id);
      const originalIds = originalOrderRef.current;

      if (currentIds.length !== originalIds.length) {
        setHasChanges(true);
        return;
      }

      for (let i = 0; i < currentIds.length; i++) {
        if (currentIds[i] !== originalIds[i]) {
          setHasChanges(true);
          return;
        }
      }

      setHasChanges(false);
    },
    [originalOrderRef, setHasChanges]
  );

  const moveExercise = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newExercises = [...orderedExercises];
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      // Swap exercises
      [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];

      setOrderedExercises(newExercises);
      checkForChanges(newExercises);

      // Animate the moved item
      animateHighlight(newExercises[newIndex].id);
    },
    [orderedExercises, checkForChanges, setOrderedExercises, animateHighlight]
  );

  const handleClose = useCallback(() => {
    // Reset all state immediately
    isClosingRef.current = true;
    isSavingRef.current = false;
    setOrderedExercises([]);
    setHasChanges(false);

    // Navigate back
    router.back();
  }, [router, isClosingRef, isSavingRef, setOrderedExercises, setHasChanges]);

  const saveOrder = useCallback(async () => {
    if (isSavingRef.current || isClosingRef.current) {
      return;
    }

    // If no changes, just close the modal
    if (!hasChanges) {
      handleClose();
      return;
    }

    // Check if database is loaded before attempting to save
    if (!isDatabaseLoaded) {
      Alert.alert('Please wait', 'Database is still loading. Please try again in a moment.');
      return;
    }

    isSavingRef.current = true;

    try {
      // For quick workouts, we need to store the order differently
      if (workoutId === 'quick') {
        // Store the exercise IDs in the global variable for the parent to retrieve
        const reorderedIds = orderedExercises.map((ex) => ex.id);
        setQuickWorkoutReorderResult(reorderedIds);

        // Reset sort method to manual for quick workouts
        await AsyncStorage.setItem('@LiftzrSync:activeWorkoutSortMethod', 'manual');

        // Reset changes state and close modal
        setHasChanges(false);
        handleClose();
        return;
      }

      // For regular workouts, store the result for the parent to pick up
      // Don't update the database directly - let the parent handle saving
      setExerciseReorderResult({ exercises: orderedExercises });

      // Set the global flag to indicate exercises were reordered
      setExercisesReorderedFlag(true);

      // Reset sort method to manual since exercises were manually reordered
      await AsyncStorage.setItem(`@LiftzrSync:exerciseSortMethod:${workoutId}`, 'manual');

      // Close modal without saving to database
      setHasChanges(false);
      handleClose();
    } catch (error) {
      console.error('Failed to save exercise order:', error);
      Alert.alert('Error', 'An unexpected error occurred while saving the exercise order.');
      isSavingRef.current = false;
    }
  }, [
    hasChanges,
    workoutId,
    isDatabaseLoaded,
    handleClose,
    orderedExercises,
    isSavingRef,
    isClosingRef,
    setHasChanges,
  ]);

  return {
    moveExercise,
    handleClose,
    saveOrder,
  };
}
