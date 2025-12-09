import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';

import { useUserPreferences } from '~/hooks/data';
import { UserPreferences } from '~/types';

export interface DefaultRestTimes {
  setRest: number; // Default rest time between sets (in seconds)
  exerciseRest: number; // Default rest time between exercises (in seconds)
}

interface DefaultRestContextType {
  defaultRestTimes: DefaultRestTimes;
  setDefaultSetRest: (seconds: number) => void;
  setDefaultExerciseRest: (seconds: number) => void;
  updateDefaultRestTimes: (restTimes: Partial<DefaultRestTimes>) => void;
  getDefaultRestTimes: () => DefaultRestTimes;
}

const DefaultRestContext = createContext<DefaultRestContextType | undefined>(undefined);

// Default values
const DEFAULT_REST_VALUES: DefaultRestTimes = {
  setRest: 60, // 1 minute default for set rest
  exerciseRest: 120, // 2 minutes default for exercise rest
};

export const DefaultRestProvider = ({ children }: { children: ReactNode }) => {
  const [defaultRestTimes, setDefaultRestTimes] = useState<DefaultRestTimes>(DEFAULT_REST_VALUES);
  const [isInitialized, setIsInitialized] = useState(false);

  const { userPreferences, isLoading, updateUserPreferences } = useUserPreferences();

  // Initialize default rest times from user preferences
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      const preferences = userPreferences;
      if (preferences) {
        setDefaultRestTimes({
          setRest:
            typeof preferences.defaultSetRest === 'number'
              ? preferences.defaultSetRest
              : DEFAULT_REST_VALUES.setRest,
          exerciseRest:
            typeof preferences.defaultExerciseRest === 'number'
              ? preferences.defaultExerciseRest
              : DEFAULT_REST_VALUES.exerciseRest,
        });
      }
      setIsInitialized(true);
    }
  }, [userPreferences, isLoading]);

  // Helper function to update preferences in storage with proper error handling
  const updatePreferencesInStorage = (updates: Partial<DefaultRestTimes>) => {
    try {
      const typedUpdates: Partial<UserPreferences> = {};
      if (updates.setRest !== undefined) {
        typedUpdates.defaultSetRest = Math.max(0, updates.setRest);
      }
      if (updates.exerciseRest !== undefined) {
        typedUpdates.defaultExerciseRest = Math.max(0, updates.exerciseRest);
      }
      updateUserPreferences(typedUpdates);
    } catch (_error) {}
  };

  const setDefaultSetRest = (seconds: number) => {
    const validatedSeconds = Math.max(0, seconds);
    setDefaultRestTimes((prev) => ({
      ...prev,
      setRest: validatedSeconds,
    }));
    updatePreferencesInStorage({ setRest: validatedSeconds });
  };

  const setDefaultExerciseRest = (seconds: number) => {
    const validatedSeconds = Math.max(0, seconds);
    setDefaultRestTimes((prev) => ({
      ...prev,
      exerciseRest: validatedSeconds,
    }));
    updatePreferencesInStorage({ exerciseRest: validatedSeconds });
  };

  const updateDefaultRestTimes = (restTimes: Partial<DefaultRestTimes>) => {
    const validatedUpdates: Partial<DefaultRestTimes> = {};

    // Validate setRest if provided
    if (restTimes.setRest !== undefined) {
      validatedUpdates.setRest = Math.max(0, restTimes.setRest);
    }

    // Validate exerciseRest if provided
    if (restTimes.exerciseRest !== undefined) {
      validatedUpdates.exerciseRest = Math.max(0, restTimes.exerciseRest);
    }

    setDefaultRestTimes((prev) => ({
      ...prev,
      ...validatedUpdates,
    }));
    updatePreferencesInStorage(validatedUpdates);
  };

  const getDefaultRestTimes = (): DefaultRestTimes => {
    return { ...defaultRestTimes };
  };

  return (
    <DefaultRestContext.Provider
      value={{
        defaultRestTimes,
        setDefaultSetRest,
        setDefaultExerciseRest,
        updateDefaultRestTimes,
        getDefaultRestTimes,
      }}>
      {children}
    </DefaultRestContext.Provider>
  );
};

export const useDefaultRest = () => {
  const context = useContext(DefaultRestContext);
  if (context === undefined) {
    throw new Error('useDefaultRest must be used within a DefaultRestProvider');
  }
  return context;
};
