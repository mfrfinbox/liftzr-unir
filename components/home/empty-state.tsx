/**
 * Home Empty State
 * Displayed when no workouts exist yet
 */

import { View, Pressable } from 'react-native';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { SEPARATOR_STYLE } from '~/lib/constants/ui';

import type { EmptyStateProps } from './types';

/**
 * Empty state view for home screen
 * Shows when user has no workouts created yet
 */
export function EmptyState({ onCreateWorkout, onStartQuickWorkout }: EmptyStateProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="items-center justify-center px-8"
      style={{
        flex: 1,
        minHeight: '100%',
        paddingBottom: insets.bottom + 60, // Account for tab bar
      }}>
      <Text className="mb-2 text-center text-xl font-bold text-foreground">
        {t('home.noWorkoutsYet')}
      </Text>

      <Text className="mb-12 text-center text-base text-muted-foreground">
        {t('home.createFirstWorkout')}
      </Text>

      <Button
        className="mb-8 w-full max-w-[280px] rounded-md bg-primary py-4"
        onPress={onCreateWorkout}
        testID="button-create-workout-empty">
        <Text className="text-base font-semibold text-white">{t('home.createWorkout')}</Text>
      </Button>

      <View className="mb-8 w-full max-w-[280px] flex-row items-center">
        <View className={`flex-1 ${SEPARATOR_STYLE}`} />
        <Text className="mx-4 text-muted-foreground">{t('home.or')}</Text>
        <View className={`flex-1 ${SEPARATOR_STYLE}`} />
      </View>

      <Pressable
        className="w-full max-w-[280px] rounded-md border border-border p-4 active:opacity-70"
        onPress={onStartQuickWorkout}
        testID="button-start-quick-workout"
        accessible={true}
        accessibilityLabel="Start quick workout"
        accessibilityRole="button">
        <Text className="text-center text-base text-foreground">{t('home.startQuickSession')}</Text>
      </Pressable>
    </View>
  );
}
