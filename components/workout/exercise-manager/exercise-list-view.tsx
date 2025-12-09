import React from 'react';

import { View, FlatList, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Text } from '~/components/ui/text';
import type { ExerciseWithDetails } from '~/types';

import { ExerciseItem } from '../exercise-item';

interface ExerciseListViewProps {
  exercisesWithDetails: ExerciseWithDetails[];
  workoutId?: string;
  isActiveWorkout: boolean;
  isReadOnly: boolean;
  flatListRef: React.RefObject<FlatList | null>;
  onRemoveExercise?: (exerciseId: string) => void;
  onUpdateRestTime?: (exerciseIndex: number, change: number) => void;
  onUpdateNextExerciseRest?: (exerciseIndex: number, seconds: number) => void;
  onToggleRest?: (exerciseIndex: number) => void;
  onAddSet?: (exerciseIndex: number) => void;
  onUpdateSetData?: (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight' | 'time' | 'distance',
    value: string
  ) => void;
  onUpdateExerciseNote?: (exerciseIndex: number, note: string) => void;
  onReplaceExercise?: (exerciseIndex: number) => void;
  onToggleSetCompletion?: (exerciseIndex: number, setIndex: number) => void;
  onShowReorderModal?: () => void;
  onToggleAddExercises: () => void;
  onPropagateSetRest?: (restTime: number) => void;
  onPropagateNextRest?: (restTime: number) => void;
  onAbandonWorkout?: () => void;
  onDeleteWorkout?: () => void;
  handleSetRestTimer: (
    exerciseName: string,
    seconds: number,
    exerciseIndex: number,
    setIndex: number
  ) => Promise<void>;
  handleRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  handleSetCompletion: (exerciseIndex: number, setIndex: number) => Promise<void>;
}

export function ExerciseListView({
  exercisesWithDetails,
  workoutId,
  isActiveWorkout,
  isReadOnly,
  flatListRef,
  onRemoveExercise,
  onUpdateRestTime,
  onUpdateNextExerciseRest,
  onToggleRest,
  onAddSet,
  onUpdateSetData,
  onUpdateExerciseNote,
  onReplaceExercise,
  onToggleSetCompletion,
  onShowReorderModal,
  onToggleAddExercises,
  onPropagateSetRest,
  onPropagateNextRest,
  onAbandonWorkout,
  onDeleteWorkout,
  handleSetRestTimer,
  handleRemoveSet,
  handleSetCompletion,
}: ExerciseListViewProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      bottomOffset={85}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
      enabled={true}>
      <FlatList
        ref={flatListRef}
        data={exercisesWithDetails}
        scrollEnabled={false}
        keyboardShouldPersistTaps="always"
        renderItem={({ item, index }) => (
          <ExerciseItem
            item={item}
            index={index}
            workoutId={workoutId}
            onRemoveExercise={onRemoveExercise}
            onUpdateRestTime={onUpdateRestTime}
            onUpdateNextExerciseRest={onUpdateNextExerciseRest}
            onToggleRest={onToggleRest}
            onAddSet={onAddSet}
            onRemoveSet={handleRemoveSet}
            onUpdateSetData={onUpdateSetData}
            onUpdateExerciseNote={onUpdateExerciseNote}
            onReplaceExercise={onReplaceExercise}
            onToggleSetCompletion={onToggleSetCompletion}
            isActiveWorkout={isActiveWorkout}
            onShowReorderModal={onShowReorderModal}
            isLastExercise={index === exercisesWithDetails.length - 1}
            onSetRestTimerStart={handleSetRestTimer}
            onPropagateSetRest={onPropagateSetRest}
            onPropagateNextRest={onPropagateNextRest}
            handleSetCompletion={handleSetCompletion}
          />
        )}
        keyExtractor={(item) => item.workoutExerciseId || item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text className="text-center text-muted-foreground">
              No exercises in this workout yet
            </Text>
          </View>
        }
        ListFooterComponent={
          <View>
            <Pressable
              className={`mt-4 flex-row items-center justify-center rounded-md p-3 ${
                isReadOnly ? 'bg-muted' : 'bg-primary'
              }`}
              onPress={onToggleAddExercises}
              disabled={isReadOnly}
              testID="button-add-exercise"
              accessible={true}
              accessibilityLabel={t('workout.addExercise')}
              accessibilityRole="button">
              <Plus size={20} color={isReadOnly ? colors.text + '60' : 'white'} />
              <Text
                className={isReadOnly ? 'ml-2' : 'ml-2 text-white'}
                style={isReadOnly ? { color: colors.text + '60' } : undefined}>
                {t('workout.addExercise')}
              </Text>
            </Pressable>

            {onAbandonWorkout && (
              <Pressable
                className="mt-3 flex-row items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 p-3"
                onPress={onAbandonWorkout}
                testID="button-discard-workout-bottom">
                <Text className="font-medium text-destructive">{t('workout.discardWorkout')}</Text>
              </Pressable>
            )}

            {onDeleteWorkout && !onAbandonWorkout && (
              <Pressable
                className="mt-3 flex-row items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 p-3"
                onPress={onDeleteWorkout}
                testID="button-delete-workout">
                <Text className="font-medium text-destructive">{t('workout.deleteWorkout')}</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </KeyboardAwareScrollView>
  );
}
