import { z } from 'zod';

/**
 * Validation schemas for authentication forms
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration schema - simplified (no tenant data, created later)
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  full_name: z
    .string()
    .min(1, 'El nombre completo es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Create tenant schema - used during onboarding
export const createTenantSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre de la empresa es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  rut_empresa: z
    .string()
    .min(1, 'El RUT es requerido')
    .regex(/^(\d{1,2}\.)?\d{3}\.\d{3}-[\dkK]$|^\d{7,8}-[\dkK]$/, 'RUT inválido (formato: 12.345.678-9 o 12345678-9)'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  phone: z
    .string()
    .optional(),
  address: z
    .string()
    .optional(),
  plan: z.enum(['basic', 'professional', 'enterprise']).optional(),
});

export type CreateTenantFormData = z.infer<typeof createTenantSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Confirme la contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
