import React from 'react';

import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { WORKOUT_FIELDS } from '~/lib/constants';
import { EXERCISE_HEADER_STYLE } from '~/lib/constants/ui';

import { SetRow } from '../set-row';

import type { ExerciseItemProps } from './types';

interface SetListProps {
  item: ExerciseItemProps['item'];
  index: number;
  unit: string;
  isActiveWorkout: boolean;
  isDistanceExercise: boolean;
  onUpdateSetData: ExerciseItemProps['onUpdateSetData'];
  onRemoveSet: ExerciseItemProps['onRemoveSet'];
  onToggleSetCompletion?: ExerciseItemProps['onToggleSetCompletion'];
  handleSetCompletionFromManager?: ExerciseItemProps['handleSetCompletion'];
  handleSetCompletion: (exerciseIndex: number, setIndex: number, isCompleting: boolean) => void;
}

export function SetList({
  item,
  index,
  unit,
  isActiveWorkout,
  isDistanceExercise,
  onUpdateSetData,
  onRemoveSet,
  onToggleSetCompletion,
  handleSetCompletionFromManager,
  handleSetCompletion,
}: SetListProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-3">
      {/* Header */}
      <View className={EXERCISE_HEADER_STYLE}>
        {/* Space for remove button */}
        <View style={{ width: 22 }} />

        {/* Set number column */}
        <View className="w-12 items-center justify-center">
          <Text className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {t('workout.set')}
          </Text>
        </View>

        {/* Input columns */}
        {isDistanceExercise ? (
          <>
            <View className="flex-1 items-center justify-center px-1.5">
              <Text className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {t('workout.distance')}
              </Text>
              <Text className="text-[10px] uppercase text-muted-foreground">
                ({t('workout.km')})
              </Text>
            </View>
            <View className="flex-1 items-center justify-center px-1.5">
              <Text className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {t('workout.time')}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View className="flex-1 items-center justify-center px-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {item.details.type === WORKOUT_FIELDS.TIME ? t('workout.time') : t('workout.reps')}
              </Text>
            </View>
            {item.details.type !== WORKOUT_FIELDS.TIME &&
              item.details.type !== WORKOUT_FIELDS.DISTANCE && (
                <View className="flex-1 items-center justify-center px-2">
                  <Text className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    {t('workout.weight')}{' '}
                    <Text className="text-[10px]">({unit.toUpperCase()})</Text>
                  </Text>
                </View>
              )}
          </>
        )}

        {/* Space for repeat button and checkbox in active workout */}
        {isActiveWorkout && (
          <>
            <View style={{ width: 32, marginRight: 8 }} />
            <View style={{ width: 32 }} />
          </>
        )}
      </View>

      {/* Set rows */}
      {item.setsData
        ? item.setsData.map((set, setIndex) => (
            <SetRow
              key={`set-${setIndex}`}
              exerciseIndex={index}
              setIndex={setIndex}
              setData={set}
              exerciseType={item.details.type}
              isDurationBased={isDistanceExercise}
              onUpdateSetData={onUpdateSetData || (() => {})}
              onRemoveSet={onRemoveSet || (() => {})}
              onToggleSetCompletion={
                isActiveWorkout
                  ? (exerciseIndex, setIndex) => {
                      if (handleSetCompletionFromManager) {
                        handleSetCompletionFromManager(exerciseIndex, setIndex);
                      } else {
                        onToggleSetCompletion?.(exerciseIndex, setIndex);
                        if (!set.completed) {
                          handleSetCompletion(exerciseIndex, setIndex, true);
                        }
                      }
                    }
                  : undefined
              }
              showRemoveButton={true}
              isOddIndex={setIndex % 2 === 1}
            />
          ))
        : Array(item.sets || 1)
            .fill(0)
            .map((_, setIndex: number) => {
              const safeReps = (() => {
                const repsValue = item.reps || '';
                if (repsValue.includes && repsValue.includes('-')) {
                  return repsValue.split('-')[0] || '';
                }
                return repsValue;
              })();

              return (
                <SetRow
                  key={`set-${setIndex}`}
                  exerciseIndex={index}
                  setIndex={setIndex}
                  setData={{ reps: safeReps, weight: '', time: '', distance: '' }}
                  exerciseType={item.details.type}
                  isDurationBased={isDistanceExercise}
                  onUpdateSetData={onUpdateSetData || (() => {})}
                  onRemoveSet={onRemoveSet || (() => {})}
                  onToggleSetCompletion={
                    isActiveWorkout
                      ? (exerciseIndex, setIndex) => {
                          if (handleSetCompletionFromManager) {
                            handleSetCompletionFromManager(exerciseIndex, setIndex);
                          } else {
                            onToggleSetCompletion?.(exerciseIndex, setIndex);
                            handleSetCompletion(exerciseIndex, setIndex, true);
                          }
                        }
                      : undefined
                  }
                  showRemoveButton={true}
                  isOddIndex={setIndex % 2 === 1}
                />
              );
            })}
    </View>
  );
}
