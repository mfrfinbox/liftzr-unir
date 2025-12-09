/**
 * Workout Completion Hook
 * Orchestrator combining all completion flows and modal state
 */

import { useState, useCallback } from 'react';

import { useAdvancedSettings } from '~/lib/contexts/AdvancedSettingsContext';

import { useCompleteOnly } from './use-complete-only';
import { useQuickWorkoutCompletion } from './use-quick-workout-completion';
import { useRegularWorkoutCompletion } from './use-regular-workout-completion';
import { useWorkoutCompletionModal } from './use-workout-completion-modal';

interface UseWorkoutCompletionProps {
  workout: any;
  workoutId: string;
  isQuickWorkout: boolean;
  quickWorkoutName: string;
  exercisesWithDetails: any[];
  elapsedTime: number;
  hasChanges: boolean;
  handleFinishWorkout: (
    time: number,
    name?: string,
    id?: string
  ) => Promise<{ id: string; workoutId?: string } | undefined> | void;
  saveWorkout: () => void;
  setWorkoutName: (name: string) => void;
  sendFinishWorkoutToWatch?: () => void;
  sendDiscardWorkoutToWatch?: () => void;
  safeNavigateBack: () => void;
}

export function useWorkoutCompletion({
  workout,
  workoutId,
  isQuickWorkout,
  quickWorkoutName,
  exercisesWithDetails,
  elapsedTime,
  hasChanges,
  handleFinishWorkout,
  saveWorkout,
  setWorkoutName,
  sendFinishWorkoutToWatch,
  safeNavigateBack,
}: UseWorkoutCompletionProps) {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showWorkoutCompletionAlerts } = useAdvancedSettings();

  // Modal state management
  const { isModalInteractionInProgress, handleCloseModal } = useWorkoutCompletionModal();

  // Achievement processing (no-op - handled in use-workout-session.ts)
  const processAchievementsInBackground = useCallback(async (_workoutHistoryId: string) => {
    // No-op: Achievements are already processed in handleFinishWorkout
  }, []);

  // Complete-only handler
  const { handleCompleteOnly } = useCompleteOnly({
    workout,
    workoutId,
    isQuickWorkout,
    quickWorkoutName,
    exercisesWithDetails,
    elapsedTime,
    hasChanges,
    showCompletionModal,
    handleFinishWorkout,
    saveWorkout,
    setWorkoutName,
    sendFinishWorkoutToWatch,
    safeNavigateBack,
    handleCloseModal,
    processAchievementsInBackground,
  });

  // Quick workout completion flow
  const { handleQuickWorkoutCompletion } = useQuickWorkoutCompletion({
    exercisesWithDetails,
    quickWorkoutName,
    elapsedTime,
    showWorkoutCompletionAlerts,
    isModalInteractionInProgress,
    handleFinishWorkout,
    setWorkoutName,
    sendFinishWorkoutToWatch,
    safeNavigateBack,
    processAchievementsInBackground,
  });

  // Regular workout completion flow
  const { handleRegularWorkoutCompletion } = useRegularWorkoutCompletion({
    workout,
    workoutId,
    hasChanges,
    elapsedTime,
    isModalInteractionInProgress,
    handleFinishWorkout,
    saveWorkout,
    sendFinishWorkoutToWatch,
    processAchievementsInBackground,
    setIsSaving,
  });

  // Main finish workout flow - combines quick and regular workflows
  const finishWorkoutFlow = useCallback(
    async (saveWithoutConfirmation?: boolean) => {
      if (isQuickWorkout) {
        await handleQuickWorkoutCompletion(saveWithoutConfirmation);
      } else {
        await handleRegularWorkoutCompletion(saveWithoutConfirmation);
      }
    },
    [isQuickWorkout, handleQuickWorkoutCompletion, handleRegularWorkoutCompletion]
  );

  return {
    showCompletionModal,
    setShowCompletionModal,
    handleCompleteOnly,
    finishWorkoutFlow,
    handleCloseModal,
    isModalInteractionInProgress,
    isSaving,
  };
}
