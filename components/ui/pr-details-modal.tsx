import React, { useMemo } from 'react';

import { View, StyleSheet } from 'react-native';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { ModalSheet } from '~/components/sheets/modal-sheet';
import { useExercises } from '~/hooks/data';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import { PRType, PersonalRecord, PR_TYPES } from '~/lib/services/pr-tracking/types';

import { Text } from './text';

interface PRDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  prs: PersonalRecord[];
}

export function PRDetailsModal({ visible, onClose, prs }: PRDetailsModalProps) {
  const { theme } = useAppTheme();
  const { displayWeight } = useMeasurement();

  // Database hooks
  const { exercises, isLoading } = useExercises();

  // Create memoized styles that depend on the theme
  const styles = useMemo(
    () =>
      StyleSheet.create({
        sectionDivider: {
          marginBottom: 16,
          paddingBottom: 12,
        },
        normalText: {
          color: theme.colors.text,
          fontSize: 15,
        },
        secondaryText: {
          color: theme.colors.text + 'aa', // aa = 67% opacity
          fontSize: 14,
        },
        valueText: {
          color: theme.colors.text,
          fontSize: 15,
          fontWeight: '500',
        },
        dateText: {
          color: theme.colors.text + 'aa', // aa = 67% opacity
          fontSize: 13,
        },
        scrollViewContent: {
          paddingTop: 20,
          paddingBottom: 320, // Increased from 200 to ensure last items are visible
          paddingHorizontal: 16,
        },
        exerciseTitle: {
          color: theme.colors.text,
          fontSize: 17,
          fontWeight: '600',
          marginBottom: 12,
          paddingBottom: 4,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '40', // 40 = 25% opacity
        },
        prRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 6,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '20', // 20 = 12% opacity - very subtle
        },
      }),
    [theme]
  );

  // Group PRs by exercise
  const groupedPRs = prs.reduce(
    (acc, pr) => {
      if (!acc[pr.exerciseId]) {
        acc[pr.exerciseId] = [];
      }
      acc[pr.exerciseId].push(pr);
      return acc;
    },
    {} as Record<string, PersonalRecord[]>
  );

  // Get exercise name
  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    return exercise ? exercise.name : 'Unknown Exercise';
  };

  // Format PR type
  const formatPRType = (type: PRType) => {
    switch (type) {
      case PR_TYPES.WEIGHT:
        return 'Weight PR';
      case PR_TYPES.REPS:
        return 'Reps PR';
      case PR_TYPES.VOLUME:
        return 'Volume PR';
      case PR_TYPES.TIME:
        return 'Time PR';
      case PR_TYPES.DISTANCE:
        return 'Distance PR';
      default:
        return 'Unknown PR';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format PR value
  const formatValue = (value: number, type: PRType) => {
    switch (type) {
      case PR_TYPES.WEIGHT:
      case PR_TYPES.VOLUME:
        return displayWeight(value);
      case PR_TYPES.REPS:
        return value.toString();
      case PR_TYPES.TIME: {
        // Format time in seconds to MM:SS or H:MM:SS
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        const seconds = value % 60;

        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      case PR_TYPES.DISTANCE:
        // Format distance in meters to km with 2 decimal places
        return `${(value / 1000).toFixed(2)} km`;
      default:
        return value.toString();
    }
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Personal Records"
      primaryActionText="Done"
      secondaryActionText=""
      backdropDismissible
      snapPoints={['70%']}
      initialIndex={0}
      enablePanDownToClose={false}
      instructionText="Achievement history"
      testID="pr-details-modal"
      primaryActionTestID="pr-details-done-button">
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator
        bounces
        alwaysBounceVertical={false}
        style={{ flex: 1 }}
        testID="pr-details-scroll-view">
        {isLoading ? (
          <View className="items-center py-8" testID="pr-loading-state">
            <Text style={styles.secondaryText}>Loading PRs...</Text>
          </View>
        ) : !exercises || exercises.length === 0 ? (
          <View className="items-center py-8" testID="pr-no-exercises-state">
            <Text style={styles.secondaryText}>No exercises available</Text>
          </View>
        ) : Object.keys(groupedPRs).length === 0 ? (
          <View className="items-center py-8" testID="pr-empty-state">
            <Text style={styles.secondaryText}>No PRs to display</Text>
          </View>
        ) : (
          Object.keys(groupedPRs).map((exerciseId, exerciseIndex) => (
            <View
              key={exerciseId}
              style={styles.sectionDivider}
              className={exerciseIndex < Object.keys(groupedPRs).length - 1 ? 'mb-4' : ''}
              testID={`pr-exercise-${exerciseIndex}`}>
              <Text style={styles.exerciseTitle} testID={`pr-exercise-name-${exerciseIndex}`}>
                {getExerciseName(exerciseId)}
              </Text>

              {groupedPRs[exerciseId].map((pr, prIndex) => (
                <View
                  key={prIndex}
                  style={styles.prRow}
                  testID={`pr-item-${exerciseIndex}-${prIndex}`}>
                  <View>
                    <Text style={styles.normalText} testID={`pr-type-${exerciseIndex}-${prIndex}`}>
                      {formatPRType(pr.type)}
                    </Text>
                    <Text style={styles.dateText} testID={`pr-date-${exerciseIndex}-${prIndex}`}>
                      {formatDate(pr.date)}
                    </Text>
                  </View>
                  <Text style={styles.valueText} testID={`pr-value-${exerciseIndex}-${prIndex}`}>
                    {formatValue(pr.value, pr.type)}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </BottomSheetScrollView>
    </ModalSheet>
  );
}
