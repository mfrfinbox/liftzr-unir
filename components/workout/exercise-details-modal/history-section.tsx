import { View } from 'react-native';

import { Clock, History } from 'lucide-react-native';

import { Text } from '~/components/ui/text';
import { WORKOUT_FIELDS } from '~/lib/constants';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

import { formatDate, formatDistance, formatTime } from './formatting-utils';

import type { GroupedHistoryEntry } from './types';

interface HistorySectionProps {
  groupedHistory: GroupedHistoryEntry[];
  exerciseType: string;
  unit: string;
  displayWeight: (weight: number) => string;
  sectionBorder: any;
  secondaryText: any;
  setText: any;
  normalText: any;
}

export function HistorySection({
  groupedHistory,
  exerciseType,
  unit,
  displayWeight,
  sectionBorder,
  secondaryText,
  setText,
  normalText,
}: HistorySectionProps) {
  const { theme } = useAppTheme();
  const isTimeBasedExercise = exerciseType === WORKOUT_FIELDS.TIME;
  const isDistanceBasedExercise = exerciseType === WORKOUT_FIELDS.DISTANCE;

  if (groupedHistory.length === 0) {
    return (
      <View className="my-8 items-center py-4">
        <History size={24} color={theme.colors.text + '60'} />
        <Text style={secondaryText} className="mt-3 text-center">
          No workout history yet
        </Text>
        <Text
          style={{ color: theme.colors.text + '50', fontSize: 13 }}
          className="mt-1 text-center">
          Start training to track your progress
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-10">
      <Text className="mb-4 font-bold text-primary">Exercise History</Text>

      {groupedHistory.map((dateGroup, groupIndex) => (
        <View key={`date-${groupIndex}`} className="mb-6">
          <Text style={secondaryText} className="mb-2 text-sm font-medium">
            {formatDate(dateGroup.date)}
          </Text>

          <View style={sectionBorder} className="mb-1">
            <View className="flex-row justify-between py-2">
              <Text style={secondaryText} className="w-16 font-medium">
                SET
              </Text>
              {isTimeBasedExercise ? (
                <Text style={secondaryText} className="flex-1 text-center font-medium">
                  TIME
                </Text>
              ) : isDistanceBasedExercise ? (
                <>
                  <Text style={secondaryText} className="flex-1 text-center font-medium">
                    DISTANCE
                  </Text>
                  <Text style={secondaryText} className="flex-1 text-center font-medium">
                    TIME
                  </Text>
                </>
              ) : (
                <>
                  <Text style={secondaryText} className="flex-1 text-center font-medium">
                    REPS
                  </Text>
                  <Text style={secondaryText} className="flex-1 text-center font-medium">
                    {unit.toUpperCase()}
                  </Text>
                </>
              )}
            </View>
          </View>

          {dateGroup.sets.map((set, setIndex) => (
            <View
              key={`set-${groupIndex}-${setIndex}`}
              style={{ borderBottomColor: theme.colors.border + '25' }}
              className="flex-row items-center border-b py-2">
              <View className="w-16">
                <Text style={setText} className="text-center">
                  {setIndex + 1}
                </Text>
              </View>
              {isTimeBasedExercise ? (
                <Text style={normalText} className="flex-1 text-center">
                  {formatTime(set.time)}
                </Text>
              ) : isDistanceBasedExercise ? (
                <>
                  <Text style={normalText} className="flex-1 text-center">
                    {formatDistance(set.distance)}
                  </Text>
                  <Text style={normalText} className="flex-1 text-center">
                    {formatTime(set.time)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={normalText} className="flex-1 text-center">
                    {set.reps || '-'}
                  </Text>
                  <Text style={normalText} className="flex-1 text-center">
                    {set.weight ? displayWeight(set.weight) : '-'}
                  </Text>
                </>
              )}
            </View>
          ))}

          {dateGroup.sets.length > 0 && (
            <View className="mt-3 flex-row items-center">
              <Clock size={18} color={theme.colors.text + '80'} />
              <Text style={secondaryText} className="ml-2 text-sm">
                Rest Timer: {dateGroup.sets[0].rest > 0 ? `${dateGroup.sets[0].rest}s` : 'Off'}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
