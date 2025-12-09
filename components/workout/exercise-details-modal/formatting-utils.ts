export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (seconds: number): string => {
  if (!seconds || seconds === 0) return '-';

  if (seconds < 60) return `${seconds}s`;

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    if (mins > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${hours}h`;
  }

  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

export const formatDistance = (meters: number): string => {
  if (!meters || meters === 0) return '-';
  const km = meters / 1000;
  // Show whole numbers without decimals
  if (km % 1 === 0) return `${km} km`;
  // Otherwise show 2 decimal places
  return `${km.toFixed(2)} km`;
};
