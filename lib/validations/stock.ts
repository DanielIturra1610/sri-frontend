import { z } from 'zod';

/**
 * Validation schema for stock adjustment forms
 */

export const stockAdjustmentSchema = z.object({
  product_id: z
    .string()
    .min(1, 'El producto es requerido'),

  location_id: z
    .string()
    .min(1, 'La ubicación es requerida'),

  transaction_type: z.enum(
    ['purchase', 'sale', 'adjustment', 'transfer_in', 'transfer_out', 'count'],
    {
      message: 'Seleccione un tipo de transacción válido',
    }
  ),

  quantity: z
    .number({
      message: 'La cantidad es requerida y debe ser un número',
    })
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad debe ser mayor a 0'),

  notes: z
    .string()
    .max(500, 'Las notas no pueden tener más de 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

// Transaction type labels
export const transactionTypeLabels: Record<string, string> = {
  purchase: 'Compra',
  sale: 'Venta',
  adjustment: 'Ajuste Manual',
  transfer_in: 'Transferencia Entrada',
  transfer_out: 'Transferencia Salida',
  count: 'Conteo Físico',
};

// Transaction type colors for badges
export const transactionTypeColors: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
  purchase: 'success',
  sale: 'danger',
  adjustment: 'warning',
  transfer_in: 'info',
  transfer_out: 'info',
  count: 'default',
};
