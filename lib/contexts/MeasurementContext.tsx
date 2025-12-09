import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

import { useUserPreferences } from '~/hooks/data';
import { convertWeight as utilConvertWeight, formatWeight as utilFormatWeight } from '~/lib/utils';

export type MeasurementUnit = 'kg' | 'lbs';

interface MeasurementContextType {
  unit: MeasurementUnit;
  setUnit: (unit: MeasurementUnit) => void;
  toggleUnit: () => void;
  formatWeight: (weight: number) => string;
  convertWeight: (weight: number, fromUnit: MeasurementUnit, toUnit: MeasurementUnit) => number;
  displayWeight: (weight: number, originalUnit?: MeasurementUnit) => string;
}

const MeasurementContext = createContext<MeasurementContextType | undefined>(undefined);

export const MeasurementProvider = ({ children }: { children: ReactNode }) => {
  const [unit, setUnit] = useState<MeasurementUnit>('kg'); // Default to kg
  const [isInitialized, setIsInitialized] = useState(false);

  const { userPreferences, isLoading, updateUserPreferences } = useUserPreferences();

  // Initialize measurement unit from user preferences
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      const savedUnit = userPreferences?.measurementSystem;
      if (savedUnit === 'imperial') {
        setUnit('lbs');
      } else {
        setUnit('kg'); // Default to kg for 'metric' or if no preference
      }
      setIsInitialized(true);
    }
  }, [userPreferences, isLoading]);

  // Update storage when unit changes
  const updateUnitInStorage = (newUnit: MeasurementUnit) => {
    try {
      const measurementSystem = newUnit === 'lbs' ? 'imperial' : 'metric';
      updateUserPreferences({ measurementSystem });
    } catch (_error) {
      // Consider showing user feedback here
    }
  };

  const setUnitWithStorage = (newUnit: MeasurementUnit) => {
    setUnit(newUnit);
    updateUnitInStorage(newUnit);
  };

  const toggleUnit = () => {
    const newUnit = unit === 'kg' ? 'lbs' : 'kg';
    setUnitWithStorage(newUnit);
  };

  const convertWeight = (
    weight: number,
    fromUnit: MeasurementUnit,
    toUnit: MeasurementUnit
  ): number => {
    // Add safety checks before calling util function
    if (!Number.isFinite(weight) || weight < 0) {
      return 0;
    }
    return utilConvertWeight(weight, fromUnit, toUnit);
  };

  const formatWeight = (weight: number): string => {
    // Add safety check
    if (!Number.isFinite(weight)) {
      return `0 ${unit}`;
    }
    return utilFormatWeight(weight, unit);
  };

  const displayWeight = (weight: number, originalUnit: MeasurementUnit = 'kg'): string => {
    // Add safety checks before conversion
    if (!Number.isFinite(weight) || weight < 0) {
      return `0 ${unit}`;
    }
    const convertedWeight = convertWeight(weight, originalUnit, unit);
    return formatWeight(convertedWeight);
  };

  return (
    <MeasurementContext.Provider
      value={{
        unit,
        setUnit: setUnitWithStorage,
        toggleUnit,
        formatWeight,
        convertWeight,
        displayWeight,
      }}>
      {children}
    </MeasurementContext.Provider>
  );
};

export const useMeasurement = () => {
  const context = useContext(MeasurementContext);
  if (context === undefined) {
    throw new Error('useMeasurement must be used within a MeasurementProvider');
  }
  return context;
};
