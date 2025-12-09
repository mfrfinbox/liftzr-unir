/**
 * Workout Muscle Heatmap Modal
 * Displays body heatmap showing which muscles are targeted in a specific workout
 */

import React, { useMemo, useState } from 'react';

import { View, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { ModalSheet } from '~/components/sheets/modal-sheet';
import InteractiveBackBodySVG from '~/components/svgs/body/full/interactive-back';
import InteractiveFrontBodySVG from '~/components/svgs/body/full/interactive-front';
import { Text } from '~/components/ui/text';
import { useMuscleGroups } from '~/hooks/data/use-muscle-groups';
import type { ExerciseWithDetails } from '~/types';

interface WorkoutMuscleHeatmapModalProps {
  visible: boolean;
  onClose: () => void;
  exercises: ExerciseWithDetails[];
  workoutName: string;
  isActiveWorkout?: boolean;
}

// Map database muscle group names to SVG part IDs
const MUSCLE_GROUP_TO_SVG_MAP: Record<string, { front?: string[]; back?: string[] }> = {
  // Core
  abs: { front: ['abs-front'] },
  obliques: { front: ['obliques-front'], back: ['obliques-back'] },
  'lower-back': { back: ['lower-back-back'] },

  // Upper Body
  chest: { front: ['chest-front'] },
  'upper-chest': { front: ['chest-front'] },
  biceps: { front: ['biceps-front'], back: ['biceps-back'] },
  triceps: { back: ['triceps-back'] },
  shoulders: { front: ['shoulders-front'], back: ['rear-deltoids-back'] },
  'front-delts': { front: ['shoulders-front'] },
  'rear-delts': { back: ['rear-deltoids-back'] },
  'medial-delts': { front: ['shoulders-front'] },
  lats: { back: ['lats-back'] },
  'upper-back': { back: ['upper-back-back'] },
  traps: { back: ['upper-back-back'] },
  forearms: { front: ['forearms-front'], back: ['forearms-back'] },
  neck: { front: ['neck-front'] },

  // Lower Body
  quadriceps: { front: ['quads-front'] },
  hamstrings: { back: ['hamstrings-back'] },
  glutes: { back: ['glutes-back'] },
  calves: { front: ['calves-front'], back: ['calves-back'] },
  adductors: { front: ['adductors-front'] },
  abductors: { front: ['abductors-front'], back: ['abductors-back'] },
  'tibialis-anterior': { front: ['shins-front'] },

  // Legacy mappings
  back: { back: ['upper-back-back', 'lats-back'] },
  quads: { front: ['quads-front'] },
  shins: { front: ['shins-front'] },
};

export function WorkoutMuscleHeatmapModal({
  visible,
  onClose,
  exercises,
  workoutName,
  isActiveWorkout = false,
}: WorkoutMuscleHeatmapModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { muscleGroups } = useMuscleGroups();
  const [showSecondary, setShowSecondary] = useState(false);
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(true); // Default to only completed sets

  // Get screen width for responsive SVG sizing (same as Statistics)
  const screenWidth = Dimensions.get('window').width;
  const svgWidth = (screenWidth - 80) / 2;
  const svgHeight = (svgWidth * 1536) / 1024;

  // Calculate muscle group data
  const { primaryMuscleGroups, secondaryMuscleGroups } = useMemo(() => {
    const primaryCounts: Record<string, number> = {};
    const secondaryCounts: Record<string, number> = {};

    exercises.forEach((exercise) => {
      const primaryMuscleId = exercise.details.primaryMuscleGroup;
      if (primaryMuscleId) {
        const muscleGroup = muscleGroups.find((mg) => mg.id === primaryMuscleId);
        if (muscleGroup) {
          const muscleName = muscleGroup.name;

          // Determine whether to include this muscle based on mode
          let shouldInclude = false;
          let setCount = 0;

          // Active workout uses setsData array, workout details uses sets array
          const setsArray = (exercise as any).setsData || exercise.sets;

          if (Array.isArray(setsArray)) {
            if (isActiveWorkout && showOnlyCompleted) {
              // Active workout with "Completed" ON: Only show if at least 1 set is completed
              const completedSets = setsArray.filter((set: any) => set.completed === true);
              setCount = completedSets.length;
              shouldInclude = setCount > 0;
            } else {
              // Active workout with "Completed" OFF OR workout details: Show all planned
              setCount = setsArray.length;
              shouldInclude = setCount > 0;
            }
          } else if (typeof exercise.sets === 'number') {
            // Fallback for number type (workout details with old structure)
            setCount = exercise.sets || 0;
            shouldInclude = setCount > 0;
          }

          if (shouldInclude) {
            primaryCounts[muscleName] = (primaryCounts[muscleName] || 0) + setCount;
          }
        }
      }
    });

    exercises.forEach((exercise) => {
      const secondaryMuscleIds = exercise.details.secondaryMuscleGroups || [];
      const primaryMuscleId = exercise.details.primaryMuscleGroup;

      secondaryMuscleIds.forEach((muscleId) => {
        if (muscleId !== primaryMuscleId) {
          const muscleGroup = muscleGroups.find((mg) => mg.id === muscleId);
          if (muscleGroup) {
            const muscleName = muscleGroup.name;

            // Determine whether to include this muscle based on mode
            let shouldInclude = false;
            let setCount = 0;

            // Active workout uses setsData array, workout details uses sets array
            const setsArray = (exercise as any).setsData || exercise.sets;

            if (Array.isArray(setsArray)) {
              if (isActiveWorkout && showOnlyCompleted) {
                // Active workout with "Completed" ON: Only show if at least 1 set is completed
                const completedSets = setsArray.filter((set: any) => set.completed === true);
                setCount = completedSets.length;
                shouldInclude = setCount > 0;
              } else {
                // Active workout with "Completed" OFF OR workout details: Show all planned
                setCount = setsArray.length;
                shouldInclude = setCount > 0;
              }
            } else if (typeof exercise.sets === 'number') {
              // Fallback for number type (workout details with old structure)
              setCount = exercise.sets || 0;
              shouldInclude = setCount > 0;
            }

            if (shouldInclude) {
              secondaryCounts[muscleName] = (secondaryCounts[muscleName] || 0) + setCount;
            }
          }
        }
      });
    });

    return {
      primaryMuscleGroups: primaryCounts,
      secondaryMuscleGroups: secondaryCounts,
    };
  }, [exercises, muscleGroups, isActiveWorkout, showOnlyCompleted]);

  // Calculate SVG highlights
  const {
    frontPrimaryHighlights,
    frontSecondaryHighlights,
    backPrimaryHighlights,
    backSecondaryHighlights,
  } = useMemo(() => {
    const frontPrimary = new Set<string>();
    const frontSecondary = new Set<string>();
    const backPrimary = new Set<string>();
    const backSecondary = new Set<string>();

    Object.keys(primaryMuscleGroups).forEach((muscleName) => {
      const mapping = MUSCLE_GROUP_TO_SVG_MAP[muscleName];
      if (mapping) {
        mapping.front?.forEach((part) => frontPrimary.add(part));
        mapping.back?.forEach((part) => backPrimary.add(part));
      }
    });

    if (showSecondary) {
      Object.keys(secondaryMuscleGroups).forEach((muscleName) => {
        const mapping = MUSCLE_GROUP_TO_SVG_MAP[muscleName];
        if (mapping) {
          mapping.front?.forEach((part) => {
            if (!frontPrimary.has(part)) frontSecondary.add(part);
          });
          mapping.back?.forEach((part) => {
            if (!backPrimary.has(part)) backSecondary.add(part);
          });
        }
      });
    }

    return {
      frontPrimaryHighlights: Array.from(frontPrimary),
      frontSecondaryHighlights: Array.from(frontSecondary),
      backPrimaryHighlights: Array.from(backPrimary),
      backSecondaryHighlights: Array.from(backSecondary),
    };
  }, [primaryMuscleGroups, secondaryMuscleGroups, showSecondary]);

  const hasWorkedMuscles =
    Object.keys(primaryMuscleGroups).length > 0 || Object.keys(secondaryMuscleGroups).length > 0;

  // Determine title and legend text based on context
  const titleKey =
    isActiveWorkout && showOnlyCompleted ? 'statistics.musclesWorked' : 'workout.musclesTargeted';
  const legendNotWorkedKey =
    isActiveWorkout && showOnlyCompleted ? 'statistics.notWorked' : 'workout.notTargeted';
  const descriptionKey =
    isActiveWorkout && showOnlyCompleted
      ? 'workout.muscleWorkingDescription'
      : 'workout.muscleTargetingDescription';

  // Create styles using theme colors directly
  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardContainer: {
          backgroundColor: colors.card + '80', // 50% opacity
          borderRadius: 8,
          padding: 16,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        },
      }),
    [colors]
  );

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title={workoutName}
      primaryActionText="Done"
      secondaryActionText=""
      snapPoints={['75%']}
      testID="muscle-heatmap-modal">
      <View className="flex-1 px-4">
        {/* Body Heatmap Card with integrated toggle */}
        <View className="mt-4" style={styles.cardContainer} testID="heatmap-card">
          {/* Card Header with Toggles */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text
              className="text-base font-medium"
              style={{ color: colors.text }}
              testID="heatmap-title">
              {t(titleKey)}
            </Text>
            <View className="flex-row items-center gap-2">
              {/* Show Only Completed Sets Toggle (Active Workout Only) */}
              {isActiveWorkout && (
                <TouchableOpacity
                  onPress={() => setShowOnlyCompleted(!showOnlyCompleted)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-1.5 rounded-md px-2.5 py-1.5"
                  style={{ backgroundColor: colors.background }}
                  testID="completed-sets-toggle"
                  accessible
                  accessibilityLabel={
                    showOnlyCompleted ? 'Show all sets' : 'Show only completed sets'
                  }
                  accessibilityRole="button">
                  {showOnlyCompleted ? (
                    <CheckCircle2 size={14} color={colors.primary} />
                  ) : (
                    <Circle size={14} color={colors.primary} />
                  )}
                  <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                    {t('workout.completed')}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Secondary Muscles Toggle */}
              <TouchableOpacity
                onPress={() => setShowSecondary(!showSecondary)}
                activeOpacity={0.7}
                className="flex-row items-center gap-1.5 rounded-md px-2.5 py-1.5"
                style={{ backgroundColor: colors.background }}
                testID="secondary-toggle"
                accessible
                accessibilityLabel={
                  showSecondary ? 'Hide secondary muscles' : 'Show secondary muscles'
                }
                accessibilityRole="button">
                {showSecondary ? (
                  <Eye size={14} color={colors.primary} />
                ) : (
                  <EyeOff size={14} color={colors.primary} />
                )}
                <Text className="text-xs font-medium" style={{ color: colors.primary }}>
                  {t('statistics.secondary')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Body Heatmap */}
          <View className="mt-3 flex-row justify-center gap-4" testID="body-heatmap-container">
            {/* Front View */}
            <View className="items-center" testID="front-body-view">
              <View style={{ width: svgWidth, height: svgHeight }}>
                <InteractiveFrontBodySVG
                  width={svgWidth}
                  height={svgHeight}
                  primaryHighlightedParts={frontPrimaryHighlights}
                  secondaryHighlightedParts={frontSecondaryHighlights}
                  primaryColor={colors.primary}
                />
              </View>
            </View>

            {/* Back View */}
            <View className="items-center" testID="back-body-view">
              <View style={{ width: svgWidth, height: svgHeight }}>
                <InteractiveBackBodySVG
                  width={svgWidth}
                  height={svgHeight}
                  primaryHighlightedParts={backPrimaryHighlights}
                  secondaryHighlightedParts={backSecondaryHighlights}
                  primaryColor={colors.primary}
                />
              </View>
            </View>
          </View>

          {/* Legend */}
          {hasWorkedMuscles && (
            <View
              className="mt-4 flex-row items-center justify-center gap-3"
              testID="heatmap-legend">
              {Object.keys(primaryMuscleGroups).length > 0 && (
                <View className="flex-row items-center gap-1.5" testID="legend-primary">
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <Text className="text-xs text-muted-foreground">{t('statistics.primary')}</Text>
                </View>
              )}
              {showSecondary && Object.keys(secondaryMuscleGroups).length > 0 && (
                <View className="flex-row items-center gap-1.5" testID="legend-secondary">
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: colors.primary, opacity: 0.4 }}
                  />
                  <Text className="text-xs text-muted-foreground">{t('statistics.secondary')}</Text>
                </View>
              )}
              <View className="flex-row items-center gap-1.5" testID="legend-not-worked">
                <View className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.border }} />
                <Text className="text-xs text-muted-foreground">{t(legendNotWorkedKey)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Informational Text */}
        <View className="mt-4 gap-2 px-1" testID="heatmap-info-section">
          <Text
            className="text-sm"
            style={{ color: colors.text + 'B3' }}
            testID="heatmap-description">
            {t(descriptionKey)}
          </Text>
          {Object.keys(secondaryMuscleGroups).length > 0 && (
            <Text
              className="text-sm"
              style={{ color: colors.text + 'B3' }}
              testID="secondary-toggle-hint">
              {t('workout.secondaryToggleHint')}
            </Text>
          )}
          {isActiveWorkout && (
            <Text
              className="text-sm"
              style={{ color: colors.text + 'B3' }}
              testID="completed-toggle-hint">
              {t('workout.completedToggleHint')}
            </Text>
          )}
        </View>
      </View>
    </ModalSheet>
  );
}
