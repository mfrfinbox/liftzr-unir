/**
 * Session PR state management
 */

import { PRType, ExercisePRs as SessionAchievedPRs } from '~/lib/services/pr-tracking/types';
import type { PersonalRecord } from '~/types';

import type { MaxValues } from './types';

export type { SessionAchievedPRs };
export type SessionNotifiedPRs = Record<
  string,
  Partial<Record<PRType, { value: number; notifiedThisSession: boolean }>>
>;

/**
 * Update session achieved PRs state with a new PR
 */
export function updateSessionAchievedPRs(
  prev: SessionAchievedPRs,
  exerciseId: string,
  newPR: PersonalRecord
): SessionAchievedPRs {
  return {
    ...prev,
    [exerciseId]: {
      ...prev[exerciseId],
      [newPR.type]: newPR,
    },
  };
}

/**
 * Update session notified PRs state to track notifications
 */
export function updateSessionNotifiedPRs(
  prev: SessionNotifiedPRs,
  exerciseId: string,
  prType: PRType,
  value: number
): SessionNotifiedPRs {
  return {
    ...prev,
    [exerciseId]: {
      ...prev[exerciseId],
      [prType]: { value, notifiedThisSession: true },
    },
  };
}

/**
 * Remove a PR type from session achieved PRs
 */
export function removeSessionAchievedPR(
  prev: SessionAchievedPRs,
  exerciseId: string,
  prType: PRType
): SessionAchievedPRs {
  const updatedExPRs = { ...prev[exerciseId] };
  delete updatedExPRs[prType];

  // If no PRs left for this exercise, remove the exercise entry
  if (Object.keys(updatedExPRs).length === 0) {
    const newState = { ...prev };
    delete newState[exerciseId];
    return newState;
  }

  return { ...prev, [exerciseId]: updatedExPRs };
}

/**
 * Remove a PR type from session notified PRs
 */
export function removeSessionNotifiedPR(
  prev: SessionNotifiedPRs,
  exerciseId: string,
  prType: PRType
): SessionNotifiedPRs {
  const updated = { ...prev };
  if (updated[exerciseId]) {
    const updatedExerciseNotifications = { ...updated[exerciseId] };
    delete updatedExerciseNotifications[prType];

    if (Object.keys(updatedExerciseNotifications).length === 0) {
      delete updated[exerciseId];
    } else {
      updated[exerciseId] = updatedExerciseNotifications;
    }
  }
  return updated;
}

/**
 * Update session PR to a lower value (when a set is unchecked)
 */
export function downgradeSessionPR(
  prev: SessionAchievedPRs,
  exerciseId: string,
  prType: PRType,
  newValue: number,
  existingPR: PersonalRecord
): SessionAchievedPRs {
  const updatedSessionRecord: PersonalRecord = {
    ...existingPR,
    value: newValue,
    date: new Date().toISOString(),
  };

  return {
    ...prev,
    [exerciseId]: {
      ...prev[exerciseId],
      [prType]: updatedSessionRecord,
    },
  };
}

/**
 * Downgrade notification record to a lower value
 */
export function downgradeSessionNotification(
  prev: SessionNotifiedPRs,
  exerciseId: string,
  prType: PRType,
  newValue: number
): SessionNotifiedPRs {
  return {
    ...prev,
    [exerciseId]: {
      ...prev[exerciseId],
      [prType]: { value: newValue, notifiedThisSession: false },
    },
  };
}

/**
 * Handle PR state updates when a set is unchecked
 * Removes or downgrades PRs based on remaining completed sets
 */
export function handlePRStateOnUncheck(
  sessionAchievedPRs: SessionAchievedPRs,
  sessionNotifiedPRs: SessionNotifiedPRs,
  exerciseId: string,
  prType: PRType,
  maxValuesAfterUncheck: MaxValues,
  setSessionAchievedPRs: React.Dispatch<React.SetStateAction<SessionAchievedPRs>>,
  setSessionNotifiedPRs: React.Dispatch<React.SetStateAction<SessionNotifiedPRs>>
): void {
  const sessionPR = sessionAchievedPRs[exerciseId]?.[prType];
  if (!sessionPR) return;

  const maxValueForType = maxValuesAfterUncheck[prType as keyof MaxValues];

  // If no completed sets remain with valid values, remove the session PR
  if (maxValueForType === 0) {
    setSessionAchievedPRs((prev) => removeSessionAchievedPR(prev, exerciseId, prType));
    setSessionNotifiedPRs((prev) => removeSessionNotifiedPR(prev, exerciseId, prType));
  } else if (sessionPR.value > maxValueForType) {
    // Update the session PR to the new max value
    setSessionAchievedPRs((prev) =>
      downgradeSessionPR(prev, exerciseId, prType, maxValueForType, sessionPR)
    );

    // Also update the notification record if it exists and is higher than the new max
    const notified = sessionNotifiedPRs[exerciseId]?.[prType];
    if (notified && notified.value > maxValueForType) {
      setSessionNotifiedPRs((prev) =>
        downgradeSessionNotification(prev, exerciseId, prType, maxValueForType)
      );
    }
  }
}
