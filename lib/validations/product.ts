import { z } from 'zod';

/**
 * Validation schemas for product forms
 */

export const productSchema = z.object({
  // Basic info
  sku: z
    .string()
    .min(1, 'El SKU es requerido')
    .max(50, 'El SKU no puede tener más de 50 caracteres')
    .regex(/^[A-Z0-9-_]+$/, 'El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos'),

  barcode: z
    .string()
    .max(50, 'El código de barras no puede tener más de 50 caracteres')
    .optional()
    .or(z.literal('')),

  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede tener más de 200 caracteres'),

  description: z
    .string()
    .max(1000, 'La descripción no puede tener más de 1000 caracteres')
    .optional()
    .or(z.literal('')),

  // Category and brand
  category_id: z
    .string()
    .optional()
    .or(z.literal('')),

  brand: z
    .string()
    .max(100, 'La marca no puede tener más de 100 caracteres')
    .optional()
    .or(z.literal('')),

  // Unit of measure
  unit_of_measure: z.enum(
    ['unit', 'kg', 'gram', 'liter', 'ml', 'meter', 'cm', 'sqm', 'box', 'pack', 'pallet'],
    {
      message: 'Seleccione una unidad de medida válida',
    }
  ),

  // Pricing
  cost_price: z
    .number({
      message: 'El precio de costo es requerido y debe ser un número',
    })
    .min(0, 'El precio de costo debe ser mayor o igual a 0')
    .max(999999999, 'El precio de costo es demasiado alto'),

  sale_price: z
    .number({
      message: 'El precio de venta es requerido y debe ser un número',
    })
    .min(0, 'El precio de venta debe ser mayor o igual a 0')
    .max(999999999, 'El precio de venta es demasiado alto'),

  tax_rate: z
    .number({
      message: 'La tasa de impuesto debe ser un número',
    })
    .min(0, 'La tasa de impuesto debe ser mayor o igual a 0')
    .max(100, 'La tasa de impuesto no puede ser mayor a 100%')
    .optional()
    .or(z.literal('')),

  // Stock levels
  minimum_stock: z
    .number({
      message: 'El stock mínimo debe ser un número',
    })
    .min(0, 'El stock mínimo debe ser mayor o igual a 0')
    .optional()
    .or(z.literal('')),

  maximum_stock: z
    .number({
      message: 'El stock máximo debe ser un número',
    })
    .min(0, 'El stock máximo debe ser mayor o igual a 0')
    .optional()
    .or(z.literal('')),

  // Status
  is_active: z.boolean().optional(),
}).refine(
  (data) => {
    // Validate that sale price is greater than or equal to cost price
    if (data.cost_price && data.sale_price) {
      return data.sale_price >= data.cost_price;
    }
    return true;
  },
  {
    message: 'El precio de venta debe ser mayor o igual al precio de costo',
    path: ['sale_price'],
  }
).refine(
  (data) => {
    // Validate that maximum stock is greater than minimum stock
    if (data.minimum_stock && data.maximum_stock) {
      return data.maximum_stock >= data.minimum_stock;
    }
    return true;
  },
  {
    message: 'El stock máximo debe ser mayor o igual al stock mínimo',
    path: ['maximum_stock'],
  }
);

export type ProductFormData = z.infer<typeof productSchema>;

// Unit of measure labels
export const unitOfMeasureLabels: Record<string, string> = {
  unit: 'Unidad',
  kg: 'Kilogramo',
  gram: 'Gramo',
  liter: 'Litro',
  ml: 'Mililitro',
  meter: 'Metro',
  cm: 'Centímetro',
  sqm: 'Metro Cuadrado',
  box: 'Caja',
  pack: 'Paquete',
  pallet: 'Pallet',
};
