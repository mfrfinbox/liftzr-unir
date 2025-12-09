/**
 * Sort Method Hook
 * Manages exercise sort method state, persistence, and inheritance
 */

import { useState, useEffect, useCallback } from 'react';

import { useFocusEffect } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ExerciseSortMethod } from '~/components/workout/exercise-sort-menu';
import { inheritSortMethodForActiveWorkout } from '~/hooks/workout/use-exercise-sorting';
import { STORAGE_KEYS } from '~/lib/constants';

import type { UseSortMethodProps } from './types';

export function useSortMethod({ workout, hasChanges }: UseSortMethodProps) {
  const [currentSortMethod, setCurrentSortMethod] = useState<ExerciseSortMethod>('manual');
  const [savedSortMethod, setSavedSortMethod] = useState<ExerciseSortMethod>('manual');
  const [sortMethodInitialized, setSortMethodInitialized] = useState(false);

  /**
   * Initialize saved sort method when workout loads
   */
  useEffect(() => {
    const initializeSavedSortMethod = async () => {
      if (workout) {
        try {
          // Load the persisted sort method for workout-details context
          const storedMethod = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISE_SORT_METHOD);
          const savedMethod = (storedMethod as ExerciseSortMethod) || 'manual';
          setSavedSortMethod(savedMethod);
        } catch (_error) {
          setSavedSortMethod('manual');
        }
      }
    };

    initializeSavedSortMethod();
  }, [workout]);

  /**
   * Reset UI to saved template state when returning from active workout or reorder modal
   */
  useFocusEffect(
    useCallback(() => {
      const resetToTemplateState = async () => {
        // Re-initialize savedSortMethod from AsyncStorage (in case it was updated during workout or reordering)
        try {
          const storedMethod = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISE_SORT_METHOD);
          const currentSavedMethod = (storedMethod as ExerciseSortMethod) || 'manual';

          // Update our saved sort method state
          setSavedSortMethod(currentSavedMethod);

          // Reset current UI state to match saved state (discards unsaved changes)
          setCurrentSortMethod(currentSavedMethod);
        } catch (_error) {}
      };

      resetToTemplateState();
    }, []) // Remove savedSortMethod dependency to avoid infinite loops
  );

  /**
   * Determine which sort method to inherit for active workout
   * If there are unsaved changes, use the saved sort method (ignore UI changes)
   * Otherwise, use the current sort method
   */
  const determineSortMethodForWorkout = useCallback((): ExerciseSortMethod => {
    if (hasChanges) {
      // If there are unsaved changes, use the saved sort method (ignore UI changes)
      return savedSortMethod;
    } else {
      // If no changes, current method represents the saved state
      return currentSortMethod;
    }
  }, [hasChanges, savedSortMethod, currentSortMethod]);

  /**
   * Inherit sort method for active workout and start workout
   */
  const inheritSortMethodAndStartWorkout = useCallback(() => {
    const sortMethodToInherit = determineSortMethodForWorkout();
    inheritSortMethodForActiveWorkout(sortMethodToInherit);
  }, [determineSortMethodForWorkout]);

  /**
   * Save sort method to AsyncStorage and update saved state
   */
  const saveSortMethod = useCallback(async () => {
    setSavedSortMethod(currentSortMethod);
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISE_SORT_METHOD, currentSortMethod);
  }, [currentSortMethod]);

  /**
   * Handle sort method change from child component
   */
  const handleSortMethodChange = useCallback(
    (method: ExerciseSortMethod, isEditable: boolean) => {
      // First time receiving sort method from child component - this is initialization
      if (!sortMethodInitialized) {
        setCurrentSortMethod(method);
        setSavedSortMethod(method);
        setSortMethodInitialized(true);
      } else if (method !== currentSortMethod && isEditable) {
        // Subsequent changes are actual user actions
        setCurrentSortMethod(method);
      }
    },
    [sortMethodInitialized, currentSortMethod]
  );

  return {
    currentSortMethod,
    savedSortMethod,
    sortMethodInitialized,
    setCurrentSortMethod,
    setSavedSortMethod,
    setSortMethodInitialized,
    inheritSortMethodAndStartWorkout,
    saveSortMethod,
    handleSortMethodChange,
  };
}
