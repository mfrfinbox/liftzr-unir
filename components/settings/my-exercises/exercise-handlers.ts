/**
 * Exercise Handlers
 * Handler functions for CRUD operations on custom exercises
 */

import { Alert } from 'react-native';

import type { Exercise } from '~/types';

import type { ExerciseWithIds } from './types';
import type { TFunction } from 'i18next';

/**
 * Create edit handler
 */
export function createEditHandler(
  setEditingExercise: (exercise: ExerciseWithIds) => void,
  setShowMyExercises: (show: boolean) => void
) {
  return (exercise: ExerciseWithIds) => {
    // Map the exercise data to include the IDs for the CustomExerciseCreator
    const exerciseWithIds = {
      ...exercise,
      primaryMuscleGroupId: exercise.primaryMuscleGroupId || exercise.primaryMuscleGroup || '',
      secondaryMuscleGroupIds:
        exercise.secondaryMuscleGroupIds || exercise.secondaryMuscleGroups || [],
    };
    setEditingExercise(exerciseWithIds);
    // Close the list modal to avoid modal stacking issues
    setShowMyExercises(false);
  };
}

/**
 * Create delete handler
 */
export function createDeleteHandler(deleteExercise: (id: string) => Promise<any>, t: TFunction) {
  return async (exercise: ExerciseWithIds) => {
    Alert.alert(
      t('settings.myExercises.deleteExerciseTitle'),
      t('settings.myExercises.deleteExerciseMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteExercise(exercise.id);
            if (result.success) {
              // Exercise deleted successfully
            } else {
              // Failed to delete exercise
            }
          },
        },
      ]
    );
  };
}

/**
 * Create create exercise handler
 */
export function createCreateExerciseHandler(
  addExercise: (exerciseData: Omit<Exercise, 'id'>) => Promise<any>,
  setShowCreateExercise: (show: boolean) => void,
  setShowMyExercises: (show: boolean) => void,
  t: TFunction
) {
  const handleCreateExercise = async (exerciseData: Omit<Exercise, 'id'>) => {
    const result = await addExercise(exerciseData);

    if (result.success) {
      // Exercise created successfully
      setShowCreateExercise(false);
      // Re-open the list modal after successful creation
      setShowMyExercises(true);
    } else {
      // Failed to create exercise
      Alert.alert(
        t('settings.myExercises.creationFailedTitle'),
        result.error || t('settings.myExercises.creationFailedMessage')
      );
    }
  };

  return handleCreateExercise;
}

/**
 * Create update exercise handler
 */
export function createUpdateExerciseHandler(
  updateExercise: (exerciseData: {
    id: string;
    name: string;
    type: 'reps' | 'time' | 'distance';
    primaryMuscleGroup: string;
    secondaryMuscleGroups: string[];
  }) => Promise<any>,
  setEditingExercise: (exercise: ExerciseWithIds | null) => void,
  setShowMyExercises: (show: boolean) => void,
  t: TFunction
) {
  return async (exerciseData: {
    id: string;
    name: string;
    type: 'reps' | 'time' | 'distance';
    primaryMuscleGroup: string;
    secondaryMuscleGroups: string[];
  }) => {
    const result = await updateExercise(exerciseData);

    if (result.success) {
      // Exercise updated successfully
      setEditingExercise(null);
      // Re-open the list modal after successful update
      setShowMyExercises(true);
    } else {
      // Failed to update exercise
      Alert.alert(
        t('settings.myExercises.updateFailedTitle'),
        result.error || t('settings.myExercises.updateFailedMessage')
      );
    }
  };
}
