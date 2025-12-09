/**
 * Statistics State Management Hook
 * Manages state for time period selection and month navigation
 */

import { useState } from 'react';

export function useStatisticsState() {
  // State for time period selection
  const [timePeriod, setTimePeriod] = useState<'week' | 'month'>('week');

  // State for month navigation (0 = current month, -1 = previous month, etc.)
  const [monthOffset, setMonthOffset] = useState(0);

  return {
    timePeriod,
    setTimePeriod,
    monthOffset,
    setMonthOffset,
  };
}
