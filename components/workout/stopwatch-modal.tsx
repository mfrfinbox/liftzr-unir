import { useMemo, useState, useEffect, useRef } from 'react';

import { View, Pressable, StyleSheet } from 'react-native';

import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Play, Pause, RefreshCw } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '~/components/sheets/bottom-sheet';
import { Text } from '~/components/ui/text';
import { APP_PADDING } from '~/lib/constants';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

interface StopwatchModalProps {
  visible: boolean;
  onClose: () => void;
  isRestTimer?: boolean;
  restSeconds?: number;
  restTotalSeconds?: number;
  exerciseName?: string;
  nextExerciseName?: string;
}

export function StopwatchModal({
  visible,
  onClose,
  isRestTimer = false,
  restSeconds = 0,
  restTotalSeconds: _restTotalSeconds = 0,
  exerciseName = '',
  nextExerciseName = '',
}: StopwatchModalProps) {
  const { theme } = useAppTheme();
  const { t } = useTranslation();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time to HH:MM:SS or MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start/stop the stopwatch
  const toggleStopwatch = () => {
    setIsRunning(!isRunning);
  };

  // Reset the stopwatch
  const resetStopwatch = () => {
    setElapsedTime(0);
    setIsRunning(false);
  };

  // Handle the timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      setElapsedTime(0);
      setIsRunning(false);
    }
  }, [visible]);

  // Create memoized styles that depend on the theme
  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerBorder: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border + '35',
        },
        titleText: {
          color: theme.colors.text,
          fontSize: 17,
          fontWeight: '500',
        },
        actionText: {
          color: theme.colors.primary + (theme.dark ? 'EE' : 'DD'),
          fontWeight: '500',
        },
        modalContent: {
          flex: 1,
          paddingHorizontal: APP_PADDING.horizontal,
          paddingVertical: 32,
          justifyContent: 'center',
        },
        contentWrapper: {
          gap: 40,
        },
        timerContainer: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        timerDisplay: {
          fontSize: 72,
          fontWeight: '300',
          fontVariant: ['tabular-nums'],
          color: theme.colors.text,
          letterSpacing: -2,
          lineHeight: 80,
        },
        buttonContainer: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          paddingTop: 20,
        },
        circleButton: {
          width: 72,
          height: 72,
          borderRadius: 36,
          alignItems: 'center',
          justifyContent: 'center',
        },
        playPauseButton: {
          backgroundColor: theme.colors.primary,
        },
        resetButton: {
          backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
          borderWidth: 1,
          borderColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      }),
    [theme]
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={['45%']}
      initialIndex={0}
      backdropDismissible
      enablePanDownToClose
      showIndicator>
      <BottomSheetView style={{ flex: 1 }}>
        <View style={styles.headerBorder}>
          <View className="flex-row items-center justify-between p-4">
            <View style={{ width: 40 }} />
            <Text style={styles.titleText}>{isRestTimer ? t('stopwatch.restTimer') : t('stopwatch.title')}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              className="px-2"
              testID="button-close-stopwatch"
              accessible
              accessibilityLabel={isRestTimer ? t('stopwatch.restTimer') : t('stopwatch.title')}
              accessibilityRole="button">
              <Text style={styles.actionText}>{t('common.done')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.contentWrapper}>
            {/* Exercise Name */}
            {isRestTimer && exerciseName && (
              <View className="items-center">
                <Text className="text-base text-muted-foreground">{t('stopwatch.restFor', { exerciseName })}</Text>
              </View>
            )}

            {/* Timer Display */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerDisplay}>
                {isRestTimer ? formatTime(restSeconds) : formatTime(elapsedTime)}
              </Text>
            </View>

            {/* Next Exercise */}
            {isRestTimer && nextExerciseName && (
              <View className="items-center">
                <Text className="text-sm text-muted-foreground">{t('stopwatch.next', { exerciseName: nextExerciseName })}</Text>
              </View>
            )}
          </View>

          {/* Control Buttons - Only show for regular stopwatch */}
          {!isRestTimer && (
            <View style={styles.buttonContainer}>
              {/* Play/Pause Button */}
              <Pressable
                style={[styles.circleButton, styles.playPauseButton]}
                onPress={toggleStopwatch}
                testID="button-toggle-stopwatch">
                {isRunning ? (
                  <Pause size={28} color="white" />
                ) : (
                  <Play size={28} color="white" style={{ marginLeft: 4 }} />
                )}
              </Pressable>

              {/* Reset Button */}
              <Pressable
                style={[styles.circleButton, styles.resetButton]}
                onPress={resetStopwatch}
                testID="button-reset-stopwatch">
                <RefreshCw size={28} color={theme.colors.text + '80'} />
              </Pressable>
            </View>
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
