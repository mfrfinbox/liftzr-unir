import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

import { useExercises } from '~/hooks/data';
import {
  ExerciseSearchService,
  type SearchResult,
  type SearchOptions,
} from '~/lib/services/search/exercise-search-service';
import type { Exercise } from '~/types';

export interface UseSmartExerciseSearchOptions {
  searchQuery?: string; // External search query (for controlled mode)
  excludeIds?: string[]; // Exercise IDs to exclude from results
  threshold?: number; // Fuzzy search threshold (0-1)
  limit?: number; // Maximum results
  filterCustomReadOnly?: boolean; // Filter out read-only custom exercises
}

export interface UseSmartExerciseSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  filteredExercises: Exercise[]; // For backward compatibility
  hasNoResults: boolean;
  showCreateCustom: boolean; // Indicates if custom exercise creation should be prominent
  clearSearch: () => void;
  refreshSearch: () => void;
}

/**
 * Smart exercise search hook with fuzzy matching
 */
export function useSmartExerciseSearch(
  options: UseSmartExerciseSearchOptions = {}
): UseSmartExerciseSearchReturn {
  const {
    searchQuery: externalSearchQuery,
    excludeIds = [],
    threshold = 0.3,
    limit = 50,
    filterCustomReadOnly: _filterCustomReadOnly = true,
  } = options;

  const { exercises: allExercises, isLoading: exercisesLoading } = useExercises();

  // Use external search query if provided, otherwise manage internal state
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  // Create stable setSearchQuery function
  const setSearchQuery = useCallback(
    (query: string) => {
      if (externalSearchQuery === undefined) {
        setInternalSearchQuery(query);
      }
      // No-op if controlled
    },
    [externalSearchQuery]
  );

  const [searchService, setSearchService] = useState<ExerciseSearchService | null>(null);

  // All exercises are available (no tier restrictions)
  const availableExercises = useMemo(() => {
    return allExercises;
  }, [allExercises]);

  // Initialize search service when data is loaded - using refs to avoid recreating
  const availableExercisesRef = useRef(availableExercises);

  useEffect(() => {
    availableExercisesRef.current = availableExercises;
  }, [availableExercises]);

  useEffect(() => {
    if (!exercisesLoading && availableExercisesRef.current.length > 0) {
      setSearchService((prevService) => {
        if (!prevService) {
          return new ExerciseSearchService(availableExercisesRef.current);
        }
        // Update existing service
        prevService.updateExercises(availableExercisesRef.current);
        return prevService;
      });
    }
  }, [exercisesLoading, availableExercises]); // Update when exercises change

  // Perform search with debounce
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !searchService) {
      return [];
    }

    const searchOptions: SearchOptions = {
      threshold,
      excludeIds,
      limit,
    };

    const results = searchService.search(searchQuery, searchOptions);
    return results;
  }, [searchQuery, searchService, threshold, excludeIds, limit]);

  // Get filtered exercises for backward compatibility
  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) {
      // Return all available exercises when no search query
      return availableExercises.filter((ex) => !excludeIds.includes(ex.id));
    }
    // Return exercises from search results
    return searchResults.map((result) => result.exercise);
  }, [searchQuery, searchResults, availableExercises, excludeIds]);

  // Determine if we have no results
  const hasNoResults = searchQuery.trim().length > 0 && searchResults.length === 0;

  // Determine if custom exercise creation should be prominent
  const showCreateCustom = useMemo(() => {
    if (!searchQuery.trim()) return false;

    // Show prominently if:
    // 1. No results at all
    if (hasNoResults) return true;

    // 2. Very few results (3 or less) - makes it easier to trigger
    if (searchResults.length <= 3) return true;

    // 3. Only low-confidence matches (score < 0.6) - raised threshold
    const hasOnlyPoorMatches =
      searchResults.length > 0 && searchResults.every((result) => result.score < 0.6);

    return hasOnlyPoorMatches;
  }, [searchQuery, hasNoResults, searchResults]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  // Refresh search (useful after adding custom exercises)
  const refreshSearch = useCallback(() => {
    if (searchService && availableExercisesRef.current.length > 0) {
      searchService.updateExercises(availableExercisesRef.current);
    }
  }, [searchService]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    filteredExercises,
    hasNoResults,
    showCreateCustom,
    clearSearch,
    refreshSearch,
  };
}

/**
 * Helper function to group search results by confidence
 */
export function groupSearchResults(results: SearchResult[]): {
  exact: SearchResult[];
  highConfidence: SearchResult[];
  lowConfidence: SearchResult[];
} {
  const exact: SearchResult[] = [];
  const highConfidence: SearchResult[] = [];
  const lowConfidence: SearchResult[] = [];

  results.forEach((result) => {
    if (result.score === 1.0) {
      exact.push(result);
    } else if (result.score >= 0.7) {
      highConfidence.push(result);
    } else {
      lowConfidence.push(result);
    }
  });

  return { exact, highConfidence, lowConfidence };
}
