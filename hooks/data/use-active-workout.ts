import { useSelector } from '@legendapp/state/react';

import {
  activeWorkoutStore$,
  activeWorkoutOperations,
} from '~/lib/legend-state/stores/activeWorkoutStore';

export function useActiveWorkout() {
  const activeWorkout = useSelector(activeWorkoutStore$.activeWorkout);
  const isWorkoutActive = useSelector(activeWorkoutStore$.isWorkoutActive);

  return {
    activeWorkout,
    isWorkoutActive,
    startWorkout: activeWorkoutOperations.startWorkout,
    updateSet: activeWorkoutOperations.updateSet,
    addSet: activeWorkoutOperations.addSet,
    removeSet: activeWorkoutOperations.removeSet,
    updateExercise: activeWorkoutOperations.updateExercise,
    completeWorkout: activeWorkoutOperations.completeWorkout,
    cancelWorkout: activeWorkoutOperations.cancelWorkout,
    pauseWorkout: activeWorkoutOperations.pauseWorkout,
    resumeWorkout: activeWorkoutOperations.resumeWorkout,
    hideWorkout: activeWorkoutOperations.hideWorkout,
    showWorkout: activeWorkoutOperations.showWorkout,
  };
}
