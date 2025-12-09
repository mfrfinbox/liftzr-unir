import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';

import { View, FlatList, Pressable } from 'react-native';

import { User, Check, Plus, Search, XCircle, CheckCircle } from 'lucide-react-native';

import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { useSmartExerciseSearch } from '~/hooks/search/use-smart-exercise-search';
import { APP_PADDING } from '~/lib/constants';
import { useAppTheme } from '~/lib/contexts/ThemeContext';
import type { Exercise } from '~/types';

import { CustomExerciseCreator } from './custom-exercise-creator';

interface ExerciseSelectionListProps {
  allExercises: Exercise[];
  selectedExerciseIds: Set<string>; // Use a Set for efficient lookups
  onToggleExercise: (exercise: Exercise) => void;
  onCreateCustomExercise?: (exercise: Omit<Exercise, 'id'>) => void;
  // Optional external search control
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export function ExerciseSelectionList({
  allExercises,
  selectedExerciseIds,
  onToggleExercise,
  onCreateCustomExercise,
  searchQuery: externalSearchQuery,
  onSearchQueryChange: externalOnSearchQueryChange,
}: ExerciseSelectionListProps) {
  const { theme } = useAppTheme();
  const [pendingExerciseName, setPendingExerciseName] = useState<string | null>(null);
  const inputRef = useRef<any>(null);

  // Determine if we're controlled or uncontrolled
  const isControlled = externalSearchQuery !== undefined;

  // Only use internal state if uncontrolled
  const [internalSearchQuery, setInternalSearchQuery] = useState('');

  // Use the appropriate query and setter with stable references
  const searchQuery = isControlled ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = useCallback(
    (query: string) => {
      if (isControlled && externalOnSearchQueryChange) {
        externalOnSearchQueryChange(query);
      } else {
        setInternalSearchQuery(query);
      }
    },
    [isControlled, externalOnSearchQueryChange]
  );

  // Use smart search hook with the determined search query
  const {
    filteredExercises: smartFilteredExercises,
    hasNoResults,
    refreshSearch,
  } = useSmartExerciseSearch({
    searchQuery, // Pass the search query to the hook
    excludeIds: [], // Don't exclude any IDs, we handle selection separately
    threshold: 0.3,
    filterCustomReadOnly: true,
  });

  // Auto-focus the input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // Small delay to ensure the component is fully rendered

    return () => clearTimeout(timer);
  }, []);

  // Handle pending exercise name updates without setTimeout
  useEffect(() => {
    if (pendingExerciseName) {
      // First refresh the search to ensure new exercises are included
      refreshSearch();
      // Then set the search query to the new exercise name
      setSearchQuery(pendingExerciseName);
      setPendingExerciseName(null);
    }
  }, [pendingExerciseName, setSearchQuery, refreshSearch]); // Include setSearchQuery and refreshSearch which are now stable

  // Use smart filtered exercises or all exercises if no search
  const filteredExercises = useMemo(() => {
    // When searching, use the smart search results
    // Otherwise show all exercises passed in
    return searchQuery ? smartFilteredExercises : allExercises;
  }, [searchQuery, smartFilteredExercises, allExercises]);

  // Render function for exercise items
  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const isSelected = selectedExerciseIds.has(item.id);
    const exerciseId = item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return (
      <Pressable onPress={() => onToggleExercise(item)} testID={`exercise-${exerciseId}`}>
        <View
          className={`mb-2 rounded-md border bg-card ${isSelected ? 'border-primary' : 'border-border'}`}>
          <View className="px-4 py-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-medium text-foreground" numberOfLines={1}>
                  {item.name}
                </Text>
                {item.isCustom && (
                  <View className="mt-1 flex-row items-center">
                    <View className="flex-row items-center rounded-full bg-primary/10 px-2 py-0.5">
                      <User size={12} color={theme.colors.primary} />
                      <Text className="ml-1 text-xs font-medium text-primary">Custom</Text>
                    </View>
                  </View>
                )}
              </View>

              <View
                className={`items-center justify-center rounded-md p-2 ${
                  isSelected ? 'bg-primary' : 'bg-muted'
                }`}
                style={{ width: 28, height: 28 }}
                testID={`exercise-${exerciseId}-checkbox-${isSelected ? 'selected' : 'unselected'}`}>
                {isSelected ? (
                  <Check size={16} color="white" />
                ) : (
                  <Plus size={16} color={theme.colors.text + '80'} />
                )}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // Wrapper for FlatList item rendering
  const renderItem = ({ item }: { item: Exercise }) => {
    return renderExerciseItem({ item });
  };

  return (
    <View className="flex-1">
      {/* Search bar with improved spacing */}
      <View className="px-4 pb-3 pt-2">
        <View className="flex-row items-center rounded-md bg-secondary/30 px-3.5">
          <Search size={20} color={theme.colors.text + '60'} style={{ marginRight: 10 }} />
          <Input
            ref={inputRef}
            className="flex-1 border-0 bg-transparent px-0 py-3 text-base text-foreground"
            placeholder="Search exercises..."
            placeholderTextColor={theme.colors.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            spellCheck={false}
            testID="exercise-search-input"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              className="p-1"
              testID="exercise-search-clear-button">
              <XCircle size={20} color={theme.colors.text + '80'} />
            </Pressable>
          )}
        </View>

        {/* Selected exercises counter - Hidden in replace modal since we only select one */}
        {selectedExerciseIds.size > 0 && onCreateCustomExercise && (
          <View
            className="mt-3 flex-row items-center justify-center rounded-md bg-primary/10 px-3 py-2"
            testID="selected-exercises-counter">
            <CheckCircle size={16} color={theme.colors.primary} />
            <Text
              className="ml-2 text-sm font-medium text-primary"
              testID={`selected-exercises-count-${selectedExerciseIds.size}`}>
              {selectedExerciseIds.size} exercise{selectedExerciseIds.size !== 1 ? 's' : ''}{' '}
              selected
            </Text>
          </View>
        )}
      </View>

      {/* Exercises list */}
      <FlatList
        data={filteredExercises}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: APP_PADDING.horizontal,
          paddingTop: 8,
          paddingBottom: APP_PADDING.vertical + 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        className="flex-1"
        ListFooterComponent={
          // Show custom exercise button at bottom when we have results
          searchQuery && filteredExercises.length > 0 && onCreateCustomExercise ? (
            <View className="mt-4">
              <CustomExerciseCreator
                searchQuery={searchQuery}
                onCreateCustomExercise={onCreateCustomExercise}
                onClearSearch={(exerciseName) => {
                  setSearchQuery('');
                  setPendingExerciseName(exerciseName);
                }}
                existingExercises={allExercises}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={
          searchQuery ? (
            <View>
              {/* Smart search message when no results */}
              {hasNoResults && (
                <View className="items-center py-4">
                  <Text className="mb-2 text-center text-muted-foreground">
                    No exercises found for &ldquo;{searchQuery}&rdquo;
                  </Text>
                  {searchQuery.length < 3 && (
                    <Text className="text-center text-xs text-muted-foreground">
                      Try typing more characters or use terms like &ldquo;biceps&rdquo;,
                      &ldquo;upper body&rdquo;, &ldquo;push&rdquo;
                    </Text>
                  )}
                </View>
              )}

              {/* Custom Exercise Creation */}
              {onCreateCustomExercise && (
                <View>
                  <CustomExerciseCreator
                    searchQuery={searchQuery}
                    onCreateCustomExercise={onCreateCustomExercise}
                    onClearSearch={(exerciseName) => {
                      setSearchQuery('');
                      setPendingExerciseName(exerciseName);
                    }}
                    existingExercises={allExercises}
                  />
                </View>
              )}

              {/* Fallback message when no custom exercise creation is available */}
              {!onCreateCustomExercise && (
                <View className="items-center py-8">
                  <Text className="text-center text-muted-foreground">
                    No exercises found matching your search.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-center text-muted-foreground">No exercises available</Text>
            </View>
          )
        }
      />
    </View>
  );
}

// Type definition (assuming it exists in mockDbUtils, otherwise define here)
// interface Exercise {
//   id: string;
//   name: string;
//   type: 'reps' | 'time';
// }
