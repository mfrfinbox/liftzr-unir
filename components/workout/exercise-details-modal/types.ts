import type { Exercise } from '~/types';

export interface ExerciseDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  exercise?: Exercise;
}

export interface HistoricalSet {
  date: string;
  reps: number;
  weight: number;
  rest?: number;
  time?: number;
  distance?: number;
}

export interface GroupedHistoryEntry {
  date: string;
  sets: any[];
}

export interface PerformanceStats {
  hasData: boolean;
  // For rep-based exercises
  maxReps?: number;
  maxWeight?: number;
  totalVolume?: number;
  // For time-based exercises
  maxTime?: number;
  avgTime?: number;
  totalTime?: number;
  // For distance-based exercises
  maxDistance?: number;
  bestTime?: number;
  avgPace?: number;
}
