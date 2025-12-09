/**
 * Personal Records Hook
 * Manages PR tracking during workout sessions
 */

import { useCallback, useState } from 'react';

import { hideToast } from '~/components/ui/toast-message';
import { WORKOUT_FIELDS } from '~/lib/constants';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';
import { PRType } from '~/lib/services/pr-tracking/types';
import type { PersonalRecord } from '~/types';

import { calculateMaxValues, hasNoValidValues } from './calculate-max-values';
import {
  generatePRCandidates,
  getGlobalPRs,
  getPRTypesToCheck,
  isGlobalPRBeaten,
} from './pr-comparison';
import { getActualExerciseId, parseAndConvertWeight, parseIntValue } from './pr-helpers';
import { generatePRToastMessages, shouldNotifyPR } from './pr-notification';
import {
  handlePRStateOnUncheck,
  SessionAchievedPRs,
  SessionNotifiedPRs,
  updateSessionAchievedPRs,
  updateSessionNotifiedPRs,
} from './pr-state-updates';

import type { UsePersonalRecordsProps } from './types';

export function usePersonalRecords({
  exercisesWithDetails,
  setExercisesWithDetails,
  workout,
  allPersonalRecords,
  allExercises,
  displayWeight,
  showPRToast,
}: UsePersonalRecordsProps) {
  const [sessionAchievedPRs, setSessionAchievedPRs] = useState<SessionAchievedPRs>({});
  const [sessionNotifiedPRs, setSessionNotifiedPRs] = useState<SessionNotifiedPRs>({});
  const { unit: measurementUnit } = useMeasurement();

  const toggleSetCompletion = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      const currentWID = workout ? workout.id : 'quick-workout-session';
      const exerciseDataForPRs = { ...exercisesWithDetails[exerciseIndex] };
      if (!exerciseDataForPRs?.setsData?.[setIndex]) {
        return;
      }

      const setToToggle = exerciseDataForPRs.setsData[setIndex];
      const newCompletedState = !setToToggle.completed;

      // Update UI immediately
      setExercisesWithDetails((prev) => {
        const updated = [...prev];
        const exToUpdate = { ...updated[exerciseIndex] };
        const setsData = [...(exToUpdate.setsData || [])];
        setsData[setIndex] = { ...setsData[setIndex], completed: newCompletedState };
        exToUpdate.setsData = setsData;
        updated[exerciseIndex] = exToUpdate;
        return updated;
      });

      const processPRsImmediately = () => {
        const setsDataReflectingToggle = (exerciseDataForPRs.setsData || []).map((s, idx) =>
          idx === setIndex ? { ...s, completed: newCompletedState } : s
        );

        const actualExerciseId = getActualExerciseId(exerciseDataForPRs);
        const globalPRs = getGlobalPRs(allPersonalRecords, actualExerciseId);

        const exerciseType = exerciseDataForPRs.details?.type || '';
        const isTimeBasedExercise = exerciseType === WORKOUT_FIELDS.TIME;
        const isDistanceBasedExercise = exerciseType === WORKOUT_FIELDS.DISTANCE;

        if (newCompletedState) {
          // === SET CHECKED: Check for new PRs ===

          // Validate the toggled set has valid values
          const timeOfToggledSet = parseIntValue(setToToggle.time);
          const weightOfToggledSet = parseAndConvertWeight(
            setToToggle.weight,
            measurementUnit || 'kg'
          );
          const repsOfToggledSet = parseIntValue(setToToggle.reps);
          const distanceOfToggledSet = parseIntValue(setToToggle.distance);

          if (isTimeBasedExercise) {
            if (timeOfToggledSet <= 0) return;
          } else if (isDistanceBasedExercise) {
            if (distanceOfToggledSet <= 0 && timeOfToggledSet <= 0) return;
          } else {
            if (weightOfToggledSet < 0 || repsOfToggledSet <= 0) return;
          }

          // Calculate max values from all completed sets
          let maxValues = calculateMaxValues({
            setsData: setsDataReflectingToggle,
            exerciseType,
            measurementUnit: measurementUnit || 'kg',
          });

          // Handle first completed set edge case
          if (
            setsDataReflectingToggle.filter((s) => s.completed).length === 1 &&
            newCompletedState
          ) {
            if (isTimeBasedExercise) {
              if (maxValues.time === 0 && timeOfToggledSet > 0) {
                maxValues = { ...maxValues, time: timeOfToggledSet };
              }
            } else if (isDistanceBasedExercise) {
              if (maxValues.distance === 0 && distanceOfToggledSet > 0) {
                maxValues = { ...maxValues, distance: distanceOfToggledSet };
              }
              if (maxValues.time === 0 && timeOfToggledSet > 0) {
                maxValues = { ...maxValues, time: timeOfToggledSet };
              }
            } else {
              if (maxValues.weight === 0 && maxValues.reps === 0 && maxValues.volume === 0) {
                if (weightOfToggledSet >= 0 && repsOfToggledSet > 0) {
                  maxValues = {
                    ...maxValues,
                    weight: weightOfToggledSet,
                    reps: repsOfToggledSet,
                    volume: weightOfToggledSet * repsOfToggledSet,
                  };
                }
              }
            }
          }

          // Check if all relevant values are 0
          if (hasNoValidValues(maxValues, exerciseType)) {
            return;
          }

          // Generate PR candidates based on exercise type
          const prCandidates = generatePRCandidates(maxValues, exerciseType);

          const newPRsForToast: { type: PRType; value: number }[] = [];

          // Check each candidate against global PRs
          prCandidates.forEach((candidate) => {
            if (candidate.value <= 0) return;

            if (isGlobalPRBeaten(candidate.value, globalPRs, candidate.type)) {
              // Create new session PR record
              const newSessionRecord: PersonalRecord = {
                id: `session-${actualExerciseId}-${candidate.type}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                exerciseId: actualExerciseId,
                type: candidate.type,
                value: candidate.value,
                date: new Date().toISOString(),
                workoutHistoryId: currentWID,
                weight: candidate.weight,
                reps: candidate.reps,
                time: candidate.time,
                distance: candidate.distance,
              };

              // Update session achieved PRs
              setSessionAchievedPRs((prev) =>
                updateSessionAchievedPRs(prev, actualExerciseId, newSessionRecord)
              );

              // Check if we should notify the user
              if (
                shouldNotifyPR(
                  candidate.value,
                  sessionNotifiedPRs,
                  actualExerciseId,
                  candidate.type
                )
              ) {
                newPRsForToast.push({ type: candidate.type as PRType, value: candidate.value });
                setSessionNotifiedPRs((prev) =>
                  updateSessionNotifiedPRs(prev, actualExerciseId, candidate.type, candidate.value)
                );
              }
            }
          });

          // Show toast notification for new PRs
          if (newPRsForToast.length > 0) {
            const details = allExercises.find((ex) => ex.id === actualExerciseId);
            if (details) {
              const messages = generatePRToastMessages(newPRsForToast, displayWeight);
              if (messages.length > 0) showPRToast(details.name, messages.join(' | '));
            }
          }
        } else {
          // === SET UNCHECKED: Recalculate PRs ===

          // Hide any PR toast immediately
          const details = allExercises.find((ex) => ex.id === actualExerciseId);
          if (details) {
            hideToast();
          }

          // Calculate max values from remaining completed sets
          const maxValuesAfterUncheck = calculateMaxValues({
            setsData: setsDataReflectingToggle,
            exerciseType,
            measurementUnit: measurementUnit || 'kg',
          });

          // Determine which PR types to check based on exercise type
          const typesToCheck = getPRTypesToCheck(exerciseType);

          // Handle PR state updates for each type
          typesToCheck.forEach((type) => {
            handlePRStateOnUncheck(
              sessionAchievedPRs,
              sessionNotifiedPRs,
              actualExerciseId,
              type,
              maxValuesAfterUncheck,
              setSessionAchievedPRs,
              setSessionNotifiedPRs
            );
          });
        }
      };

      processPRsImmediately();
    },
    [
      exercisesWithDetails,
      workout,
      showPRToast,
      sessionAchievedPRs,
      sessionNotifiedPRs,
      allPersonalRecords,
      allExercises,
      displayWeight,
      setExercisesWithDetails,
      measurementUnit,
    ]
  );

  // Function to recalculate PRs after removing a set
  const recalculatePRsAfterSetRemoval = useCallback(
    (exerciseIndex: number, removedSet: any) => {
      const exerciseData = exercisesWithDetails[exerciseIndex];
      if (!exerciseData || !removedSet?.completed) {
        // Only recalculate if the removed set was completed
        return;
      }

      const actualExerciseId = getActualExerciseId(exerciseData);
      const exerciseType = exerciseData.details?.type || '';

      // Calculate max values from remaining completed sets
      const maxValuesAfterRemoval = calculateMaxValues({
        setsData: exerciseData.setsData || [],
        exerciseType,
        measurementUnit: measurementUnit || 'kg',
      });

      // Determine which PR types to check based on exercise type
      const typesToCheck = getPRTypesToCheck(exerciseType);

      // Handle PR state updates for each type
      typesToCheck.forEach((type) => {
        handlePRStateOnUncheck(
          sessionAchievedPRs,
          sessionNotifiedPRs,
          actualExerciseId,
          type,
          maxValuesAfterRemoval,
          setSessionAchievedPRs,
          setSessionNotifiedPRs
        );
      });
    },
    [
      exercisesWithDetails,
      sessionAchievedPRs,
      sessionNotifiedPRs,
      setSessionAchievedPRs,
      setSessionNotifiedPRs,
      measurementUnit,
    ]
  );

  return {
    toggleSetCompletion,
    sessionAchievedPRs,
    sessionNotifiedPRs,
    setSessionAchievedPRs,
    setSessionNotifiedPRs,
    recalculatePRsAfterSetRemoval,
  };
}
