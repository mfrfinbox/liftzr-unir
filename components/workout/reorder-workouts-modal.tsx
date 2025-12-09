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
import { useUpdateWorkout } from '~/hooks/data';
import { APP_PADDING } from '~/lib/constants';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import { Workout } from '~/types';

interface ReorderWorkoutsModalProps {
  visible: boolean;
  onClose: () => void;
  workouts: Workout[];
  onWorkoutsReordered: () => void;
}

export function ReorderWorkoutsModal({ visible, onClose, workouts }: ReorderWorkoutsModalProps) {
  const isDatabaseLoaded = true;
  const { reorderWorkouts } = useUpdateWorkout();
  const [orderedWorkouts, setOrderedWorkouts] = useState<Workout[]>([]);
  const [isProcessingSave, setIsProcessingSave] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [_isDragging, setIsDragging] = useState(false);
  const { theme } = useAppTheme();

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
          borderBottomColor: theme.colors.border + '35', // 35 = 21% opacity (subtler)
          borderBottomWidth: 1,
        },
        activeItem: {
          backgroundColor: theme.colors.card, // Use card color which works in both light/dark mode
        },
        inactiveItem: {
          backgroundColor: 'transparent',
        },
        buttonBackground: {
          backgroundColor:
            theme.dark === true
              ? theme.colors.text + '1A' // 1A = 10% opacity (darker than before)
              : theme.colors.card + 'F5', // F5 = 96% opacity (more visible)
          borderRadius: 8,
        },
        primaryText: {
          color: theme.colors.primary + 'ee', // ee = 93% opacity - less stark/bright
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
          color: theme.colors.text + 'aa', // aa = 67% opacity - matches workout details
          fontSize: 14,
        },
        instructionText: {
          color: theme.colors.text + '80', // 80 = 50% opacity
          fontSize: 14,
        },
        dragHandle: {
          width: 24,
          height: 24,
          marginRight: 16,
          alignItems: 'center',
          justifyContent: 'center',
        },
        buttonContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 6,
          paddingHorizontal: APP_PADDING.horizontal,
          paddingVertical: APP_PADDING.vertical,
          borderRadius: 8,
        },
        headerBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '35', // 35 = 21% opacity - more subtle
        },
        sectionBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '25', // 25 = 15% opacity - even more subtle
        },
        handleIcon: {
          opacity: 0.8, // Make the handle icon slightly more subtle
        },
        actionText: {
          color: theme.colors.primary + (theme.dark ? 'EE' : 'DD'), // Slightly more opaque
          fontWeight: '500',
        },
        buttonIcon: {
          color: theme.colors.primary + (theme.dark ? 'EE' : 'DD'),
          opacity: 0.95,
        },
        buttonText: {
          color: theme.colors.primary + (theme.dark ? 'EE' : 'DD'),
          fontWeight: '500',
        },
      }),
    [theme]
  );

  // Reset the ordered workouts whenever the modal is opened
  useEffect(() => {
    if (visible) {
      const workoutsCopy = [...workouts];
      setOrderedWorkouts(workoutsCopy);
      originalOrderRef.current = workoutsCopy.map((w) => w.id); // Store original order
      setHasChanges(false);
      setIsProcessingSave(false);
      isSavingRef.current = false;
      isClosingRef.current = false;
      setIsDragging(false); // Reset dragging state when opening
    } else {
      // When modal closes, ensure all state is reset
      setIsProcessingSave(false);
      isSavingRef.current = false;
      isClosingRef.current = false;
      setIsDragging(false);
      setHasChanges(false);
    }
  }, [visible, workouts]);

  // Cleanup when modal is dismissed
  useEffect(() => {
    if (!visible) {
      // Use InteractionManager to ensure animations complete before cleanup
      const interactionCleanup = InteractionManager.runAfterInteractions(() => {
        setOrderedWorkouts([]);
        setHasChanges(false);
        setIsProcessingSave(false);
        isSavingRef.current = false;
        isClosingRef.current = false;
        setIsDragging(false); // Reset dragging state when closing
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

  // Safely close the modal
  const handleClose = () => {
    // Reset all state immediately
    isClosingRef.current = true;
    isSavingRef.current = false;
    setIsProcessingSave(false);
    setOrderedWorkouts([]);
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
    if (!isDatabaseLoaded) {
      Alert.alert('Please wait', 'Database is still loading. Please try again in a moment.');
      return;
    }

    isSavingRef.current = true;
    setIsProcessingSave(true);

    try {
      const workoutIds = orderedWorkouts.map((workout) => workout.id);
      // Use the reorder function
      const result = await reorderWorkouts(workoutIds);

      if (result.success) {
        // Reset changes state and close modal immediately
        setHasChanges(false);
        handleClose();
      } else {
        Alert.alert('Error', 'Failed to save the new workout order. Please try again.');
        setIsProcessingSave(false);
        isSavingRef.current = false;
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred while saving the workout order.');
      setIsProcessingSave(false);
      isSavingRef.current = false;
    }
  };

  // Handle drag end
  const handleDragEnd = ({ data }: { data: Workout[] }) => {
    setIsDragging(false);
    setOrderedWorkouts(data);
    checkForChanges(data);
  };

  // Render a draggable item
  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<Workout>) => {
    const index = getIndex ? getIndex() : 0;
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
            testID={`reorder-workout-item-${index}`}>
            {/* Drag handle indicator */}
            <View style={styles.dragHandle} testID={`reorder-workout-handle-${index}`}>
              <Menu
                size={22}
                color={isActive ? theme.colors.primary : theme.colors.text + 'cc'} // Added opacity to non-active state
                style={styles.handleIcon}
              />
            </View>

            <View className="flex-1">
              <Text
                style={styles.normalText}
                className="text-base font-medium"
                testID={`reorder-workout-name-${index}`}>
                {item.title}
              </Text>
              <Text
                style={styles.secondaryText}
                className="text-sm"
                testID={`reorder-workout-info-${index}`}>
                {item.exercises.length} exercises
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
          <Text style={styles.titleText} className="font-medium" testID="reorder-workouts-title">
            Reorder Workouts
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

        {/* Workout List */}
        <View className="flex-1">
          {orderedWorkouts.length > 0 ? (
            <DraggableFlatList
              data={orderedWorkouts}
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
                No workouts to reorder
              </Text>
            </View>
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
