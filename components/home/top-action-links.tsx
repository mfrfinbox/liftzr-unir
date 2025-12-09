/**
 * Top Action Links
 * Quick workout and create new workout links shown above workout list
 */

import { View, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Zap, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';

import type { TopActionLinksProps } from './types';

/**
 * Top action links shown when workouts exist
 */
export function TopActionLinks({ onStartQuickWorkout, onCreateNew }: TopActionLinksProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View className="mb-6 flex-row items-center justify-between">
      <Pressable
        onPress={onStartQuickWorkout}
        testID="button-start-quick-link"
        accessible={true}
        accessibilityLabel="Start quick workout"
        accessibilityRole="link">
        <View className="flex-row items-center">
          <Zap size={18} color={colors.primary} />
          <Text className="ml-1 text-lg font-bold text-primary">{t('home.quickWorkout')}</Text>
        </View>
      </Pressable>

      <Pressable
        onPress={onCreateNew}
        testID="button-create-new-link"
        accessible={true}
        accessibilityLabel="Create new workout"
        accessibilityRole="link">
        <View className="flex-row items-center">
          <Text className="mr-1 text-lg font-bold text-primary">{t('home.createNew')}</Text>
          <Plus size={20} color={colors.primary} />
        </View>
      </Pressable>
    </View>
  );
}
