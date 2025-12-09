/**
 * Exercise Details Component
 * Displays detailed exercise information with sets, reps, and weights
 */

import React from 'react';

import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import type { WorkoutHistoryExercise, WorkoutHistorySet, NumberFormattingConfig } from '~/types';

interface ExerciseDetailsProps {
  exercises: WorkoutHistoryExercise[];
  getExerciseName: (exerciseId: string) => string;
  getExerciseType: (exerciseId: string) => string;
  formatTimeValue: (seconds: number) => string;
  displayWeight: (weight: number) => string;
  unit: string;
  NUMBER_FORMATTING: NumberFormattingConfig;
  workoutIndex: number;
}

export function ExerciseDetails({
  exercises,
  getExerciseName,
  getExerciseType,
  formatTimeValue,
  displayWeight,
  unit,
  NUMBER_FORMATTING,
  workoutIndex,
}: ExerciseDetailsProps) {
  const { t } = useTranslation();

  if (exercises.length === 0) return null;

  return (
    <>
      {exercises.map((exercise, exerciseIndex) => (
        <View
          key={`${exercise.exerciseId}-${exerciseIndex}`}
          className={exerciseIndex > 0 ? 'mt-5 border-t border-border pt-3' : ''}
          testID={`workout-${workoutIndex}-detailed-exercise-${exerciseIndex}`}>
          <Text
            className="mb-3 text-xl font-semibold text-foreground"
            testID={`workout-${workoutIndex}-detailed-exercise-name-${exerciseIndex}`}>
            {getExerciseName(exercise.exerciseId)}
          </Text>

          {(() => {
            const exerciseType = getExerciseType(exercise.exerciseId);
            const isTimeBased = exerciseType === 'time';
            const isDistanceBased = exerciseType === 'distance';

            return (
              <>
                {/* Headers */}
                <View className="mb-2 flex-row">
                  <Text className="w-16 font-medium text-muted-foreground">{t('workout.set')}</Text>
                  {isTimeBased ? (
                    <Text className="flex-1 font-medium text-muted-foreground">{t('workout.time')}</Text>
                  ) : isDistanceBased ? (
                    <>
                      <Text className="flex-1 font-medium text-muted-foreground">{t('workout.distance')}</Text>
                      <Text className="flex-1 font-medium text-muted-foreground">{t('workout.time')}</Text>
                    </>
                  ) : (
                    <>
                      <Text className="w-16 font-medium text-muted-foreground">{t('workout.reps')}</Text>
                      <Text className="w-16 font-medium text-muted-foreground">
                        {unit.toUpperCase()}
                      </Text>
                    </>
                  )}
                </View>

                {/* Sets */}
                {exercise.sets.map((set: WorkoutHistorySet, setIndex: number) => {
                  const timeValue = set.time || set.duration || 0;
                  const distanceValue = set.distance || 0;

                  return (
                    <View key={setIndex} className="mb-2 flex-row items-center">
                      <Text className="w-16 text-foreground">{setIndex + 1}</Text>
                      {isTimeBased ? (
                        <Text className="flex-1 text-foreground">{formatTimeValue(timeValue)}</Text>
                      ) : isDistanceBased ? (
                        <>
                          <Text className="flex-1 text-foreground">
                            {distanceValue
                              ? `${(distanceValue / NUMBER_FORMATTING.DISTANCE_KM_CONVERSION).toFixed(2)} ${unit === 'kg' ? 'km' : 'mi'}`
                              : '-'}
                          </Text>
                          <Text className="flex-1 text-foreground">
                            {formatTimeValue(timeValue)}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text className="w-16 text-foreground">{set.reps}</Text>
                          <Text className="w-16 text-foreground">{displayWeight(set.weight)}</Text>
                        </>
                      )}
                    </View>
                  );
                })}
              </>
            );
          })()}
        </View>
      ))}
    </>
  );
}
