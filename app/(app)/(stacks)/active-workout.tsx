/**
 * Active Workout Screen
 * Main screen for tracking an active workout session
 */

import { useState, useEffect, useRef } from 'react';

import { View } from 'react-native';

import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import { useTheme } from '@react-navigation/native';
import { useSharedValue } from 'react-native-reanimated';

import { Screen } from '~/components/layout/screen';
import { WorkoutMuscleHeatmapModal } from '~/components/sheets/workout-muscle-heatmap-modal';
import { AnimatedWorkoutTitle } from '~/components/workout/animated-workout-title';
import { ExerciseManager } from '~/components/workout/exercise-manager';
import { SavingWorkoutOverlay } from '~/components/workout/saving-workout-overlay';
import { StopwatchModal } from '~/components/workout/stopwatch-modal';
import { WorkoutHeaderControls } from '~/components/workout/workout-header-controls';
import { useWorkouts } from '~/hooks/data/use-workouts';
import { useSimpleWorkoutPersistence } from '~/hooks/useSimpleWorkoutPersistence';
import { useActiveWorkoutControls } from '~/hooks/workout/active-workout/use-active-workout-controls';
import { useActiveWorkoutModals } from '~/hooks/workout/active-workout/use-active-workout-modals';
import { useWorkoutRecovery } from '~/hooks/workout/active-workout/use-workout-recovery';
import { useHiddenWorkoutState } from '~/hooks/workout/use-hidden-workout-state';
import { useQuickWorkout } from '~/hooks/workout/use-quick-workout';
import { useWorkoutCompletion } from '~/hooks/workout/use-workout-completion';
import { useWorkoutData } from '~/hooks/workout/use-workout-data';
import { useWorkoutTimer } from '~/hooks/workout/use-workout-timer';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import { dismissAllRestTimerNotifications } from '~/lib/services/notifications';

