import { z } from 'zod';

/**
 * Validation schema for category forms
 */

export const categorySchema = z.object({
  // Basic info
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),

  description: z
    .string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional()
    .or(z.literal('')),

  // Parent category (optional - for subcategories)
  parent_id: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
