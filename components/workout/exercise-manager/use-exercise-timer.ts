import { useState, useRef, useCallback, useEffect } from 'react';

import type { FlatList } from 'react-native';

import { useTimer } from '~/hooks/workout/use-timer';
import type { ExerciseWithDetails } from '~/types';

interface UseExerciseTimerProps {
  exercisesWithDetails: ExerciseWithDetails[];
  flatListRef: React.RefObject<FlatList | null>;
  showImmediateNotification: (title: string, body: string) => Promise<string | null>;
}

export function useExerciseTimer({
  exercisesWithDetails,
  flatListRef,
  showImmediateNotification,
}: UseExerciseTimerProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  const [nextExerciseIndex, setNextExerciseIndex] = useState<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { timerState, startTimer, cancelActiveTimer } = useTimer({
    flatListRef,
    nextExerciseIndex,
    showImmediateNotification,
  });

  const handleSetRestTimer = async (
    exerciseName: string,
    seconds: number,
    exerciseIndex: number,
    setIndex: number
  ) => {
    await startTimer('set', seconds, exerciseName, undefined, exerciseIndex, setIndex);
  };

  const cancelRestTimer = useCallback(async () => {
    await cancelActiveTimer();
  }, [cancelActiveTimer]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  const startInterExerciseRest = async (currentExIndex: number, nextExIndex: number) => {
    const currentExercise = exercisesWithDetails[currentExIndex];
    const nextExercise = exercisesWithDetails[nextExIndex];
    const restTime = currentExercise.nextExerciseRest || 0;

    if (restTime <= 0) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (flatListRef.current && nextExIndex !== null) {
          flatListRef.current.scrollToIndex({
            index: nextExIndex,
            animated: true,
            viewOffset: 20,
          });
        }
        scrollTimeoutRef.current = null;
      }, 300);
      return;
    }

    await cancelActiveTimer();

    setCurrentExerciseIndex(currentExIndex);
    setNextExerciseIndex(nextExIndex);

    await startTimer('exercise', restTime, currentExercise.details.name, nextExercise.details.name);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    timerState,
    currentExerciseIndex,
    nextExerciseIndex,
    handleSetRestTimer,
    cancelRestTimer,
    formatTime,
    startInterExerciseRest,
    cancelActiveTimer,
  };
}
