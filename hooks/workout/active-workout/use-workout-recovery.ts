/**
 * Workout Recovery Hook
 * Handles recovery from saved workout state
 */

import { useEffect, useMemo } from 'react';

import { Alert } from 'react-native';

import { useTranslation } from 'react-i18next';

interface RecoveryState {
  startTime: string;
  elapsedTime: number;
  pausedTime: number;
  isPaused: boolean;
  lastSaved: number;
  workoutName?: string;
}

interface UseWorkoutRecoveryParams {
  recovery: string | undefined;
  setStartTime: (time: Date) => void;
  setPausedTime: (time: number) => void;
  setElapsedTime: (time: number) => void;
}

interface UseWorkoutRecoveryReturn {
  recoveryState: RecoveryState | null;
}

export function useWorkoutRecovery({
  recovery,
  setStartTime,
  setPausedTime,
  setElapsedTime,
}: UseWorkoutRecoveryParams): UseWorkoutRecoveryReturn {
  const { t } = useTranslation();

  // Parse recovery state
  const recoveryState = useMemo(() => {
    if (recovery) {
      try {
        return JSON.parse(recovery) as RecoveryState;
      } catch {
        return null;
      }
    }
    return null;
  }, [recovery]);

  // Restore workout state from recovery
  useEffect(() => {
    if (recoveryState) {
      try {
        const savedStartTime = new Date(recoveryState.startTime);
        const savedElapsedTime = recoveryState.elapsedTime || 0;
        const savedPausedTime = recoveryState.pausedTime || 0;

        // If workout is NOT paused, calculate elapsed time since last save
        let finalElapsedTime = savedElapsedTime;
        if (!recoveryState.isPaused) {
          const now = Date.now();
          const timeSinceSaved = Math.floor((now - recoveryState.lastSaved) / 1000);
          finalElapsedTime = savedElapsedTime + timeSinceSaved;
        }

        setStartTime(savedStartTime);
        setPausedTime(savedPausedTime);
        setElapsedTime(finalElapsedTime);
      } catch {
        Alert.alert(t('workout.recoveryFailedTitle'), t('workout.recoveryFailedMessage'));
      }
    }
  }, [recoveryState, setStartTime, setPausedTime, setElapsedTime, t]);

  return {
    recoveryState,
  };
}
