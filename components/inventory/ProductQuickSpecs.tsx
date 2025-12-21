'use client';

import * as React from 'react';
import { Scale, Ruler, Box, Award, Thermometer, Clock, Factory, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ProductSpecifications } from '@/types';

export interface ProductQuickSpecsProps {
  specifications: ProductSpecifications;
  maxItems?: number;
  showAll?: boolean;
  className?: string;
}

// Specification field configuration
const SPEC_FIELDS = [
  { key: 'weight', label: 'Peso', icon: Scale },
  { key: 'dimensions', label: 'Dimensiones', icon: Ruler },
  { key: 'material', label: 'Material', icon: Box },
  { key: 'grade', label: 'Grado/Clase', icon: Award },
  { key: 'storage_temp', label: 'Temperatura', icon: Thermometer },
  { key: 'shelf_life', label: 'Vida util', icon: Clock },
  { key: 'manufacturer', label: 'Fabricante', icon: Factory },
  { key: 'country_of_origin', label: 'Origen', icon: MapPin },
] as const;

export function ProductQuickSpecs({
  specifications,
  maxItems = 4,
  showAll = false,
  className,
}: ProductQuickSpecsProps) {
  // Get specs that have values
  const availableSpecs = SPEC_FIELDS.filter(
    (field) => specifications[field.key as keyof ProductSpecifications]
  );

  // Limit items if not showing all
  const displaySpecs = showAll ? availableSpecs : availableSpecs.slice(0, maxItems);

  // Get certifications
  const certifications = specifications.certifications || [];

  // Get custom fields
  const customFields = specifications.custom_fields || {};
  const customFieldEntries = Object.entries(customFields);

  if (displaySpecs.length === 0 && certifications.length === 0 && customFieldEntries.length === 0) {
    return (
      <p className={cn('text-sm text-gray-500 dark:text-gray-400 italic', className)}>
        Sin especificaciones registradas
      </p>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main specs */}
      {displaySpecs.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {displaySpecs.map((field) => {
            const Icon = field.icon;
            const value = specifications[field.key as keyof ProductSpecifications];
            return (
              <div
                key={field.key}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{field.label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {value as string}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (showAll || displaySpecs.length < maxItems) && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Certificaciones</p>
          <div className="flex flex-wrap gap-1">
            {certifications.map((cert) => (
              <span
                key={cert}
                className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructions (only in full view) */}
      {showAll && specifications.instructions && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">
            Instrucciones de almacenamiento/manejo
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {specifications.instructions}
          </p>
        </div>
      )}

      {/* Custom fields (only in full view) */}
      {showAll && customFieldEntries.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Campos personalizados</p>
          <div className="space-y-1">
            {customFieldEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">{key}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductQuickSpecs;
