'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { Plus, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { ProductSpecifications } from '@/types';

export interface ProductSpecificationsFormProps {
  specifications?: ProductSpecifications;
  onChange: (specifications: ProductSpecifications) => void;
  className?: string;
  disabled?: boolean;
}

// Predefined specification fields with labels
const PREDEFINED_FIELDS = [
  { key: 'weight', label: 'Peso', placeholder: 'Ej: 500g, 2.5kg' },
  { key: 'dimensions', label: 'Dimensiones', placeholder: 'Ej: 10x10x5cm' },
  { key: 'material', label: 'Material', placeholder: 'Ej: Acero galvanizado' },
  { key: 'grade', label: 'Grado/Clase', placeholder: 'Ej: 8.8, A2-70' },
  { key: 'storage_temp', label: 'Temperatura almacenamiento', placeholder: 'Ej: 15-25 C' },
  { key: 'shelf_life', label: 'Vida util', placeholder: 'Ej: 24 meses' },
  { key: 'manufacturer', label: 'Fabricante', placeholder: 'Nombre del fabricante' },
  { key: 'country_of_origin', label: 'Pais de origen', placeholder: 'Ej: Chile' },
] as const;

export function ProductSpecificationsForm({
  specifications = {},
  onChange,
  className,
  disabled = false,
}: ProductSpecificationsFormProps) {
  const [certInput, setCertInput] = useState('');
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Update a specific field
  const updateField = useCallback(
    (key: keyof ProductSpecifications, value: string | string[] | Record<string, string>) => {
      const updated = {
        ...specifications,
        [key]: value || undefined,
      };
      // Remove undefined values
      Object.keys(updated).forEach((k) => {
        if (updated[k as keyof ProductSpecifications] === undefined || updated[k as keyof ProductSpecifications] === '') {
          delete updated[k as keyof ProductSpecifications];
        }
      });
      onChange(updated);
    },
    [specifications, onChange]
  );

  // Add certification
  const addCertification = useCallback(() => {
    if (!certInput.trim()) return;
    const certs = specifications.certifications || [];
    if (!certs.includes(certInput.trim())) {
      updateField('certifications', [...certs, certInput.trim()]);
    }
    setCertInput('');
  }, [certInput, specifications.certifications, updateField]);

  // Remove certification
  const removeCertification = useCallback(
    (cert: string) => {
      const certs = (specifications.certifications || []).filter((c) => c !== cert);
      updateField('certifications', certs.length > 0 ? certs : undefined as any);
    },
    [specifications.certifications, updateField]
  );

  // Add custom field
  const addCustomField = useCallback(() => {
    if (!customFieldKey.trim() || !customFieldValue.trim()) return;
    const customFields = specifications.custom_fields || {};
    updateField('custom_fields', {
      ...customFields,
      [customFieldKey.trim()]: customFieldValue.trim(),
    });
    setCustomFieldKey('');
    setCustomFieldValue('');
    setShowAddCustom(false);
  }, [customFieldKey, customFieldValue, specifications.custom_fields, updateField]);

  // Remove custom field
  const removeCustomField = useCallback(
    (key: string) => {
      const customFields = { ...(specifications.custom_fields || {}) };
      delete customFields[key];
      updateField('custom_fields', Object.keys(customFields).length > 0 ? customFields : undefined as any);
    },
    [specifications.custom_fields, updateField]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Info banner */}
      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-blue-700 dark:text-blue-300">
          Completa la ficha tecnica con las especificaciones del producto. Esta informacion
          sera visible durante el conteo de inventario para ayudar a identificar el producto.
        </p>
      </div>

      {/* Predefined fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PREDEFINED_FIELDS.map(({ key, label, placeholder }) => (
          <Input
            key={key}
            label={label}
            placeholder={placeholder}
            value={(specifications as any)[key] || ''}
            onChange={(e) => updateField(key as keyof ProductSpecifications, e.target.value)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Certifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Certificaciones
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(specifications.certifications || []).map((cert) => (
            <span
              key={cert}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm"
            >
              {cert}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeCertification(cert)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {!disabled && (
          <div className="flex gap-2">
            <Input
              placeholder="Ej: ISO-9001, DIN-933"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCertification();
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCertification}
              disabled={!certInput.trim()}
            >
              Agregar
            </Button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <Textarea
        label="Instrucciones de almacenamiento/manejo"
        placeholder="Instrucciones especiales para el almacenamiento o manejo del producto..."
        value={specifications.instructions || ''}
        onChange={(e) => updateField('instructions', e.target.value)}
        disabled={disabled}
        rows={3}
      />

      {/* Custom fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Campos personalizados
        </label>

        {/* Existing custom fields */}
        {specifications.custom_fields && Object.keys(specifications.custom_fields).length > 0 && (
          <div className="space-y-2 mb-3">
            {Object.entries(specifications.custom_fields).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded"
              >
                <span className="font-medium text-sm text-gray-600 dark:text-gray-400 min-w-[100px]">
                  {key}:
                </span>
                <span className="text-sm flex-1">{value}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeCustomField(key)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add custom field form */}
        {!disabled && (
          <>
            {showAddCustom ? (
              <div className="flex gap-2 items-end">
                <Input
                  label="Nombre"
                  placeholder="Nombre del campo"
                  value={customFieldKey}
                  onChange={(e) => setCustomFieldKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  label="Valor"
                  placeholder="Valor"
                  value={customFieldValue}
                  onChange={(e) => setCustomFieldValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomField();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomField}
                  disabled={!customFieldKey.trim() || !customFieldValue.trim()}
                >
                  Agregar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddCustom(false);
                    setCustomFieldKey('');
                    setCustomFieldValue('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddCustom(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Agregar campo personalizado
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProductSpecificationsForm;
