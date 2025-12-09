import { useState, useCallback } from 'react';

interface UseRestTimerProps {
  initialRestTime: number;
  initialNextRestTime: number;
  exerciseIndex: number;
  onUpdateRestTime?: (exerciseIndex: number, change: number) => void;
  onUpdateNextExerciseRest?: (exerciseIndex: number, seconds: number) => void;
}

export function useRestTimer({
  initialRestTime,
  initialNextRestTime,
  exerciseIndex,
  onUpdateRestTime,
  onUpdateNextExerciseRest,
}: UseRestTimerProps) {
  const [restTime, setRestTime] = useState(initialRestTime.toString());
  const [nextRestTime, setNextRestTime] = useState(initialNextRestTime.toString());

  const handleRestTimeChange = useCallback(
    (seconds: number) => {
      setRestTime(seconds.toString());
      if (onUpdateRestTime) {
        onUpdateRestTime(exerciseIndex, seconds - initialRestTime);
      }
    },
    [exerciseIndex, initialRestTime, onUpdateRestTime]
  );

  const handleNextRestTimeChange = useCallback(
    (seconds: number) => {
      setNextRestTime(seconds.toString());
      if (onUpdateNextExerciseRest) {
        onUpdateNextExerciseRest(exerciseIndex, seconds);
      }
    },
    [exerciseIndex, onUpdateNextExerciseRest]
  );

  return {
    restTime: parseInt(restTime) || 0,
    nextRestTime: parseInt(nextRestTime) || 0,
    handleRestTimeChange,
    handleNextRestTimeChange,
  };
}
