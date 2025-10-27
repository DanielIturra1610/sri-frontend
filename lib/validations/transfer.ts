import { z } from 'zod';

/**
 * Validation schema for transfer forms
 */

export const transferSchema = z.object({
  product_id: z
    .string()
    .min(1, 'El producto es requerido'),

  from_location_id: z
    .string()
    .min(1, 'La ubicación de origen es requerida'),

  to_location_id: z
    .string()
    .min(1, 'La ubicación de destino es requerida'),

  quantity: z
    .number({
      message: 'La cantidad es requerida y debe ser un número',
    })
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad debe ser mayor a 0'),

  reason: z
    .string()
    .max(500, 'La razón no puede tener más de 500 caracteres')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.from_location_id !== data.to_location_id, {
  message: 'La ubicación de origen y destino no pueden ser la misma',
  path: ['to_location_id'],
});

export type TransferFormData = z.infer<typeof transferSchema>;

// Transfer status labels
export const transferStatusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_transit: 'En Tránsito',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

// Transfer status colors for badges
export const transferStatusColors: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
  pending: 'warning',
  in_transit: 'info',
  completed: 'success',
  cancelled: 'danger',
};
