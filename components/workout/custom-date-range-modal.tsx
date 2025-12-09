import React, { useState } from 'react';

import { View, Pressable, Platform, Modal } from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

import { Text } from '~/components/ui/text';
import { useAppTheme } from '~/lib/contexts/ThemeContext';

interface CustomDateRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onDateRangeSelect: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export function CustomDateRangeModal({
  visible,
  onClose,
  onDateRangeSelect,
  initialStartDate,
  initialEndDate,
}: CustomDateRangeModalProps) {
  const { theme } = useAppTheme();
  const { t } = useTranslation();

  const [startDate, setStartDate] = useState(
    initialStartDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(initialEndDate || new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleApply = () => {
    const validEndDate = endDate < startDate ? startDate : endDate;
    onDateRangeSelect(startDate, validEndDate);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
      // If end date is before new start date, adjust it
      if (endDate < selectedDate) {
        setEndDate(selectedDate);
      }
    }
    // Don't auto-close on iOS - let user tap Done
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
    // Don't auto-close on iOS - let user tap Done
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="flex-1" onPress={onClose} />
          <View className="rounded-t-3xl bg-background px-6 pb-6 pt-6">
            {/* Header */}
            <View className="pb-4">
              <Text className="text-center text-base font-medium text-muted-foreground">
                {t('dateRange.chooseRange')}
              </Text>
            </View>

            {/* Date Selection Fields */}
            <View className="gap-3">
              {/* Start Date */}
              <Pressable
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    setShowStartPicker(true);
                    setShowEndPicker(false);
                  } else {
                    setShowStartPicker(true);
                  }
                }}
                className="rounded-md border border-border bg-muted px-4 py-3.5">
                <Text className="mb-1 text-xs font-medium text-muted-foreground">{t('dateRange.from')}</Text>
                <Text className="text-base text-foreground">{formatDate(startDate)}</Text>
              </Pressable>

              {/* End Date */}
              <Pressable
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    setShowEndPicker(true);
                    setShowStartPicker(false);
                  } else {
                    setShowEndPicker(true);
                  }
                }}
                className="rounded-md border border-border bg-muted px-4 py-3.5">
                <Text className="mb-1 text-xs font-medium text-muted-foreground">{t('dateRange.to')}</Text>
                <Text className="text-base text-foreground">{formatDate(endDate)}</Text>
              </Pressable>
            </View>

            {/* Quick Presets */}
            <View className="mt-3">
              <Text className="mb-2 text-xs font-medium text-muted-foreground">{t('dateRange.quickPresets')}</Text>
              <View className="flex-row flex-wrap gap-2">
                <Pressable
                  onPress={() => {
                    const today = new Date();
                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setStartDate(lastWeek);
                    setEndDate(today);
                  }}
                  className="rounded-md border border-border bg-muted px-3.5 py-2">
                  <Text className="text-sm text-foreground">{t('dateRange.last7Days')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    setStartDate(lastMonth);
                    setEndDate(today);
                  }}
                  className="rounded-md border border-border bg-muted px-3.5 py-2">
                  <Text className="text-sm text-foreground">{t('dateRange.last30Days')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const today = new Date();
                    const lastQuarter = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                    setStartDate(lastQuarter);
                    setEndDate(today);
                  }}
                  className="rounded-md border border-border bg-muted px-3.5 py-2">
                  <Text className="text-sm text-foreground">{t('dateRange.last90Days')}</Text>
                </Pressable>
              </View>
            </View>

            {/* iOS Date Picker - Embedded in main modal */}
            {Platform.OS === 'ios' && (showStartPicker || showEndPicker) && (
              <View className="mt-3">
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-sm font-medium text-muted-foreground">
                    {showStartPicker ? t('dateRange.selectStartDate') : t('dateRange.selectEndDate')}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setShowStartPicker(false);
                      setShowEndPicker(false);
                    }}>
                    <Text className="text-sm font-medium text-primary">{t('common.done')}</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={showStartPicker ? startDate : endDate}
                  mode="date"
                  display="spinner"
                  onChange={showStartPicker ? handleStartDateChange : handleEndDateChange}
                  maximumDate={new Date()}
                  minimumDate={showEndPicker ? startDate : undefined}
                  themeVariant={theme.dark ? 'dark' : 'light'}
                  style={{
                    backgroundColor: theme.colors.background,
                    height: 200,
                    marginHorizontal: -20,
                  }}
                />
              </View>
            )}

            {/* Action Buttons */}
            <View className="mt-5 flex-row gap-3">
              <Pressable onPress={onClose} className="flex-1 rounded-md bg-muted py-3">
                <Text className="text-center font-medium text-foreground">{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleApply}
                disabled={endDate < startDate}
                className={`flex-1 rounded-md py-3 ${
                  endDate < startDate ? 'bg-muted opacity-50' : 'bg-primary'
                }`}>
                <Text
                  className={`text-center font-medium ${
                    endDate < startDate ? 'text-muted-foreground' : 'text-primary-foreground'
                  }`}>
                  {t('dateRange.applyFilter')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Android Date Picker */}
      {Platform.OS === 'android' && showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          maximumDate={new Date()}
        />
      )}

      {Platform.OS === 'android' && showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate}
          maximumDate={new Date()}
        />
      )}
    </>
  );
}
