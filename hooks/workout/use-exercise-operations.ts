import { useCallback, useState, useMemo } from 'react';

import { Alert } from 'react-native';

import { useRouter } from 'expo-router';

import { useToastMessage } from '~/components/ui/toast-message';
import { useExercises } from '~/hooks/data';
import type { MuscleGroup } from '~/lib/constants/muscle-groups';
import { useDefaultRest } from '~/lib/contexts/DefaultRestContext';
import { ExercisePRs as GlobalExercisePRs, PRType } from '~/lib/services/pr-tracking/types';
import type { Exercise, ExerciseWithDetails, WorkoutExercise } from '~/types';

interface UseExerciseOperationsProps {
  exercisesWithDetails: ExerciseWithDetails[];
  setExercisesWithDetails: React.Dispatch<React.SetStateAction<ExerciseWithDetails[]>>;
  allExercises: Exercise[];
  muscleGroups: MuscleGroup[];
  setSessionAchievedPRs: React.Dispatch<React.SetStateAction<GlobalExercisePRs>>;
  setSessionNotifiedPRs: React.Dispatch<
    React.SetStateAction<
      Record<string, Partial<Record<PRType, { value: number; notifiedThisSession: boolean }>>>
    >
  >;
}

export function useExerciseOperations({
  exercisesWithDetails,
  setExercisesWithDetails,
  allExercises,
  muscleGroups,
  setSessionAchievedPRs,
  setSessionNotifiedPRs,
}: UseExerciseOperationsProps) {
  // Exercise selection UI state
  const [isAddingExercises, setIsAddingExercises] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedExercises, setTempSelectedExercises] = useState<ExerciseWithDetails[]>([]);

  // External dependencies
  const { addExercise, exercises: freshExercises } = useExercises();
  const { showSuccessToast, showErrorToast } = useToastMessage();
  const { defaultRestTimes } = useDefaultRest();

  // Use fresh exercises from the hook to ensure we get updates after creating new exercises
  const exercisesToFilter = freshExercises.length > 0 ? freshExercises : allExercises;

  // Computed filtered exercises based on search query
  const filteredExercises = useMemo(() => {
    return searchQuery
      ? exercisesToFilter.filter((exercise) =>
          exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : exercisesToFilter;
  }, [searchQuery, exercisesToFilter]);

  const addExerciseToWorkout = useCallback(
    (exercise: Exercise) => {
      // Check if this exercise is already in the workout
      const alreadyExists = exercisesWithDetails.some((ex) => ex.id === exercise.id);
      if (alreadyExists) {
        return;
      }

      // Generate a unique ID for this workout exercise instance
      const workoutExerciseId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newExercise: ExerciseWithDetails = {
        id: exercise.id,
        workoutExerciseId, // Add the unique identifier
        sets: 1,
        reps: '',
        rest: defaultRestTimes.setRest,
        nextExerciseRest: defaultRestTimes.exerciseRest,
        details: exercise,
        setsData: [{ reps: '', weight: '', completed: false }],
        exerciseNotes: '',
      };

      setExercisesWithDetails((prev) => {
        const updated = [...prev, newExercise];
        return updated;
      });
    },
    [defaultRestTimes, setExercisesWithDetails, exercisesWithDetails]
  );

  const createCustomExercise = useCallback(
    async (exerciseData: Omit<Exercise, 'id'>) => {
      try {
        // Validate primary muscle group
        if (!exerciseData.primaryMuscleGroup) {
          throw new Error('Primary muscle group is required');
        }

        // Check if an exercise with this name already exists locally
        const existingExercise = freshExercises.find(
          (e) => e.name.toLowerCase() === exerciseData.name.toLowerCase() && e.isCustom
        );

        if (existingExercise) {
          // Show error and suggest using the existing exercise
          showErrorToast(
            `You already have a custom exercise named "${exerciseData.name}". Please choose a different name or use the existing one.`
          );

          // Optionally, add the existing exercise to the workout instead
          addExerciseToWorkout(existingExercise);
          showSuccessToast(
            `Added existing exercise "${exerciseData.name}" to your workout instead.`
          );
          return;
        }

        // Create the custom exercise in the database
        const result = await addExercise(exerciseData);

        if (result.success && result.exerciseId && result.data) {
          // Use the created exercise directly from the result
          // It should already have the correct structure with muscle group IDs
          const createdExercise = result.data;

          // Auto-add the custom exercise to the current workout
          // The exercise will have the correct ID from the start
          addExerciseToWorkout(createdExercise);

          // Workaround: Clear and re-type the search to force list refresh
          const currentSearchQuery = searchQuery;
          setSearchQuery('');
          setTimeout(() => {
            setSearchQuery(currentSearchQuery);
          }, 50);

          // Don't close the exercise selection modal - let user continue adding exercises
          // setIsAddingExercises(false);

          // Show success message
          showSuccessToast(`Custom exercise "${exerciseData.name}" created and added!`);
        } else {
          // Check if it's a duplicate name error
          if (result.error?.includes('already exists') || result.error?.includes('duplicate')) {
            throw new Error(
              `You already have an exercise named "${exerciseData.name}". Please choose a different name.`
            );
          }
          throw new Error(result.error || 'Failed to create exercise');
        }
      } catch (_error) {
        const errorMessage =
          _error instanceof Error ? _error.message : 'Failed to create custom exercise';
        showErrorToast(errorMessage);

        // Don't clear search or close modal on error so user can try again
        // setIsAddingExercises(false);
      }
    },
    [
      searchQuery,
      setSearchQuery,
      setIsAddingExercises,
      showSuccessToast,
      showErrorToast,
      addExercise,
      muscleGroups,
      addExerciseToWorkout,
      freshExercises,
    ]
  );

  const removeExercise = useCallback(
    (exerciseIdToRemove: string, skipConfirmation = false) => {
      const action = () => {
        // When in add exercises mode, we're removing by exercise.id
        // When in normal mode, we're removing by workoutExerciseId
        // So we need to handle both cases

        // Find the exercise to get its actual exercise ID for PR cleanup
        const exerciseToRemove = exercisesWithDetails.find((ex) => {
          // If we're in add mode, match by exercise id
          if (isAddingExercises) {
            return ex.id === exerciseIdToRemove;
          }
          // Otherwise match by workoutExerciseId or id
          return (ex.workoutExerciseId || ex.id) === exerciseIdToRemove;
        });
        const actualExerciseId = exerciseToRemove?.id;

        // Remove the exercise with the same matching logic
        setExercisesWithDetails((prev) =>
          prev.filter((ex) => {
            // If we're in add mode, filter by exercise id
            if (isAddingExercises) {
              return ex.id !== exerciseIdToRemove;
            }
            // Otherwise filter by workoutExerciseId or id
            return (ex.workoutExerciseId || ex.id) !== exerciseIdToRemove;
          })
        );

        // Clean up PRs using the actual exercise ID
        if (actualExerciseId) {
          setSessionAchievedPRs((prev) => {
            const updated = { ...prev };
            delete updated[actualExerciseId];
            return updated;
          });
          setSessionNotifiedPRs((prev) => {
            const updated = { ...prev };
            delete updated[actualExerciseId];
            return updated;
          });
        }
      };

      if (skipConfirmation || isAddingExercises) {
        action();
        return;
      }

      Alert.alert('Remove Exercise', 'Are you sure you want to remove this exercise?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: action,
        },
      ]);
    },
    [
      isAddingExercises,
      setExercisesWithDetails,
      setSessionAchievedPRs,
      setSessionNotifiedPRs,
      exercisesWithDetails,
    ]
  );

  const router = useRouter();

  const toggleAddExercises = useCallback(() => {
    // Navigate to the add exercises modal with currently selected exercises
    const selectedExercisesMap: Record<string, WorkoutExercise> = {};

    // Convert exercisesWithDetails to the format expected by the modal
    // Use the actual exercise ID (from details) as the key, not the workout exercise ID
    exercisesWithDetails.forEach((exercise) => {
      // The actual exercise ID is in exercise.details.id
      const exerciseId = exercise.details?.id || exercise.id;

      selectedExercisesMap[exerciseId] = {
        id: exerciseId,
        sets: exercise.sets || 3,
        reps: exercise.reps || '',
        rest: exercise.rest || 60,
        nextExerciseRest: exercise.nextExerciseRest || 0,
        setsData: exercise.setsData || [],
        exerciseNotes: exercise.exerciseNotes || '',
        orderIndex: exercise.orderIndex,
        workoutExerciseId: exercise.workoutExerciseId || exercise.id,
      };
    });

    // Navigate to the modal with the selected exercises
    router.push({
      pathname: '/(app)/(modals)/add-exercises-to-workout',
      params: {
        selectedExercises: JSON.stringify(selectedExercisesMap),
      },
    });

    setSearchQuery('');
  }, [exercisesWithDetails, router]);

  const cancelExerciseSelection = useCallback(() => {
    setExercisesWithDetails(tempSelectedExercises);
    setIsAddingExercises(false);
    setSearchQuery('');
  }, [tempSelectedExercises, setExercisesWithDetails]);

  const applyExerciseSelection = useCallback(() => {
    setIsAddingExercises(false);
    setSearchQuery('');
  }, []);

  return {
    // State
    isAddingExercises,
    searchQuery,
    tempSelectedExercises,
    filteredExercises,

    // State setters
    setIsAddingExercises,
    setSearchQuery,
    setTempSelectedExercises,

    // Functions
    addExerciseToWorkout,
    createCustomExercise,
    removeExercise,
    toggleAddExercises,
    cancelExerciseSelection,
    applyExerciseSelection,
  };
}
