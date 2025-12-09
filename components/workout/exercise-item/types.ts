import type { ExerciseWithDetails } from '~/types';

export interface ExerciseItemProps {
  item: ExerciseWithDetails;
  index: number;
  workoutId?: string;
  onRemoveExercise?: (exerciseId: string) => void;
  onUpdateRestTime?: (exerciseIndex: number, change: number) => void;
  onToggleRest?: (exerciseIndex: number) => void;
  onUpdateNextExerciseRest?: (exerciseIndex: number, seconds: number) => void;
  onAddSet?: (exerciseIndex: number) => void;
  onAddSetWithPreviousPerformance?: (exerciseIndex: number, previousPerformance: any) => void;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSetData?: (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight' | 'time' | 'distance',
    value: string
  ) => void;
  onUpdateExerciseNote?: (exerciseIndex: number, note: string) => void;
  onToggleSetCompletion?: (exerciseIndex: number, setIndex: number) => void;
  onReplaceExercise?: (exerciseIndex: number) => void;
  isActiveWorkout?: boolean;
  onShowReorderModal?: () => void;
  isLastExercise?: boolean;
  onSetRestTimerStart?: (
    exerciseName: string,
    seconds: number,
    exerciseIndex: number,
    setIndex: number
  ) => void;
  onPropagateSetRest?: (restTime: number) => void;
  onPropagateNextRest?: (restTime: number) => void;
  handleSetCompletion?: (exerciseIndex: number, setIndex: number) => void;
  previousPerformance?: any;
}
