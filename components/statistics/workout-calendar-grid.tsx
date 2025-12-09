import React, { useMemo } from 'react';

import { View, TouchableOpacity } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { useWeekStart } from '~/lib/contexts/WeekStartContext';
import type { WorkoutHistory } from '~/types';

interface WorkoutCalendarGridProps {
  workoutHistory: WorkoutHistory[];
  targetDate?: Date; // Optional target date to show specific month
}

export function WorkoutCalendarGrid({ workoutHistory, targetDate }: WorkoutCalendarGridProps) {
  const { colors, dark } = useTheme();
  const { t } = useTranslation();
  const { getWeekStartDayNumber } = useWeekStart();
  const weekStartDayNumber = getWeekStartDayNumber();

  // No cutoff date - full history access for everyone
  const cutoffDate = null;

  // Calculate month data (use targetDate if provided, otherwise current month)
  const { calendarDays, workoutCounts, lockedDays, displayMonth, externalWorkoutDays } =
    useMemo(() => {
      const displayDate = targetDate || new Date();
      const currentYear = displayDate.getFullYear();
      const currentMonth = displayDate.getMonth();

      // Get first and last day of current month
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();

      // Get day of week for first day (0 = Sunday)
      const firstDayWeekday = firstDayOfMonth.getDay();

      // Adjust for week start preference (weekStartDayNumber: 0=Sunday, 1=Monday)
      const adjustedFirstDay = (firstDayWeekday - weekStartDayNumber + 7) % 7;

      // Count workouts per day and track external workouts
      const counts = new Map<string, number>();
      const lockedDays = new Set<number>();
      const externalWorkoutDays = new Set<number>(); // Track days with external workouts

      workoutHistory.forEach((workout) => {
        const date = new Date(workout.date);
        // Only count workouts from current month
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          const day = date.getDate();

          // No cutoff - all workouts are visible

          const currentCount = counts.get(day.toString()) || 0;
          counts.set(day.toString(), currentCount + 1);

          // Track if this day has any external workouts (HealthKit)
          if (workout.workoutId?.startsWith('healthkit-')) {
            externalWorkoutDays.add(day);
          }
        }
      });

      // No locked dates - everyone has full access

      // Build calendar array with empty cells for alignment
      const days: (number | null)[] = [];

      // Add empty cells for days before month starts (adjusted for week start preference)
      for (let i = 0; i < adjustedFirstDay; i++) {
        days.push(null);
      }

      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }

      // Fill remaining cells to complete the last week
      const remainingCells = 7 - (days.length % 7);
      if (remainingCells < 7) {
        for (let i = 0; i < remainingCells; i++) {
          days.push(null);
        }
      }

      return {
        calendarDays: days,
        workoutCounts: counts,
        lockedDays,
        displayMonth: currentMonth,
        externalWorkoutDays,
      };
    }, [workoutHistory, cutoffDate, targetDate, weekStartDayNumber]);

  // Get color based on workout count
  const getSquareColor = (count: number, isLocked: boolean) => {
    if (isLocked) {
      // More visible locked state with diagonal stripes effect using gradient
      return dark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
    }
    const primaryRGB = '47, 110, 240';
    if (count === 0) {
      return `rgba(${primaryRGB}, 0.1)`;
    } else if (count === 1) {
      return `rgba(${primaryRGB}, 0.4)`;
    } else if (count === 2) {
      return `rgba(${primaryRGB}, 0.7)`;
    } else {
      return `rgba(${primaryRGB}, 1)`;
    }
  };

  // Day labels - reorder based on week start preference
  const dayLabels = useMemo(() => {
    const allDays = [
      t('statistics.weekDays.sunday'),
      t('statistics.weekDays.monday'),
      t('statistics.weekDays.tuesday'),
      t('statistics.weekDays.wednesday'),
      t('statistics.weekDays.thursday'),
      t('statistics.weekDays.friday'),
      t('statistics.weekDays.saturday'),
    ];

    // Rotate array based on week start preference
    return [...allDays.slice(weekStartDayNumber), ...allDays.slice(0, weekStartDayNumber)];
  }, [t, weekStartDayNumber]);

  return (
    <View className="-mx-3">
      {/* Day labels */}
      <View className="flex-row px-2 pb-1">
        {dayLabels.map((label, index) => (
          <View key={index} className="flex-1 items-center">
            <Text className="text-xs text-muted-foreground">{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View className="flex-row flex-wrap px-2">
        {calendarDays.map((day, index) => {
          const isLocked = day ? lockedDays.has(day) : false;
          const count = day && !isLocked ? workoutCounts.get(day.toString()) || 0 : 0;
          const hasExternalWorkout = day ? externalWorkoutDays.has(day) : false;
          const today = new Date();
          const isToday =
            day === today.getDate() &&
            displayMonth === today.getMonth() &&
            (targetDate ? targetDate.getFullYear() === today.getFullYear() : true);

          return (
            <View
              key={index}
              className="items-center justify-center p-0.5"
              style={{ width: `${100 / 7}%`, aspectRatio: 1 }}>
              {day ? (
                <View
                  className="relative h-full w-full items-center justify-center overflow-hidden rounded-md"
                  style={{
                    backgroundColor: isLocked
                      ? dark
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(0, 0, 0, 0.03)'
                      : getSquareColor(count, false),
                    borderWidth: isToday && !isLocked ? 2 : 0,
                    borderColor: isToday && !isLocked ? colors.primary : 'transparent',
                  }}>
                  {isLocked ? (
                    <Lock size={16} color={colors.text} style={{ opacity: 0.5 }} />
                  ) : (
                    <>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        className="h-full w-full items-center justify-center">
                        <View className="items-center">
                          <Text
                            className="text-xs font-medium"
                            style={{
                              color: count > 0 ? 'white' : colors.text,
                              opacity: count > 0 ? 1 : 0.5,
                            }}>
                            {day}
                          </Text>
                          {/* Small dot indicator below number for external workouts */}
                          {hasExternalWorkout && (
                            <View
                              style={{
                                width: 3,
                                height: 3,
                                borderRadius: 1.5,
                                marginTop: 1,
                                backgroundColor:
                                  count > 0 ? 'rgba(255, 255, 255, 0.8)' : colors.primary,
                              }}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ) : (
                <View className="h-full w-full" />
              )}
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View className="mt-3">
        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-xs text-muted-foreground">{t('statistics.restDay')}</Text>
          <View className="flex-row gap-1">
            <View
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: 'rgba(47, 110, 240, 0.1)' }}
            />
            <View
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: 'rgba(47, 110, 240, 0.4)' }}
            />
            <View
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: 'rgba(47, 110, 240, 0.7)' }}
            />
            <View
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: 'rgba(47, 110, 240, 1)' }}
            />
          </View>
          <Text className="text-xs text-muted-foreground">{t('statistics.multiple')}</Text>
        </View>
        {/* External workout indicator legend */}
        {externalWorkoutDays.size > 0 && (
          <View className="mt-2 flex-row items-center justify-center gap-1.5">
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }}
            />
            <Text className="text-[10px] text-muted-foreground" style={{ opacity: 0.8 }}>
              Apple Health
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
