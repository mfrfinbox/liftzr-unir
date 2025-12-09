import { useState, useRef } from 'react';

import { View, Pressable, TextInput, Alert } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { MinusCircle, Check } from 'lucide-react-native';

import { Text } from '~/components/ui/text';
import { INPUT_STYLE, CHECKBOX_STYLE, SET_ROW_BACKGROUND } from '~/lib/constants/ui';
import { useMeasurement } from '~/lib/contexts/MeasurementContext';

import { DistanceInput } from './distance-input';
import { TimeInput } from './time-input';
import { WeightInput } from './weight-input';

interface SetRowProps {
  exerciseIndex: number;
  setIndex: number;
  setData: {
    reps: string;
    weight: string;
    completed?: boolean;
    time?: string; // Time in seconds
    distance?: string; // Distance in meters
    isPreFilled?: boolean; // Indicates if this set was pre-filled from previous workout
  };
  onUpdateSetData: (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight' | 'time' | 'distance',
    value: string
  ) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onToggleSetCompletion?: (exerciseIndex: number, setIndex: number) => void;
  showRemoveButton?: boolean;
  isOddIndex?: boolean;
  exerciseType?: 'reps' | 'time' | 'distance'; // Add exercise type
  isDurationBased?: boolean; // For distance-based exercises
}

