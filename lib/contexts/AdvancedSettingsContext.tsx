import React, { createContext, useContext, ReactNode } from 'react';

interface AdvancedSettingsContextType {
  showWorkoutCompletionAlerts: boolean;
}

const AdvancedSettingsContext = createContext<AdvancedSettingsContextType | undefined>(undefined);

export const AdvancedSettingsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AdvancedSettingsContext.Provider
      value={{
        showWorkoutCompletionAlerts: true,
      }}>
      {children}
    </AdvancedSettingsContext.Provider>
  );
};

export const useAdvancedSettings = () => {
  const context = useContext(AdvancedSettingsContext);
  if (context === undefined) {
    throw new Error('useAdvancedSettings must be used within an AdvancedSettingsProvider');
  }
  return context;
};
