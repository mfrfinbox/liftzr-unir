import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'liftzr-workout-persistence' });
const WORKOUT_STATE_KEY = 'workout_state';

export interface SimpleWorkoutState {
  workoutId: string;
  workoutName: string;
  startTime: string; // ISO string
  elapsedTime: number; // Current elapsed time in seconds (frozen if paused)
  pausedTime: number; // CRITICAL: total paused time in MILLISECONDS
  isPaused?: boolean; // Whether the workout is currently paused
  isHidden?: boolean; // Whether the workout is hidden from view
  // Complete exercise data needed for recovery
  exercises: {
    id: string;
    sets: number;
    reps: string;
    rest: number;
    nextExerciseRest?: number;
    exerciseNotes?: string;
    setsData: {
      weight: string;
      reps: string;
      completed: boolean;
    }[];
    details: {
      id: string;
      name: string;
      primaryMuscleGroup: string[];
      secondaryMuscleGroups?: string[];
      equipment: string;
      difficulty: string;
      instructions: string[];
    };
  }[];
  lastSaved: number;
}

export class SimpleWorkoutPersistence {
  static save(state: SimpleWorkoutState): void {
    try {
      storage.set(WORKOUT_STATE_KEY, JSON.stringify(state));
    } catch (_error) {}
  }

  static restore(): SimpleWorkoutState | null {
    try {
      const saved = storage.getString(WORKOUT_STATE_KEY);
      if (saved) {
        const state = JSON.parse(saved) as SimpleWorkoutState;

        // Only restore if less than 24 hours old
        const age = Date.now() - state.lastSaved;
        if (age < 24 * 60 * 60 * 1000) {
          return state;
        }
      }
    } catch (_error) {}
    return null;
  }

  static clear(): void {
    try {
      storage.delete(WORKOUT_STATE_KEY);
    } catch (_error) {}
  }

  static exists(): boolean {
    try {
      return storage.contains(WORKOUT_STATE_KEY);
    } catch {
      return false;
    }
  }
}
