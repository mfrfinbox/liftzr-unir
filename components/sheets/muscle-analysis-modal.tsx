import React, { useMemo, useState } from 'react';

import { View, Modal, ScrollView, FlatList, Pressable } from 'react-native';

import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import type { MuscleGroup } from '~/types';

type TimePeriod = 'week' | 'month' | 'year';

interface MuscleData {
  muscleGroup: MuscleGroup;
  setCount: number;
  exerciseCount: number;
  exercises: {
    id: string;
    name: string;
    setCount: number;
  }[];
  type: 'primary' | 'secondary';
}

interface MuscleAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  primaryMuscleGroups: Record<string, number>;
  secondaryMuscleGroups: Record<string, number>;
  exercisesByMuscle: Record<string, { id: string; name: string; setCount: number }[]>;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  showSecondary: boolean;
  onShowSecondaryChange: (show: boolean) => void;
  muscleGroups: MuscleGroup[];
}

const BUTTON_HIT_SLOP = 10;

export function MuscleAnalysisModal({
  visible,
  onClose,
  primaryMuscleGroups,
  secondaryMuscleGroups,
  exercisesByMuscle,
  timePeriod,
  onTimePeriodChange,
  showSecondary,
  onShowSecondaryChange,
  muscleGroups,
}: MuscleAnalysisModalProps) {
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Prepare muscle data for display
  const muscleData = useMemo(() => {
    const data: MuscleData[] = [];

    // Process primary muscles
    Object.entries(primaryMuscleGroups).forEach(([muscleName, setCount]) => {
      const muscleGroup = muscleGroups.find((mg) => mg.name === muscleName);
      if (muscleGroup) {
        data.push({
          muscleGroup,
          setCount,
          exerciseCount: exercisesByMuscle[muscleName]?.length || 0,
          exercises: exercisesByMuscle[muscleName] || [],
          type: 'primary',
        });
      }
    });

    // Process secondary muscles
    Object.entries(secondaryMuscleGroups).forEach(([muscleName, setCount]) => {
      const muscleGroup = muscleGroups.find((mg) => mg.name === muscleName);
      if (muscleGroup) {
        data.push({
          muscleGroup,
          setCount,
          exerciseCount: exercisesByMuscle[muscleName]?.length || 0,
          exercises: exercisesByMuscle[muscleName] || [],
          type: 'secondary',
        });
      }
    });

    // Sort by set count (most worked first)
    return data.sort((a, b) => b.setCount - a.setCount);
  }, [primaryMuscleGroups, secondaryMuscleGroups, exercisesByMuscle, muscleGroups]);

  const primaryMuscles = muscleData.filter((m) => m.type === 'primary');
  const secondaryMuscles = showSecondary ? muscleData.filter((m) => m.type === 'secondary') : [];

  const toggleExpanded = (muscleId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(muscleId)) {
        newSet.delete(muscleId);
      } else {
        newSet.add(muscleId);
      }
      return newSet;
    });
  };

  const renderMuscleItem = ({ item }: { item: MuscleData }) => {
    const isExpanded = expandedItems.has(item.muscleGroup.id);

    return (
      <Pressable onPress={() => toggleExpanded(item.muscleGroup.id)}>
        <View className="border-border bg-card mb-3 rounded-md border p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <View className="mr-2">
                {item.exercises.length > 0 ? (
                  isExpanded ? (
                    <ChevronDown size={16} color="#666" />
                  ) : (
                    <ChevronRight size={16} color="#666" />
                  )
                ) : (
                  <View style={{ width: 16 }} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-foreground text-base font-semibold">
                  {item.muscleGroup.displayName}
                </Text>
                <Text className="text-muted-foreground mt-1 text-sm">
                  {item.setCount} {item.setCount === 1 ? t('common.set') : t('common.sets')} •{' '}
                  {item.exerciseCount}{' '}
                  {item.exerciseCount === 1 ? t('common.exercise') : t('common.exercises')}
                </Text>
              </View>
            </View>
          </View>

          {/* Exercise List - Only show when expanded */}
          {isExpanded && item.exercises.length > 0 && (
            <View className="border-border mt-3 border-t pt-3">
              {item.exercises.map((exercise, index) => (
                <View
                  key={exercise.id}
                  className={`flex-row items-center justify-between ${index > 0 ? 'mt-2' : ''}`}>
                  <Text className="text-muted-foreground flex-1 text-sm">• {exercise.name}</Text>
                  <Text className="text-muted-foreground text-sm font-medium">
                    {exercise.setCount}{' '}
                    {exercise.setCount === 1 ? t('common.set') : t('common.sets')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View className="bg-background flex-1">
        {/* Header */}
        <View className="border-border bg-card border-b">
          <View className="flex-row items-center justify-between px-6 py-4">
            <Pressable
              onPress={onClose}
              hitSlop={BUTTON_HIT_SLOP}
              testID="modal-close-button"
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}>
              <Text className="text-primary text-base font-medium">{t('common.close')}</Text>
            </Pressable>
            <Text className="text-foreground text-xl font-bold">{t('muscleAnalysis.title')}</Text>
            <View style={{ width: 50 }} />
          </View>
        </View>

        {/* Filters */}
        <View className="border-border bg-card border-b px-6 py-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {/* Secondary Toggle */}
              <Pressable
                onPress={() => onShowSecondaryChange(!showSecondary)}
                className={`flex-row items-center rounded-md px-4 py-2 ${
                  showSecondary ? 'bg-primary/10' : 'bg-muted/30'
                }`}>
                {showSecondary ? <Eye size={16} color="#666" /> : <EyeOff size={16} color="#666" />}
                <Text className="text-foreground ml-1.5 text-sm font-medium">
                  {t('statistics.secondary')}
                </Text>
              </Pressable>

              <View className="bg-border mx-2 w-px" />

              {/* Time Period Filter */}
              <Pressable
                onPress={() => onTimePeriodChange('week')}
                className={`rounded-md px-4 py-2 ${
                  timePeriod === 'week' ? 'bg-primary' : 'bg-muted/30'
                }`}>
                <Text
                  className={`text-sm font-medium ${
                    timePeriod === 'week' ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                  {t('statistics.thisWeek')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onTimePeriodChange('month')}
                className={`rounded-md px-4 py-2 ${
                  timePeriod === 'month' ? 'bg-primary' : 'bg-muted/30'
                }`}>
                <Text
                  className={`text-sm font-medium ${
                    timePeriod === 'month' ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                  {t('statistics.thisMonth')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onTimePeriodChange('year')}
                className={`rounded-md px-4 py-2 ${
                  timePeriod === 'year' ? 'bg-primary' : 'bg-muted/30'
                }`}>
                <Text
                  className={`text-sm font-medium ${
                    timePeriod === 'year' ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                  {t('statistics.thisYear')}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-4">
            {/* Summary Stats */}
            <View className="bg-muted/30 mb-6 flex-row justify-around rounded-md p-4">
              <View className="items-center">
                <Text className="text-foreground text-2xl font-bold">{muscleData.length}</Text>
                <Text className="text-muted-foreground text-xs">
                  {t('muscleAnalysis.musclesWorked')}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-foreground text-2xl font-bold">
                  {muscleData.reduce((sum, m) => sum + m.setCount, 0)}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {t('muscleAnalysis.totalSets')}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-foreground text-2xl font-bold">
                  {new Set(muscleData.flatMap((m) => m.exercises.map((e) => e.id))).size}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  {t('muscleAnalysis.uniqueExercises')}
                </Text>
              </View>
            </View>

            {/* Primary Muscles Section */}
            {primaryMuscles.length > 0 && (
              <View className="mb-6">
                <Text className="text-foreground mb-3 text-lg font-semibold">
                  {t('muscleAnalysis.primaryMuscles')} ({primaryMuscles.length})
                </Text>
                <FlatList
                  data={primaryMuscles}
                  renderItem={renderMuscleItem}
                  keyExtractor={(item) => `primary-${item.muscleGroup.id}`}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Secondary Muscles Section */}
            {secondaryMuscles.length > 0 && (
              <View className="mb-6">
                <Text className="text-foreground mb-3 text-lg font-semibold">
                  {t('muscleAnalysis.secondaryMuscles')} ({secondaryMuscles.length})
                </Text>
                <FlatList
                  data={secondaryMuscles}
                  renderItem={renderMuscleItem}
                  keyExtractor={(item) => `secondary-${item.muscleGroup.id}`}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Empty State */}
            {muscleData.length === 0 && (
              <View className="items-center py-12">
                <Text className="text-muted-foreground text-base">
                  {t('muscleAnalysis.noMusclesWorked')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
