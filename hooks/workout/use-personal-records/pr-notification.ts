/**
 * PR notification and toast message formatting
 */

import { PRType, PR_TYPES } from '~/lib/services/pr-tracking/types';

import { PRTypeToLabel } from './pr-helpers';

interface PRForToast {
  type: PRType;
  value: number;
}

/**
 * Format a PR value for display in toast message
 */
export function formatPRValue(
  prType: PRType,
  value: number,
  displayWeight: (value: number) => string
): string {
  if (prType === PR_TYPES.WEIGHT || prType === PR_TYPES.VOLUME) {
    // Convert kg to user's preferred unit
    return displayWeight(value);
  } else if (prType === PR_TYPES.TIME) {
    // Format time as H:MM:SS or MM:SS
    const hours = Math.floor(value / 3600);
    const mins = Math.floor((value % 3600) / 60);
    const secs = value % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  } else if (prType === PR_TYPES.DISTANCE) {
    // Format distance as km with 2 decimal places
    return `${(value / 1000).toFixed(2)} km`;
  } else {
    return value.toString();
  }
}

/**
 * Generate toast messages for new PRs
 */
export function generatePRToastMessages(
  newPRs: PRForToast[],
  displayWeight: (value: number) => string
): string[] {
  return newPRs
    .map((pr) => {
      const value = formatPRValue(pr.type, pr.value, displayWeight);
      return `${PRTypeToLabel(pr.type)}: ${value}`;
    })
    .filter(Boolean);
}

/**
 * Check if a PR should be notified to the user
 * Prevents duplicate notifications for the same PR value
 */
export function shouldNotifyPR(
  candidateValue: number,
  sessionNotifiedPRs: Record<
    string,
    Partial<Record<PRType, { value: number; notifiedThisSession: boolean }>>
  >,
  exerciseId: string,
  prType: PRType
): boolean {
  const notifiedStatus = sessionNotifiedPRs[exerciseId]?.[prType];
  return (
    !notifiedStatus ||
    notifiedStatus.value < candidateValue ||
    (notifiedStatus.value === candidateValue && !notifiedStatus.notifiedThisSession)
  );
}
