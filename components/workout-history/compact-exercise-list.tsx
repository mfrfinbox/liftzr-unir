/**
 * Compact Exercise List Component
 * Displays condensed exercise summary in compact view mode
 */

import React from 'react';

import { View } from 'react-native';

import { Text } from '~/components/ui/text';
import type { WorkoutHistoryExercise } from '~/types';

interface CompactExerciseListProps {
  exercises: WorkoutHistoryExercise[];
  getExerciseName: (exerciseId: string) => string;
  workoutIndex: number;
}

export function CompactExerciseList({
  exercises,
  getExerciseName,
  workoutIndex,
}: CompactExerciseListProps) {
  if (exercises.length === 0) return null;

  return (
    <View className="mb-3" testID={`workout-${workoutIndex}-exercise-list`}>
      {exercises.map((exercise, exerciseIndex) => (
        <View
          key={`${exercise.exerciseId}-${exerciseIndex}`}
          className="mb-2"
          testID={`workout-${workoutIndex}-compact-exercise-${exerciseIndex}`}>
          <View className="flex-row items-center justify-between">
            <Text
              className="text-base font-medium text-foreground"
              testID={`workout-${workoutIndex}-exercise-${exerciseIndex}-name`}>
              {getExerciseName(exercise.exerciseId)}
            </Text>
            <Text
              className="text-sm text-muted-foreground"
              testID={`workout-${workoutIndex}-exercise-${exerciseIndex}-sets`}>
              {exercise.sets.length} sets
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
