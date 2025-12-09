/**
 * Workout Card Component
 * Displays a workout card with stats, actions, and menu
 */

import { View, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';
import {
  MoreVertical,
  Dumbbell,
  Calendar,
  Trophy,
  Sparkles,
  ChevronsRight,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { SEPARATOR_STYLE } from '~/lib/constants/ui';
import { getExerciseCount, getCompletionStatus } from '~/lib/utils/workout-utils';

import type { WorkoutCardProps } from './types';

/**
 * Get completion badge content based on stats
 */
function CompletionBadge({
  completionStats,
}: {
  completionStats: WorkoutCardProps['completionStats'];
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const isNew = !completionStats || completionStats.completionCount === 0;

  if (isNew) {
    return (
      <View className="flex-row items-center">
        <Sparkles size={15} color={colors.primary} />
        <Text className="ml-1.5 font-bold" style={{ fontSize: 13, color: colors.primary }}>
          {t('home.newWorkout')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center">
      <Trophy size={15} color={colors.text + '60'} />
      <Text className="ml-1.5" style={{ fontSize: 13, color: colors.text + '60' }}>
        {completionStats.completionCount}x {t('home.completed')}
      </Text>
    </View>
  );
}

/**
 * Start workout button
 */
function StartButton({ onPress, testID }: { onPress: (e: any) => void; testID: string }) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-md bg-primary px-4 py-2 active:opacity-90"
      testID={testID}>
      <ChevronsRight size={18} color="white" style={{ marginRight: 4 }} />
      <Text className="font-semibold text-white" style={{ fontSize: 14 }}>
        {t('home.start')}
      </Text>
    </Pressable>
  );
}

/**
 * Workout card component with full UI
 */
export function WorkoutCard({
  workout,
  index,
  onPress,
  onMenuPress,
  onStartPress,
  completionStats,
  menuButtonRef,
}: WorkoutCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Card key={workout.id} className="overflow-hidden">
      <Pressable onPress={onPress} className="active:opacity-90" testID={`workout-card-${index}`}>
        <View>
          {/* Header with title and menu */}
          <View className="flex-row items-start justify-between px-5 pb-3 pt-4">
            <View className="flex-1">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
                testID={`workout-title-${index}`}>
                {workout.title}
              </Text>

              {/* Stats row */}
              <View className="mt-2 flex-row flex-wrap gap-x-4 gap-y-1">
                {/* Exercise count */}
                <View className="flex-row items-center">
                  <Dumbbell size={14} color={colors.text + '60'} />
                  <Text className="ml-1.5" style={{ fontSize: 13, color: colors.text + '60' }}>
                    {getExerciseCount(workout)}{' '}
                    {getExerciseCount(workout) === 1 ? t('home.exercise') : t('home.exercises')}
                  </Text>
                </View>

                {/* Last completed */}
                <View className="flex-row items-center">
                  <Calendar size={14} color={colors.text + '60'} />
                  <Text className="ml-1.5" style={{ fontSize: 13, color: colors.text + '60' }}>
                    {getCompletionStatus(workout, {
                      [workout.id]: completionStats || {
                        completionCount: 0,
                        lastCompleted: null,
                      },
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu button */}
            <View ref={menuButtonRef} collapsable={false} testID={`workout-menu-wrapper-${index}`}>
              <Pressable
                onPress={onMenuPress}
                className="-mr-1 -mt-1 ml-2 rounded-md p-1.5"
                testID={`workout-menu-button-${index}`}
                accessible={true}
                accessibilityLabel={`${workout.title} menu`}
                accessibilityRole="button"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MoreVertical
                  size={18}
                  color={colors.text + '80'}
                  testID={`workout-menu-icon-${index}`}
                />
              </Pressable>
            </View>
          </View>

          {/* Separator */}
          <View className={SEPARATOR_STYLE} />

          {/* Bottom action area */}
          <View className="flex-row items-center justify-between px-5 py-3">
            {/* Completion badge */}
            <CompletionBadge completionStats={completionStats} />

            {/* Start button */}
            <StartButton onPress={onStartPress} testID={`button-start-workout-${index}`} />
          </View>
        </View>
      </Pressable>
    </Card>
  );
}
