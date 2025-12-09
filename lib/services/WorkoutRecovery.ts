import { SimpleWorkoutPersistence, SimpleWorkoutState } from './workout-persistence';

// Check for recoverable workout and return data instead of showing alert
export async function checkWorkoutRecovery(): Promise<SimpleWorkoutState | null> {
  const exists = await SimpleWorkoutPersistence.exists();

  if (exists) {
    const savedState = await SimpleWorkoutPersistence.restore();
    return savedState;
  }

  return null;
}
