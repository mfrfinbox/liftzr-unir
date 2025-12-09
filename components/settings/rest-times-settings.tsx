import { View, Pressable } from 'react-native';

import { Timer, ArrowRightCircle, Minus, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { SEPARATOR_STYLE } from '~/lib/constants/ui';
import { useDefaultRest } from '~/lib/contexts/DefaultRestContext';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

export function RestTimesSettings() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { defaultRestTimes, setDefaultSetRest, setDefaultExerciseRest } = useDefaultRest();

  const formatRestTime = (seconds: number): string => {
    if (seconds === 0) return t('settings.restTimers.off');
    if (seconds < 60) return `${seconds}s`;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      if (minutes > 0 && remainingSeconds > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
      if (minutes > 0) return `${hours}h ${minutes}m`;
      if (remainingSeconds > 0) return `${hours}h ${remainingSeconds}s`;
      return `${hours}h`;
    }

    return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`;
  };

  const adjustRestTime = (type: 'set' | 'exercise', change: number) => {
    const currentValue = type === 'set' ? defaultRestTimes.setRest : defaultRestTimes.exerciseRest;
    const newValue = Math.max(0, currentValue + change);

    if (type === 'set') {
      setDefaultSetRest(newValue);
    } else {
      setDefaultExerciseRest(newValue);
    }
  };

  return (
    <View>
      <View>
        {/* Between Sets */}
        <View className="flex-row items-center justify-between px-4 py-3.5">
          <View className="flex-row items-center gap-3">
            <Timer size={20} color={theme.colors.text + '80'} />
            <Text className="text-base text-foreground">
              {t('settings.restTimers.betweenSets')}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => adjustRestTime('set', -15)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Minus size={16} color={theme.colors.text + '80'} />
            </Pressable>
            <Text className="min-w-16 text-center text-foreground">
              {formatRestTime(defaultRestTimes.setRest)}
            </Text>
            <Pressable
              onPress={() => adjustRestTime('set', 15)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Plus size={16} color={theme.colors.text + '80'} />
            </Pressable>
          </View>
        </View>

        {/* Divider */}
        <View className={SEPARATOR_STYLE} />

        {/* Between Exercises */}
        <View className="flex-row items-center justify-between px-4 py-3.5">
          <View className="flex-row items-center gap-3">
            <ArrowRightCircle size={20} color={theme.colors.text + '80'} />
            <Text className="text-base text-foreground">
              {t('settings.restTimers.betweenExercises')}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => adjustRestTime('exercise', -15)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Minus size={16} color={theme.colors.text + '80'} />
            </Pressable>
            <Text className="min-w-16 text-center text-foreground">
              {formatRestTime(defaultRestTimes.exerciseRest)}
            </Text>
            <Pressable
              onPress={() => adjustRestTime('exercise', 15)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Plus size={16} color={theme.colors.text + '80'} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
