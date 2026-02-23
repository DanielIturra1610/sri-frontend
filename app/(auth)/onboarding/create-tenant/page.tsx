'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';
import { createTenantSchema, type CreateTenantFormData } from '@/lib/validations/auth';

// Mapeo de slugs de landing a valores del backend
const PLAN_SLUG_MAP: Record<string, string> = {
  basico: 'basic',
  profesional: 'professional',
  empresarial: 'enterprise',
};

// Nombres legibles de los planes
const PLAN_NAMES: Record<string, string> = {
  basico: 'Básico',
  profesional: 'Profesional',
  empresarial: 'Empresarial',
};

export default function CreateTenantPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; full_name: string } | null>(null);
  const [selectedPlanFromLanding, setSelectedPlanFromLanding] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateTenantFormData>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      plan: 'basic',
    },
  });

  useEffect(() => {
    // Check if user is authenticated
    const user = AuthService.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user already has a tenant
    if (user.tenant_id) {
      // Si hay plan seleccionado, ir a billing
      const savedPlan = localStorage.getItem('selected_plan');
      if (savedPlan) {
        router.push('/settings/billing');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    setCurrentUser({ email: user.email, full_name: user.full_name });
    // Pre-fill email with user's email
    setValue('email', user.email);

    // Cargar plan desde localStorage si existe
    const savedPlan = localStorage.getItem('selected_plan');
    if (savedPlan) {
      setSelectedPlanFromLanding(savedPlan);
      // Convertir slug de landing a valor del backend
      const backendPlan = PLAN_SLUG_MAP[savedPlan] || 'basic';
      setValue('plan', backendPlan as 'basic' | 'professional' | 'enterprise');
    }
  }, [router, setValue]);

  const onSubmit = async (data: CreateTenantFormData) => {
    try {
      setError('');
      setIsLoading(true);

      await AuthService.createTenant(data);

      // Si hay plan seleccionado desde landing, ir a billing para pagar
      const savedPlan = localStorage.getItem('selected_plan');
      if (savedPlan) {
        router.push('/settings/billing');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Crear tu Empresa
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido <span className="font-medium">{currentUser.full_name}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          Configura tu empresa para comenzar a usar SRI Inventarios
        </p>
      </div>

      {/* Selected Plan Banner */}
      {selectedPlanFromLanding && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Plan seleccionado desde el sitio
              </p>
              <p className="text-lg font-bold text-green-900 dark:text-green-200">
                {PLAN_NAMES[selectedPlanFromLanding]}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
              Pre-seleccionado
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            Después de crear tu empresa, serás redirigido a la página de pago para activar tu suscripción.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Create Tenant Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            placeholder="Mi Empresa S.A."
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* RUT */}
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
            placeholder="12.345.678-9"
          />
          {errors.rut_empresa && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.rut_empresa.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Formato: 12.345.678-9 o 12345678-9
          </p>
        </div>

        {/* Email */}
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
            placeholder="contacto@miempresa.cl"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone (Optional) */}
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

        {/* Address (Optional) */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Dirección (Opcional)
          </label>
          <input
            {...register('address')}
            id="address"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            placeholder="Av. Principal 123, Santiago"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Plan Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Plan
          </label>
          <div className="grid grid-cols-1 gap-3">
            {/* Basic Plan */}
            <label className="relative flex items-start p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <input
                {...register('plan')}
                type="radio"
                value="basic"
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  Básico
                </span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Ideal para pequeños negocios. Hasta 100 productos.
                </span>
              </div>
            </label>

            {/* Professional Plan */}
            <label className="relative flex items-start p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <input
                {...register('plan')}
                type="radio"
                value="professional"
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  Profesional
                </span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Para negocios en crecimiento. Productos ilimitados.
                </span>
              </div>
            </label>

            {/* Enterprise Plan */}
            <label className="relative flex items-start p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <input
                {...register('plan')}
                type="radio"
                value="enterprise"
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  Empresarial
                </span>
                <span className="block text-sm text-gray-500 dark:text-gray-400">
                  Solución completa con soporte prioritario y API.
                </span>
              </div>
            </label>
          </div>
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
              Creando empresa...
            </span>
          ) : (
            'Crear Empresa'
          )}
        </button>
      </form>

      {/* Logout Link */}
      <div className="mt-6 text-center">
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
