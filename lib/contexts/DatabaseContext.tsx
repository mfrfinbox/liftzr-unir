import React, { createContext, useContext, useEffect, useState } from 'react';

import { loadInitialData } from '~/lib/legend-state/utils/loadInitialData';
import { logger } from '~/lib/utils/logger';

interface DatabaseContextType {
  isLoaded: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function useDatabase(): DatabaseContextType {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Load initial data from JSON files
        loadInitialData();
        setIsLoaded(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Database initialization failed');
        logger.error('Failed to initialize database', error);
        setError(error);
        setIsLoaded(true); // Set to true even on error so app doesn't hang
      }
    };

    initializeDatabase();
  }, []);

  const value = {
    isLoaded,
    error,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}
