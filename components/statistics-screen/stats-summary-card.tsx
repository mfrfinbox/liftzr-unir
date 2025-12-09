/**
 * Stats Summary Card Component
 * Displays weekly/monthly workout statistics
 */

import React from 'react';

import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';

import { formatWeight } from './statistics-helpers';

interface StatsSummaryCardProps {
  thisWeekStats: {
    workouts: number;
    sets: number;
    weightLifted: number;
    totalTime?: number;
  };
  children?: React.ReactNode;
}

export function StatsSummaryCard({ thisWeekStats, children }: StatsSummaryCardProps) {
  const { t } = useTranslation();
  const { unit, convertWeight } = useMeasurement();

  return (
    <Card className="mb-5 bg-card" testID="weekly-stats-card">
      <CardContent className="p-3">
        {/* Statistics Summary */}
        <View className="flex-row justify-between pb-3" testID="weekly-stats-summary">
          <View className="flex-1 items-center" testID="workouts-stat">
            <Text className="text-2xl font-bold text-foreground" testID="workouts-count">
              {thisWeekStats.workouts}
            </Text>
            <Text className="text-xs text-muted-foreground" testID="workouts-label">
              {t('statistics.workoutsLabel')}
            </Text>
          </View>

          <View className="flex-1 items-center" testID="sets-stat">
            <Text className="text-2xl font-bold text-foreground" testID="sets-count">
              {thisWeekStats.sets}
            </Text>
            <Text className="text-xs text-muted-foreground" testID="sets-label">
              {t('statistics.setsLabel')}
            </Text>
          </View>

          <View className="flex-1 items-center" testID="weight-stat">
            <Text className="text-2xl font-bold text-foreground" testID="weight-count">
              {formatWeight(convertWeight(thisWeekStats.weightLifted, 'kg', unit))}
            </Text>
            <Text className="text-xs text-muted-foreground" testID="weight-unit">
              {unit}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="my-2 h-[0.5px] bg-muted/40" testID="stats-divider" />

        {/* Child content (week/month view) */}
        {children}
      </CardContent>
    </Card>
  );
}
