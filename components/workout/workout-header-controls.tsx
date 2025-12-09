import { View, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { ChevronDown, Play, Pause } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';

interface WorkoutHeaderControlsProps {
  elapsedTime: number;
  isWorkoutPaused: boolean;
  formatTime: (time: number) => string;
  onPauseWorkout: () => void;
  onFinishWorkout: () => void;
  onHideWorkout: () => void;
  hasWorkouts?: boolean;
}

export function WorkoutHeaderControls({
  elapsedTime,
  isWorkoutPaused,
  formatTime,
  onPauseWorkout,
  onFinishWorkout,
  onHideWorkout,
  hasWorkouts = false,
}: WorkoutHeaderControlsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View className="border-b border-border py-4" testID="workout-header-controls">
      <View className="flex-row items-center justify-between px-4">
        {hasWorkouts ? (
          <Pressable
            onPress={onHideWorkout}
            className="p-1"
            testID="button-hide-workout"
            accessible={true}
            accessibilityLabel={t('workout.hideWorkout')}
            accessibilityRole="button">
            <ChevronDown size={18} color={colors.text + '80'} />
          </Pressable>
        ) : (
          <View style={{ width: 26 }} />
        )}

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onPauseWorkout}
            className="p-1"
            testID={isWorkoutPaused ? 'button-resume-workout' : 'button-pause-workout'}
            accessible={true}
            accessibilityLabel={isWorkoutPaused ? 'Resume workout' : 'Pause workout'}
            accessibilityRole="button">
            {isWorkoutPaused ? (
              <Play size={18} color={colors.primary} />
            ) : (
              <Pause size={18} color={colors.text + '80'} />
            )}
          </Pressable>
          <Text className="text-xl font-semibold text-foreground" testID="workout-timer">
            {formatTime(elapsedTime)}
          </Text>
          {isWorkoutPaused && (
            <Text className="ml-1 text-sm text-muted-foreground" testID="workout-paused-label">
              PAUSED
            </Text>
          )}
        </View>

        <Pressable
          onPress={onFinishWorkout}
          testID="button-finish-workout"
          accessible={true}
          accessibilityLabel={t('workout.finishWorkout')}
          accessibilityRole="button">
          <Text className="font-medium text-primary">{t('workout.finish')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
