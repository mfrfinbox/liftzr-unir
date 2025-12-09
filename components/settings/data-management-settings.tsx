import { useState } from 'react';

import { View, ActivityIndicator, Pressable, Alert } from 'react-native';

import * as Updates from 'expo-updates';

import { useTheme } from '@react-navigation/native';
import { RefreshCw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { exercisesStore$ } from '~/lib/legend-state/stores/exercisesStore';
import { personalRecordsStore$ } from '~/lib/legend-state/stores/personalRecordsStore';
import {
  userPreferencesStore$,
  DEFAULT_USER_PREFERENCES,
} from '~/lib/legend-state/stores/userPreferencesStore';
import { workoutHistoryStore$ } from '~/lib/legend-state/stores/workoutHistoryStore';
import { workoutsStore$ } from '~/lib/legend-state/stores/workoutsStore';

export function DataManagementSettings() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDatabase = async () => {
    Alert.alert(
      t('settings.dataManagement.resetConfirmTitle'),
      t('settings.dataManagement.resetConfirmMessage'),
      [
        {
          text: t('settings.dataManagement.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.dataManagement.reset'),
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              // Reset Legend State stores
              workoutsStore$.workouts.set([]);
              workoutHistoryStore$.workoutHistory.set([]);
              personalRecordsStore$.data.set({});

              // Clear only custom exercises (preserve global ones)
              const exercises = exercisesStore$.exercises.peek();
              const globalExercises = exercises.filter((e) => !e.isCustom);
              exercisesStore$.exercises.set(globalExercises);

              // Reset user preferences to defaults
              userPreferencesStore$.userPreferences.set(DEFAULT_USER_PREFERENCES);

              // Restart the app
              await Updates.reloadAsync();
            } catch (error) {
              console.error('Reset database error:', error);
              Alert.alert(t('errors.title'), t('errors.unexpected'));
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="gap-2">
      {/* Reset Database Button */}
      <Pressable
        className="flex-row items-center justify-center px-4 py-3.5 active:opacity-70"
        onPress={handleResetDatabase}
        disabled={isResetting}
        testID="reset-database-button">
        {isResetting ? (
          <View className="flex-row items-center gap-3">
            <ActivityIndicator color={colors.notification} size="small" />
            <Text className="text-base text-red-500">
              {t('settings.dataManagement.resettingDatabase')}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-3">
            <RefreshCw size={20} color={colors.notification} />
            <Text className="text-base text-red-500">
              {t('settings.dataManagement.resetDatabase')}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
