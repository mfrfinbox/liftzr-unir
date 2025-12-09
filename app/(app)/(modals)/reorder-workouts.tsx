import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

import { View, Pressable, Alert, StyleSheet, FlatList, Animated } from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';

import { ChevronUp, ChevronDown, Info } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '~/components/ui/text';
import { useUpdateWorkout } from '~/hooks/data';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import { Workout } from '~/types';

// Global variable to pass data back to parent
let reorderResult: { workoutIds: string[] } | null = null;

export function getReorderResult() {
  const result = reorderResult;
  reorderResult = null; // Clear after reading
  return result;
}

export default function ReorderWorkoutsModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    workouts: string;
  }>();

  const { theme } = useAppTheme();
  const isDatabaseLoaded = true;
  const { reorderWorkouts } = useUpdateWorkout();

  const [orderedWorkouts, setOrderedWorkouts] = useState<Workout[]>([]);
  const [isProcessingSave, setIsProcessingSave] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [_lastMovedIndex, setLastMovedIndex] = useState<number | null>(null);
  const highlightAnimations = useRef<{ [key: string]: Animated.Value }>({});

  // Track interaction state with refs to prevent issues during state updates
  const isSavingRef = useRef(false);
  const isClosingRef = useRef(false);
  const originalOrderRef = useRef<string[]>([]);

  // Parse workouts from params
  const workouts = useMemo(() => {
    try {
      return params.workouts ? JSON.parse(params.workouts) : [];
    } catch {
      return [];
    }
  }, [params.workouts]);

  // Create memoized styles that depend on the theme
  const styles = useMemo(
    () =>
      StyleSheet.create({
        listItem: {
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          marginBottom: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        normalText: {
          color: theme.colors.text,
        },
        titleText: {
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: '600',
        },
        secondaryText: {
          color: theme.colors.text + 'aa',
          fontSize: 14,
        },
        instructionText: {
          color: theme.colors.text + '80',
          fontSize: 14,
        },
        headerBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '35',
        },
        sectionBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '25',
        },
        actionText: {
          color: theme.colors.primary,
          fontWeight: '500',
          fontSize: 16,
        },
        moveButton: {
          padding: 8,
          marginLeft: 8,
        },
        moveButtonDisabled: {
          opacity: 0.3,
        },
        highlightedItem: {
          borderColor: theme.colors.primary,
          borderWidth: 2,
        },
      }),
    [theme]
  );

  // Initialize workouts
  useEffect(() => {
    const workoutsCopy = [...workouts];
    setOrderedWorkouts(workoutsCopy);
    originalOrderRef.current = workoutsCopy.map((w) => w.id);
    setHasChanges(false);
    setIsProcessingSave(false);
    isSavingRef.current = false;
    isClosingRef.current = false;
  }, [workouts]);

  // Check if order has changed
  const checkForChanges = (newOrder: Workout[]) => {
    const currentIds = newOrder.map((w) => w.id);
    const originalIds = originalOrderRef.current;

    if (currentIds.length !== originalIds.length) {
      setHasChanges(true);
      return;
    }

    for (let i = 0; i < currentIds.length; i++) {
      if (currentIds[i] !== originalIds[i]) {
        setHasChanges(true);
        return;
      }
    }

    setHasChanges(false);
  };

  // Create or get highlight animation for a workout
  const getHighlightAnimation = useCallback((workoutId: string) => {
    if (!highlightAnimations.current[workoutId]) {
      highlightAnimations.current[workoutId] = new Animated.Value(0);
    }
    return highlightAnimations.current[workoutId];
  }, []);

  // Animate highlight for moved item
  const animateHighlight = useCallback(
    (workoutId: string) => {
      const animation = getHighlightAnimation(workoutId);

      // Reset and animate
      animation.setValue(1);
      Animated.timing(animation, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    },
    [getHighlightAnimation]
  );

  // Move workout up or down
  const moveWorkout = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newWorkouts = [...orderedWorkouts];
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      // Swap workouts
      [newWorkouts[index], newWorkouts[newIndex]] = [newWorkouts[newIndex], newWorkouts[index]];

      setOrderedWorkouts(newWorkouts);
      checkForChanges(newWorkouts);

      // Track and animate the moved item
      setLastMovedIndex(newIndex);
      animateHighlight(newWorkouts[newIndex].id);
    },
    [orderedWorkouts, animateHighlight]
  );

  // Safely close the modal
  const handleClose = useCallback(() => {
    // Reset all state immediately
    isClosingRef.current = true;
    isSavingRef.current = false;
    setIsProcessingSave(false);
    setOrderedWorkouts([]);
    setHasChanges(false);

    // Navigate back
    router.back();
  }, [router]);

  // Save the new order
  const saveOrder = useCallback(async () => {
    if (isProcessingSave || isSavingRef.current || isClosingRef.current) {
      return;
    }

    // If no changes, just close the modal
    if (!hasChanges) {
      handleClose();
      return;
    }

    // Check if database is loaded before attempting to save
    if (!isDatabaseLoaded) {
      Alert.alert('Please wait', 'Database is still loading. Please try again in a moment.');
      return;
    }

    isSavingRef.current = true;
    setIsProcessingSave(true);

    try {
      const workoutIds = orderedWorkouts.map((workout) => workout.id);

      // Store the result for the parent to pick up
      reorderResult = { workoutIds };

      // Use the reorder function
      const result = await reorderWorkouts(workoutIds);

      if (result.success) {
        // The sort method will be automatically handled by the useWorkoutSorting hook
        handleClose();
      } else {
        Alert.alert('Error', 'Failed to save the new workout order. Please try again.');
        setIsProcessingSave(false);
        isSavingRef.current = false;
      }
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred while saving the workout order.');
      setIsProcessingSave(false);
      isSavingRef.current = false;
    }
  }, [
    hasChanges,
    isProcessingSave,
    isDatabaseLoaded,
    handleClose,
    orderedWorkouts,
    reorderWorkouts,
  ]);

  // Render a workout item
  const renderItem = ({ item, index }: { item: Workout; index: number }) => {
    const isFirst = index === 0;
    const isLast = index === orderedWorkouts.length - 1;
    const highlightAnimation = getHighlightAnimation(item.id);

    const animatedStyle = {
      borderColor: highlightAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.card, theme.colors.primary],
      }),
      borderWidth: highlightAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 2],
      }),
    };

    return (
      <Animated.View
        style={[styles.listItem, animatedStyle]}
        testID={`reorder-workout-item-${index}`}>
        <View className="flex-1">
          <Text
            style={styles.normalText}
            className="text-base font-medium"
            testID={`reorder-workout-name-${index}`}>
            {item.title}
          </Text>
          <Text className="text-xs text-muted-foreground" testID={`reorder-workout-info-${index}`}>
            {item.exercises.length} {item.exercises.length === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>

        <View className="flex-row items-center" testID={`reorder-workout-arrows-${index}`}>
          <Pressable
            onPress={() => moveWorkout(index, 'up')}
            disabled={isFirst}
            style={[styles.moveButton, isFirst && styles.moveButtonDisabled]}
            testID={`reorder-workout-move-up-${index}`}>
            <ChevronUp
              size={24}
              color={isFirst ? theme.colors.text + '30' : theme.colors.primary}
            />
          </Pressable>

          <Pressable
            onPress={() => moveWorkout(index, 'down')}
            disabled={isLast}
            style={[styles.moveButton, isLast && styles.moveButtonDisabled]}
            testID={`reorder-workout-move-down-${index}`}>
            <ChevronDown
              size={24}
              color={isLast ? theme.colors.text + '30' : theme.colors.primary}
            />
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View style={styles.headerBorder} className="bg-card">
          <View className="flex-row items-center justify-between px-6 py-4">
            <Pressable onPress={handleClose} hitSlop={10} testID="reorder-cancel-button">
              <Text style={styles.actionText} className="text-base font-medium">
                Cancel
              </Text>
            </Pressable>
            <Text
              style={styles.titleText}
              className="text-xl font-bold"
              testID="reorder-workouts-title">
              Reorder Workouts
            </Text>
            <Pressable onPress={saveOrder} hitSlop={10} testID="reorder-done-button">
              <Text style={styles.actionText} className="text-base font-semibold">
                Done
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.sectionBorder} className="bg-card py-3">
          <View className="flex-row items-center justify-center">
            <Info size={16} color={theme.colors.text + '60'} style={{ marginRight: 6 }} />
            <Text
              style={[styles.instructionText, { color: theme.colors.text + '60' }]}
              className="text-center text-sm">
              Use arrows to move workouts up or down.
            </Text>
          </View>
        </View>

        {/* Workout List */}
        <View className="flex-1">
          {orderedWorkouts.length > 0 ? (
            <FlatList
              data={orderedWorkouts}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="items-center justify-center py-10">
              <Text style={styles.secondaryText} className="text-center">
                No workouts to reorder
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
