"use client";

import { STATUS_COLORS, getStatusLabel } from '../../utils/statusMessages';

export default function StatusIndicator({ status, size = 'sm', showLabel = false }) {
  const color = STATUS_COLORS[status?.toLowerCase()] || STATUS_COLORS.offline;
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3 border-2 border-white dark:border-slate-900',
    lg: 'w-4 h-4 border-2 border-white dark:border-slate-900',
  };

  const bgClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-slate-400 dark:bg-slate-500'
  };

  return (
    <div className="flex items-center gap-2" title={getStatusLabel(status)}>
      <div className={`rounded-full ${sizeClasses[size] || sizeClasses.sm} ${bgClasses[color]}`} />
      {showLabel && <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">{getStatusLabel(status)}</span>}
    </div>
  );
}