export default function ActiveWorkoutScreen() {
  const { colors } = useTheme();
  const { theme: _theme } = useAppTheme();
  const router = useRouter();
  const { workoutId, recovery } = useLocalSearchParams<{
    workoutId: string;
    recovery?: string;
  }>();

  const scrollY = useSharedValue(0);

  // Check if user has any workouts
  const { workouts } = useWorkouts();
  const hasWorkouts = workouts && workouts.length > 0;

  // Local state
  const [stopwatchModalVisible, setStopwatchModalVisible] = useState(false);
  const [showMuscleHeatmap, setShowMuscleHeatmap] = useState(false);
  const [restTimerState, setRestTimerState] = useState<any>(null);
  const handleSetCompletionRef = useRef<((exerciseIndex: number, setIndex: number) => void) | null>(
    null
  );

  // Workout data hook
  const workoutData = useWorkoutData();
  const {
    workout: _workout,
    workoutName,
    exercisesWithDetails,
    handleFinishWorkout,
    saveWorkout,
    setWorkoutName,
  } = workoutData;

  // Timer hook - initialize first
  const timer = useWorkoutTimer(null, undefined, undefined);
  const {
    isWorkoutActive: _isWorkoutActive,
    isWorkoutPaused,
    elapsedTime,
    startTime: _startTime,
    pausedTime: _pausedTime,
    formatTime,
    handlePauseWorkout,
    setStartTime,
    setPausedTime,
    setElapsedTime,
  } = timer;

  // Recovery hook - uses timer setters
  const { recoveryState } = useWorkoutRecovery({
    recovery,
    setStartTime,
    setPausedTime,
    setElapsedTime,
  });

  // Quick workout hook
  const { isQuickWorkout, quickWorkoutName, updateQuickWorkoutName } = useQuickWorkout({
    workoutId: workoutId || '',
    setWorkoutName,
    recoveredWorkoutName: recoveryState?.workoutName,
  });

  // Hidden workout state hook
  const { hideCurrentWorkout } = useHiddenWorkoutState();

  // Simple workout persistence
  const { saveNow } = useSimpleWorkoutPersistence(
    workoutId || '',
    workoutName || quickWorkoutName,
    _startTime,
    elapsedTime,
    _pausedTime,
    isWorkoutPaused,
    exercisesWithDetails,
    true
  );

  // Safe navigation callback
  const safeNavigateBack = () => {
    setStopwatchModalVisible(false);

    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(app)/(tabs)/home');
      }
    } catch {
      setTimeout(() => {
        router.replace('/(app)/(tabs)/home');
      }, 100);
    }
  };

  // Workout controls hook
  const { handleAbandonWorkout, handlePauseWorkoutWithSave, handleHideWorkout } =
    useActiveWorkoutControls({
      handlePauseWorkout,
      saveWorkout,
      hideCurrentWorkout,
      saveNow,
      safeNavigateBack,
    });

  // Workout completion hook
  const {
    finishWorkoutFlow,
    setShowCompletionModal: _setShowCompletionModal,
    isSaving,
  } = useWorkoutCompletion({
    workout: workoutData.workout,
    workoutId: workoutId || '',
    isQuickWorkout,
    quickWorkoutName,
    exercisesWithDetails,
    elapsedTime,
    hasChanges: workoutData.hasChanges,
    handleFinishWorkout,
    saveWorkout,
    setWorkoutName,
    sendFinishWorkoutToWatch: undefined,
    sendDiscardWorkoutToWatch: undefined,
    safeNavigateBack,
  });

  // Modal interactions hook
  const { handleReplaceExercise, handleOpenReorderModal, isModalInteractionInProgressRef } =
    useActiveWorkoutModals({
      workoutId,
      isQuickWorkout,
      displayWorkoutName: isQuickWorkout ? quickWorkoutName : workoutName,
      exercisesWithDetails,
      reorderRegularWorkoutExercises: workoutData.reorderRegularWorkoutExercises,
      reorderQuickWorkoutExercises: workoutData.reorderQuickWorkoutExercises,
    });

  const displayWorkoutName = isQuickWorkout ? quickWorkoutName : workoutName;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setStopwatchModalVisible(false);
      isModalInteractionInProgressRef.current = false;
      dismissAllRestTimerNotifications();
    };
  }, [isModalInteractionInProgressRef]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <Screen
        style={{ backgroundColor: colors.background }}
        scrollable={false}
        withTabBarPadding={false}
        testID="screen-active-workout">
        {/* Fixed Header Content */}
        {!workoutData.isAddingExercises && (
          <View>
            {/* Controls Bar */}
            <WorkoutHeaderControls
              elapsedTime={elapsedTime}
              isWorkoutPaused={isWorkoutPaused}
              formatTime={formatTime}
              onPauseWorkout={handlePauseWorkoutWithSave}
              onFinishWorkout={() => finishWorkoutFlow(false)}
              onHideWorkout={handleHideWorkout}
              hasWorkouts={hasWorkouts}
            />

            {/* Animated Workout Title Section */}
            <AnimatedWorkoutTitle
              scrollY={scrollY}
              isQuickWorkout={isQuickWorkout}
              displayWorkoutName={displayWorkoutName}
              quickWorkoutName={quickWorkoutName}
              exercisesCount={exercisesWithDetails.length}
              onChangeWorkoutName={isQuickWorkout ? updateQuickWorkoutName : setWorkoutName}
              onOpenReorderModal={handleOpenReorderModal}
              onOpenStopwatchModal={() => setStopwatchModalVisible(true)}
              onOpenMuscleHeatmap={() => setShowMuscleHeatmap(true)}
              restTimerState={restTimerState}
            />
          </View>
        )}

        {/* Main Exercise Content */}
        <ExerciseManager
          exercisesWithDetails={exercisesWithDetails}
          filteredExercises={workoutData.filteredExercises}
          isAddingExercises={workoutData.isAddingExercises}
          searchQuery={workoutData.searchQuery}
          workoutId={workoutId}
          onChangeSearchQuery={workoutData.setSearchQuery}
          onClearSearch={() => workoutData.setSearchQuery('')}
          onToggleAddExercises={() => {
            isModalInteractionInProgressRef.current = true;
            workoutData.toggleAddExercises();
          }}
          cancelExerciseSelection={workoutData.cancelExerciseSelection}
          applyExerciseSelection={workoutData.applyExerciseSelection}
          onAddExercise={workoutData.addExerciseToWorkout}
          onCreateCustomExercise={workoutData.createCustomExercise}
          onRemoveExercise={workoutData.removeExercise}
          onUpdateRestTime={workoutData.updateRestTime}
          onUpdateNextExerciseRest={workoutData.updateNextExerciseRest}
          onToggleRest={workoutData.toggleRest}
          onAddSet={workoutData.addSetToExercise}
          onRemoveSet={workoutData.removeSetFromExercise}
          onUpdateSetData={workoutData.updateSetData}
          onUpdateExerciseNote={workoutData.updateExerciseNote}
          onReplaceExercise={handleReplaceExercise}
          onToggleSetCompletion={workoutData.toggleSetCompletion}
          onShowReorderModal={exercisesWithDetails.length > 1 ? handleOpenReorderModal : undefined}
          onPropagateSetRest={workoutData.propagateSetRest}
          onPropagateNextRest={workoutData.propagateNextRest}
          recalculatePRsAfterSetRemoval={workoutData.recalculatePRsAfterSetRemoval}
          onExposeHandleSetCompletion={(handler) => {
            handleSetCompletionRef.current = handler;
          }}
          onRestTimerStateChange={(newState) => {
            setRestTimerState((prevState: any) => {
              if (
                prevState?.active === newState.active &&
                prevState?.seconds === newState.seconds &&
                prevState?.type === newState.type
              ) {
                return prevState;
              }
              return newState;
            });
          }}
          onAbandonWorkout={handleAbandonWorkout}
        />

        {/* Stopwatch Modal */}
        <StopwatchModal
          visible={stopwatchModalVisible}
          onClose={() => setStopwatchModalVisible(false)}
        />

        {/* Muscle Heatmap Modal */}
        <WorkoutMuscleHeatmapModal
          visible={showMuscleHeatmap}
          onClose={() => setShowMuscleHeatmap(false)}
          exercises={exercisesWithDetails}
          workoutName={displayWorkoutName}
          isActiveWorkout={true}
        />

        {/* Saving Workout Overlay */}
        <SavingWorkoutOverlay visible={isSaving} testID="saving-workout-overlay" />
      </Screen>
    </>
  );
}
