'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      plan: 'basic',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      setIsLoading(true);
      await registerUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Crear Cuenta
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Registra tu empresa en SRI Inventarios
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Information Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            Información de la Empresa
          </h2>

          {/* Company Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nombre de la Empresa *
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="Mi Empresa SRL"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Company RUT */}
          <div>
            <label
              htmlFor="rut_empresa"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              RUT de la Empresa *
            </label>
            <input
              {...register('rut_empresa')}
              id="rut_empresa"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="12345678-9"
            />
            {errors.rut_empresa && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.rut_empresa.message}
              </p>
            )}
          </div>

          {/* Company Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email de la Empresa *
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="empresa@ejemplo.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Company Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Teléfono (Opcional)
            </label>
            <input
              {...register('phone')}
              id="phone"
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="+56 9 1234 5678"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Plan Selection */}
          <div>
            <label
              htmlFor="plan"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Plan *
            </label>
            <select
              {...register('plan')}
              id="plan"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            >
              <option value="basic">Básico - Gratis</option>
              <option value="professional">Profesional - $29.990/mes</option>
              <option value="enterprise">Empresarial - $99.990/mes</option>
            </select>
            {errors.plan && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.plan.message}
              </p>
            )}
          </div>
        </div>

        {/* User Information Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            Información del Usuario Administrador
          </h2>

          {/* User Full Name */}
          <div>
            <label
              htmlFor="user.full_name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nombre Completo *
            </label>
            <input
              {...register('user.full_name')}
              id="user.full_name"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="Juan Pérez"
            />
            {errors.user?.full_name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.user.full_name.message}
              </p>
            )}
          </div>

          {/* User Email */}
          <div>
            <label
              htmlFor="user.email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email del Usuario *
            </label>
            <input
              {...register('user.email')}
              id="user.email"
              type="email"
              autoComplete="username"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="juan@ejemplo.com"
            />
            {errors.user?.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.user.email.message}
              </p>
            )}
          </div>

          {/* User Password */}
          <div>
            <label
              htmlFor="user.password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Contraseña *
            </label>
            <input
              {...register('user.password')}
              id="user.password"
              type="password"
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              placeholder="••••••••"
            />
            {errors.user?.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.user.password.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Mínimo 8 caracteres, debe incluir mayúscula, minúscula y número
            </p>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Acepto los{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              política de privacidad
            </Link>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creando cuenta...
            </span>
          ) : (
            'Crear Cuenta'
          )}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
