import type { Exercise } from '~/types';

export interface CustomExerciseCreatorProps {
  searchQuery?: string;
  onCreateCustomExercise?: (exercise: Omit<Exercise, 'id'>) => void;
  onUpdateExercise?: (exercise: {
    id: string;
    name: string;
    type: 'reps' | 'time' | 'distance';
    primaryMuscleGroup: string;
    secondaryMuscleGroups: string[];
    usesPlates?: boolean;
  }) => void;
  onClearSearch?: (exerciseName: string) => void;
  editingExercise?: Exercise & {
    primaryMuscleGroupId?: string;
    secondaryMuscleGroupIds?: string[];
  };
  isOpen?: boolean;
  onClose?: () => void;
  mode?: 'create' | 'edit';
  existingExercises?: Exercise[];
}

export interface ExerciseFormState {
  exerciseType: 'reps' | 'time' | 'distance';
  primaryMuscleGroup: string;
  secondaryMuscleGroups: string[];
  exerciseName: string;
  usesPlates: boolean;
  validationError: string | null;
  isAISuggesting: boolean;
  aiSuggestionUsed: boolean;
  hasOpenAIKey: boolean | null;
}
