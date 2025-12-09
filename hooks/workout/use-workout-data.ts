/**
 * Main workout data hook
 *
 * This hook has been refactored from a 815-line monolith into focused, maintainable modules.
 * The logic is now split across:
 *
 * - use-workout-state.ts: Workout state management and change detection
 * - use-watch-integration.ts: Apple Watch real-time sync during workouts
 * - use-exercise-replacement.ts: Exercise replacement logic
 * - use-workout-recovery.ts: Recovery from saved workout state
 * - core/index.ts: Main orchestrating hook that combines all functionality
 *
 * This maintains 100% API compatibility while providing better maintainability,
 * testability, and separation of concerns.
 */

export { useWorkoutData } from './core';
