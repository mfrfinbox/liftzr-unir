/**
 * Reorder Exercises Modal
 * Main orchestrator component for exercise reordering modal
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';

import { View, Pressable, StyleSheet, FlatList } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '~/components/ui/text';
import ReorderExerciseItem from '~/components/workout/reorder-exercise-item';
import { useMuscleGroups } from '~/hooks/data/use-muscle-groups';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import {
  useHighlightAnimations,
  createAnimatedStyle,
  useReorderHandlers,
} from '~/lib/utils/reorder-exercises';
import type { ExerciseWithDetails } from '~/types';

export default function ReorderExercisesModal() {
  const params = useLocalSearchParams<{
    exercises: string;
    workoutId: string;
    workoutName?: string;
  }>();

  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const isDatabaseLoaded = true;
  const { muscleGroups } = useMuscleGroups();

  const [orderedExercises, setOrderedExercises] = useState<ExerciseWithDetails[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Track interaction state with refs to prevent issues during state updates
  const isSavingRef = useRef(false);
  const isClosingRef = useRef(false);
  const originalOrderRef = useRef<string[]>([]);

  // Animation hooks
  const { getHighlightAnimation, animateHighlight } = useHighlightAnimations();

  // Parse exercises from params
  const exercises = useMemo(() => {
    try {
      return params.exercises ? JSON.parse(params.exercises) : [];
    } catch {
      return [];
    }
  }, [params.exercises]);

  const workoutId = params.workoutId || '';

  // Create memoized styles that depend on the theme
  const styles = useMemo(
    () =>
      StyleSheet.create({
        titleText: {
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: '600',
        },
        secondaryText: {
          color: theme.colors.text + 'aa',
          fontSize: 14,
        },
        instructionText: {
          color: theme.colors.text + '80',
          fontSize: 14,
        },
        headerBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '35',
        },
        sectionBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '25',
        },
        actionText: {
          color: theme.colors.primary,
          fontWeight: '500',
          fontSize: 16,
        },
      }),
    [theme]
  );

  // Initialize exercises
  useEffect(() => {
    const exercisesCopy = [...exercises];
    setOrderedExercises(exercisesCopy);
    originalOrderRef.current = exercisesCopy.map((e) => e.id);
    setHasChanges(false);
    isSavingRef.current = false;
    isClosingRef.current = false;
  }, [exercises]);

  // Setup event handlers using the dedicated hook
  const { moveExercise, handleClose, saveOrder } = useReorderHandlers({
    workoutId,
    isDatabaseLoaded,
    orderedExercises,
    hasChanges,
    isSavingRef,
    isClosingRef,
    originalOrderRef,
    setOrderedExercises,
    setHasChanges,
    animateHighlight,
  });

  // Render an exercise item
  const renderItem = ({ item, index }: { item: ExerciseWithDetails; index: number }) => {
    const highlightAnimation = getHighlightAnimation(item.id);
    const animatedStyle = createAnimatedStyle(highlightAnimation, theme);

    const muscleGroupName = (() => {
      const primaryId = item.details.primaryMuscleGroup;
      if (!primaryId) return 'Unknown';
      const muscleGroup = muscleGroups.find((mg) => mg.id === primaryId);
      return muscleGroup?.displayName || 'Unknown';
    })();

    return (
      <ReorderExerciseItem
        item={item}
        index={index}
        total={orderedExercises.length}
        muscleGroupName={muscleGroupName}
        animatedStyle={animatedStyle}
        onMoveUp={() => moveExercise(index, 'up')}
        onMoveDown={() => moveExercise(index, 'down')}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View style={styles.headerBorder} className="bg-card">
          <View className="flex-row items-center justify-between px-6 py-4">
            <Pressable onPress={handleClose} hitSlop={10} testID="reorder-cancel-button">
              <Text style={styles.actionText} className="text-base font-medium">
                {t('common.cancel')}
              </Text>
            </Pressable>
            <Text style={styles.titleText} className="text-xl font-bold">
              {t('reorderExercises.title')}
            </Text>
            <Pressable onPress={saveOrder} hitSlop={10} testID="reorder-done-button">
              <Text style={styles.actionText} className="text-base font-semibold">
                {t('common.done')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.sectionBorder} className="bg-card py-3">
          <View className="flex-row items-center justify-center">
            <Info size={16} color={theme.colors.text + '60'} style={{ marginRight: 6 }} />
            <Text
              style={[styles.instructionText, { color: theme.colors.text + '60' }]}
              className="text-center text-sm">
              {t('reorderExercises.instruction')}
            </Text>
          </View>
        </View>

        {/* Exercise List */}
        <View className="flex-1">
          {orderedExercises.length > 0 ? (
            <FlatList
              data={orderedExercises}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="items-center justify-center py-10">
              <Text style={styles.secondaryText} className="text-center">
                {t('reorderExercises.noExercises')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
