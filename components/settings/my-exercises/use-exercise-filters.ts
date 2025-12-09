/**
 * Exercise Filters Hook
 * Manages search and type filtering for custom exercises
 */

import { useState, useMemo } from 'react';

import type { MuscleGroup } from '~/types';

import type { ExerciseWithIds, ExerciseTypeFilter } from './types';

interface UseExerciseFiltersProps {
  customExercises: ExerciseWithIds[];
  muscleGroups: MuscleGroup[];
}

export function useExerciseFilters({ customExercises, muscleGroups }: UseExerciseFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ExerciseTypeFilter>('all');

  /**
   * Filter exercises based on search query and type filter
   */
  const filteredExercises = useMemo(() => {
    let filtered = customExercises;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((ex) => {
        // Check if name matches
        if (ex.name.toLowerCase().includes(query)) return true;

        // Check if any muscle group display name matches
        const muscleGroupNames = (ex.primaryMuscleGroup ? [ex.primaryMuscleGroup] : []).map(
          (id) => {
            const mg = muscleGroups.find((m) => m.id === id);
            return mg?.displayName?.toLowerCase() || '';
          }
        );

        return muscleGroupNames.some((name) => name.includes(query));
      });
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((ex) => ex.type === selectedType);
    }

    return filtered;
  }, [customExercises, searchQuery, selectedType, muscleGroups]);

  return {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    filteredExercises,
  };
}
