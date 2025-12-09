/**
 * Workout History Section Component
 * Displays recent workouts and link to full history
 */

import React from 'react';

import { View, TouchableOpacity } from 'react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '@react-navigation/native';
import { History } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import type { Workout, WorkoutHistory } from '~/types';

interface WorkoutHistorySectionProps {
  thisWeekWorkouts: WorkoutHistory[];
  workoutHistory: WorkoutHistory[];
  workouts: Workout[];
}

export function WorkoutHistorySection({
  thisWeekWorkouts: _thisWeekWorkouts,
  workoutHistory,
  workouts: _workouts,
}: WorkoutHistorySectionProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View className="mb-6" testID="workout-history-section">
      <Text className="mb-3 text-lg font-medium text-foreground" testID="workout-history-title">
        {t('statistics.workoutHistory')}
      </Text>

      {/* View Full History Button */}
      <TouchableOpacity
        onPress={() => router.push('/workout-history')}
        activeOpacity={0.7}
        testID="view-full-history-button"
        accessible={true}
        accessibilityLabel="View full workout history"
        accessibilityRole="button">
        <Card className="bg-card" testID="view-full-history-card">
          <CardContent className="flex-row items-center justify-between p-4">
            <View className="flex-1" testID="history-content">
              <View className="flex-row items-center">
                <History size={20} color={colors.primary} />
                <Text
                  className="ml-2 text-base font-medium text-card-foreground"
                  testID="view-full-history-text">
                  {t('statistics.viewFullHistory')}
                </Text>
              </View>
              {workoutHistory.length > 0 && (
                <Text className="mt-1 text-sm text-muted-foreground" testID="workout-count-text">
                  {workoutHistory.length}{' '}
                  {workoutHistory.length !== 1
                    ? t('statistics.totalWorkouts')
                    : t('statistics.totalWorkout')}{' '}
                  {t('statistics.completed')}
                </Text>
              )}
            </View>
            <View className="opacity-50" testID="history-arrow">
              <Text className="text-xl">→</Text>
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    </View>
  );
}
