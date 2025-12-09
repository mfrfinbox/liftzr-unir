/**
 * Workout History Item Component
 * Individual workout card in the history list
 */

import React, { memo, useCallback } from 'react';

import { View, TouchableOpacity, Pressable } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '@react-navigation/native';
import { Dumbbell, Clock, ChevronDown, ChevronUp, Check } from 'lucide-react-native';

import { Card, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { CHECKBOX_STYLE, SEPARATOR_STYLE } from '~/lib/constants/ui';
import type { PersonalRecord, WorkoutHistory, NumberFormattingConfig } from '~/types';

import { CompactExerciseList } from './compact-exercise-list';
import { ExerciseDetails } from './exercise-details';
import { WorkoutCardHeader } from './workout-card-header';

interface WorkoutHistoryItemProps {
  item: WorkoutHistory;
  index: number;
  personalRecords: PersonalRecord[];
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
  formatDuration: (duration: number) => string;
  renderWorkoutName: (workoutId: string) => React.ReactNode;
  getExerciseName: (exerciseId: string) => string;
  getExerciseType: (exerciseId: string) => string;
  formatTimeValue: (seconds: number) => string;
  displayWeight: (weight: number) => string;
  unit: string;
  onPRPress: (prs: PersonalRecord[]) => void;
  NUMBER_FORMATTING: NumberFormattingConfig;
  viewMode: 'compact' | 'detailed';
  isExpanded: boolean;
  onExpandToggle: () => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export const WorkoutHistoryItem = memo(
  ({
    item,
    index,
    personalRecords,
    formatDate,
    formatTime,
    formatDuration,
    renderWorkoutName,
    getExerciseName,
    getExerciseType,
    formatTimeValue,
    displayWeight,
    unit,
    onPRPress,
    NUMBER_FORMATTING,
    viewMode,
    isExpanded,
    onExpandToggle,
    isSelectMode,
    isSelected,
    onToggleSelection,
  }: WorkoutHistoryItemProps) => {
    const { colors } = useTheme();

    const isExternalWorkout = item.workoutId?.startsWith('healthkit-');

    const allPRs = isExternalWorkout
      ? []
      : personalRecords.filter((pr: PersonalRecord) => pr.workoutHistoryId === item.id);

    const hasPRs = allPRs.length > 0;
    const prCountInSession = allPRs.length;

    const handleCardPress = useCallback(() => {
      if (isSelectMode && onToggleSelection) {
        onToggleSelection();
      } else if (hasPRs && allPRs.length > 0) {
        onPRPress(allPRs);
      }
    }, [isSelectMode, onToggleSelection, hasPRs, allPRs, onPRPress]);

    const CardWrapper = isSelectMode || hasPRs ? TouchableOpacity : View;

    const EXERCISES_TO_SHOW = 2;
    const hasMoreExercises = item.exercises.length > EXERCISES_TO_SHOW;

    const visibleExercises =
      viewMode === 'detailed'
        ? item.exercises
        : isExpanded
          ? item.exercises
          : item.exercises.slice(0, EXERCISES_TO_SHOW);

    return (
      <Card
        className={`mb-4 overflow-hidden border ${
          isSelectMode && isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
        }`}
        testID={`workout-card-${index}`}>
        <CardWrapper
          onPress={isSelectMode || hasPRs ? handleCardPress : undefined}
          activeOpacity={isSelectMode || hasPRs ? 0.8 : 1}
          testID={
            isSelectMode
              ? `workout-select-button-${index}`
              : hasPRs
                ? `workout-pr-button-${index}`
                : undefined
          }
          accessible={isSelectMode || hasPRs}
          accessibilityLabel={
            isSelectMode
              ? `Select workout from ${formatDate(item.date)}`
              : hasPRs
                ? 'View PR details'
                : undefined
          }
          accessibilityRole={isSelectMode || hasPRs ? 'button' : undefined}>
          <CardContent className="p-4">
            {/* Selection Mode Checkbox */}
            {isSelectMode && (
              <View className="mb-3 flex-row items-center">
                <Pressable
                  onPress={onToggleSelection}
                  className={`${CHECKBOX_STYLE.base} ${
                    isSelected ? CHECKBOX_STYLE.completed : CHECKBOX_STYLE.uncompleted
                  }`}
                  testID={`workout-checkbox-${index}`}
                  accessible
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected || false }}>
                  {isSelected && <Check size={16} color="white" />}
                </Pressable>
                <Text className="ml-3 text-sm font-medium text-foreground">
                  Select this workout
                </Text>
              </View>
            )}

            {/* Card Header with Date and PR Badge */}
            <WorkoutCardHeader
              date={item.date}
              formatDate={formatDate}
              formatTime={formatTime}
              prCount={prCountInSession}
              index={index}
            />

            {/* Workout Name */}
            <TouchableOpacity
              onPress={() => {
                /* TODO: Add navigation to workout details if needed */
              }}
              testID={`workout-${index}-name`}
              accessible={true}
              accessibilityLabel={`Workout: ${renderWorkoutName(item.workoutId)}`}
              accessibilityRole="button">
              <Text
                className="mb-2 text-base font-medium text-foreground"
                testID={`workout-${index}-name-text`}>
                {renderWorkoutName(item.workoutId)}
              </Text>
            </TouchableOpacity>

            {/* Workout Summary */}
            <View className="mb-2 flex-row items-center" testID={`workout-summary-${index}`}>
              {!isExternalWorkout && (
                <View className="mr-8 flex-row items-center">
                  <Dumbbell size={14} color={colors.text + '60'} />
                  <Text
                    className="ml-1.5 text-sm"
                    style={{ color: colors.text + '60' }}
                    testID={`workout-${index}-exercise-count`}>
                    {item.exercises.length} {item.exercises.length === 1 ? 'exercise' : 'exercises'}
                  </Text>
                </View>
              )}

              {isExternalWorkout && (
                <View className="mr-8 flex-row items-center">
                  <Ionicons name="logo-apple" size={14} color={colors.text + '60'} />
                  <Text
                    className="ml-1.5 text-sm"
                    style={{ color: colors.text + '60' }}
                    testID={`workout-${index}-apple-health-indicator`}>
                    Apple Health
                  </Text>
                </View>
              )}

              <View className="flex-row items-center">
                <Clock size={14} color={colors.text + '60'} />
                <Text
                  className="ml-1.5 text-sm"
                  style={{ color: colors.text + '60' }}
                  testID={`workout-${index}-duration`}>
                  {formatDuration(item.duration)}
                </Text>
              </View>
            </View>

            {/* Divider - only show for non-external workouts */}
            {!isExternalWorkout && (
              <View className={`my-3 ${SEPARATOR_STYLE}`} testID={`workout-divider-${index}`} />
            )}

            {/* Compact Exercise List */}
            {viewMode === 'compact' && !isExternalWorkout && item.exercises.length > 0 && (
              <CompactExerciseList
                exercises={visibleExercises}
                getExerciseName={getExerciseName}
                workoutIndex={index}
              />
            )}

            {/* Detailed Exercise List */}
            {viewMode === 'detailed' && !isExternalWorkout && (
              <ExerciseDetails
                exercises={visibleExercises}
                getExerciseName={getExerciseName}
                getExerciseType={getExerciseType}
                formatTimeValue={formatTimeValue}
                displayWeight={displayWeight}
                unit={unit}
                NUMBER_FORMATTING={NUMBER_FORMATTING}
                workoutIndex={index}
              />
            )}

            {/* Show More/Less Button */}
            {viewMode === 'compact' && !isExternalWorkout && hasMoreExercises && (
              <Pressable
                onPress={onExpandToggle}
                className="mt-4 flex-row items-center justify-center rounded-md bg-muted/50 py-2"
                testID={`workout-${index}-expand-toggle`}
                accessible={true}
                accessibilityLabel={isExpanded ? 'Show less exercises' : 'Show more exercises'}
                accessibilityRole="button">
                {isExpanded ? (
                  <>
                    <ChevronUp size={16} color={colors.text + '80'} />
                    <Text
                      className="ml-1 text-sm text-muted-foreground"
                      testID={`workout-${index}-show-less-text`}>
                      Show Less
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      className="mr-1 text-sm text-muted-foreground"
                      testID={`workout-${index}-show-more-text`}>
                      +{item.exercises.length - EXERCISES_TO_SHOW} more exercise
                      {item.exercises.length - EXERCISES_TO_SHOW > 1 ? 's' : ''}
                    </Text>
                    <ChevronDown size={16} color={colors.text + '80'} />
                  </>
                )}
              </Pressable>
            )}
          </CardContent>
        </CardWrapper>
      </Card>
    );
  }
);

WorkoutHistoryItem.displayName = 'WorkoutHistoryItem';
