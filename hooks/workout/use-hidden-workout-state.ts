import { useState, useEffect, useCallback, useRef } from 'react';

import { SimpleWorkoutPersistence, SimpleWorkoutState } from '~/lib/services/workout-persistence';

/**
 * Hook to manage hidden workout state using the existing persistence system
 */
export function useHiddenWorkoutState() {
  const [hiddenWorkout, setHiddenWorkout] = useState<SimpleWorkoutState | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  // Track timeout to clean up properly
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for hidden workout on mount
  useEffect(() => {
    const checkForHiddenWorkout = async () => {
      const savedState = SimpleWorkoutPersistence.restore();
      if (savedState && savedState.isHidden) {
        setHiddenWorkout(savedState);
        setIsHidden(true);
      } else {
        setHiddenWorkout(null);
        setIsHidden(false);
      }
    };

    checkForHiddenWorkout();
  }, []);

  // Poll for changes in persistence (since we don't have reactive state)
  useEffect(() => {
    const interval = setInterval(() => {
      const savedState = SimpleWorkoutPersistence.restore();
      const currentlyHidden = savedState && savedState.isHidden;

      if (currentlyHidden && !isHidden) {
        // Workout was just hidden
        setHiddenWorkout(savedState);
        setIsHidden(true);
      } else if (!currentlyHidden && isHidden) {
        // Workout was shown or cleared
        setHiddenWorkout(null);
        setIsHidden(false);
      } else if (currentlyHidden && savedState && isHidden) {
        // Update the workout data if still hidden (only if we think it's already hidden)
        setHiddenWorkout(savedState);
      } else if (!savedState && (isHidden || hiddenWorkout)) {
        // No saved state but we think there's a hidden workout - clear it
        setHiddenWorkout(null);
        setIsHidden(false);
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [isHidden, hiddenWorkout]);

  const hideCurrentWorkout = useCallback(async () => {
    const savedState = SimpleWorkoutPersistence.restore();
    if (savedState) {
      const updatedState = { ...savedState, isHidden: true, lastSaved: Date.now() };
      SimpleWorkoutPersistence.save(updatedState);
      setHiddenWorkout(updatedState);
      setIsHidden(true);
    }
  }, []);

  const showCurrentWorkout = useCallback(async () => {
    const savedState = SimpleWorkoutPersistence.restore();
    if (savedState) {
      const updatedState = { ...savedState, isHidden: false, lastSaved: Date.now() };
      SimpleWorkoutPersistence.save(updatedState);
      setIsHidden(false);
      // Don't clear hiddenWorkout immediately, let the interval handle it
    }
  }, []);

  const clearHiddenWorkout = useCallback(async () => {
    await SimpleWorkoutPersistence.clear();
    setHiddenWorkout(null);
    setIsHidden(false);

    // Clear any existing timeout
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }

    // Force immediate state check to prevent polling from restoring state
    clearTimeoutRef.current = setTimeout(() => {
      const savedState = SimpleWorkoutPersistence.restore();
      if (!savedState) {
        setHiddenWorkout(null);
        setIsHidden(false);
      }
      clearTimeoutRef.current = null;
    }, 50);
  }, []);

  const forceStateCheck = useCallback(() => {
    const savedState = SimpleWorkoutPersistence.restore();
    if (savedState && savedState.isHidden) {
      setHiddenWorkout(savedState);
      setIsHidden(true);
    } else {
      setHiddenWorkout(null);
      setIsHidden(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear timeout if component unmounts
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    hiddenWorkout,
    isHidden,
    hideCurrentWorkout,
    showCurrentWorkout,
    clearHiddenWorkout,
    forceStateCheck,
  };
}
