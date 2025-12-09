import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

import { View, FlatList, Pressable } from 'react-native';

import { useRouter } from 'expo-router';

import { Medal, Search, XCircle } from 'lucide-react-native';

import { ModalHeader } from '~/components/layout/modal-header';
import { Screen } from '~/components/layout/screen';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { KeyboardAwareWrapper } from '~/components/ui/keyboard-aware-wrapper';
import { Text } from '~/components/ui/text';
import { useExercises, usePersonalRecords } from '~/hooks/data';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import { PRType, PR_TYPES } from '~/lib/services/pr-tracking/types';
import type { PersonalRecord } from '~/types';

interface ExercisePRData {
  exerciseId: string;
  exerciseName: string;
  prs: {
    [PR_TYPES.WEIGHT]?: PersonalRecord;
    [PR_TYPES.REPS]?: PersonalRecord;
    [PR_TYPES.VOLUME]?: PersonalRecord;
    [PR_TYPES.TIME]?: PersonalRecord;
    [PR_TYPES.DISTANCE]?: PersonalRecord;
  };
}

export default function AllPersonalRecordsModal() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { displayWeight } = useMeasurement();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<any>(null);

  // Database hooks
  const { exercises, isLoading: exercisesLoading } = useExercises();
  const { personalRecords, isLoading: prsLoading } = usePersonalRecords();

  // Auto-focus the input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Process personal records to get the latest PR for each exercise/type combination
  const exercisePRData = useMemo(() => {
    if (!personalRecords || !exercises) return [];

    // Group PRs by exercise and type, keeping only the latest for each
    const prsByExerciseAndType: Record<string, Record<PRType, PersonalRecord>> = {};

    personalRecords.forEach((pr) => {
      const _key = `${pr.exerciseId}-${pr.type}`;

      if (!prsByExerciseAndType[pr.exerciseId]) {
        prsByExerciseAndType[pr.exerciseId] = {} as Record<PRType, PersonalRecord>;
      }

      const existingPR = prsByExerciseAndType[pr.exerciseId][pr.type];
      if (!existingPR || new Date(pr.date) > new Date(existingPR.date)) {
        prsByExerciseAndType[pr.exerciseId][pr.type] = pr;
      }
    });

    // Convert to array format with exercise names
    const result: ExercisePRData[] = [];
    Object.keys(prsByExerciseAndType).forEach((exerciseId) => {
      const exercise = exercises.find((ex) => ex.id === exerciseId);
      if (exercise) {
        result.push({
          exerciseId,
          exerciseName: exercise.name,
          prs: prsByExerciseAndType[exerciseId],
        });
      }
    });

    // Sort alphabetically by exercise name
    return result.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
  }, [personalRecords, exercises]);

  // Filter exercises based on search query
  const filteredExercisePRData = useMemo(() => {
    if (!searchQuery) return exercisePRData;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return exercisePRData.filter((exercise) =>
      exercise.exerciseName.toLowerCase().includes(lowerCaseQuery)
    );
  }, [exercisePRData, searchQuery]);

  // Format PR type for display
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
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        const seconds = value % 60;

        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      case PR_TYPES.DISTANCE:
        return `${(value / 1000).toFixed(2)} km`;
      default:
        return value.toString();
    }
  };

  const renderExerciseItem = useCallback(
    ({ item }: { item: ExercisePRData }) => {
      const prTypes = Object.keys(item.prs) as PRType[];
      const sortedPRTypes = prTypes.sort((a, b) => {
        const order = [
          PR_TYPES.WEIGHT,
          PR_TYPES.REPS,
          PR_TYPES.VOLUME,
          PR_TYPES.TIME,
          PR_TYPES.DISTANCE,
        ];
        return order.indexOf(a) - order.indexOf(b);
      });

      return (
        <Card key={item.exerciseId} className="mb-4 border-border">
          <CardContent className="p-4">
            <Text className="mb-3 text-lg font-semibold text-foreground">{item.exerciseName}</Text>

            <View className="gap-3">
              {sortedPRTypes.map((type) => {
                const pr = item.prs[type];
                if (!pr) return null;

                return (
                  <View key={type} className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-base text-foreground">{formatPRType(type)}</Text>
                      <Text className="text-sm text-muted-foreground">{formatDate(pr.date)}</Text>
                    </View>
                    <Text className="text-base font-medium text-foreground">
                      {formatValue(pr.value, type)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </CardContent>
        </Card>
      );
    },
    [displayWeight]
  );

  const isLoading = exercisesLoading || prsLoading;

  return (
    <KeyboardAwareWrapper>
      <Screen
        scrollable={false}
        withTabBarPadding={false}
        style={{ paddingTop: 0 }}
        testID="modal-all-personal-records">
        <ModalHeader title="All Personal Records" onClose={handleClose} />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground">Loading personal records...</Text>
          </View>
        ) : (
          <View className="flex-1">
            {/* Search bar */}
            <View className="px-4 py-3">
              <View className="flex-row items-center rounded-md border border-border bg-input px-3">
                <Search size={20} color={theme.colors.text + '80'} style={{ marginRight: 8 }} />
                <Input
                  ref={inputRef}
                  className="flex-1 border-0 bg-transparent px-0 py-2 text-base text-foreground"
                  placeholder="Search exercises..."
                  placeholderTextColor={theme.colors.text}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  autoCorrect={false}
                  spellCheck={false}
                  testID="input-pr-search"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} className="p-1">
                    <XCircle size={20} color={theme.colors.text + '80'} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* PRs list */}
            <FlatList
              data={filteredExercisePRData}
              renderItem={renderExerciseItem}
              keyExtractor={(item) => item.exerciseId}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 20,
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                filteredExercisePRData.length === 0 ? (
                  <View className="items-center justify-center py-16">
                    <Medal
                      size={48}
                      color={theme.colors.text + '80'}
                      style={{ marginBottom: 12 }}
                    />
                    {searchQuery ? (
                      <>
                        <Text className="mb-1 text-center text-muted-foreground">
                          No personal records found for &ldquo;{searchQuery}&rdquo;
                        </Text>
                        <Text className="text-center text-sm text-muted-foreground">
                          Try a different search term
                        </Text>
                      </>
                    ) : exercisePRData.length === 0 ? (
                      <>
                        <Text className="mb-1 text-center text-muted-foreground">
                          No personal records yet
                        </Text>
                        <Text className="text-center text-sm text-muted-foreground">
                          Complete workouts to start tracking your PRs
                        </Text>
                      </>
                    ) : null}
                  </View>
                ) : null
              }
            />
          </View>
        )}
      </Screen>
    </KeyboardAwareWrapper>
  );
}
