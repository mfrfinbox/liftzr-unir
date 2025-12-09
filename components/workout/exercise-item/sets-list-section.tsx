import React from 'react';

import { View } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { SetRow } from '~/components/workout/set-row';
import { WORKOUT_FIELDS } from '~/lib/constants';
import { EXERCISE_HEADER_STYLE } from '~/lib/constants/ui';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';
import type { Exercise } from '~/types';

interface SetsListSectionProps {
  item: {
    details: Exercise;
    setsData?: {
      reps: string;
      weight: string;
      time?: string;
      distance?: string;
      completed?: boolean;
    }[];
    sets?: number | any[];
    reps?: string;
  };
  index: number;
  isActiveWorkout: boolean;
  isDistanceExercise: boolean;
  onUpdateSetData: (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight' | 'time' | 'distance',
    value: string
  ) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onToggleSetCompletion?: (exerciseIndex: number, setIndex: number) => void;
  handleSetCompletionFromManager?: (exerciseIndex: number, setIndex: number) => void;
  handleSetCompletion: (exerciseIndex: number, setIndex: number, fromToggle: boolean) => void;
  onAddSet: () => void;
  previousPerformance?: any;
}

export function SetsListSection({
  item,
  index,
  isActiveWorkout,
  isDistanceExercise,
  onUpdateSetData,
  onRemoveSet,
  onToggleSetCompletion,
  handleSetCompletionFromManager,
  handleSetCompletion,
  onAddSet,
  previousPerformance,
}: SetsListSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { unit } = useMeasurement();

  return (
    <View className="mb-3">
      <View className={EXERCISE_HEADER_STYLE}>
        <View style={{ width: 22 }} />
        <View className="w-12 items-center justify-center">
          <Text className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {t('workout.set')}
          </Text>
        </View>

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

        {isActiveWorkout && (
          <>
            <View style={{ width: 32, marginRight: 8 }} />
            <View style={{ width: 32 }} />
          </>
        )}
      </View>

      {item.setsData
        ? item.setsData.map((set, setIndex) => (
            <SetRow
              key={`set-${setIndex}`}
              exerciseIndex={index}
              setIndex={setIndex}
              setData={set}
              exerciseType={item.details.type}
              isDurationBased={isDistanceExercise}
              onUpdateSetData={onUpdateSetData}
              onRemoveSet={onRemoveSet}
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
        : Array(typeof item.sets === 'number' ? item.sets : item.sets?.length || 1)
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
                  onUpdateSetData={onUpdateSetData}
                  onRemoveSet={onRemoveSet}
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

      <Button
        className="mt-3 flex-row items-center justify-center rounded-md border border-dashed border-muted-foreground/20 bg-transparent py-3"
        onPress={onAddSet}
        testID={`add-set-button-${index}`}
        accessible={true}
        accessibilityLabel={`Add set to ${item.details.name}`}
        accessibilityHint={
          previousPerformance?.lastSets?.length > 0
            ? 'Will pre-fill from previous workout'
            : 'Add new empty set'
        }>
        <Plus size={20} color={colors.text + '80'} />
        <Text
          className="ml-2 text-sm font-medium text-muted-foreground"
          testID={`add-set-text-${index}`}>
          {t('workout.addSet')}
        </Text>
      </Button>
    </View>
  );
}
