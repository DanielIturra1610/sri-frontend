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

export const registerSchema = z.object({
  // Tenant info
  name: z
    .string()
    .min(1, 'El nombre de la empresa es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  rut_empresa: z
    .string()
    .min(1, 'El RUT de la empresa es requerido')
    .regex(/^\d{7,8}-[\dkK]$/, 'RUT inválido (formato: 12345678-9)'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  phone: z
    .string()
    .optional(),
  plan: z.enum(['basic', 'professional', 'enterprise'], {
    errorMap: () => ({ message: 'Seleccione un plan válido' }),
  }),
  // User info
  user: z.object({
    full_name: z
      .string()
      .min(1, 'El nombre completo es requerido')
      .min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: z
      .string()
      .min(1, 'El email del usuario es requerido')
      .email('Email inválido'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
      ),
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

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
