/**
 * Workout Streak Display Component
 * Shows weekly workout streak visualization
 */

import React, { useMemo } from 'react';

import { View } from 'react-native';

import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { useWeekStart } from '~/lib/contexts/WeekStartContext';

interface WorkoutStreakDisplayProps {
  weeklyWorkouts: Record<number, boolean>;
}

export function WorkoutStreakDisplay({ weeklyWorkouts }: WorkoutStreakDisplayProps) {
  const { t } = useTranslation();
  const { getWeekStartDayNumber } = useWeekStart();
  const weekStartDayNumber = getWeekStartDayNumber();

  // Memoize days of week calculation to prevent re-renders
  const daysOfWeek = useMemo(() => {
    const allDaysOfWeek = [
      { id: 0, label: t('statistics.weekDays.sunday') },
      { id: 1, label: t('statistics.weekDays.monday') },
      { id: 2, label: t('statistics.weekDays.tuesday') },
      { id: 3, label: t('statistics.weekDays.wednesday') },
      { id: 4, label: t('statistics.weekDays.thursday') },
      { id: 5, label: t('statistics.weekDays.friday') },
      { id: 6, label: t('statistics.weekDays.saturday') },
    ];

    // Reorder days based on user's week start preference
    return [
      ...allDaysOfWeek.slice(weekStartDayNumber),
      ...allDaysOfWeek.slice(0, weekStartDayNumber),
    ];
  }, [weekStartDayNumber, t]);

  return (
    <View className="flex-row justify-between pt-2" testID="weekly-streak">
      {daysOfWeek.map((day) => {
        const isToday = new Date().getDay() === day.id;
        const hasWorkout = weeklyWorkouts?.[day.id] || false;
        const isUpcomingDay = day.id > new Date().getDay();

        return (
          <View key={day.id} className="items-center" testID={`day-${day.id}`}>
            <Text className="mb-1 text-xs text-muted-foreground" testID={`day-label-${day.id}`}>
              {day.label}
            </Text>
            <View
              className={`h-10 w-10 items-center justify-center rounded-md ${
                hasWorkout
                  ? 'bg-primary'
                  : isToday
                    ? 'border border-primary bg-background'
                    : isUpcomingDay
                      ? 'bg-muted/30'
                      : 'bg-muted/50'
              }`}
              testID={`day-circle-${day.id}${hasWorkout ? '-completed' : isToday ? '-today' : isUpcomingDay ? '-upcoming' : '-past'}`}>
              {hasWorkout ? (
                <Check size={18} color="white" />
              ) : isToday ? (
                <View className="h-2 w-2 rounded-full bg-primary" />
              ) : (
                <View className="h-2 w-2 rounded-full bg-muted" />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
