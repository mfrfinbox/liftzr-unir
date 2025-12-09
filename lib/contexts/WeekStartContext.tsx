import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

import { useUserPreferences } from '~/hooks/data';

export type WeekStartDay = 'monday' | 'sunday';

interface WeekStartContextType {
  weekStartDay: WeekStartDay;
  setWeekStartDay: (day: WeekStartDay) => void;
  toggleWeekStart: () => void;
  getWeekStartDayNumber: () => number;
}

const WeekStartContext = createContext<WeekStartContextType | undefined>(undefined);

export const WeekStartProvider = ({ children }: { children: ReactNode }) => {
  const [weekStartDay, setWeekStartDay] = useState<WeekStartDay>('monday'); // Default to Monday
  const [isInitialized, setIsInitialized] = useState(false);

  const { userPreferences, isLoading, updateUserPreferences } = useUserPreferences();

  // Initialize week start day from user preferences
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      const savedWeekStartDay = userPreferences?.weekStartDay;
      if (savedWeekStartDay === 0) {
        setWeekStartDay('sunday');
      } else {
        setWeekStartDay('monday'); // Default to Monday for 1 or any other value
      }
      setIsInitialized(true);
    }
  }, [userPreferences, isLoading]);

  // Update user preferences when week start day changes
  const updateWeekStartInStorage = (newDay: WeekStartDay) => {
    const weekStartDayNumber = newDay === 'sunday' ? 0 : 1;
    updateUserPreferences({ weekStartDay: weekStartDayNumber });
  };

  const setWeekStartDayWithStorage = (newDay: WeekStartDay) => {
    setWeekStartDay(newDay);
    updateWeekStartInStorage(newDay);
  };

  const toggleWeekStart = () => {
    const newDay = weekStartDay === 'sunday' ? 'monday' : 'sunday';
    setWeekStartDayWithStorage(newDay);
  };

  const getWeekStartDayNumber = (): number => {
    return weekStartDay === 'sunday' ? 0 : 1;
  };

  return (
    <WeekStartContext.Provider
      value={{
        weekStartDay,
        setWeekStartDay: setWeekStartDayWithStorage,
        toggleWeekStart,
        getWeekStartDayNumber,
      }}>
      {children}
    </WeekStartContext.Provider>
  );
};

export const useWeekStart = () => {
  const context = useContext(WeekStartContext);
  if (context === undefined) {
    throw new Error('useWeekStart must be used within a WeekStartProvider');
  }
  return context;
};
