import type { Exercise, ExerciseWithDetails } from '~/types';

export interface ExerciseManagerProps {
  exercisesWithDetails: ExerciseWithDetails[];
  filteredExercises: Exercise[];
  isAddingExercises: boolean;
  searchQuery: string;
  workoutId?: string;
  onChangeSearchQuery: (query: string) => void;
  onClearSearch: () => void;
  onToggleAddExercises: () => void;
  cancelExerciseSelection: () => void;
  applyExerciseSelection: () => void;
  useModalForAddExercises?: boolean;
  onAddExercise: (exercise: Exercise) => void;
  onCreateCustomExercise?: (exercise: Omit<Exercise, 'id'>) => void;
  onRemoveExercise?: (exerciseId: string) => void;
  onUpdateRestTime?: (exerciseIndex: number, change: number) => void;
  onUpdateNextExerciseRest?: (exerciseIndex: number, seconds: number) => void;
  onToggleRest?: (exerciseIndex: number) => void;
  onAddSet?: (exerciseIndex: number) => void;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSetData?: (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight' | 'time' | 'distance',
    value: string
  ) => void;
  onUpdateExerciseNote?: (exerciseIndex: number, note: string) => void;
  onReplaceExercise?: (exerciseIndex: number) => void;
  onToggleSetCompletion?: (exerciseIndex: number, setIndex: number) => void;
  onShowReorderModal?: () => void;
  onPropagateSetRest?: (restTime: number) => void;
  onPropagateNextRest?: (restTime: number) => void;
  recalculatePRsAfterSetRemoval?: (exerciseIndex: number, removedSet: any) => void;
  onRestTimerStateChange?: (timerState: any) => void;
  onAbandonWorkout?: () => void;
  onDeleteWorkout?: () => void;
  isReadOnly?: boolean;
  onExposeHandleSetCompletion?: (
    handler: (exerciseIndex: number, setIndex: number) => void
  ) => void;
}

export interface TimerState {
  active: boolean;
  type: 'set' | 'exercise' | null;
  seconds: number;
  totalSeconds: number;
  exerciseName: string;
  nextExerciseName?: string;
  triggeredByExerciseIndex?: number;
  triggeredBySetIndex?: number;
}
