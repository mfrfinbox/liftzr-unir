import i18n from '~/lib/config/i18n';

/**
 * Format a date to a relative time string
 * Examples: "Today", "Yesterday", "Monday", "Last Tuesday", "Dec 15"
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return i18n.t('common.today');
  }

  if (diffDays === 1) {
    return i18n.t('common.yesterday');
  }

  if (diffDays < 7) {
    // Return day name (e.g., "Monday")
    const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, { weekday: 'long' });
  }

  if (diffDays < 14) {
    // Return "Last [Day]" (e.g., "Last Monday")
    const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
    const dayName = date.toLocaleDateString(locale, { weekday: 'long' });
    return `${i18n.t('common.last')} ${dayName}`;
  }

  // Return month and day (e.g., "Dec 15")
  const locale = i18n.language === 'es' ? 'es-ES' : 'en-US';
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}
