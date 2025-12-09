import { useState, useEffect, useCallback } from 'react';

interface UseQuickWorkoutProps {
  workoutId: string;
  setWorkoutName: (name: string) => void;
  recoveredWorkoutName?: string;
}

export function useQuickWorkout({
  workoutId,
  setWorkoutName,
  recoveredWorkoutName,
}: UseQuickWorkoutProps) {
  const [isQuickWorkout, setIsQuickWorkout] = useState(false);
  const [quickWorkoutName, setQuickWorkoutName] = useState('Quick Workout');

  useEffect(() => {
    if (workoutId === 'quick') {
      setIsQuickWorkout(true);
    }
  }, [workoutId]);

  useEffect(() => {
    if (recoveredWorkoutName && workoutId === 'quick') {
      // Use the recovered workout name if available
      setQuickWorkoutName(recoveredWorkoutName);
      setWorkoutName(recoveredWorkoutName);
    }
  }, [workoutId, recoveredWorkoutName, setWorkoutName]);

  const updateQuickWorkoutName = useCallback(
    (name: string) => {
      setQuickWorkoutName(name);
      setWorkoutName(name);
    },
    [setWorkoutName]
  );

  return {
    isQuickWorkout,
    quickWorkoutName,
    setQuickWorkoutName,
    updateQuickWorkoutName,
  };
}
