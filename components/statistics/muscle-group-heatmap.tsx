import { useMemo, useState } from 'react';

import { View, Dimensions, TouchableOpacity } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { ChevronDown, Eye, EyeOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import InteractiveBackBodySVG from '~/components/svgs/body/full/interactive-back';
import InteractiveFrontBodySVG from '~/components/svgs/body/full/interactive-front';
import { Card, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { useExercises } from '~/hooks/data';
import { useMuscleGroups } from '~/hooks/data/use-muscle-groups';
import { useWorkoutHistory } from '~/hooks/data/use-workout-history';
import { useWeekStart } from '~/lib/contexts/WeekStartContext';
import type { WorkoutHistory } from '~/types';

// Map database muscle group names to SVG part IDs
// Names must match exactly with muscle_groups.json "name" field
const MUSCLE_GROUP_TO_SVG_MAP: Record<string, { front?: string[]; back?: string[] }> = {
  // Core
  abs: { front: ['abs-front'] },
  obliques: { front: ['obliques-front'], back: ['obliques-back'] },
  'lower-back': { back: ['lower-back-back'] },

  // Upper Body
  chest: { front: ['chest-front'] },
  'upper-chest': { front: ['chest-front'] }, // Same SVG part as chest
  biceps: { front: ['biceps-front'], back: ['biceps-back'] },
  triceps: { back: ['tripceps-back'] }, // Note: SVG has typo 'tripceps' not 'triceps'
  shoulders: { front: ['shoulders-front'], back: ['rear-deltoids-back'] },
  'front-delts': { front: ['shoulders-front'] }, // Part of shoulders SVG
  'rear-delts': { back: ['rear-deltoids-back'] },
  'medial-delts': { front: ['shoulders-front'] }, // Part of shoulders SVG
  lats: { back: ['lats-back'] },
  'upper-back': { back: ['upper-back-back'] },
  traps: { back: ['upper-back-back'] },
  forearms: { front: ['forearms-front'], back: ['forearms-back'] },
  neck: { front: ['neck-front'] },

  // Lower Body
  quadriceps: { front: ['quads-front'] }, // FIXED: was 'quads', should be 'quadriceps'
  hamstrings: { back: ['hamstrings-back'] },
  glutes: { back: ['glutes-back'] },
  calves: { front: ['calves-front'], back: ['calves-back'] },
  adductors: { front: ['adductors-front'] },
  abductors: { front: ['abductors-front'], back: ['abductors-back'] },

  // Tibialis Anterior (Shins)
  'tibialis-anterior': { front: ['shins-front'] },

  // Legacy mappings for backward compatibility
  back: { back: ['upper-back-back', 'lats-back'] },
  quads: { front: ['quads-front'] },
  shins: { front: ['shins-front'] }, // Keep for backward compatibility
};

type TimePeriod = 'week' | 'month' | 'year';

export function MuscleGroupHeatmap() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { workoutHistory } = useWorkoutHistory();
  const { exercises } = useExercises();
  const { muscleGroups } = useMuscleGroups();
  const { getWeekStartDayNumber } = useWeekStart();
  const weekStartDayNumber = getWeekStartDayNumber();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [showSecondary, setShowSecondary] = useState(false);

  // Get screen width for responsive SVG sizing
  const screenWidth = Dimensions.get('window').width;
  const svgWidth = (screenWidth - 64) / 2; // Account for padding and gap between SVGs
  const svgHeight = (svgWidth * 1536) / 1024; // Maintain aspect ratio

  // Calculate which muscle groups were worked in the selected time period (separated by primary/secondary)
  const { primaryMuscleGroups, secondaryMuscleGroups } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Calculate the start date based on time period
    const startDate = new Date();

    if (timePeriod === 'week') {
      const currentDay = today.getDay();
      let daysToSubtract = currentDay - weekStartDayNumber;
      if (daysToSubtract < 0) {
        daysToSubtract += 7;
      }
      startDate.setDate(today.getDate() - daysToSubtract);
    } else if (timePeriod === 'month') {
      startDate.setDate(1); // First day of current month
    } else {
      // year
      startDate.setMonth(0, 1); // January 1st of current year
    }

    startDate.setHours(0, 0, 0, 0);

    const primaryCounts: Record<string, number> = {};
    const secondaryCounts: Record<string, number> = {};

    // First pass: Count ALL primary muscle groups across all workouts
    workoutHistory.forEach((workout: WorkoutHistory) => {
      const workoutDate = new Date(workout.date);

      if (workoutDate >= startDate && workoutDate <= today) {
        workout.exercises.forEach((workoutExercise) => {
          const exercise = exercises.find((ex) => ex.id === workoutExercise.exerciseId);
          if (exercise) {
            const setCount = workoutExercise.sets.length;

            // Count primary muscle group
            if (exercise.primaryMuscleGroup) {
              const muscleGroup = muscleGroups.find((mg) => mg.id === exercise.primaryMuscleGroup);
              if (muscleGroup) {
                const mgName = muscleGroup.name;
                primaryCounts[mgName] = (primaryCounts[mgName] || 0) + setCount;
              }
            }
          }
        });
      }
    });

    // Second pass: Count secondary muscle groups (excluding any already counted as primary)
    workoutHistory.forEach((workout: WorkoutHistory) => {
      const workoutDate = new Date(workout.date);

      if (workoutDate >= startDate && workoutDate <= today) {
        workout.exercises.forEach((workoutExercise) => {
          const exercise = exercises.find((ex) => ex.id === workoutExercise.exerciseId);
          if (exercise) {
            const setCount = workoutExercise.sets.length;

            // Count secondary muscle groups
            if (exercise.secondaryMuscleGroups) {
              exercise.secondaryMuscleGroups.forEach((mgId) => {
                const muscleGroup = muscleGroups.find((mg) => mg.id === mgId);
                if (muscleGroup) {
                  const mgName = muscleGroup.name;
                  // Only count as secondary if it's not already a primary muscle
                  if (!primaryCounts[mgName]) {
                    secondaryCounts[mgName] = (secondaryCounts[mgName] || 0) + setCount;
                  }
                }
              });
            }
          }
        });
      }
    });

    return {
      primaryMuscleGroups: primaryCounts,
      secondaryMuscleGroups: secondaryCounts,
    };
  }, [workoutHistory, exercises, muscleGroups, weekStartDayNumber, timePeriod]);

  // Convert worked muscle groups to SVG highlights (separate primary and secondary)
  const {
    frontPrimaryHighlights,
    frontSecondaryHighlights,
    backPrimaryHighlights,
    backSecondaryHighlights,
  } = useMemo(() => {
    const frontPrimaryParts = new Set<string>();
    const frontSecondaryParts = new Set<string>();
    const backPrimaryParts = new Set<string>();
    const backSecondaryParts = new Set<string>();

    // Process primary muscle groups
    Object.keys(primaryMuscleGroups).forEach((muscleGroupName) => {
      const svgMapping = MUSCLE_GROUP_TO_SVG_MAP[muscleGroupName];
      if (svgMapping) {
        svgMapping.front?.forEach((part) => frontPrimaryParts.add(part));
        svgMapping.back?.forEach((part) => backPrimaryParts.add(part));
      }
    });

    // Process secondary muscle groups (only if showSecondary is true)
    if (showSecondary) {
      Object.keys(secondaryMuscleGroups).forEach((muscleGroupName) => {
        const svgMapping = MUSCLE_GROUP_TO_SVG_MAP[muscleGroupName];
        if (svgMapping) {
          svgMapping.front?.forEach((part) => {
            if (!frontPrimaryParts.has(part)) {
              frontSecondaryParts.add(part);
            }
          });
          svgMapping.back?.forEach((part) => {
            if (!backPrimaryParts.has(part)) {
              backSecondaryParts.add(part);
            }
          });
        }
      });
    }

    return {
      frontPrimaryHighlights: Array.from(frontPrimaryParts),
      frontSecondaryHighlights: Array.from(frontSecondaryParts),
      backPrimaryHighlights: Array.from(backPrimaryParts),
      backSecondaryHighlights: Array.from(backSecondaryParts),
    };
  }, [primaryMuscleGroups, secondaryMuscleGroups, showSecondary]);

  // Check if any muscles were worked
  const hasWorkedMuscles =
    Object.keys(primaryMuscleGroups).length > 0 || Object.keys(secondaryMuscleGroups).length > 0;

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-medium text-foreground">{t('statistics.musclesWorked')}</Text>
        <View className="flex-row gap-1.5">
          <TouchableOpacity
            onPress={() => setShowSecondary(!showSecondary)}
            activeOpacity={0.7}
            className="flex-row items-center rounded-md bg-muted/30 px-2 py-1"
            testID="secondary-toggle">
            {showSecondary ? (
              <Eye size={14} color={colors.primary} />
            ) : (
              <EyeOff size={14} color={colors.primary} />
            )}
            <Text className="ml-1 text-xs font-medium text-primary">
              {t('statistics.secondary')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              setTimePeriod((prev) => {
                if (prev === 'week') return 'month';
                if (prev === 'month') return 'year';
                return 'week';
              })
            }
            activeOpacity={0.7}
            className="flex-row items-center rounded-md bg-muted/30 px-2 py-1"
            testID="muscle-time-period-toggle">
            <Text className="text-xs font-medium text-primary" testID="muscle-time-period-text">
              {timePeriod === 'week'
                ? t('statistics.thisWeek')
                : timePeriod === 'month'
                  ? t('statistics.thisMonth')
                  : t('statistics.thisYear')}
            </Text>
            <ChevronDown size={14} color={colors.primary} style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </View>
      <View testID="muscle-heatmap-card">
        <Card className="bg-card">
          <CardContent className="p-4">
            <View className="flex-row justify-center gap-4">
              {/* Front View */}
              <View className="items-center">
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
              <View className="items-center">
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

            {/* Legend or Empty State Message */}
            {hasWorkedMuscles ? (
              <View className="mt-4 flex-row items-center justify-center gap-3">
                {Object.keys(primaryMuscleGroups).length > 0 && (
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-3 w-3 rounded-full bg-primary" />
                    <Text className="text-xs text-muted-foreground">{t('statistics.primary')}</Text>
                  </View>
                )}
                {showSecondary && Object.keys(secondaryMuscleGroups).length > 0 && (
                  <View className="flex-row items-center gap-1.5">
                    <View className="h-3 w-3 rounded-full bg-primary/40" />
                    <Text className="text-xs text-muted-foreground">
                      {t('statistics.secondary')}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center gap-1.5">
                  <View className="h-3 w-3 rounded-full bg-border" />
                  <Text className="text-xs text-muted-foreground">{t('statistics.notWorked')}</Text>
                </View>
              </View>
            ) : (
              <View className="mt-4 items-center">
                <Text className="text-sm text-muted-foreground">
                  {t('statistics.completeMuscleActivity')}
                </Text>
              </View>
            )}
          </CardContent>
        </Card>
      </View>
    </View>
  );
}
