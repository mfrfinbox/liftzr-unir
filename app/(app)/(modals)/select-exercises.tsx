import { useState, useCallback, useEffect, useMemo } from 'react';

import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '~/components/layout/screen';
import { KeyboardAwareWrapper } from '~/components/ui/keyboard-aware-wrapper';
import { Text } from '~/components/ui/text';
import { ExerciseSelectionList } from '~/components/workout/exercise-selection-list';
import { useExercises, useAddWorkout } from '~/hooks/data';
import { TIMEOUTS } from '~/lib/constants';
import { useDefaultRest } from '~/lib/contexts/DefaultRestContext';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import { Exercise, WorkoutExercise } from '~/types';

export default function SelectExercisesModal() {
  const router = useRouter();
  const navigation = useNavigation();
  const { workoutName } = useLocalSearchParams<{
    workoutName: string;
    flow?: 'create' | 'edit';
  }>();
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const { defaultRestTimes } = useDefaultRest();

  // Legend State hooks
  const { exercises: allExercises, isLoading: exercisesLoading, addExercise } = useExercises();
  const { addWorkout } = useAddWorkout();

  const [selectedExercisesMap, setSelectedExercisesMap] = useState<Record<string, WorkoutExercise>>(
    {}
  );

  // Add loading state for save operations
  const [isSaving, setIsSaving] = useState(false);

  // Memoize the set of selected IDs for the list component
  const selectedExerciseIds = useMemo(() => {
    return new Set(Object.keys(selectedExercisesMap));
  }, [selectedExercisesMap]);

  // Calculate canApply before it's needed in callbacks
  const canApply = useMemo(
    () => Object.keys(selectedExercisesMap).length > 0,
    [selectedExercisesMap]
  );

  const handleToggleExercise = (exercise: Exercise) => {
    setSelectedExercisesMap((prev) => {
      const newSelected = { ...prev };

      if (newSelected[exercise.id]) {
        delete newSelected[exercise.id];
      } else {
        // Otherwise add it with new default settings
        newSelected[exercise.id] = {
          id: exercise.id,
          sets: 1, // Default to 1 set instead of 3
          reps: '', // No default reps - user must enter manually
          rest: defaultRestTimes.setRest, // Use default rest time from settings
          nextExerciseRest: defaultRestTimes.exerciseRest, // Use default exercise rest time from settings
          setsData: [{ reps: '', weight: '' }], // Just one set with empty values
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
    if (!canApply) return; // Prevent saving with no exercises

    if (!workoutName) {
      return;
    }

    // Set saving state to true to show UI feedback
    setIsSaving(true);

    // Add timeout to prevent infinite waiting
    const timeoutId = setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Error', 'Workout save timed out. Please try again.');
    }, TIMEOUTS.EXERCISE_LOADING); // 30 second timeout

    try {
      // Create the workout with exercises directly
      const result = await addWorkout({
        title: workoutName,
        exercises: Object.values(selectedExercisesMap),
        description: '',
        created: new Date().toISOString(),
      });

      clearTimeout(timeoutId); // Clear timeout if successful

      if (result.success && result.workoutId) {
        // Skip immediate exercise sync - let it happen naturally through the sync process
        // The workout is already saved with exercises in Legend-State
        // Navigate to workout details
        router.dismissAll();
        router.push({
          pathname: '/(app)/(stacks)/workout-details',
          params: {
            workoutId: result.workoutId,
            workoutName: workoutName,
            created: 'true',
          },
        });
      } else if (result.error === 'limit_reached') {
        // This error should not occur in offline-first mode
        // Legacy error handling - will be repurposed for trial mode in Phase 4
        Alert.alert('Error', 'Failed to create workout. Please try again.');
      } else {
        // Show error to user in a more visible way
        Alert.alert('Error', 'Failed to create workout. Please try again.');
      }
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      // Always reset saving state and clear timeout, even if there was an error
      clearTimeout(timeoutId);
      setIsSaving(false);
    }
  }, [workoutName, selectedExercisesMap, router, canApply, addWorkout]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Hide native header to avoid iOS 18 glass effect
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // CRITICAL: Handle loading and error states AFTER all hooks are called
  if (exercisesLoading) {
    return (
      <>
        <KeyboardAwareWrapper>
          <Screen
            scrollable={false}
            withTabBarPadding={false}
            style={{ paddingTop: 0 }}
            testID="modal-select-exercises">
            <View className="flex-1 items-center justify-center">
              <Text className="text-muted-foreground">{t('common.loading')}</Text>
            </View>
          </Screen>
        </KeyboardAwareWrapper>
      </>
    );
  }

  if (exercisesLoading) {
    return (
      <>
        <KeyboardAwareWrapper>
          <Screen
            scrollable={false}
            withTabBarPadding={false}
            style={{ paddingTop: 0 }}
            testID="modal-select-exercises">
            {/* Custom header to avoid iOS 18 glass effect */}
            <View className="flex-row items-center justify-between px-4 py-3">
              <TouchableOpacity
                onPress={handleClose}
                testID="button-cancel-select-exercises"
                accessible={true}
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button">
                <Text className="text-base text-primary">{t('common.cancel')}</Text>
              </TouchableOpacity>

              <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
                {workoutName || t('screens.selectExercises')}
              </Text>

              <View style={{ width: 60 }} />
            </View>

            <View className="flex-1 items-center justify-center">
              <Text className="text-destructive">{t('common.loading')}</Text>
            </View>
          </Screen>
        </KeyboardAwareWrapper>
      </>
    );
  }

  return (
    <>
      <KeyboardAwareWrapper>
        <Screen
          scrollable={false}
          withTabBarPadding={false}
          style={{ paddingTop: 0 }}
          testID="modal-select-exercises">
          {/* Custom header to avoid iOS 18 glass effect */}
          <View className="flex-row items-center justify-between px-4 py-3">
            <TouchableOpacity
              onPress={handleClose}
              testID="button-cancel-select-exercises"
              accessible={true}
              accessibilityLabel={t('common.cancel')}
              accessibilityRole="button">
              <Text className="text-base text-primary">{t('common.cancel')}</Text>
            </TouchableOpacity>

            <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
              {workoutName || t('screens.selectExercises')}
            </Text>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!canApply || isSaving}
              testID="button-apply-exercises">
              {isSaving ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text
                  className={`text-base ${canApply ? 'text-primary' : 'text-muted-foreground'}`}>
                  {t('common.save')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Use the shared list component for exercise selection UI. */}
          {/* This modal handles the 'create new workout' flow. */}
          {/* Apply/Cancel logic and navigation are specific to this modal context. */}
          <ExerciseSelectionList
            allExercises={allExercises}
            selectedExerciseIds={selectedExerciseIds}
            onToggleExercise={handleToggleExercise}
            onCreateCustomExercise={handleCreateCustomExercise}
          />
        </Screen>
      </KeyboardAwareWrapper>
    </>
  );
}
