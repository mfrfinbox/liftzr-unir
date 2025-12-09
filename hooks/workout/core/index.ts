import { useState, useEffect, useRef } from 'react';

import { useLocalSearchParams } from 'expo-router';

import { useToastMessage } from '~/components/ui/toast-message';
import { useExercises } from '~/hooks/data/use-exercises';
import { useMuscleGroups } from '~/hooks/data/use-muscle-groups';
import { usePersonalRecords as usePersonalRecordsFromDB } from '~/hooks/data/use-personal-records';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';
import type { ExerciseWithDetails } from '~/types';

import { useExerciseOperations } from '../use-exercise-operations';
import { usePersonalRecords } from '../use-personal-records';
import { useSetOperations } from '../use-set-operations';
import { useWorkoutSession } from '../use-workout-session';
import { useWorkoutUtilities } from '../use-workout-utilities';

import { useExerciseReplacement } from './use-exercise-replacement';
import { useWorkoutDataProcessor } from './use-workout-data-processor';
import { useWorkoutRecovery } from './use-workout-recovery';
import { useWorkoutState } from './use-workout-state';

/**
 * Main workout data hook - orchestrates all workout-related functionality
 * This is the refactored version of the original 815-line useWorkoutData hook
 */
export function useWorkoutData(refreshKey = 0) {
  const { workoutId } = useLocalSearchParams<{
    workoutId: string;
  }>();

  // Core state
  const [exercisesWithDetails, setExercisesWithDetails] = useState<ExerciseWithDetails[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  // Removed workoutTime state - it's managed by the timer hook to avoid re-render cascades

  // Database hooks
  const { exercises: allExercises } = useExercises();
  const { personalRecords: allPersonalRecords } = usePersonalRecordsFromDB();
  const { muscleGroups } = useMuscleGroups();

  // Context hooks
  const { showPRToast } = useToastMessage();
  const { displayWeight } = useMeasurement();

  // Original data ref for change detection
  const originalDataRef = useRef<{
    name: string;
    exercises: ExerciseWithDetails[];
  }>({
    name: '',
    exercises: [],
  });

  // Core workout state management
  const {
    workout,
    setWorkout: _setWorkout,
    hasChanges,
    setHasChanges,
    initializedWorkoutsRef,
    justSavedRef: _justSavedRef,
    saveTimeoutRef: _saveTimeoutRef,
    lastProcessedWorkoutRef: _lastProcessedWorkoutRef,
  } = useWorkoutState({
    exercisesWithDetails,
    workoutName,
    originalDataRef,
  });

  // Process workout data to convert database format to UI format
  useWorkoutDataProcessor({
    workout,
    allExercises,
    setWorkoutName,
    setExercisesWithDetails,
    initializedWorkoutsRef,
    originalDataRef,
    refreshKey,
  });

  // Workout recovery from saved state
  useWorkoutRecovery({
    setWorkoutName,
    setExercisesWithDetails,
  });

  // Session state for PRs (these will be managed by personal records hook)
  const [sessionAchievedPRs, setSessionAchievedPRs] = useState<Record<string, any>>({});
  const [sessionNotifiedPRs, setSessionNotifiedPRs] = useState<Record<string, any>>({});

  // Set operations hook
  const { addSetToExercise, removeSetFromExercise, updateSetData } = useSetOperations({
    exercisesWithDetails,
    setExercisesWithDetails,
    workout,
  });

  // Personal records hook
  const {
    toggleSetCompletion,
    sessionAchievedPRs: prSessionAchievedPRs,
    sessionNotifiedPRs: prSessionNotifiedPRs,
    setSessionAchievedPRs: prSetSessionAchievedPRs,
    setSessionNotifiedPRs: prSetSessionNotifiedPRs,
    recalculatePRsAfterSetRemoval,
  } = usePersonalRecords({
    exercisesWithDetails,
    setExercisesWithDetails,
    workout,
    allPersonalRecords,
    allExercises,
    displayWeight,
    showPRToast,
  });

  // Use the PR states from the personal records hook
  useEffect(() => {
    if (prSessionAchievedPRs !== sessionAchievedPRs) {
      setSessionAchievedPRs(prSessionAchievedPRs);
    }
  }, [prSessionAchievedPRs]);

  useEffect(() => {
    if (prSessionNotifiedPRs !== sessionNotifiedPRs) {
      setSessionNotifiedPRs(prSessionNotifiedPRs);
    }
  }, [prSessionNotifiedPRs]);

  // Exercise operations hook
  const {
    isAddingExercises,
    searchQuery,
    filteredExercises,
    setSearchQuery,
    addExerciseToWorkout,
    createCustomExercise,
    removeExercise,
    toggleAddExercises,
    cancelExerciseSelection,
    applyExerciseSelection,
  } = useExerciseOperations({
    exercisesWithDetails,
    setExercisesWithDetails,
    allExercises,
    muscleGroups: muscleGroups as any,
    setSessionAchievedPRs: prSetSessionAchievedPRs,
    setSessionNotifiedPRs: prSetSessionNotifiedPRs,
  });

  // Workout utilities hook
  const {
    updateRestTime,
    updateNextExerciseRest,
    toggleRest,
    reorderQuickWorkoutExercises,
    reorderRegularWorkoutExercises,
    replaceWorkoutState,
    propagateSetRest,
    propagateNextRest,
  } = useWorkoutUtilities({
    exercisesWithDetails,
    setExercisesWithDetails,
    workoutId,
  });

  // Exercise replacement logic
  const { replaceExercise } = useExerciseReplacement({
    exercisesWithDetails,
    setExercisesWithDetails,
    setHasChanges,
    setSessionAchievedPRs: prSetSessionAchievedPRs,
    setSessionNotifiedPRs: prSetSessionNotifiedPRs,
  });

  // Workout session management
  const {
    saveWorkout,
    handleClose,
    handleStartWorkout,
    handleEndEditingName,
    handleFinishWorkout,
    refreshWorkoutData,
  } = useWorkoutSession({
    workout,
    workoutId,
    workoutName,
    exercisesWithDetails,
    sessionAchievedPRs: prSessionAchievedPRs,
    setSessionAchievedPRs: prSetSessionAchievedPRs,
    setSessionNotifiedPRs: prSetSessionNotifiedPRs,
    hasChanges,
    setHasChanges,
    isEditingName,
    setIsEditingName,
  });

  // 🔧 CRITICAL FIX: Removed broken originalDataRef sync logic
  // The originalDataRef is properly initialized in use-workout-data-processor.ts
  // Trying to sync it here with a ref dependency never worked because refs don't trigger useEffect

  // Reset session data when loading new workout
  useEffect(() => {
    if (workoutId && workoutId !== 'quick') {
      prSetSessionAchievedPRs({});
      prSetSessionNotifiedPRs({});
    }
  }, [workoutId]);

  // Update exercise notes handler
  const updateExerciseNote = (exerciseIndex: number, note: string) => {
    setExercisesWithDetails((prev) => {
      const updated = [...prev];
      if (updated[exerciseIndex]) {
        updated[exerciseIndex] = {
          ...updated[exerciseIndex],
          exerciseNotes: note,
        };
      }
      return updated;
    });
    setHasChanges(true);
  };

  return {
    workout,
    workoutName,
    setWorkoutName,
    exercisesWithDetails,
    filteredExercises,
    isAddingExercises,
    searchQuery,
    setSearchQuery,
    isEditingName,
    setIsEditingName,
    hasChanges,
    handleClose,
    saveWorkout,
    handleStartWorkout,
    addSetToExercise,
    removeSetFromExercise,
    updateSetData,
    updateExerciseNote,
    replaceExercise,
    toggleAddExercises,
    cancelExerciseSelection,
    applyExerciseSelection,
    addExerciseToWorkout,
    createCustomExercise,
    removeExercise,
    updateRestTime,
    updateNextExerciseRest,
    toggleRest,
    handleEndEditingName,
    handleFinishWorkout,
    toggleSetCompletion,
    setWorkoutTime: () => {}, // No-op for backward compatibility
    refreshWorkoutData,
    reorderQuickWorkoutExercises,
    reorderRegularWorkoutExercises,
    replaceWorkoutState,
    sessionAchievedPRs: prSessionAchievedPRs,
    sessionNotifiedPRs: prSessionNotifiedPRs,
    propagateSetRest,
    propagateNextRest,
    recalculatePRsAfterSetRemoval,
  };
}
