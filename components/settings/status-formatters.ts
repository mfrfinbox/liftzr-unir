/**
 * Status Formatters
 * Formatting functions for backup status display
 */

// Time formatting constants
const MS_PER_MINUTE = 60000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const TIME_LABELS = {
  NEVER: 'Never',
  JUST_NOW: 'Just now',
  MINUTES_AGO: 'm ago',
  HOURS_AGO: 'h ago',
  DAYS_AGO: 'd ago',
} as const;

export interface StatusFormatterParams {
  isBackupEnabled: boolean;
  isOnline: boolean;
  syncStatus: string;
  isSyncing: boolean;
  lastError: string | null;
  lastSyncedAt: string | null;
}

export function formatLastSync(timestamp: string | null): string {
  if (!timestamp) return TIME_LABELS.NEVER;

  const now = new Date();
  const then = new Date(timestamp);

  // Handle invalid dates
  if (isNaN(then.getTime())) return TIME_LABELS.NEVER;

  const diffMs = now.getTime() - then.getTime();

  // Handle future timestamps (negative diffMs)
  if (diffMs < 0) {
    return then.toLocaleDateString();
  }

  const diffMins = Math.floor(diffMs / MS_PER_MINUTE);

  if (diffMins < 1) return TIME_LABELS.JUST_NOW;
  if (diffMins < MINUTES_PER_HOUR) return `${diffMins}${TIME_LABELS.MINUTES_AGO}`;

  const diffHours = Math.floor(diffMins / MINUTES_PER_HOUR);
  if (diffHours < HOURS_PER_DAY) return `${diffHours}${TIME_LABELS.HOURS_AGO}`;

  const diffDays = Math.floor(diffHours / HOURS_PER_DAY);

  // For very old timestamps (365+ days), show absolute date instead of relative
  if (diffDays >= 365) {
    return then.toLocaleDateString();
  }

  return `${diffDays}${TIME_LABELS.DAYS_AGO}`;
}

export function getStatusText({
  isBackupEnabled,
  isOnline,
  syncStatus,
  isSyncing,
}: Pick<
  StatusFormatterParams,
  'isBackupEnabled' | 'isOnline' | 'syncStatus' | 'isSyncing'
>): string {
  if (!isBackupEnabled) return 'Liftzr Cloud';
  if (!isOnline) return 'Offline';
  if (syncStatus === 'syncing' || isSyncing) return 'Syncing...';
  if (syncStatus === 'error') return 'Sync Error';
  return 'Liftzr Cloud';
}

export function getSecondaryText({
  isBackupEnabled,
  isOnline,
  lastError,
  lastSyncedAt,
}: Pick<
  StatusFormatterParams,
  'isBackupEnabled' | 'isOnline' | 'lastError' | 'lastSyncedAt'
>): string {
  if (!isBackupEnabled) return 'Secure cloud backup for your workouts';
  if (!isOnline) return 'No internet connection';
  if (lastError) return lastError;
  return `Last synced: ${formatLastSync(lastSyncedAt)}`;
}
