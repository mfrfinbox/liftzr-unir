import { View, Pressable, Alert } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Timer, Clock, Edit3, ArrowDownAZ, Target } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { Text } from '~/components/ui/text';

interface AnimatedWorkoutTitleProps {
  scrollY: SharedValue<number>;
  isQuickWorkout: boolean;
  displayWorkoutName: string;
  quickWorkoutName: string;
  exercisesCount: number;
  onChangeWorkoutName: (name: string) => void;
  onOpenReorderModal: () => void;
  onOpenStopwatchModal: () => void;
  onOpenMuscleHeatmap?: () => void;
  restTimerState?: any; // Rest timer state from ExerciseManager
}

export function AnimatedWorkoutTitle({
  scrollY,
  isQuickWorkout,
  displayWorkoutName,
  quickWorkoutName,
  exercisesCount,
  onChangeWorkoutName,
  onOpenReorderModal,
  onOpenStopwatchModal,
  onOpenMuscleHeatmap,
  restTimerState,
}: AnimatedWorkoutTitleProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 30], [1, 0], Extrapolate.CLAMP);
    const height = interpolate(scrollY.value, [0, 30], [40, 0], Extrapolate.CLAMP);

    return {
      opacity,
      height,
      overflow: 'hidden',
    };
  });

  const handleChangeWorkoutName = () => {
    Alert.prompt(
      t('workout.changeWorkoutNameTitle'),
      t('workout.changeWorkoutNameMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.save'),
          onPress: (newName?: string) => {
            if (newName && newName.trim()) {
              onChangeWorkoutName(newName.trim());
            }
          },
        },
      ],
      'plain-text',
      quickWorkoutName
    );
  };

  return (
    <>
      <Animated.View
        style={[{ borderBottomWidth: 1, borderBottomColor: colors.border }, titleAnimatedStyle]}
        className="px-4 py-2">
        <View className="flex-row items-center justify-between">
          {/* Left side - Always show stopwatch - Fixed width container */}
          <View style={{ width: 72 }} className="flex-row items-center">
            <Pressable onPress={onOpenStopwatchModal} className="p-1">
              <Timer size={20} color={colors.text + '80'} />
            </Pressable>
          </View>

          {/* Center - Title with watch stats on sides or Rest Timer */}
          <View className="flex-1 items-center justify-center px-2">
            {restTimerState?.active ? (
              // Show rest timer when active
              <View className="flex-row items-center">
                <Clock size={16} color={colors.primary} style={{ marginRight: 4 }} />
                <Text className="text-base font-semibold text-primary">
                  {restTimerState.formatTime(restTimerState.seconds)}
                </Text>
                <Pressable
                  onPress={restTimerState.cancelRestTimer}
                  className="ml-2 rounded-full bg-primary/10 px-2 py-0.5"
                  testID="button-skip-rest-timer"
                  accessible={true}
                  accessibilityLabel={t('workout.skipRestTimer')}
                  accessibilityRole="button">
                  <Text className="text-xs font-medium text-primary">{t('workout.skip')}</Text>
                </Pressable>
              </View>
            ) : (
              <View className="flex-row items-center">
                {/* Workout title */}
                {isQuickWorkout ? (
                  <Pressable
                    onPress={handleChangeWorkoutName}
                    className="flex-row items-center"
                    testID="quick-workout-edit-button"
                    accessible={true}
                    accessibilityLabel={t('workout.editWorkoutName')}
                    accessibilityRole="button">
                    <Text
                      className="text-center text-base font-semibold text-foreground"
                      testID="quick-workout-name-text">
                      {displayWorkoutName}
                    </Text>
                    <Edit3 size={14} color={colors.text + '60'} style={{ marginLeft: 6 }} />
                  </Pressable>
                ) : (
                  <Text className="text-center text-base font-semibold text-foreground">
                    {displayWorkoutName}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Right side - Show muscle heatmap and sort icons when applicable - Fixed width container */}
          <View style={{ width: 72 }} className="flex-row items-center justify-end gap-2">
            {onOpenMuscleHeatmap && exercisesCount > 0 && (
              <Pressable
                onPress={onOpenMuscleHeatmap}
                className="p-1"
                testID="muscle-heatmap-icon-button"
                accessible
                accessibilityLabel={t('workout.viewMuscleTargeting')}
                accessibilityRole="button">
                <Target size={20} color={colors.text + '80'} />
              </Pressable>
            )}
            {exercisesCount > 1 && (
              <Pressable onPress={onOpenReorderModal} className="p-1" testID="exercise-sort-button">
                <ArrowDownAZ size={20} color={colors.text + '80'} />
              </Pressable>
            )}
          </View>
        </View>
      </Animated.View>
    </>
  );
}
