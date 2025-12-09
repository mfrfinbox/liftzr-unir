import React, { useState, useCallback, useEffect, useMemo } from 'react';

import { View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '~/components/layout/screen';
import { KeyboardAwareWrapper } from '~/components/ui/keyboard-aware-wrapper';
import { Text } from '~/components/ui/text';
import { ExerciseSelectionList } from '~/components/workout/exercise-selection-list';
import { useExercises } from '~/hooks/data';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import type { Exercise, WorkoutExercise } from '~/types';

// Global result storage similar to reorder modal
interface AddExercisesResult {
  exercisesToAdd: Exercise[];
  exercisesToRemove: string[]; // exercise IDs to remove
}

let addExercisesResult: AddExercisesResult | null = null;

export function getAddExercisesResult(): AddExercisesResult | null {
  const result = addExercisesResult;
  addExercisesResult = null; // Clear after reading
  return result;
}

export default function AddExercisesToWorkoutModal() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  // Get exercises that were already selected (passed as a JSON string parameter)
  const { selectedExercises: selectedExercisesParam } = useLocalSearchParams<{
    selectedExercises?: string;
  }>();

  // Legend State hooks
  const { exercises: allExercises, isLoading: exercisesLoading, addExercise } = useExercises();

  // Parse the initially selected exercises
  const initialSelectedExercises = useMemo(() => {
    if (!selectedExercisesParam) return {};
    try {
      return JSON.parse(selectedExercisesParam) as Record<string, WorkoutExercise>;
    } catch (_error) {
      return {};
    }
  }, [selectedExercisesParam]);

  const [selectedExercisesMap, setSelectedExercisesMap] =
    useState<Record<string, WorkoutExercise>>(initialSelectedExercises);

  // Add loading state for save operations
  const [isSaving, setIsSaving] = useState(false);

  // Memoize the set of selected IDs for the list component
  const selectedExerciseIds = useMemo(() => {
    return new Set(Object.keys(selectedExercisesMap));
  }, [selectedExercisesMap]);

  // Calculate canApply before it's needed in callbacks
  const canApply = useMemo(() => {
    // We can apply if there are selected exercises different from the initial selection
    const currentIds = Object.keys(selectedExercisesMap).sort();
    const initialIds = Object.keys(initialSelectedExercises).sort();
    return JSON.stringify(currentIds) !== JSON.stringify(initialIds);
  }, [selectedExercisesMap, initialSelectedExercises]);

  const handleToggleExercise = (exercise: Exercise) => {
    setSelectedExercisesMap((prev) => {
      const newSelected = { ...prev };

      if (newSelected[exercise.id]) {
        delete newSelected[exercise.id];
      } else {
        // Add it with minimal default settings for adding to existing workout
        newSelected[exercise.id] = {
          id: exercise.id,
          sets: 1,
          reps: '',
          rest: 60, // Default 60 seconds rest
          nextExerciseRest: 0, // No rest between exercises by default
          setsData: [{ reps: '', weight: '' }],
          exerciseNotes: '',
          orderIndex: Object.keys(newSelected).length,
          // For new additions, workoutExerciseId will be generated later
          workoutExerciseId: undefined,
        };
      }
      return newSelected;
    });
  };

  const handleCreateCustomExercise = useCallback(
    async (exerciseData: Omit<Exercise, 'id'>) => {
      try {
        // Create the custom exercise
        const result = await addExercise(exerciseData);

        if (result.success) {
          // Exercise created successfully - no need to show anything
          // The UI will automatically update via Legend State
          return;
        }

        if (result.error === 'limit_reached') {
          // This error should not occur in offline-first mode
          // Legacy error handling - will be repurposed for trial mode in Phase 4
          Alert.alert('Error', 'Failed to create exercise. Please try again.');
        } else if (result.error) {
          // Handle other errors
          Alert.alert('Error', result.error || 'Failed to create exercise. Please try again.');
        }
      } catch (_error) {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    },
    [addExercise]
  );

  const handleSave = useCallback(async () => {
    if (!canApply) return;

    setIsSaving(true);

    try {
      // Calculate which exercises to add and which to remove
      const currentSelectedIds = Object.keys(selectedExercisesMap);
      const initialSelectedIds = Object.keys(initialSelectedExercises);

      const exercisesToAdd = currentSelectedIds.filter((id) => !initialSelectedIds.includes(id));
      const exercisesToRemove = initialSelectedIds.filter((id) => !currentSelectedIds.includes(id));

      // Store the result with both additions and removals
      addExercisesResult = {
        exercisesToAdd: exercisesToAdd
          .map((exerciseId) => allExercises.find((ex) => ex.id === exerciseId))
          .filter(Boolean) as Exercise[],
        exercisesToRemove: exercisesToRemove.map((exerciseId) => {
          // Return the workoutExerciseId for removal (the ID used in the workout)
          const initialExercise = initialSelectedExercises[exerciseId];
          return initialExercise?.workoutExerciseId || exerciseId;
        }),
      };

      // Debug logging removed after fixing the issue

      // Navigate back
      router.back();
    } catch (_error) {
    } finally {
      setIsSaving(false);
    }
  }, [selectedExercisesMap, router, canApply, allExercises, initialSelectedExercises]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Hide native header to avoid iOS 18 glass effect
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Handle loading state
  if (exercisesLoading) {
    return (
      <KeyboardAwareWrapper>
        <Screen
          scrollable={false}
          withTabBarPadding={false}
          style={{ paddingTop: 0 }}
          testID="modal-add-exercises-to-workout">
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">{t('addExercises.loadingExercises')}</Text>
          </View>
        </Screen>
      </KeyboardAwareWrapper>
    );
  }

  return (
    <KeyboardAwareWrapper>
      <Screen
        scrollable={false}
        withTabBarPadding={false}
        style={{ paddingTop: 0 }}
        testID="modal-add-exercises-to-workout">
        {/* Custom header to avoid iOS 18 glass effect */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={handleClose}
            testID="button-cancel-add-exercises"
            accessible={true}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button">
            <Text className="text-base text-primary">{t('common.cancel')}</Text>
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-foreground">{t('addExercises.title')}</Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={!canApply || isSaving}
            testID="button-apply-exercises">
            {isSaving ? (
              <View className="flex flex-row items-center">
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              <Text className={`text-base ${canApply ? 'text-primary' : 'text-muted-foreground'}`}>
                {t('addExercises.apply')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ExerciseSelectionList
          allExercises={allExercises}
          selectedExerciseIds={selectedExerciseIds}
          onToggleExercise={handleToggleExercise}
          onCreateCustomExercise={handleCreateCustomExercise}
        />
      </Screen>
    </KeyboardAwareWrapper>
  );
}