export function SetRow({
  exerciseIndex,
  setIndex,
  setData,
  onUpdateSetData,
  onRemoveSet,
  onToggleSetCompletion,
  showRemoveButton = true,
  isOddIndex = false,
  exerciseType = 'reps',
}: SetRowProps) {
  // ALL HOOKS DECLARED UNCONDITIONALLY IN SAME ORDER ALWAYS
  const { colors } = useTheme();
  const { unit, convertWeight, displayWeight: formatDisplayWeight } = useMeasurement();
  const repsRef = useRef<TextInput>(null);
  const [editingReps, setEditingReps] = useState<string | null>(null);
  const [editingWeight, setEditingWeight] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<string | null>(null);
  const [editingDistance, setEditingDistance] = useState<string | null>(null);

  // DERIVED VALUES FROM PROPS (NO HOOKS)
  const isCompleted = Boolean(setData?.completed);

  const derivedReps = (() => {
    if (!setData?.reps) return '';
    const repsValue = String(setData.reps);
    if (repsValue.indexOf('-') !== -1) {
      const parts = repsValue.split('-');
      return parts[0] || '';
    }
    return repsValue;
  })();

  const derivedWeightDisplay = (() => {
    if (!setData?.weight) return '';
    const weightInKg = parseFloat(String(setData.weight)) || 0;
    return formatDisplayWeight(weightInKg).replace(` ${unit}`, '');
  })();

  const derivedTime = (() => {
    if (!setData?.time) return '';
    return String(setData.time);
  })();

  const derivedDistance = (() => {
    if (!setData?.distance) return '';
    return String(setData.distance);
  })();

  // COMPUTED VALUES FOR INPUTS
  const displayReps = editingReps ?? derivedReps;
  const displayWeight = editingWeight ?? derivedWeightDisplay;
  const displayTime = editingTime ?? derivedTime;
  const displayDistance = editingDistance ?? derivedDistance;

  // SIMPLE EVENT HANDLERS (NO HOOKS)
  const updateReps = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setEditingReps(numericValue);
    onUpdateSetData(exerciseIndex, setIndex, 'reps', numericValue);
  };

  const updateWeight = (value: string) => {
    // Replace comma with dot for locales that use comma as decimal separator
    const normalizedValue = value.replace(',', '.');
    // Allow only numbers and a single decimal point
    const numericValue = normalizedValue.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const finalValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;

    setEditingWeight(finalValue);
    const weightInUserUnit = parseFloat(finalValue) || 0;
    const weightInKg = convertWeight(weightInUserUnit, unit, 'kg');
    onUpdateSetData(exerciseIndex, setIndex, 'weight', weightInKg.toString());
  };

  const handleRepsBlur = () => {
    setEditingReps(null);
  };

  const handleWeightBlur = () => {
    setEditingWeight(null);
  };

  const updateTime = (value: string) => {
    setEditingTime(value);
    onUpdateSetData(exerciseIndex, setIndex, 'time', value);
  };

  const handleTimeBlur = () => {
    setEditingTime(null);
  };

  const updateDistance = (value: string) => {
    setEditingDistance(value);
    onUpdateSetData(exerciseIndex, setIndex, 'distance', value);
  };

  const handleDistanceBlur = () => {
    setEditingDistance(null);
  };

  const handleToggleCompletion = () => {
    if (onToggleSetCompletion) {
      if (!isCompleted) {
        if (exerciseType === 'time') {
          const actualTime = setData?.time || displayTime || '0';
          const timeValue = parseInt(String(actualTime), 10);
          const missingTime = !actualTime || String(actualTime).trim() === '' || timeValue <= 0;

          if (missingTime) {
            Alert.alert('Complete Set', 'Please add time to mark this set as done.');
            return;
          }
        } else if (exerciseType === 'distance') {
          // For distance-based exercises, check both distance and time
          const actualDistance = setData?.distance || displayDistance || '0';
          const distanceValue = parseInt(String(actualDistance), 10);
          const missingDistance =
            !actualDistance || String(actualDistance).trim() === '' || distanceValue <= 0;

          if (missingDistance) {
            Alert.alert('Complete Set', 'Please add distance to mark this set as done.');
            return;
          }

          const actualTime = setData?.time || displayTime || '0';
          const timeValue = parseInt(String(actualTime), 10);
          const missingTime = !actualTime || String(actualTime).trim() === '' || timeValue <= 0;

          if (missingTime) {
            Alert.alert('Complete Set', 'Please add time to mark this set as done.');
            return;
          }
        } else {
          const actualReps = setData?.reps || displayReps || '0';
          const repsValue = parseInt(String(actualReps), 10);
          const missingReps = !actualReps || String(actualReps).trim() === '' || repsValue <= 0;

          if (missingReps) {
            Alert.alert('Complete Set', 'Please add reps to mark this set as done.');
            return;
          }
        }
      }
      onToggleSetCompletion(exerciseIndex, setIndex);
    }
  };

  const getBackgroundClass = () => {
    if (isCompleted) {
      return SET_ROW_BACKGROUND.completed;
    }
    return isOddIndex ? SET_ROW_BACKGROUND.odd : SET_ROW_BACKGROUND.even;
  };

  // SINGLE RETURN - NO CONDITIONAL RENDERING
  return (
    <View
      className={`mb-2 flex-row items-center py-3 ${getBackgroundClass()}`}
      testID={`set-row-${exerciseIndex}-${setIndex}`}>
      {/* Remove Button - Always reserve space */}
      {showRemoveButton ? (
        <Pressable
          onPress={() => onRemoveSet(exerciseIndex, setIndex)}
          className="items-center justify-center"
          style={{ width: 22 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID={`remove-set-button-${exerciseIndex}-${setIndex}`}>
          <MinusCircle size={20} color={colors.text + '60'} />
        </Pressable>
      ) : (
        <View style={{ width: 22 }} />
      )}

      {/* Set Number */}
      <View
        className="w-12 items-center justify-center"
        testID={`set-number-${exerciseIndex}-${setIndex}`}>
        <Text className="text-sm font-medium text-foreground">{setIndex + 1}</Text>
      </View>

      {/* Reps/Time/Distance Input */}
      {exerciseType === 'distance' ? (
        // Distance-based exercises show both distance and time
        <>
          <View className="flex-1 items-center justify-center px-1.5">
            <DistanceInput
              value={displayDistance}
              onChange={updateDistance}
              onBlur={handleDistanceBlur}
              editable={!isCompleted}
              isCompleted={isCompleted}
              testID={`distance-input-${exerciseIndex}-${setIndex}`}
            />
          </View>
          <View className="flex-1 items-center justify-center px-1.5">
            <TimeInput
              value={displayTime}
              onChange={updateTime}
              onBlur={handleTimeBlur}
              editable={!isCompleted}
              isCompleted={isCompleted}
              testID={`time-input-${exerciseIndex}-${setIndex}`}
            />
          </View>
        </>
      ) : exerciseType === 'time' ? (
        // Time-based exercises show only time
        <View className="flex-1 items-center justify-center px-2">
          <TimeInput
            value={displayTime}
            onChange={updateTime}
            onBlur={handleTimeBlur}
            editable={!isCompleted}
            isCompleted={isCompleted}
            testID={`time-input-${exerciseIndex}-${setIndex}`}
          />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-2">
          <Pressable
            onPress={() => repsRef.current?.focus()}
            disabled={isCompleted}
            testID={`reps-pressable-${exerciseIndex}-${setIndex}`}>
            <View
              className={`${isCompleted ? INPUT_STYLE.backgroundColor.completed : INPUT_STYLE.backgroundColor.active} ${INPUT_STYLE.container}`}
              style={{ minWidth: 65, height: 38 }}>
              <TextInput
                ref={repsRef}
                className={`text-center font-medium text-foreground ${isCompleted ? 'opacity-60' : ''}`}
                style={{
                  color: colors.text,
                  flex: 1,
                  fontSize: 16,
                  lineHeight: 18,
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingHorizontal: 8,
                  includeFontPadding: false,
                  textAlignVertical: 'center',
                }}
                keyboardType="number-pad"
                value={displayReps}
                onChangeText={updateReps}
                onBlur={handleRepsBlur}
                placeholder="-"
                placeholderTextColor={colors.text + '40'}
                selectTextOnFocus={true}
                editable={!isCompleted}
                testID={`reps-input-${exerciseIndex}-${setIndex}`}
                id={`reps-input-${exerciseIndex}-${setIndex}`}
              />
            </View>
          </Pressable>
        </View>
      )}

      {/* Weight Input - Hide for time-based and distance-based exercises */}
      {exerciseType === 'reps' && (
        <View className="flex-1 items-center justify-center px-2">
          <WeightInput
            value={displayWeight}
            onChange={updateWeight}
            onBlur={handleWeightBlur}
            editable={!isCompleted}
            isCompleted={isCompleted}
            testID={`weight-input-${exerciseIndex}-${setIndex}`}
          />
        </View>
      )}

      {/* Completion Checkbox */}
      {onToggleSetCompletion && (
        <Pressable
          onPress={handleToggleCompletion}
          className={`${CHECKBOX_STYLE.base} ${
            isCompleted ? CHECKBOX_STYLE.completed : CHECKBOX_STYLE.uncompleted
          }`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID={`set-checkbox-${exerciseIndex}-${setIndex}`}
          accessible
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          accessibilityLabel={`Mark set ${setIndex + 1} as ${isCompleted ? 'incomplete' : 'complete'}`}>
          {isCompleted && <Check size={16} color="white" />}
        </Pressable>
      )}
    </View>
  );
}
