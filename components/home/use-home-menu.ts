/**
 * Home Menu Hook
 * Manages menu state and interactions for workout cards
 */

import { useState, useRef, useCallback } from 'react';

import type { View } from 'react-native';

import { useAnimatedMenu } from '~/hooks/ui/use-animated-menu';
import type { Workout } from '~/types';

import type { UseHomeMenuReturn } from './types';

/**
 * Hook to manage menu state and interactions
 */
export function useHomeMenu(): UseHomeMenuReturn & {
  menuVisible: boolean;
  menuPosition: { top: number; right: number };
  getMenuStyle: () => any;
} {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState<number | undefined>(undefined);
  const menuButtonRefs = useRef<{ [id: string]: View | null }>({});

  const workoutMenu = useAnimatedMenu();

  const showMenu = useCallback(
    (workout: Workout, workoutId: string, index: number) => {
      const menuButtonRef = menuButtonRefs.current[workoutId];
      if (!menuButtonRef) return;

      setSelectedWorkout(workout);
      setSelectedWorkoutIndex(index);
      workoutMenu.showMenu(menuButtonRef);
    },
    [workoutMenu]
  );

  const closeMenu = useCallback(() => {
    workoutMenu.closeMenu(() => {
      setSelectedWorkout(null);
      setSelectedWorkoutIndex(undefined);
    });
  }, [workoutMenu]);

  return {
    selectedWorkout,
    selectedWorkoutIndex,
    menuButtonRefs,
    showMenu,
    closeMenu,
    menuVisible: workoutMenu.menuVisible,
    menuPosition: workoutMenu.menuPosition,
    getMenuStyle: workoutMenu.getMenuStyle,
  };
}
