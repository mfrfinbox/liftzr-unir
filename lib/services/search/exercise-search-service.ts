import Fuse, { type IFuseOptions } from 'fuse.js';

import type { Exercise } from '~/types';

export interface SearchResult {
  exercise: Exercise;
  score: number;
}

export interface SearchOptions {
  threshold?: number; // Fuzzy search threshold (0-1, lower is stricter)
  excludeIds?: string[]; // Exercise IDs to exclude from results
  limit?: number; // Maximum number of results
}

export class ExerciseSearchService {
  private fuse: Fuse<Exercise>;
  private exercises: Exercise[];
  private fuseOptions: IFuseOptions<Exercise>;

  constructor(exercises: Exercise[]) {
    this.exercises = exercises;

    // Configure Fuse.js for fuzzy search
    this.fuseOptions = {
      includeScore: true,
      threshold: 0.3, // Default threshold for balanced fuzzy matching
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'primaryMuscleGroup', weight: 0.2 },
        { name: 'secondaryMuscleGroups', weight: 0.1 },
      ],
      // Advanced options for better matching
      minMatchCharLength: 2,
      shouldSort: true,
      ignoreLocation: true, // Don't prioritize matches at the beginning
      useExtendedSearch: false,
    };

    this.fuse = new Fuse(exercises, this.fuseOptions);
  }

  /**
   * Perform fuzzy search across exercises
   */
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    const { threshold = 0.3, excludeIds = [], limit = 50 } = options;

    if (!query || query.trim().length === 0) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results: SearchResult[] = [];
    const addedExerciseIds = new Set<string>();

    // 1. Check for exact matches first
    const exactMatches = this.exercises.filter(
      (ex) => ex.name.toLowerCase() === normalizedQuery && !excludeIds.includes(ex.id)
    );

    exactMatches.forEach((exercise) => {
      if (!addedExerciseIds.has(exercise.id)) {
        results.push({
          exercise,
          score: 1.0,
        });
        addedExerciseIds.add(exercise.id);
      }
    });

    // 2. Fuzzy text search with Fuse.js
    if (this.fuse) {
      // Update threshold if different from default
      if (threshold !== 0.3) {
        this.fuseOptions.threshold = threshold;
        // Recreate Fuse instance with new options
        this.fuse = new Fuse(this.exercises, this.fuseOptions);
      }

      const fuseResults = this.fuse.search(normalizedQuery);

      fuseResults.forEach((result) => {
        if (!excludeIds.includes(result.item.id) && !addedExerciseIds.has(result.item.id)) {
          results.push({
            exercise: result.item,
            score: 1 - (result.score || 0), // Convert Fuse score (0 is perfect) to our score (1 is perfect)
          });
          addedExerciseIds.add(result.item.id);
        }
      });
    }

    // Sort by score (highest first) and apply limit
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Update the exercise list (useful when custom exercises are added)
   */
  updateExercises(exercises: Exercise[]): void {
    this.exercises = exercises;
    // Rebuild Fuse index
    this.fuse = new Fuse(exercises, this.fuseOptions);
  }
}
