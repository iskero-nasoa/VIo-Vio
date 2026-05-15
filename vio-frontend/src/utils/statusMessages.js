export const STATUS_OPTIONS = ['online', 'offline', 'away'];

export const STATUS_COLORS = {
  online: 'green',
  offline: 'gray',
  away: 'yellow'
};

export function getStatusLabel(status) {
  if (!status) return 'Offline';
  
  const labels = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away'
  };
  
  return labels[status.toLowerCase()] || 'Offline';
}
