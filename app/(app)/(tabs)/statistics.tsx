/**
 * Statistics Screen
 * Main screen for viewing workout statistics and workout history
 */

import { View, TouchableOpacity } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Screen } from '~/components/layout/screen';
import { MuscleGroupHeatmap } from '~/components/statistics/muscle-group-heatmap';
import { WorkoutCalendarGrid } from '~/components/statistics/workout-calendar-grid';
import { StatsSummaryCard } from '~/components/statistics-screen/stats-summary-card';
import { useMonthNavigation } from '~/components/statistics-screen/use-month-navigation';
import { useStatisticsCalculations } from '~/components/statistics-screen/use-statistics-calculations';
import { useStatisticsState } from '~/components/statistics-screen/use-statistics-state';
import { WorkoutHistorySection } from '~/components/statistics-screen/workout-history-section';
import { WorkoutStreakDisplay } from '~/components/statistics-screen/workout-streak-display';
import { Text } from '~/components/ui/text';
import { useExercises } from '~/hooks/data';
import { useWorkoutHistory } from '~/hooks/data/use-workout-history';
import { useWorkouts } from '~/hooks/data/use-workouts';
import { APP_PADDING } from '~/lib/constants';
import { useWeekStart } from '~/lib/contexts/WeekStartContext';

export default function StatisticsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { getWeekStartDayNumber } = useWeekStart();
  const weekStartDayNumber = getWeekStartDayNumber();

  // Database hooks
  const { exercises } = useExercises();
  const { workouts } = useWorkouts();
  const { workoutHistory } = useWorkoutHistory();

  // State management
  const { timePeriod, setTimePeriod, monthOffset, setMonthOffset } = useStatisticsState();

  // Statistics calculations
  const { weeklyWorkouts, thisWeekStats, thisWeekWorkouts, periodStartDate, earliestWorkoutDate } =
    useStatisticsCalculations({
      workoutHistory,
      exercises,
      weekStartDayNumber,
      timePeriod,
      monthOffset,
    });

  // Month navigation
  const {
    canNavigateToPreviousMonth,
    canNavigateToNextMonth,
    handlePreviousMonth,
    handleNextMonth,
  } = useMonthNavigation({
    timePeriod,
    monthOffset,
    earliestWorkoutDate,
    setMonthOffset,
  });

  return (
    <Screen
      title={t('screens.statistics')}
      scrollable
      contentContainerStyle={{ paddingHorizontal: APP_PADDING.horizontal }}
      testID="statistics-screen">
      <View testID="statistics-content">
        {/* Workouts Section Header */}
        <View className="flex-row items-center justify-between pb-3 pt-2" testID="workouts-header">
          <Text className="text-lg font-medium text-foreground" testID="workouts-title">
            {t('statistics.workouts')}
          </Text>

          <View className="flex-row items-center gap-2">
            {/* Month Navigation Arrows (only visible in month view) */}
            {timePeriod === 'month' && (
              <>
                <TouchableOpacity
                  onPress={handlePreviousMonth}
                  disabled={!canNavigateToPreviousMonth}
                  activeOpacity={0.7}
                  className={`h-8 w-8 items-center justify-center rounded-md ${
                    canNavigateToPreviousMonth ? 'bg-muted/30' : 'opacity-30'
                  }`}
                  testID="previous-month-button">
                  <ChevronLeft
                    size={18}
                    color={canNavigateToPreviousMonth ? colors.primary : colors.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNextMonth}
                  disabled={!canNavigateToNextMonth}
                  activeOpacity={0.7}
                  className={`h-8 w-8 items-center justify-center rounded-md ${
                    canNavigateToNextMonth ? 'bg-muted/30' : 'opacity-30'
                  }`}
                  testID="next-month-button">
                  <ChevronRight
                    size={18}
                    color={canNavigateToNextMonth ? colors.primary : colors.text}
                  />
                </TouchableOpacity>
              </>
            )}

            {/* View Toggle Button */}
            <TouchableOpacity
              onPress={() => {
                setTimePeriod((prev) => (prev === 'week' ? 'month' : 'week'));
                if (timePeriod === 'month') {
                  setMonthOffset(0);
                }
              }}
              activeOpacity={0.7}
              className="flex-row items-center rounded-md bg-muted/30 px-3 py-1.5"
              testID="time-period-toggle">
              <Text className="text-sm font-medium text-primary" testID="time-period-text">
                {timePeriod === 'week'
                  ? t('statistics.thisWeek')
                  : monthOffset === 0
                    ? t('statistics.thisMonth')
                    : periodStartDate.toLocaleDateString(undefined, {
                        month: 'long',
                        year: 'numeric',
                      })}
              </Text>
              <ChevronDown size={16} color={colors.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Card */}
        <StatsSummaryCard thisWeekStats={thisWeekStats}>
          {timePeriod === 'week' ? (
            <WorkoutStreakDisplay weeklyWorkouts={weeklyWorkouts} />
          ) : (
            <WorkoutCalendarGrid workoutHistory={workoutHistory} targetDate={periodStartDate} />
          )}
        </StatsSummaryCard>

        {/* Muscle Groups Heatmap */}
        <View testID="muscle-groups-section">
          <MuscleGroupHeatmap />
        </View>

        {/* Workout History Section */}
        <WorkoutHistorySection
          thisWeekWorkouts={thisWeekWorkouts}
          workoutHistory={workoutHistory}
          workouts={workouts}
        />
      </View>
    </Screen>
  );
}
