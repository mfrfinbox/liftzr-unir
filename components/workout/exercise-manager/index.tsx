import { useEffect, useRef, useMemo } from 'react';

import { View, FlatList } from 'react-native';

import { useExerciseNotifications } from '~/hooks/workout/use-exercise-notifications';
import type { Exercise } from '~/types';

import { ExerciseListView } from './exercise-list-view';
import { ExerciseSelectionView } from './exercise-selection-view';
import { useExerciseCompletion } from './use-exercise-completion';
import { useExerciseTimer } from './use-exercise-timer';
import { useSetRemoval } from './use-set-removal';

import type { ExerciseManagerProps } from './types';

export function ExerciseManager({
  exercisesWithDetails,
  filteredExercises,
  isAddingExercises,
  searchQuery,
  workoutId,
  onChangeSearchQuery,
  onClearSearch,
  onToggleAddExercises,
  cancelExerciseSelection,
  applyExerciseSelection,
  useModalForAddExercises = false,
  onAddExercise,
  onCreateCustomExercise,
  onRemoveExercise,
  onUpdateRestTime,
  onUpdateNextExerciseRest,
  onToggleRest,
  onAddSet,
  onRemoveSet,
  onUpdateSetData,
  onUpdateExerciseNote,
  onReplaceExercise,
  onToggleSetCompletion,
  onShowReorderModal,
  onPropagateSetRest,
  onPropagateNextRest,
  recalculatePRsAfterSetRemoval,
  onRestTimerStateChange,
  onAbandonWorkout,
  onDeleteWorkout,
  isReadOnly = false,
  onExposeHandleSetCompletion,
}: ExerciseManagerProps) {
  const { showImmediateNotification } = useExerciseNotifications();
  const isActiveWorkout = !!onToggleSetCompletion;
  const flatListRef = useRef<FlatList | null>(null);

  const {
    timerState,
    currentExerciseIndex,
    handleSetRestTimer,
    cancelRestTimer,
    formatTime,
    startInterExerciseRest,
    cancelActiveTimer,
  } = useExerciseTimer({
    exercisesWithDetails,
    flatListRef,
    showImmediateNotification,
  });

  const { handleSetCompletion } = useExerciseCompletion({
    exercisesWithDetails,
    timerState,
    currentExerciseIndex,
    onToggleSetCompletion,
    handleSetRestTimer,
    startInterExerciseRest,
    cancelActiveTimer,
    startTimer: async (type, seconds, exerciseName, nextExerciseName, exerciseIndex, setIndex) => {
      if (type === 'set' && exerciseIndex !== undefined && setIndex !== undefined) {
        await handleSetRestTimer(exerciseName, seconds, exerciseIndex, setIndex);
      }
    },
  });

  const { handleRemoveSet } = useSetRemoval({
    exercisesWithDetails,
    timerState,
    currentExerciseIndex,
    onRemoveSet,
    recalculatePRsAfterSetRemoval,
    cancelActiveTimer,
  });

  const handleToggleExerciseForAI = (exercise: Exercise) => {
    const isCurrentlyAdded = exercisesWithDetails.some((ex) => ex.id === exercise.id);
    if (isCurrentlyAdded) {
      if (onRemoveExercise) onRemoveExercise(exercise.id);
    } else {
      onAddExercise(exercise);
    }
  };

  const selectedExerciseIds = useMemo(
    () => new Set(exercisesWithDetails.map((ex) => ex.id)),
    [exercisesWithDetails]
  );

  useEffect(() => {
    if (onRestTimerStateChange) {
      const newState = {
        ...timerState,
        formatTime,
        cancelRestTimer,
      };
      onRestTimerStateChange(newState);
    }
  }, [
    timerState.active,
    timerState.type,
    timerState.seconds,
    timerState.totalSeconds,
    timerState.exerciseName,
    timerState.nextExerciseName,
    onRestTimerStateChange,
    cancelRestTimer,
  ]);

  useEffect(() => {
    if (onExposeHandleSetCompletion) {
      onExposeHandleSetCompletion(handleSetCompletion);
    }
  }, [onExposeHandleSetCompletion]);

  return (
    <View className="flex-1">
      {isAddingExercises && !useModalForAddExercises ? (
        <ExerciseSelectionView
          filteredExercises={filteredExercises}
          selectedExerciseIds={selectedExerciseIds}
          searchQuery={searchQuery}
          exerciseCount={exercisesWithDetails.length}
          onChangeSearchQuery={onChangeSearchQuery}
          onClearSearch={onClearSearch}
          cancelExerciseSelection={cancelExerciseSelection}
          applyExerciseSelection={applyExerciseSelection}
          onAddExercise={onAddExercise}
          onRemoveExercise={onRemoveExercise}
          onCreateCustomExercise={onCreateCustomExercise}
          onToggleExercise={handleToggleExerciseForAI}
        />
      ) : (
        <ExerciseListView
          exercisesWithDetails={exercisesWithDetails}
          workoutId={workoutId}
          isActiveWorkout={isActiveWorkout}
          isReadOnly={isReadOnly}
          flatListRef={flatListRef}
          onRemoveExercise={onRemoveExercise}
          onUpdateRestTime={onUpdateRestTime}
          onUpdateNextExerciseRest={onUpdateNextExerciseRest}
          onToggleRest={onToggleRest}
          onAddSet={onAddSet}
          onUpdateSetData={onUpdateSetData}
          onUpdateExerciseNote={onUpdateExerciseNote}
          onReplaceExercise={onReplaceExercise}
          onToggleSetCompletion={onToggleSetCompletion}
          onShowReorderModal={onShowReorderModal}
          onToggleAddExercises={onToggleAddExercises}
          onPropagateSetRest={onPropagateSetRest}
          onPropagateNextRest={onPropagateNextRest}
          onAbandonWorkout={onAbandonWorkout}
          onDeleteWorkout={onDeleteWorkout}
          handleSetRestTimer={handleSetRestTimer}
          handleRemoveSet={handleRemoveSet}
          handleSetCompletion={handleSetCompletion}
        />
      )}
    </View>
  );
}

export type { ExerciseManagerProps } from './types';
