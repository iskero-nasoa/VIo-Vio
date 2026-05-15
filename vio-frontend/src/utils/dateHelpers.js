import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

export function formatTime(date) {
  if (!date) return '';
  return format(new Date(date), 'HH:mm');
}

export function getRelativeTime(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
