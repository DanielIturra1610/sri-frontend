'use client';

import React from 'react';
import { Package, Calendar, AlertTriangle, Check } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { Lot } from '@/types';

interface LotSelectorProps {
  lots: Lot[];
  selectedLotId: string | null;
  onSelect: (lotId: string | null) => void;
  showNoLotOption?: boolean;
  disabled?: boolean;
  className?: string;
}

function getExpiryStatus(expiryDate: string | undefined) {
  if (!expiryDate) {
    return { status: 'unknown', label: 'Sin fecha', color: 'secondary' as const };
  }

  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) {
    return { status: 'expired', label: 'VENCIDO', color: 'destructive' as const };
  }
  if (daysUntil <= 30) {
    return { status: 'warning', label: `${daysUntil} días`, color: 'warning' as const };
  }
  return { status: 'ok', label: `${daysUntil} días`, color: 'success' as const };
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function LotSelector({
  lots,
  selectedLotId,
  onSelect,
  showNoLotOption = true,
  disabled = false,
  className,
}: LotSelectorProps) {
  const handleSelect = (lotId: string | null) => {
    if (!disabled) {
      onSelect(lotId);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Package className="h-4 w-4" />
        Selecciona el lote que estás contando
      </div>

      <div className="space-y-2">
        {lots.map((lot) => {
          const expiry = getExpiryStatus(lot.expiry_date);
          const isSelected = selectedLotId === lot.id;
          const isExpired = expiry.status === 'expired';

          return (
            <button
              key={lot.id}
              type="button"
              onClick={() => handleSelect(lot.id)}
              disabled={disabled || isExpired}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                isExpired && 'opacity-50 cursor-not-allowed',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              {/* Radio indicator */}
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 bg-white'
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>

              {/* Lot info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {lot.lot_number}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {lot.current_quantity} uds
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Vence: {formatDate(lot.expiry_date)}
                  </span>
                </div>
              </div>

              {/* Expiry badge */}
              <Badge
                variant={expiry.color}
                size="sm"
                className="shrink-0 flex items-center gap-1"
              >
                {expiry.status === 'warning' && (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {expiry.label}
              </Badge>
            </button>
          );
        })}

        {/* No lot option */}
        {showNoLotOption && (
          <button
            type="button"
            onClick={() => handleSelect(null)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-all',
              selectedLotId === null
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            {/* Radio indicator */}
            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                selectedLotId === null
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 bg-white'
              )}
            >
              {selectedLotId === null && <Check className="h-3 w-3 text-white" />}
            </div>

            <span className="text-gray-500">Sin especificar lote</span>
          </button>
        )}

        {/* Empty state */}
        {lots.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-sm">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Este producto no tiene lotes registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}
