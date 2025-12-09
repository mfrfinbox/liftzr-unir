import React from 'react';

import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { ExerciseHeader } from '~/components/workout/exercise-header';
import { ExerciseNotesSection } from '~/components/workout/exercise-notes-section';
import { ExerciseOptionsMenu } from '~/components/workout/exercise-options-menu';
import { ExerciseSeparator } from '~/components/workout/exercise-separator';
import { RestTimerMenu } from '~/components/workout/rest-timer-menu';
import { SimpleRestTimer } from '~/components/workout/simple-rest-timer';
import { useMenuAnimation } from '~/hooks/workout/use-menu-animation';
import {
  usePreviousPerformance,
  formatPreviousPerformanceCompact,
} from '~/hooks/workout/use-previous-performance';
import { useRestTimer } from '~/hooks/workout/use-rest-timer';
import { useSetCompletion } from '~/hooks/workout/use-set-completion';
import { WORKOUT_FIELDS } from '~/lib/constants';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';

import { ExerciseItemModals } from './exercise-item-modals';
import { createHandlers } from './handlers';
import { PreviousPerformanceDisplay } from './previous-performance-display';
import { SetsListSection } from './sets-list-section';
import { useExerciseItemState } from './use-exercise-item-state';

import type { ExerciseItemProps } from './types';

