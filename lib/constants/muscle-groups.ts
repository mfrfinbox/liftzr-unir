// TypeScript interfaces for muscle group system
// Actual muscle group data is stored in the database `muscle_groups` table

export interface MuscleGroup {
  id: string;
  name: string; // Internal name (e.g., 'chest', 'biceps')
  displayName: string; // Display name (e.g., 'Chest', 'Biceps')
  category: 'upper_body' | 'lower_body' | 'core' | 'full_body'; // Matches database schema
  createdAt: Date;
  updatedAt: Date;
}

export interface MuscleGroupCategory {
  id: string;
  name: string;
  color: string;
  muscles: MuscleGroup[];
}

// Helper functions for muscle group operations
export const getMuscleGroupById = (
  muscleGroups: MuscleGroup[],
  id: string
): MuscleGroup | undefined => {
  return muscleGroups.find((muscle) => muscle.id === id);
};

export const getMuscleGroupsByCategory = (
  muscleGroups: MuscleGroup[],
  category: 'upper_body' | 'lower_body' | 'core' | 'full_body'
): MuscleGroup[] => {
  return muscleGroups.filter((muscle) => muscle.category === category);
};

// Group muscle groups by category for UI display
export const groupMuscleGroupsByCategory = (muscleGroups: MuscleGroup[]): MuscleGroupCategory[] => {
  const categories: MuscleGroupCategory[] = [
    {
      id: 'upper-body',
      name: 'Upper Body',
      color: '#3B82F6', // Blue
      muscles: getMuscleGroupsByCategory(muscleGroups, 'upper_body'),
    },
    {
      id: 'lower-body',
      name: 'Lower Body',
      color: '#10B981', // Green
      muscles: getMuscleGroupsByCategory(muscleGroups, 'lower_body'),
    },
    {
      id: 'core',
      name: 'Core',
      color: '#F59E0B', // Amber
      muscles: getMuscleGroupsByCategory(muscleGroups, 'core'),
    },
    {
      id: 'full-body',
      name: 'Full Body & Other',
      color: '#8B5CF6', // Purple
      muscles: getMuscleGroupsByCategory(muscleGroups, 'full_body'),
    },
  ];

  return categories;
};
