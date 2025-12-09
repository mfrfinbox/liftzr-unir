import { useState, useEffect, useCallback, useRef } from 'react';

export interface WorkoutTimerState {
  isWorkoutActive: boolean;
  isWorkoutPaused: boolean;
  elapsedTime: number;
  startTime: Date;
  pausedTime: number; // CRITICAL: Now stored in MILLISECONDS (like Watch) for precision
  lastPauseTime: Date | null;
}

export interface WorkoutTimerActions {
  handlePauseWorkout: (timestamp?: number) => Promise<void>;
  formatTime: (timeInSeconds: number) => string;
  setStartTime: (time: Date) => void;
  setPausedTime: (time: number) => void;
  setElapsedTime: (time: number) => void;
}

export function useWorkoutTimer(
  setWorkoutTime: ((time: number) => void) | null,
  initialStartTime?: Date,
  initialPausedState?: boolean
): WorkoutTimerState & WorkoutTimerActions {
  const [isWorkoutActive] = useState(true);
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(initialPausedState || false);
  const [elapsedTime, setElapsedTimeInternal] = useState(0);
  const [startTime, setStartTime] = useState<Date>(initialStartTime || new Date());
  const [pausedTime, setPausedTime] = useState(0);
  const [lastPauseTime, setLastPauseTime] = useState<Date | null>(null);

  // CRITICAL: Use refs to avoid interval restarts on state changes
  const pausedTimeRef = useRef(pausedTime);
  const startTimeRef = useRef(startTime);

  // Update refs whenever state changes
  pausedTimeRef.current = pausedTime;
  startTimeRef.current = startTime;

  // Wrapper to update both elapsed time and workout time together
  const setElapsedTime = useCallback(
    (time: number | ((prev: number) => number)) => {
      setElapsedTimeInternal((prev) => {
        const newTime = typeof time === 'function' ? time(prev) : time;
        if (setWorkoutTime) {
          setWorkoutTime(newTime);
        }
        return newTime;
      });
    },
    [setWorkoutTime]
  );

  const handlePauseWorkout = useCallback(
    async (timestamp?: number) => {
      // Use provided timestamp (from Watch) or current time
      const now = timestamp || Date.now();

      if (isWorkoutPaused) {
        // RESUMING: Calculate pause duration in MILLISECONDS (matches Watch implementation)
        if (lastPauseTime) {
          const pauseDuration = now - lastPauseTime.getTime(); // Keep in ms for precision
          setPausedTime((prev) => prev + pauseDuration);
        }
        setIsWorkoutPaused(false);
        setLastPauseTime(null);
      } else {
        // PAUSING: Calculate and freeze elapsed time at the exact pause timestamp
        const start = startTime.getTime();
        const frozenElapsed = Math.floor((now - start - pausedTime) / 1000); // pausedTime is now in ms

        // Set the frozen elapsed time immediately
        setElapsedTimeInternal(frozenElapsed);

        setIsWorkoutPaused(true);
        setLastPauseTime(new Date(now));
      }
    },
    [isWorkoutPaused, lastPauseTime, elapsedTime, startTime, pausedTime]
  );

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update workout time only when elapsed time actually changes (not in the interval)
  useEffect(() => {
    if (setWorkoutTime) {
      setWorkoutTime(elapsedTime);
    }
  }, [elapsedTime, setWorkoutTime]);

  // Timestamp-based timer (matches Watch implementation - never gets out of sync)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isWorkoutActive && !isWorkoutPaused) {
      interval = setInterval(() => {
        // Calculate elapsed time from timestamps using REFS (same as Watch)
        const now = Date.now();
        const start = startTimeRef.current.getTime();
        const pausedMs = pausedTimeRef.current; // pausedTime is now stored in ms (no conversion needed)
        const elapsed = Math.floor((now - start - pausedMs) / 1000);

        setElapsedTimeInternal(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isWorkoutActive, isWorkoutPaused]); // ONLY depend on pause state, not values!

  return {
    isWorkoutActive,
    isWorkoutPaused,
    elapsedTime,
    startTime,
    pausedTime,
    lastPauseTime,
    handlePauseWorkout,
    formatTime,
    setStartTime,
    setPausedTime,
    setElapsedTime,
  };
}
