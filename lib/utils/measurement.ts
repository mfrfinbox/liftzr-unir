// Measurement utility functions for weight conversion and formatting

export const convertWeight = (
  weight: number,
  fromUnit: 'kg' | 'lbs',
  toUnit: 'kg' | 'lbs'
): number => {
  // Input validation - return 0 instead of throwing for invalid weights
  if (!Number.isFinite(weight) || weight < 0) {
    return 0;
  }

  if (fromUnit !== 'kg' && fromUnit !== 'lbs') {
    throw new Error('fromUnit must be either "kg" or "lbs"');
  }

  if (toUnit !== 'kg' && toUnit !== 'lbs') {
    throw new Error('toUnit must be either "kg" or "lbs"');
  }

  if (fromUnit === toUnit) return weight;

  const KG_TO_LBS = 2.20462;
  const LBS_TO_KG = 1 / KG_TO_LBS;

  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return weight * KG_TO_LBS;
  }

  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return weight * LBS_TO_KG;
  }

  return weight;
};

export const formatWeight = (
  weight: number,
  unit: 'kg' | 'lbs',
  decimalPlaces: number = 1
): string => {
  if (!Number.isFinite(weight)) return `0 ${unit}`;

  // Remove trailing zeros and unnecessary decimal points
  const formatted =
    weight % 1 === 0 ? weight.toString() : parseFloat(weight.toFixed(decimalPlaces)).toString();

  return `${formatted} ${unit}`;
};

// Additional weight-related utilities
export const parseWeight = (weightString: string): number => {
  const parsed = parseFloat(weightString);
  return isNaN(parsed) ? 0 : parsed;
};
