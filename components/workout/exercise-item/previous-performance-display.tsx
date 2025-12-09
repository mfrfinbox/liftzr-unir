import React from 'react';

import { View, Pressable, ScrollView } from 'react-native';

import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';

interface PreviousPerformanceDisplayProps {
  previousPerformanceData: {
    sets: {
      setNumber: number;
      text: string;
    }[];
    uniformWeight?: string;
  } | null;
  previousPerformance: {
    lastDateFormatted: string;
  };
  exerciseName: string;
  index: number;
  onOpenDetails: () => void;
}

/**
 * Displays previous workout performance data for an exercise
 */
export function PreviousPerformanceDisplay({
  previousPerformanceData,
  previousPerformance,
  exerciseName,
  index,
  onOpenDetails,
}: PreviousPerformanceDisplayProps) {
  const { t } = useTranslation();

  if (!previousPerformanceData) return null;

  return (
    <View className="mb-4 border-b border-muted/20 pb-3" testID={`previous-performance-${index}`}>
      <Pressable
        onPress={onOpenDetails}
        accessible={true}
        accessibilityLabel={`Previous performance for ${exerciseName}`}
        accessibilityHint="Tap to see full exercise history"
        testID={`previous-performance-header-${index}`}>
        <View className="flex-row items-center justify-between">
          <Text
            className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/60"
            testID={`previous-performance-date-${index}`}>
            {t('workout.lastWorkout')} • {previousPerformance.lastDateFormatted}
          </Text>
        </View>
      </Pressable>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        className="-mx-4 mt-1.5"
        contentContainerStyle={{
          paddingHorizontal: 16,
          flexGrow: 0,
        }}
        nestedScrollEnabled={true}
        testID={`previous-performance-scroll-${index}`}>
        <View className="flex-row items-start gap-3">
          {previousPerformanceData.sets.map((set, idx) => {
            const parts = set.text.split(' × ');
            const reps =
              parts[0]?.replace(' reps', '').replace(' rep', '') || set.text.replace(' reps', '');
            const weight = parts[1] || previousPerformanceData.uniformWeight || '';
            const cleanWeight = weight.replace('kg', '').replace('lbs', '').trim();

            return (
              <Pressable
                key={idx}
                onPress={onOpenDetails}
                className="items-center"
                testID={`previous-set-${index}-${set.setNumber}-reps${reps}-weight${cleanWeight}`}>
                <View
                  className="mb-1 rounded-full bg-muted/30 px-3 py-0.5"
                  testID={`previous-set-bubble-${index}-${set.setNumber}`}>
                  <Text
                    className="text-[9px] font-semibold uppercase text-muted-foreground/90"
                    testID={`previous-set-label-${index}-${set.setNumber}`}>
                    Set {set.setNumber}
                  </Text>
                </View>
                <Text
                  className="text-xs font-medium text-muted-foreground"
                  testID={`previous-set-data-${index}-${set.setNumber}-${reps}x${cleanWeight}`}>
                  {reps}×{weight}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
