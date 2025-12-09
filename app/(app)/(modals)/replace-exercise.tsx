import React, { useState, useCallback, useEffect, useMemo } from 'react';

import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
} from 'react-native';

import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';

import { Search, XCircle, User, Check, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '~/components/layout/screen';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { KeyboardAwareWrapper } from '~/components/ui/keyboard-aware-wrapper';
import { KeyboardDismissButton } from '~/components/ui/keyboard-dismiss-button';
import { Text } from '~/components/ui/text';
import { useExercises } from '~/hooks/data';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import type { Exercise } from '~/types';

// Global result storage for passing data back to workout-details
let replaceExerciseResult: {
  newExercise: Exercise;
  oldExerciseId: string;
  exerciseIndex: number;
} | null = null;

export function getReplaceExerciseResult() {
  const result = replaceExerciseResult;
  replaceExerciseResult = null; // Clear after reading
  return result;
}

export function clearReplaceExerciseResult() {
  replaceExerciseResult = null;
}

export default function ReplaceExerciseModal() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  // Get parameters for the exercise to replace
  const {
    exerciseId,
    exerciseIndex,
    exerciseName,
    primaryMuscleGroup,
    exerciseType,
    isActiveWorkout,
    hasCompletedSets,
    currentWorkoutExerciseIds,
  } = useLocalSearchParams<{
    exerciseId: string;
    exerciseIndex: string;
    exerciseName: string;
    primaryMuscleGroup: string; // Single muscle group ID
    secondaryMuscleGroups: string; // JSON string array
    exerciseType: string;
    isActiveWorkout?: string;
    hasCompletedSets?: string;
    currentWorkoutExerciseIds?: string; // JSON string array of all exercise IDs in current workout
  }>();

  // Legend State hooks
  const { exercises: allExercises, isLoading: exercisesLoading } = useExercises();

  // Get the target primary muscle group (now singular)
  const targetPrimaryMuscleGroup = primaryMuscleGroup || null;

  // Parse the list of current workout exercise IDs to exclude
  const workoutExerciseIds = useMemo(() => {
    try {
      return currentWorkoutExerciseIds ? (JSON.parse(currentWorkoutExerciseIds) as string[]) : [];
    } catch {
      return [];
    }
  }, [currentWorkoutExerciseIds]);

  // Secondary muscle groups are not used for filtering currently
  // but are still passed for potential future use

  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Filter exercises by muscle groups and type
  const filteredExercises = useMemo(() => {
    // Exclude all exercises currently in the workout (including the one being replaced)
    let filtered = allExercises.filter((exercise) => !workoutExerciseIds.includes(exercise.id));

    // Apply muscle group and type filters if not searching
    if (!searchQuery && showFilters) {
      filtered = filtered.filter((exercise) => {
        // Match exercise type
        const typeMatches = exercise.type === exerciseType;

        // Match primary muscle group
        const primaryMatches =
          !targetPrimaryMuscleGroup || exercise.primaryMuscleGroup === targetPrimaryMuscleGroup;

        return typeMatches && primaryMatches;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((exercise) =>
        exercise.name.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return filtered;
  }, [
    allExercises,
    workoutExerciseIds,
    exerciseType,
    targetPrimaryMuscleGroup,
    searchQuery,
    showFilters,
  ]);

  const handleToggleExercise = (exercise: Exercise) => {
    // For replacement, we only allow selecting one exercise at a time
    setSelectedExercise(selectedExercise?.id === exercise.id ? null : exercise);
  };

  const handleSave = useCallback(async () => {
    if (!selectedExercise) return;

    // Show warning for active workouts with completed sets
    if (isActiveWorkout === 'true' && hasCompletedSets === 'true') {
      Alert.alert(
        t('replaceExercise.confirmTitle'),
        t('replaceExercise.confirmMessage', { exerciseName }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('replaceExercise.replace'),
            style: 'destructive',
            onPress: async () => {
              await performReplacement();
            },
          },
        ]
      );
    } else {
      await performReplacement();
    }
  }, [selectedExercise, isActiveWorkout, hasCompletedSets, exerciseName, t]);

  const performReplacement = async () => {
    if (!selectedExercise) return;

    setIsSaving(true);

    try {
      const replaceResult = {
        newExercise: selectedExercise,
        oldExerciseId: exerciseId,
        exerciseIndex: parseInt(exerciseIndex, 10),
      };

      // Store the result globally for both cases
      replaceExerciseResult = replaceResult;

      // Navigate back to the previous screen
      router.back();
    } catch (_error) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
    // Clear search when toggling filters back on
    if (!showFilters) {
      setSearchQuery('');
    }
  }, [showFilters]);

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
          testID="modal-replace-exercise">
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">{t('replaceExercise.loadingExercises')}</Text>
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
        testID="modal-replace-exercise">
        <KeyboardDismissButton />

        {/* Custom header to avoid iOS 18 glass effect */}
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            onPress={handleClose}
            testID="button-cancel-replace-exercise"
            accessible={true}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
            style={{ minWidth: 70 }}>
            <Text className="text-base text-primary">{t('common.cancel')}</Text>
          </TouchableOpacity>

          <View className="mx-2 flex-1">
            <Text
              className="text-center text-lg font-semibold text-foreground"
              numberOfLines={1}
              ellipsizeMode="tail">
              {exerciseName || t('replaceExercise.title')}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={!selectedExercise || isSaving}
            testID="button-replace-exercise"
            style={{ minWidth: 70, alignItems: 'flex-end' }}>
            {isSaving ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text
                className={`text-base ${selectedExercise ? 'text-primary' : 'text-muted-foreground'}`}>
                {t('replaceExercise.replace')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter toggle with improved spacing and design */}
        <View className="px-4 pb-3 pt-4">
          <Pressable
            onPress={handleToggleFilters}
            className="flex-row items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5"
            testID="toggle-filters">
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                {showFilters
                  ? t('replaceExercise.similarExercises')
                  : t('replaceExercise.allExercises')}
              </Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                {showFilters
                  ? t('replaceExercise.showingSimilar', { type: exerciseType })
                  : t('replaceExercise.browseAll')}
              </Text>
            </View>
            <View className="ml-3 rounded-md bg-primary/10 px-2.5 py-1">
              <Text className="text-xs font-medium text-primary">
                {showFilters ? t('replaceExercise.showAll') : t('replaceExercise.showSimilar')}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Search bar */}
        <View className="px-4 pb-3 pt-2">
          <View className="flex-row items-center rounded-xl bg-secondary/30 px-3.5">
            <Search size={20} color={theme.colors.text + '60'} style={{ marginRight: 10 }} />
            <Input
              className="flex-1 border-0 bg-transparent px-0 py-3 text-base text-foreground"
              placeholder={t('replaceExercise.searchExercises')}
              placeholderTextColor={theme.colors.text}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCorrect={false}
              spellCheck={false}
              testID="replace-exercise-search-input"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} className="p-1">
                <XCircle size={20} color={theme.colors.text + '80'} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Exercise list with custom clean styling */}
        <FlatList
          data={filteredExercises}
          renderItem={({ item, index }) => {
            const isSelected = selectedExercise?.id === item.id;
            const _exerciseId = item.name.toLowerCase().replace(/ /g, '-');
            return (
              <Pressable
                onPress={() => handleToggleExercise(item)}
                className="px-4"
                testID={`replace-exercise-item-${index}`}>
                <Card className={`mb-2 border ${isSelected ? 'border-primary' : 'border-border'}`}>
                  <CardContent className="px-4 py-2">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text
                          className="font-medium text-foreground"
                          testID={`replace-exercise-text-${index}`}>
                          {item.name}
                        </Text>
                        {item.isCustom && (
                          <View className="mt-1 flex-row items-center">
                            <View className="flex-row items-center rounded-full bg-primary/10 px-2 py-0.5">
                              <User size={12} color={theme.colors.primary} />
                              <Text className="ml-1 text-xs font-medium text-primary">
                                {t('replaceExercise.custom')}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                      <View
                        className={`items-center justify-center rounded-full p-2 ${
                          isSelected ? 'bg-primary' : 'bg-muted'
                        }`}
                        style={{ width: 28, height: 28 }}>
                        {isSelected ? (
                          <Check size={16} color="white" />
                        ) : (
                          <Plus size={16} color={theme.colors.text + '80'} />
                        )}
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        />
      </Screen>
    </KeyboardAwareWrapper>
  );
}
