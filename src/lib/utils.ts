import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export from formatters
export { formatCurrency, formatDate, formatDateTR, formatNumber, formatFileSize } from '@/utils/formatters';

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Status colors
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'in-progress':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30';
    case 'completed':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30';
    case 'paused':
    case 'pending':
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30';
    case 'cancelled':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30';
  }
}

// Priority colors
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
    case 'high':
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30';
    case 'medium':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30';
    case 'low':
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30';
  }
}

// Download file helper
export function downloadFile(data: Blob, filename: string): void {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