export function ExerciseItem({
  item,
  index,
  workoutId,
  onRemoveExercise,
  onUpdateRestTime,
  onUpdateNextExerciseRest,
  onAddSet,
  onAddSetWithPreviousPerformance,
  onRemoveSet,
  onUpdateSetData,
  onUpdateExerciseNote,
  onToggleSetCompletion,
  onReplaceExercise,
  isActiveWorkout = !!onToggleSetCompletion,
  onShowReorderModal,
  isLastExercise = false,
  onSetRestTimerStart,
  onPropagateSetRest,
  onPropagateNextRest,
  handleSetCompletion: handleSetCompletionFromManager,
  previousPerformance: providedPreviousPerformance,
}: ExerciseItemProps) {
  const { unit, convertWeight } = useMeasurement();
  const { t } = useTranslation();

  // Get previous performance data
  const fetchedPreviousPerformance = usePreviousPerformance(
    item.details?.id || item.id,
    workoutId,
    item.details?.name || item.name
  );
  const previousPerformance = providedPreviousPerformance || fetchedPreviousPerformance;

  // State management
  const state = useExerciseItemState();

  // Menu animations
  const { fadeAnim, scaleAnim, animateClose } = useMenuAnimation(state.menuVisible);
  const {
    fadeAnim: setRestFadeAnim,
    scaleAnim: setRestScaleAnim,
    animateClose: closeSetRestMenu,
  } = useMenuAnimation(state.restMenuVisible);
  const {
    fadeAnim: nextRestFadeAnim,
    scaleAnim: nextRestScaleAnim,
    animateClose: closeNextRestMenu,
  } = useMenuAnimation(state.nextRestMenuVisible);

  // Rest timer management
  const { restTime, nextRestTime, handleRestTimeChange, handleNextRestTimeChange } = useRestTimer({
    initialRestTime: item.rest || 0,
    initialNextRestTime: item.nextExerciseRest || 0,
    exerciseIndex: index,
    onUpdateRestTime,
    onUpdateNextExerciseRest,
  });

  // Set completion handling
  const { handleSetCompletion } = useSetCompletion({
    item,
    onToggleSetCompletion,
    onSetRestTimerStart,
  });

  // Check if distance-based exercise
  const isDistanceExercise = item.details.type === WORKOUT_FIELDS.DISTANCE;

  // Create handlers
  const handlers = createHandlers({
    item,
    index,
    onRemoveExercise,
    onReplaceExercise,
    onShowReorderModal,
    onAddSet,
    onAddSetWithPreviousPerformance,
    onPropagateSetRest,
    onPropagateNextRest,
    previousPerformance,
    animateClose,
    closeSetRestMenu,
    closeNextRestMenu,
    setMenuVisible: state.setMenuVisible,
    setDetailsModalVisible: state.setDetailsModalVisible,
    setMenuPosition: state.setMenuPosition,
    menuButtonRef: state.menuButtonRef,
  });

  // Format previous performance data
  const previousPerformanceData =
    previousPerformance?.lastSets?.length > 0
      ? formatPreviousPerformanceCompact(
          previousPerformance.lastSets,
          unit as 'kg' | 'lbs',
          convertWeight
        )
      : null;

  return (
    <View className="mb-8" testID={`exercise-${index}`}>
      <ExerciseHeader
        exercise={item.details}
        index={index}
        onOpenDetails={handlers.handleOpenDetailsModal}
        onShowMenu={handlers.showMenu}
        onReplaceExercise={onReplaceExercise ? handlers.handleReplaceExercise : undefined}
        menuButtonRef={state.menuButtonRef}
      />

      {isActiveWorkout && previousPerformanceData && (
        <PreviousPerformanceDisplay
          previousPerformanceData={previousPerformanceData}
          previousPerformance={previousPerformance}
          exerciseName={item.details.name}
          index={index}
          onOpenDetails={handlers.handleOpenDetailsModal}
        />
      )}

      <ExerciseOptionsMenu
        visible={state.menuVisible}
        position={state.menuPosition}
        fadeAnim={fadeAnim}
        scaleAnim={scaleAnim}
        onClose={handlers.closeMenu}
        onDelete={handlers.handleDeletePress}
        onReorder={onShowReorderModal ? handlers.handleReorderPress : undefined}
        showReorderOption={!!onShowReorderModal && !isActiveWorkout}
      />

      <RestTimerMenu
        visible={state.restMenuVisible}
        position={{ top: 0, left: 0 }}
        fadeAnim={setRestFadeAnim}
        scaleAnim={setRestScaleAnim}
        onClose={handlers.handleCloseSetRestMenu}
        onPropagate={handlers.handlePropagateSetRest}
      />

      <RestTimerMenu
        visible={state.nextRestMenuVisible}
        position={{ top: 0, left: 0 }}
        fadeAnim={nextRestFadeAnim}
        scaleAnim={nextRestScaleAnim}
        onClose={handlers.handleCloseNextRestMenu}
        onPropagate={handlers.handlePropagateNextRest}
      />

      <View className="mb-2 px-1">
        <SimpleRestTimer
          restTime={restTime}
          onRestTimeChange={handleRestTimeChange}
          label={t('workout.setRest')}
          icon="time-outline"
        />
      </View>

      <SetsListSection
        item={item}
        index={index}
        isActiveWorkout={isActiveWorkout}
        isDistanceExercise={isDistanceExercise}
        onUpdateSetData={onUpdateSetData || (() => {})}
        onRemoveSet={onRemoveSet || (() => {})}
        onToggleSetCompletion={onToggleSetCompletion}
        handleSetCompletionFromManager={handleSetCompletionFromManager}
        handleSetCompletion={handleSetCompletion}
        onAddSet={handlers.handleAddSet}
        previousPerformance={previousPerformance}
      />

      <ExerciseNotesSection
        notes={item.exerciseNotes || ''}
        onUpdateNotes={(notes) => onUpdateExerciseNote && onUpdateExerciseNote(index, notes)}
      />

      {!isLastExercise && onUpdateNextExerciseRest && (
        <View className="mb-2 mt-3 px-1">
          <SimpleRestTimer
            restTime={nextRestTime}
            onRestTimeChange={handleNextRestTimeChange}
            label={t('workout.restBeforeNext')}
            icon="arrow-forward-circle-outline"
            presets={[60, 120, 180]}
          />
        </View>
      )}

      {!isLastExercise && <ExerciseSeparator />}

      <ExerciseItemModals
        detailsModalVisible={state.detailsModalVisible}
        onCloseDetailsModal={() => state.setDetailsModalVisible(false)}
        exercise={item.details}
      />
    </View>
  );
}

export type { ExerciseItemProps } from './types';
export type { ExerciseWithDetails } from '~/types';
