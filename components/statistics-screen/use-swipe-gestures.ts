/**
 * Swipe Gestures Hook
 * Handles swipe gesture detection for month navigation
 */

import { useState } from 'react';

import type { GestureResponderEvent } from 'react-native';

interface UseSwipeGesturesProps {
  timePeriod: 'week' | 'month';
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
}

export function useSwipeGestures({
  timePeriod,
  handlePreviousMonth,
  handleNextMonth,
}: UseSwipeGesturesProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: GestureResponderEvent) => {
    setTouchEnd(null);
    setTouchStart(e.nativeEvent.pageX);
  };

  const onTouchMove = (e: GestureResponderEvent) => {
    setTouchEnd(e.nativeEvent.pageX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Only handle swipes when in month view
    if (timePeriod === 'month') {
      if (isLeftSwipe) {
        handlePreviousMonth();
      } else if (isRightSwipe) {
        handleNextMonth();
      }
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
