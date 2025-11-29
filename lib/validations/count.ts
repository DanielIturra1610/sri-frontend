import type { CountStatus } from '@/types';
import type { BadgeProps } from '@/components/ui/Badge';

/**
 * Count status labels for display
 */
export const countStatusLabels: Record<CountStatus, string> = {
  DRAFT: 'Borrador',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

/**
 * Count status colors for badges
 */
export const countStatusColors: Record<CountStatus, BadgeProps['variant']> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
};

/**
 * Get count status display info
 */
export function getCountStatusInfo(status: CountStatus) {
  return {
    label: countStatusLabels[status] || status,
    color: countStatusColors[status] || 'default',
  };
}

/**
 * Format progress percentage
 */
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

/**
 * Format discrepancy with sign
 */
export function formatDiscrepancy(discrepancy: number): string {
  if (discrepancy === 0) return '0';
  return discrepancy > 0 ? `+${discrepancy}` : `${discrepancy}`;
}

/**
 * Get discrepancy type
 */
export function getDiscrepancyType(discrepancy: number): 'surplus' | 'shortage' | 'match' {
  if (discrepancy > 0) return 'surplus';
  if (discrepancy < 0) return 'shortage';
  return 'match';
}

/**
 * Get discrepancy color
 */
export function getDiscrepancyColor(discrepancy: number): string {
  if (discrepancy > 0) return 'text-blue-600 dark:text-blue-400';
  if (discrepancy < 0) return 'text-red-600 dark:text-red-400';
  return 'text-green-600 dark:text-green-400';
}
