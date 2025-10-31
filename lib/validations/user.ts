import { z } from 'zod';
import type { UserRole } from '@/types';

/**
 * Validation schemas for user management forms
 */

export const userSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  full_name: z
    .string()
    .min(1, 'El nombre completo es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .optional()
    .or(z.literal('')),
  rut: z
    .string()
    .regex(/^\d{7,8}-[\dkK]$/, 'RUT inválido (formato: 12345678-9)')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'AUDITOR', 'OPERATOR'], {
    message: 'Seleccione un rol válido',
  }),
  is_active: z.boolean().default(true),
});

export const createUserSchema = userSchema.extend({
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
});

export const updateUserSchema = userSchema.extend({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .optional()
    .or(z.literal('')),
});

export type UserFormData = z.infer<typeof userSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// Role labels for display
export const roleLabels: Record<UserRole, string> = {
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  AUDITOR: 'Auditor',
  OPERATOR: 'Operador',
};

// Role descriptions
export const roleDescriptions: Record<UserRole, string> = {
  OWNER: 'Acceso completo al sistema y gestión de la cuenta',
  ADMIN: 'Gestión completa de usuarios, productos e inventario',
  MANAGER: 'Gestión de productos, inventario y reportes',
  AUDITOR: 'Solo lectura de productos, inventario y reportes',
  OPERATOR: 'Gestión básica de inventario y transacciones',
};
