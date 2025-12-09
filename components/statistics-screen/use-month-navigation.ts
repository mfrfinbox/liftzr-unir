/**
 * Month Navigation Hook
 * Handles month navigation logic and constraints
 */

import { useMemo } from 'react';

interface UseMonthNavigationProps {
  timePeriod: 'week' | 'month';
  monthOffset: number;
  earliestWorkoutDate: Date;
  setMonthOffset: (value: number | ((prev: number) => number)) => void;
}

export function useMonthNavigation({
  timePeriod,
  monthOffset,
  earliestWorkoutDate,
  setMonthOffset,
}: UseMonthNavigationProps) {
  const canNavigateToPreviousMonth = useMemo(() => {
    if (timePeriod !== 'month') return false;

    const earliestMonth = new Date(
      earliestWorkoutDate.getFullYear(),
      earliestWorkoutDate.getMonth(),
      1
    );
    const targetMonth = new Date();
    targetMonth.setMonth(targetMonth.getMonth() + monthOffset - 1);
    targetMonth.setDate(1);

    return targetMonth >= earliestMonth;
  }, [timePeriod, monthOffset, earliestWorkoutDate]);

  const canNavigateToNextMonth = useMemo(() => {
    if (timePeriod !== 'month') return false;
    return monthOffset < 0;
  }, [timePeriod, monthOffset]);

  const handlePreviousMonth = () => {
    if (canNavigateToPreviousMonth) {
      setMonthOffset((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (canNavigateToNextMonth) {
      setMonthOffset((prev) => prev + 1);
    }
  };

  return {
    canNavigateToPreviousMonth,
    canNavigateToNextMonth,
    handlePreviousMonth,
    handleNextMonth,
  };
}
