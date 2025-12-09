import { View, Pressable } from 'react-native';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { BottomSheet } from '~/components/sheets/bottom-sheet';
import { Text } from '~/components/ui/text';
import { WORKOUT_FIELDS } from '~/lib/constants';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';

import { HistorySection } from './history-section';
import { PerformanceStatsDisplay } from './performance-stats-display';
import { useExerciseHistory } from './use-exercise-history';
import { useExerciseStyles } from './use-exercise-styles';
import { useModalLifecycle } from './use-modal-lifecycle';
import { usePerformanceStats } from './use-performance-stats';

import type { ExerciseDetailsModalProps } from './types';

export function ExerciseDetailsModal({ visible, onClose, exercise }: ExerciseDetailsModalProps) {
  const { displayWeight, unit } = useMeasurement();

  const styles = useExerciseStyles();
  const { isClosingRef } = useModalLifecycle(visible, exercise);
  const { groupedHistory, historicalSets } = useExerciseHistory(exercise);

  const exerciseType = exercise?.type || WORKOUT_FIELDS.REPS;
  const performanceStats = usePerformanceStats(historicalSets, exerciseType);

  const handleClose = () => {
    if (isClosingRef.current) return;

    isClosingRef.current = true;
    onClose();

    setTimeout(() => {
      isClosingRef.current = false;
    }, 500);
  };

  if (!exercise) return null;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      snapPoints={['80%']}
      initialIndex={0}
      backdropDismissible
      enablePanDownToClose={false}
      showIndicator>
      <View style={styles.headerBorder} className="flex-row items-center justify-between p-4">
        <Pressable
          onPress={handleClose}
          hitSlop={10}
          className="px-2"
          testID="exercise-details-close-button">
          <Text style={styles.actionText}>Close</Text>
        </Pressable>
        <Text
          style={styles.titleText}
          className="text-lg font-medium"
          testID="exercise-details-title">
          {exercise.name}
        </Text>
        <View className="w-10" />
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        style={{ flex: 1 }}>
        {(performanceStats.hasData || historicalSets.length > 0) && (
          <PerformanceStatsDisplay
            performanceStats={performanceStats}
            exerciseType={exerciseType}
            displayWeight={displayWeight}
            statValue={styles.statValue}
            statLabel={styles.statLabel}
          />
        )}

        <HistorySection
          groupedHistory={groupedHistory}
          exerciseType={exerciseType}
          unit={unit}
          displayWeight={displayWeight}
          sectionBorder={styles.sectionBorder}
          secondaryText={styles.secondaryText}
          setText={styles.setText}
          normalText={styles.normalText}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
