import { useState, useEffect, useRef } from 'react';

import { View, TouchableOpacity } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Save, ArrowDownAZ, Pencil, Target } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { useToastMessage } from '~/components/ui/toast-message';
import { TOAST_DURATION } from '~/lib/constants';
import type { ExerciseWithDetails } from '~/types';

import { ExerciseSortMethod } from './exercise-sort-menu';

interface WorkoutHeaderProps {
  workoutId?: string;
  workoutName: string;
  onClose: () => void;
  onSave?: () => void;
  hasChanges?: boolean;
  isEditingName?: boolean;
  onEditName?: () => void;
  onChangeName?: (name: string) => void;
  handleEndEditingName?: () => void;
  onCancelEditName?: () => void;
  showCreatedToast?: boolean;
  exercises?: ExerciseWithDetails[];
  onExercisesReordered?: (exercises: ExerciseWithDetails[]) => void;
  onSortMethodChange?: (method: ExerciseSortMethod) => void;
  onShowReorderModal?: () => void;
  onOpenMuscleHeatmap?: () => void;
}

export function WorkoutHeader({
  workoutId,
  workoutName,
  onClose,
  onSave,
  hasChanges = false,
  isEditingName = false,
  onEditName,
  onChangeName,
  handleEndEditingName,
  onCancelEditName,
  onShowReorderModal,
  onOpenMuscleHeatmap,
  showCreatedToast = false,
}: WorkoutHeaderProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastMessage();
  const toastShownRef = useRef(false);
  const originalNameRef = useRef(workoutName);

  // Store original name when editing starts
  useEffect(() => {
    if (isEditingName) {
      originalNameRef.current = workoutName;
    }
  }, [isEditingName]);

  // Show toast when workout is first created - only once
  useEffect(() => {
    if (showCreatedToast && !toastShownRef.current) {
      showSuccessToast(t('workout.workoutCreated'), undefined, TOAST_DURATION.shorter);
      toastShownRef.current = true;
    }
  }, [showCreatedToast, showSuccessToast, workoutName, t]);

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple clicks

    try {
      setIsSaving(true);
      if (onSave) await onSave();
      // Don't show saved checkmark anymore
    } catch (_error) {
      // Show error toast if save fails
      showErrorToast(t('workout.failedToSaveChanges'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="border-b border-border">
      <View className="px-4 py-3">
        {/* Header with Close and Save/Saved */}
        <View className="flex-row items-center justify-between">
          {!isEditingName ? (
            <TouchableOpacity
              onPress={onClose}
              className="z-10"
              testID="close-button"
              style={{ width: 60 }}>
              <Text className="font-semibold text-primary">{t('common.close')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}

          {/* Center: Workout name (editable) */}
          {!isEditingName && (
            <TouchableOpacity
              onPress={onEditName}
              className="absolute flex-row items-center justify-center"
              style={{ left: '20%', right: '20%' }}
              disabled={!onEditName}
              testID="workout-name-button">
              <Text className="text-center text-lg font-semibold text-foreground" numberOfLines={1}>
                {workoutName}
              </Text>
              {onEditName && (
                <View className="ml-2">
                  <Pencil size={14} color={colors.text + '40'} />
                </View>
              )}
            </TouchableOpacity>
          )}

          {isEditingName ? (
            // When editing name, just show empty space (Done button is below)
            <View style={{ width: 60 }} />
          ) : !isEditingName && workoutId ? (
            <View className="flex-row items-center">
              {hasChanges && (
                // Show Save icon when there are changes
                <TouchableOpacity
                  onPress={handleSave}
                  className="z-10 p-2"
                  disabled={isSaving}
                  testID="save-button">
                  <Save size={20} color={colors.primary} style={{ opacity: isSaving ? 0.5 : 1 }} />
                </TouchableOpacity>
              )}
              {/* Show muscle heatmap icon if handler is available */}
              {onOpenMuscleHeatmap && (
                <TouchableOpacity
                  onPress={onOpenMuscleHeatmap}
                  className="z-10 p-2"
                  testID="muscle-heatmap-icon-button">
                  <Target size={20} color={colors.text + '80'} />
                </TouchableOpacity>
              )}
              {/* Show sort icon if reorder modal is available */}
              {onShowReorderModal && (
                <TouchableOpacity
                  onPress={onShowReorderModal}
                  className="z-10 p-2"
                  testID="sort-exercises-button">
                  <ArrowDownAZ size={20} color={colors.text + '80'} />
                </TouchableOpacity>
              )}
            </View>
          ) : hasChanges ? (
            <TouchableOpacity
              onPress={handleSave}
              className="z-10 p-2"
              disabled={isSaving}
              testID="save-button">
              <Save size={20} color={colors.primary} style={{ opacity: isSaving ? 0.5 : 1 }} />
            </TouchableOpacity>
          ) : onOpenMuscleHeatmap ? (
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={onOpenMuscleHeatmap}
                className="z-10 p-2"
                testID="muscle-heatmap-icon-button">
                <Target size={20} color={colors.text + '80'} />
              </TouchableOpacity>
              {onShowReorderModal && (
                <TouchableOpacity
                  onPress={onShowReorderModal}
                  className="z-10 p-2"
                  testID="sort-exercises-button">
                  <ArrowDownAZ size={20} color={colors.text + '80'} />
                </TouchableOpacity>
              )}
            </View>
          ) : onShowReorderModal ? (
            <TouchableOpacity
              onPress={onShowReorderModal}
              className="z-10 p-2"
              testID="sort-exercises-button">
              <ArrowDownAZ size={20} color={colors.text + '80'} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* Edit Name Input - Only shown when editing */}
        {isEditingName && (
          <View className="mt-2 flex-row items-center gap-2">
            <View className="flex-1">
              <Input
                value={workoutName}
                onChangeText={onChangeName}
                onSubmitEditing={() => {
                  handleEndEditingName?.();
                }}
                returnKeyType="done"
                autoFocus
                selectTextOnFocus
                testID="workout-name-input"
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                // Cancel editing - revert to original name and exit edit mode without saving
                onChangeName?.(originalNameRef.current);
                onCancelEditName?.();
              }}
              className="px-3 py-2"
              testID="workout-name-cancel-button">
              <Text className="font-medium text-muted-foreground">{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleEndEditingName?.();
              }}
              className="px-3 py-2"
              testID="workout-name-done-button">
              <Text className="font-semibold text-primary">{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
