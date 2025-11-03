import { z } from 'zod';

/**
 * Settings validation schemas
 */

// Company settings schema
export const companySettingsSchema = z.object({
  company_name: z.string().min(1, 'El nombre de la empresa es requerido').min(3, 'Mínimo 3 caracteres'),
  company_rut: z.string().min(1, 'El RUT es requerido').regex(/^\d{7,8}-[\dkK]$/, 'Formato de RUT inválido (ej: 12345678-9)'),
  company_email: z.string().email('Email inválido').optional().or(z.literal('')),
  company_phone: z.string().optional().or(z.literal('')),
  company_address: z.string().optional().or(z.literal('')),
  company_city: z.string().optional().or(z.literal('')),
  company_country: z.string().optional().or(z.literal('')),
});

export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;

// General settings schema
export const generalSettingsSchema = z.object({
  timezone: z.string().min(1, 'La zona horaria es requerida'),
  date_format: z.string().min(1, 'El formato de fecha es requerido'),
  currency: z.string().min(1, 'La moneda es requerida'),
  language: z.string().min(1, 'El idioma es requerido'),
});

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

// Notification settings schema
export const notificationSettingsSchema = z.object({
  email_notifications_enabled: z.boolean(),
  low_stock_notifications: z.boolean(),
  transfer_notifications: z.boolean(),
  system_notifications: z.boolean(),
});

export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

// Security settings schema
export const securitySettingsSchema = z.object({
  session_timeout_minutes: z.number().min(5, 'Mínimo 5 minutos').max(1440, 'Máximo 24 horas (1440 minutos)'),
  password_expiry_days: z.number().min(0, 'Mínimo 0 días (nunca expira)').max(365, 'Máximo 365 días'),
  require_strong_password: z.boolean(),
  enable_two_factor: z.boolean(),
});

export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;

// Inventory settings schema
export const inventorySettingsSchema = z.object({
  auto_calculate_reorder_point: z.boolean(),
  default_stock_unit: z.string().min(1, 'La unidad de stock es requerida'),
  allow_negative_stock: z.boolean(),
  require_approval_for_adjustments: z.boolean(),
});

export type InventorySettingsFormData = z.infer<typeof inventorySettingsSchema>;
