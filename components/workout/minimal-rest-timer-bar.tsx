import { View, Pressable } from 'react-native';

import Animated from 'react-native-reanimated';

import { Text } from '~/components/ui/text';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

interface MinimalRestTimerBarProps {
  timerState: {
    active: boolean;
    type: 'set' | 'exercise';
    seconds: number;
    totalSeconds: number;
    exerciseName?: string;
    nextExerciseName?: string;
  };
  timerHeaderStyle: any;
  formatTime: (seconds: number) => string;
  onSkip: () => void;
}

export function MinimalRestTimerBar({
  timerState,
  timerHeaderStyle,
  formatTime,
  onSkip,
}: MinimalRestTimerBarProps) {
  const { theme } = useAppTheme();

  if (!timerState.active) return null;

  const progress = ((timerState.totalSeconds - timerState.seconds) / timerState.totalSeconds) * 100;

  // Simplified label
  const label =
    timerState.type === 'set'
      ? 'Rest'
      : timerState.nextExerciseName
        ? timerState.nextExerciseName
        : 'Rest';

  return (
    <Animated.View style={[timerHeaderStyle]}>
      <Pressable onPress={onSkip} className="relative">
        {/* Progress bar background */}
        <View
          className="absolute inset-0"
          style={{ backgroundColor: theme.colors.primary + '10' }}
        />

        {/* Progress bar fill */}
        <View
          className="absolute inset-y-0 left-0"
          style={{
            width: `${progress}%`,
            backgroundColor: theme.colors.primary + '20',
          }}
        />

        {/* Content */}
        <View className="flex-row items-center justify-between px-4 py-2.5">
          <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
            {label}
          </Text>

          <Text className="text-base font-bold" style={{ color: theme.colors.primary }}>
            {formatTime(timerState.seconds)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
