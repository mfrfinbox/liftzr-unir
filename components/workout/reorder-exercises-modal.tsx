import React, { useState, useRef, useEffect, useMemo } from 'react';

import { View, Pressable, Alert, InteractionManager, StyleSheet } from 'react-native';

import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Menu, Info } from 'lucide-react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
  OpacityDecorator,
} from 'react-native-draggable-flatlist';

import { BottomSheet } from '~/components/sheets/bottom-sheet';
import { Text } from '~/components/ui/text';
import { useMuscleGroups } from '~/hooks/data/use-muscle-groups';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import type { ExerciseWithDetails } from '~/types';

interface ReorderExercisesModalProps {
  visible: boolean;
  onClose: () => void;
  exercises: ExerciseWithDetails[];
  workoutId: string;
  onExercisesReordered: (reorderedExercises?: ExerciseWithDetails[]) => void;
  onReorderQuickWorkout?: (exerciseIds: string[]) => void;
}

export function ReorderExercisesModal({
  visible,
  onClose,
  exercises,
  workoutId,
  onExercisesReordered,
  onReorderQuickWorkout,
}: ReorderExercisesModalProps) {
  const { theme } = useAppTheme();
  const isDatabaseLoaded = true;
  const { muscleGroups } = useMuscleGroups();
  const [orderedExercises, setOrderedExercises] = useState<ExerciseWithDetails[]>([]);
  const [isProcessingSave, setIsProcessingSave] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [_isDragging, setIsDragging] = useState(false);

  // Track interaction state with refs to prevent issues during state updates
  const isSavingRef = useRef(false);
  const isClosingRef = useRef(false);
  const originalOrderRef = useRef<string[]>([]);

  // Create memoized styles that depend on the theme
  const styles = useMemo(
    () =>
      StyleSheet.create({
        flatListContainer: {
          backgroundColor: theme.colors.background,
          marginBottom: '100%',
        },
        listItem: {
          borderBottomColor: theme.colors.border + '35',
          borderBottomWidth: 1,
        },
        activeItem: {
          backgroundColor: theme.colors.card,
        },
        inactiveItem: {
          backgroundColor: 'transparent',
        },
        primaryText: {
          color: theme.colors.primary + 'ee',
          fontWeight: '500',
        },
        normalText: {
          color: theme.colors.text,
        },
        titleText: {
          color: theme.colors.text,
          fontSize: 17,
          fontWeight: '500',
        },
        secondaryText: {
          color: theme.colors.text + 'aa',
          fontSize: 14,
        },
        instructionText: {
          color: theme.colors.text + '80',
          fontSize: 14,
        },
        dragHandle: {
          width: 24,
          height: 24,
          marginRight: 16,
          alignItems: 'center',
          justifyContent: 'center',
        },
        headerBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '35',
        },
        sectionBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '25',
        },
        handleIcon: {
          opacity: 0.8,
        },
        actionText: {
          color: theme.colors.primary + (theme.dark ? 'EE' : 'DD'),
          fontWeight: '500',
        },
      }),
    [theme]
  );

  // Reset the ordered exercises whenever the modal is opened
  useEffect(() => {
    if (visible) {
      const exercisesCopy = [...exercises];
      setOrderedExercises(exercisesCopy);
      originalOrderRef.current = exercisesCopy.map((e) => e.id);
      setHasChanges(false);
      setIsProcessingSave(false);
      isSavingRef.current = false;
      isClosingRef.current = false;
      setIsDragging(false);
    } else {
      // When modal closes, ensure all state is reset
      setIsProcessingSave(false);
      isSavingRef.current = false;
      isClosingRef.current = false;
      setIsDragging(false);
      setHasChanges(false);
    }
  }, [visible, exercises]);

  // Cleanup when modal is dismissed
  useEffect(() => {
    if (!visible) {
      const interactionCleanup = InteractionManager.runAfterInteractions(() => {
        setOrderedExercises([]);
        setHasChanges(false);
        setIsProcessingSave(false);
        isSavingRef.current = false;
        isClosingRef.current = false;
        setIsDragging(false);
      });

      return () => {
        interactionCleanup.cancel();
      };
    }
  }, [visible]);

  // Complete cleanup when component unmounts
  useEffect(() => {
    return () => {
      isSavingRef.current = false;
      isClosingRef.current = false;
    };
  }, []);

  // Check if order has changed
  const checkForChanges = (newOrder: ExerciseWithDetails[]) => {
    const currentIds = newOrder.map((e) => e.id);
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

  // Safely close the modal
  const handleClose = () => {
    // Reset all state immediately
    isClosingRef.current = true;
    isSavingRef.current = false;
    setIsProcessingSave(false);
    setOrderedExercises([]);
    setHasChanges(false);
    setIsDragging(false);

    // Close the modal
    onClose();
  };

  // Save the new order
  const saveOrder = async () => {
    if (isProcessingSave || isSavingRef.current || isClosingRef.current) {
      return;
    }

    // If no changes, just close the modal
    if (!hasChanges) {
      handleClose();
      return;
    }

    // Check if database is loaded before attempting to save
    if (!isDatabaseLoaded && workoutId !== 'quick') {
      Alert.alert('Please wait', 'Database is still loading. Please try again in a moment.');
      return;
    }

    isSavingRef.current = true;
    setIsProcessingSave(true);

    try {
      // Special handling for quick workouts
      if (workoutId === 'quick') {
        // If we have the special quick workout handler, use it
        if (onReorderQuickWorkout) {
          const exerciseIds = orderedExercises.map((exercise) => exercise.id);
          onReorderQuickWorkout(exerciseIds);
        }

        // Close the modal immediately for quick workouts
        handleClose();
        return;
      }

      // For active workouts, we need to pass the full ordered exercises array
      // so the parent can update its state and save properly
      if (onExercisesReordered) {
        // Pass the reordered exercises to the parent
        onExercisesReordered(orderedExercises);
      }

      // Reset changes state and close modal immediately
      setHasChanges(false);
      handleClose();
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred while saving the exercise order.');
      setIsProcessingSave(false);
      isSavingRef.current = false;
    }
  };

  // Handle drag end
  const handleDragEnd = ({ data }: { data: ExerciseWithDetails[] }) => {
    setIsDragging(false);
    setOrderedExercises(data);
    checkForChanges(data);
  };

  // Render a draggable item
  const renderItem = ({ item, drag, isActive }: RenderItemParams<ExerciseWithDetails>) => {
    // Resolve muscle group ID to display name
    const primaryMuscleGroupName = (() => {
      const primaryId = item.details.primaryMuscleGroup;
      if (!primaryId) return 'Unknown';

      const muscleGroup = muscleGroups.find((mg) => mg.id === primaryId);
      return muscleGroup?.displayName || 'Unknown';
    })();

    return (
      <OpacityDecorator activeOpacity={0.8}>
        <ScaleDecorator activeScale={0.98}>
          <Pressable
            onLongPress={() => {
              setIsDragging(true);
              drag();
            }}
            delayLongPress={150}
            style={[styles.listItem, isActive ? styles.activeItem : styles.inactiveItem]}
            className="my-0.5 flex-row items-center rounded-lg p-3 px-4"
            testID={`reorder-exercise-item-${item.details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Reorder ${item.details.name}`}>
            {/* Drag handle indicator */}
            <View style={styles.dragHandle}>
              <Menu
                size={22}
                color={isActive ? theme.colors.primary : theme.colors.text + 'cc'}
                style={styles.handleIcon}
              />
            </View>

            <View className="flex-1">
              <Text
                style={styles.normalText}
                className="text-base font-medium"
                testID={`reorder-exercise-name-${item.details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                {item.details.name}
              </Text>
              <Text
                className="text-xs text-muted-foreground"
                testID={`reorder-exercise-info-${item.details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                {item.setsData?.length || 0} {(item.setsData?.length || 0) === 1 ? 'set' : 'sets'} ·{' '}
                {primaryMuscleGroupName}
              </Text>
            </View>
          </Pressable>
        </ScaleDecorator>
      </OpacityDecorator>
    );
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      snapPoints={['60%']}
      initialIndex={0}
      backdropDismissible={true}
      enablePanDownToClose={false}
      showIndicator={true}>
      <BottomSheetView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerBorder} className="flex-row items-center justify-between p-4">
          <Pressable
            onPress={handleClose}
            hitSlop={10}
            className="px-2"
            testID="reorder-cancel-button">
            <Text style={styles.actionText}>Cancel</Text>
          </Pressable>
          <Text style={styles.titleText} className="font-medium">
            Reorder Exercises
          </Text>
          <Pressable onPress={saveOrder} hitSlop={10} className="px-2" testID="reorder-done-button">
            <Text style={styles.actionText}>Done</Text>
          </Pressable>
        </View>

        {/* Instructions */}
        <View style={styles.sectionBorder} className="py-2">
          <View className="flex-row items-center justify-center">
            <Info size={16} color={theme.colors.text + '60'} style={{ marginRight: 6 }} />
            <Text
              style={[styles.instructionText, { color: theme.colors.text + '60' }]}
              className="text-center text-sm">
              Hold and drag to reorder.
            </Text>
          </View>
        </View>

        {/* Exercise List */}
        <View className="flex-1">
          {orderedExercises.length > 0 ? (
            <DraggableFlatList
              data={orderedExercises}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerClassName="p-2 pb-6"
              activationDistance={20}
              dragItemOverflow={true}
              dragHitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              autoscrollSpeed={75}
              autoscrollThreshold={40}
              showsVerticalScrollIndicator={false}
              containerStyle={styles.flatListContainer}
              onDragBegin={() => setIsDragging(true)}
            />
          ) : (
            <View className="items-center justify-center py-10">
              <Text style={styles.secondaryText} className="text-center">
                No exercises to reorder
              </Text>
            </View>
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
