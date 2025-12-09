import { View } from 'react-native';

import { Text } from '~/components/ui/text';
import { WORKOUT_FIELDS } from '~/lib/constants';

import { formatTime } from './formatting-utils';

import type { PerformanceStats } from './types';

interface PerformanceStatsDisplayProps {
  performanceStats: PerformanceStats;
  exerciseType: string;
  displayWeight: (weight: number) => string;
  statValue: any;
  statLabel: any;
}

export function PerformanceStatsDisplay({
  performanceStats,
  exerciseType,
  displayWeight,
  statValue,
  statLabel,
}: PerformanceStatsDisplayProps) {
  const isTimeBasedExercise = exerciseType === WORKOUT_FIELDS.TIME;
  const isDistanceBasedExercise = exerciseType === WORKOUT_FIELDS.DISTANCE;

  if (!performanceStats.hasData) return null;

  return (
    <View className="my-6 flex-row items-center justify-between px-2">
      {isTimeBasedExercise ? (
        <>
          <View className="flex-1 items-center px-1">
            <Text style={statLabel} className="mb-1">
              Max Time
            </Text>
            <Text style={statValue}>
              {performanceStats.maxTime ? formatTime(performanceStats.maxTime) : '-'}
            </Text>
          </View>

          <View className="flex-1 items-center px-1">
            <Text style={statLabel} className="mb-1">
              Avg Time
            </Text>
            <Text style={statValue}>
              {performanceStats.avgTime ? formatTime(performanceStats.avgTime) : '-'}
            </Text>
          </View>

          <View className="flex-1 items-center px-1">
            <Text style={statLabel} className="mb-1">
              Total Time
            </Text>
            <Text style={statValue}>
              {performanceStats.totalTime ? formatTime(performanceStats.totalTime) : '-'}
            </Text>
          </View>
        </>
      ) : isDistanceBasedExercise ? (
        <>
          <View className="flex-1 items-center px-1">
            <Text style={statLabel} className="mb-1">
              Max Distance
            </Text>
            <Text style={statValue}>
              {performanceStats.maxDistance
                ? `${(performanceStats.maxDistance / 1000).toFixed(2)} km`
                : '-'}
            </Text>
          </View>

          <View className="flex-1 items-center px-1">
            <Text style={statLabel} className="mb-1">
              Best Time
            </Text>
            <Text style={statValue}>
              {performanceStats.bestTime ? formatTime(performanceStats.bestTime) : '-'}
            </Text>
          </View>

          <View className="flex-1 items-center px-1">
            <Text style={statLabel} className="mb-1">
              Avg Pace
            </Text>
            <Text style={statValue} numberOfLines={1} adjustsFontSizeToFit>
              {performanceStats.avgPace ? `${formatTime(performanceStats.avgPace)}/km` : '-'}
            </Text>
          </View>
        </>
      ) : (
        <>
          <View className="flex-1 items-center px-1">
            <Text style={statLabel} className="mb-1">
              Max Reps
            </Text>
            <Text style={statValue}>{performanceStats.maxReps || '-'}</Text>
          </View>

          <View className="flex-1 items-center px-1">
            <Text style={statLabel} className="mb-1">
              Max Weight
            </Text>
            <Text style={statValue} numberOfLines={1} adjustsFontSizeToFit>
              {performanceStats.maxWeight ? displayWeight(performanceStats.maxWeight) : '-'}
            </Text>
          </View>

          <View className="flex-1 items-center px-1">
            <Text style={statLabel} className="mb-1">
              Volume
            </Text>
            <Text style={statValue} numberOfLines={1} adjustsFontSizeToFit>
              {performanceStats.totalVolume ? displayWeight(performanceStats.totalVolume) : '-'}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
