// Formatting utilities for display

/**
 * Format weight for display with proper units
 */
export const formatWeightForDisplay = (
  weight: string | number,
  unit: 'kg' | 'lbs' = 'kg',
  includeUnit: boolean = true
): string => {
  const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;

  if (isNaN(numWeight) || numWeight === 0) return '0';

  // Remove trailing zeros and unnecessary decimal points
  const formatted = numWeight % 1 === 0 ? numWeight.toString() : numWeight.toFixed(1);

  return includeUnit ? `${formatted} ${unit}` : formatted;
};
