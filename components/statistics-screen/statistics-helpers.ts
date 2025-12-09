/**
 * Statistics Helper Functions
 * Utility functions for formatting and calculating statistics
 */

import { NUMBER_FORMATTING } from '~/lib/constants';

/**
 * Format total time for weekly/monthly stats (compact format)
 */
export const formatTotalTime = (seconds: number): { value: string; unit: string } => {
  if (!seconds || seconds === 0) return { value: '0', unit: 'm' };

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    // Show approximation when we have partial hours (e.g., "~1h" for "1h 10m")
    const hasPartialMinutes = minutes > 0;
    return {
      value: hasPartialMinutes ? `~${hours}` : `${hours}`,
      unit: 'h',
    };
  }
  return { value: `${minutes}`, unit: 'm' };
};

/**
 * Format weight with K/M suffix and proper decimal handling
 */
export const formatWeight = (weight: number): string => {
  if (weight >= NUMBER_FORMATTING.WEIGHT_MILLION_THRESHOLD) {
    return `${(weight / NUMBER_FORMATTING.WEIGHT_MILLION_THRESHOLD).toFixed(1)}M`;
  } else if (weight >= NUMBER_FORMATTING.WEIGHT_THOUSAND_THRESHOLD) {
    return `${(weight / NUMBER_FORMATTING.WEIGHT_THOUSAND_THRESHOLD).toFixed(1)}K`;
  }
  // Round to 1 decimal place for weights, remove trailing .0
  const rounded = Math.round(weight * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toString();
};
