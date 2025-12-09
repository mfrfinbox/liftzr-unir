/**
 * Workout Details Screen
 * View and edit workout templates
 */

import { useEffect, useState, useRef } from 'react';

import { View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { Screen } from '~/components/layout/screen';
import { WorkoutMuscleHeatmapModal } from '~/components/sheets/workout-muscle-heatmap-modal';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ExerciseManager } from '~/components/workout/exercise-manager';
import { WorkoutHeader } from '~/components/workout/workout-header';
import { useModalManagement } from '~/components/workout-details/use-modal-management';
import { useSortMethod } from '~/components/workout-details/use-sort-method';
import {
  createDeleteWorkoutHandler,
  createStartWorkoutHandler,
} from '~/components/workout-details/workout-actions';
import { useDeleteWorkout } from '~/hooks/data';
import { useActiveWorkoutGuards } from '~/hooks/workout/use-active-workout-guards';
import { useWorkoutData } from '~/hooks/workout/use-workout-data';
import { TIMEOUTS } from '~/lib/constants';

export default function WorkoutDetailsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { created } = useLocalSearchParams<{
    created?: string;
  }>();
  const [showCreatedToast, setShowCreatedToast] = useState(false);
  const createdToastShownRef = useRef(false);

  // Add a refresh key to force re-rendering when needed
  const [refreshKey, setRefreshKey] = useState(0);

  // To track modal interaction state
  const isModalInteractionInProgress = useRef(false);
  const hasProcessedModalResult = useRef(false);

  // Muscle heatmap modal state
  const [showMuscleHeatmap, setShowMuscleHeatmap] = useState(false);

  // Check if this is a newly created workout - only set once
  useEffect(() => {
    if (created === 'true' && !createdToastShownRef.current) {
      setShowCreatedToast(true);
      createdToastShownRef.current = true;

      // Reset the showCreatedToast flag after a delay to prevent it from showing again
      const timer = setTimeout(() => {
        setShowCreatedToast(false);
      }, TIMEOUTS.TOAST_DISPLAY);

      return () => clearTimeout(timer);
    }
  }, [created]);

  // Pass refresh key to force re-initialization when needed
  const workoutData = useWorkoutData(refreshKey);
  const {
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
    addSetToExercise,
    removeSetFromExercise,
    updateSetData,
    updateExerciseNote,
    toggleAddExercises,
    cancelExerciseSelection,
    applyExerciseSelection,
    addExerciseToWorkout,
    createCustomExercise,
    removeExercise,
    updateRestTime,
    toggleRest,
    handleEndEditingName,
    updateNextExerciseRest,
    propagateSetRest,
    propagateNextRest,
    reorderRegularWorkoutExercises,
    refreshWorkoutData,
  } = workoutData;

  // Active workout guards
  const { confirmStartNewWorkout } = useActiveWorkoutGuards();

  // Delete workout hook
  const { deleteWorkout } = useDeleteWorkout();

  // Sort method management hook
  const { inheritSortMethodAndStartWorkout, saveSortMethod, handleSortMethodChange } =
    useSortMethod({ workout, hasChanges });

  // Modal management hook
  const { handleOpenReorderModal, handleReplaceExercise, isDatabaseLoaded } = useModalManagement({
    exercisesWithDetails,
    workout,
    workoutName,
    isModalInteractionInProgress,
    hasProcessedModalResult,
    reorderRegularWorkoutExercises,
    refreshWorkoutData,
    setRefreshKey,
  });

  // Action handlers
  const handleDeleteWorkout = createDeleteWorkoutHandler(
    workout,
    workoutName,
    deleteWorkout,
    router,
    t
  );

  const handleStartWorkout = createStartWorkoutHandler(
    workout,
    confirmStartNewWorkout,
    inheritSortMethodAndStartWorkout,
    router
  );

  if (!workout) {
    return (
      <Screen scrollable={false} withTabBarPadding={false}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Loading workout details...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      style={{ backgroundColor: colors.background }}
      scrollable={false}
      withTabBarPadding={false}
      testID="screen-workout-details">
      {!isAddingExercises && (
        <>
          <WorkoutHeader
            workoutName={workoutName}
            workoutId={workout.id}
            isEditingName={isEditingName}
            hasChanges={hasChanges}
            onEditName={() => setIsEditingName(true)}
            onChangeName={setWorkoutName}
            handleEndEditingName={handleEndEditingName}
            onCancelEditName={() => {
              setIsEditingName(false);
              // Revert to original workout name
              if (workout) {
                setWorkoutName(workout.title);
              }
            }}
            onClose={handleClose}
            onSave={async () => {
              await saveWorkout();
              // Save sort method when workout is saved
              await saveSortMethod();
            }}
            onOpenMuscleHeatmap={
              exercisesWithDetails.length > 0 && isDatabaseLoaded
                ? () => setShowMuscleHeatmap(true)
                : undefined
            }
            onShowReorderModal={
              exercisesWithDetails.length > 1 && isDatabaseLoaded
                ? handleOpenReorderModal
                : undefined
            }
            showCreatedToast={showCreatedToast}
            exercises={exercisesWithDetails}
            onExercisesReordered={reorderRegularWorkoutExercises}
            onSortMethodChange={(method) => {
              handleSortMethodChange(method, true);
            }}
          />

          {/* Start Workout Button */}
          {exercisesWithDetails.length > 0 && (
            <View className="mb-4 mt-4 px-4">
              <Button
                className="rounded-md bg-primary p-3"
                onPress={handleStartWorkout}
                testID="start-workout-button">
                <Text className="font-medium text-white">{t('workout.startWorkout')}</Text>
              </Button>
            </View>
          )}
        </>
      )}

      <ExerciseManager
        exercisesWithDetails={exercisesWithDetails}
        filteredExercises={filteredExercises}
        isAddingExercises={isAddingExercises}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        onToggleAddExercises={() => {
          isModalInteractionInProgress.current = true;
          toggleAddExercises();
        }}
        cancelExerciseSelection={cancelExerciseSelection}
        applyExerciseSelection={applyExerciseSelection}
        onAddExercise={addExerciseToWorkout}
        onCreateCustomExercise={createCustomExercise}
        onRemoveExercise={removeExercise}
        onUpdateRestTime={updateRestTime}
        onUpdateNextExerciseRest={updateNextExerciseRest}
        onToggleRest={toggleRest}
        onAddSet={addSetToExercise}
        onRemoveSet={removeSetFromExercise}
        onUpdateSetData={updateSetData}
        onUpdateExerciseNote={updateExerciseNote}
        onReplaceExercise={handleReplaceExercise}
        onPropagateSetRest={propagateSetRest}
        onPropagateNextRest={propagateNextRest}
        onDeleteWorkout={handleDeleteWorkout}
        isReadOnly={false}
      />

      {/* Muscle Heatmap Modal */}
      <WorkoutMuscleHeatmapModal
        visible={showMuscleHeatmap}
        onClose={() => setShowMuscleHeatmap(false)}
        exercises={exercisesWithDetails}
        workoutName={workoutName}
      />
    </Screen>
  );
}
