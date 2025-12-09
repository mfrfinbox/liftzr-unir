import React, { useState } from 'react';

import { View, TextInput, Pressable } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { NotebookPen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';

interface ExerciseNotesSectionProps {
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

// Placeholder color for dark theme
const PLACEHOLDER_COLOR = 'rgba(140, 150, 160, 1)';

export function ExerciseNotesSection({ notes, onUpdateNotes }: ExerciseNotesSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(notes || '');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const handleSaveNote = () => {
    if (isSavingNote) return;

    setIsSavingNote(true);
    onUpdateNotes(noteText);

    setTimeout(() => {
      setIsEditingNote(false);
      setIsSavingNote(false);
    }, 300);
  };

  const handleStartEditing = () => {
    setNoteText(notes || '');
    setIsEditingNote(true);
  };

  return (
    <View className="mt-3">
      {isEditingNote ? (
        <View className="flex-row items-center rounded-xl bg-muted/25">
          <TextInput
            className="flex-1 px-3"
            testID="exercise-notes-input"
            style={{
              color: colors.text,
              minHeight: 44,
              fontSize: 15,
              textAlignVertical: 'top',
              paddingTop: 12,
              paddingBottom: 12,
              lineHeight: 20,
            }}
            multiline
            value={noteText}
            onChangeText={setNoteText}
            placeholder={t('workout.exerciseNotes')}
            placeholderTextColor={PLACEHOLDER_COLOR}
            autoFocus
            selectTextOnFocus={true}
            editable={!isSavingNote}
            onBlur={() => {
              // Auto-save on blur if text has changed
              if (noteText !== notes) {
                handleSaveNote();
              }
            }}
          />
          <Pressable
            onPress={handleSaveNote}
            className="px-3 py-2"
            disabled={isSavingNote}
            testID="notes-done-button"
            hitSlop={{ top: 10, bottom: 10, left: 5, right: 10 }}>
            <Text
              className={`text-sm font-medium ${isSavingNote ? 'text-muted-foreground' : 'text-primary'}`}>
              {t('common.done')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handleStartEditing}
          className="rounded-xl bg-muted/15 p-2"
          android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
          testID="exercise-notes-section">
          <View className="flex-row items-start">
            <NotebookPen size={16} color={colors.text + '60'} style={{ marginTop: 2 }} />
            <Text className="ml-2 flex-1 text-sm text-muted-foreground">
              {notes ? notes : t('workout.tapToAddNotes')}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}
