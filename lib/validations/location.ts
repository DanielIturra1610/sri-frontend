import { z } from 'zod';

/**
 * Validation schema for location forms
 */

export const locationSchema = z.object({
  // Basic info
  code: z
    .string()
    .min(1, 'El código es requerido')
    .max(20, 'El código no puede tener más de 20 caracteres')
    .regex(/^[A-Z0-9-_]+$/, 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'),

  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),

  type: z.enum(
    ['warehouse', 'store', 'distribution_center', 'supplier', 'other'],
    {
      message: 'Seleccione un tipo de ubicación válido',
    }
  ),

  description: z
    .string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional()
    .or(z.literal('')),

  is_active: z.boolean().optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;

// Location type labels
export const locationTypeLabels: Record<string, string> = {
  warehouse: 'Bodega',
  store: 'Tienda',
  distribution_center: 'Centro de Distribución',
  supplier: 'Proveedor',
  other: 'Otro',
};
