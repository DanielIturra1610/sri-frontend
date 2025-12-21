'use client';

import React from 'react';
import { Badge } from '@/components/ui';
import type { LotStatus } from '@/types';

interface LotStatusBadgeProps {
  status: LotStatus;
  size?: 'default' | 'sm' | 'lg';
}

const statusConfig: Record<LotStatus, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'info' }> = {
  available: {
    label: 'Disponible',
    variant: 'success',
  },
  expired: {
    label: 'Vencido',
    variant: 'destructive',
  },
  quarantine: {
    label: 'Cuarentena',
    variant: 'warning',
  },
  consumed: {
    label: 'Consumido',
    variant: 'secondary',
  },
  recalled: {
    label: 'Retirado',
    variant: 'info',
  },
};

export function LotStatusBadge({ status, size = 'default' }: LotStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}
