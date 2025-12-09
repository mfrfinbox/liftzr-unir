import { useState, useRef } from 'react';

import { View, Pressable, TextInput, Keyboard } from 'react-native';

import * as Haptics from 'expo-haptics';

import { Timer, ArrowRightCircle } from 'lucide-react-native';

import { Text } from '~/components/ui/text';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

interface SimpleRestTimerProps {
  restTime: number;
  onRestTimeChange: (seconds: number) => void;
  label?: string;
  icon?: string;
  presets?: number[];
}

export function SimpleRestTimer({
  restTime,
  onRestTimeChange,
  label = 'Set Rest',
  icon = 'time-outline',
  presets = [30, 60, 90],
}: SimpleRestTimerProps) {
  const { theme } = useAppTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<TextInput>(null);
  const isEnabled = restTime > 0;

  // Format seconds to display
  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'Off';
    if (seconds < 60) return `${seconds}s`;

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      if (mins > 0 && secs > 0) return `${hours}h ${mins}m ${secs}s`;
      if (mins > 0) return `${hours}h ${mins}m`;
      if (secs > 0) return `${hours}h ${secs}s`;
      return `${hours}h`;
    }

    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  // Parse time input
  const parseTimeInput = (input: string): number => {
    const cleaned = input.trim().toLowerCase();
    if (/^\d+$/.test(cleaned)) return parseInt(cleaned);
    if (cleaned.includes('m')) {
      const parts = cleaned.split('m');
      const mins = parseInt(parts[0]) || 0;
      const secs = parts[1] ? parseInt(parts[1].replace('s', '')) || 0 : 0;
      return mins * 60 + secs;
    }
    if (cleaned.endsWith('s')) return parseInt(cleaned.replace('s', '')) || 0;
    return 0;
  };

  const handleToggle = () => {
    if (isEnabled) {
      onRestTimeChange(0);
    } else {
      onRestTimeChange(presets[0]); // Default to first preset
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartEdit = () => {
    if (!isEnabled) return;
    setIsEditing(true);
    setEditValue(restTime.toString());
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleEndEdit = () => {
    const newSeconds = parseTimeInput(editValue);
    if (newSeconds !== restTime && newSeconds >= 0) {
      onRestTimeChange(newSeconds);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditing(false);
    setEditValue('');
    Keyboard.dismiss();
  };

  if (isEditing) {
    return (
      <View className="flex-row items-center justify-between py-1.5">
        <Pressable onPress={handleEndEdit} className="flex-row items-center">
          {icon === 'arrow-forward-circle-outline' ? (
            <ArrowRightCircle size={20} color={theme.colors.primary} style={{ marginRight: 6 }} />
          ) : (
            <Timer size={20} color={theme.colors.primary} style={{ marginRight: 6 }} />
          )}
          <Text className="text-sm font-medium text-foreground">{label}:</Text>
        </Pressable>

        <View className="flex-row items-center">
          <TextInput
            ref={inputRef}
            value={editValue}
            onChangeText={setEditValue}
            onBlur={handleEndEdit}
            onSubmitEditing={handleEndEdit}
            keyboardType="numeric"
            placeholder="30, 60, 90"
            placeholderTextColor={theme.colors.text + '40'}
            style={{
              color: theme.colors.primary,
              fontSize: 16,
              fontWeight: '600',
              minWidth: 60,
              textAlign: 'right',
              paddingVertical: 4,
              paddingHorizontal: 8,
            }}
            selectTextOnFocus
            autoCapitalize="none"
          />
          <Text className="ml-1 text-sm text-muted-foreground">sec</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Pressable
        onPress={handleToggle}
        className="flex-row items-center"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        {icon === 'arrow-forward-circle-outline' ? (
          <ArrowRightCircle
            size={20}
            color={isEnabled ? theme.colors.primary : theme.colors.text + '60'}
            style={{ marginRight: 6 }}
          />
        ) : (
          <Timer
            size={20}
            color={isEnabled ? theme.colors.primary : theme.colors.text + '60'}
            style={{ marginRight: 6 }}
          />
        )}
        <Text
          className={`text-sm font-medium ${isEnabled ? 'text-foreground' : 'text-muted-foreground'}`}>
          {label}:
        </Text>
      </Pressable>

      {isEnabled ? (
        <Pressable
          onPress={handleStartEdit}
          className="px-2 py-0.5"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text className="text-base font-semibold" style={{ color: theme.colors.primary }}>
            {formatTime(restTime)}
          </Text>
        </Pressable>
      ) : (
        <View className="flex-row items-center gap-1">
          {presets.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => {
                onRestTimeChange(preset);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="px-2.5 py-0.5"
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}>
              <Text className="text-sm font-medium" style={{ color: theme.colors.primary }}>
                {preset < 60 ? `${preset}s` : `${preset / 60}m`}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
