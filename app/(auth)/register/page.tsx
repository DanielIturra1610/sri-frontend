'use client';

import { Suspense, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/services/authService';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';

const PLAN_NAMES: Record<string, string> = {
  basico: 'Básico',
  profesional: 'Profesional',
  empresarial: 'Empresarial',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Capturar el plan de la URL y guardarlo en localStorage
  useEffect(() => {
    const planFromUrl = searchParams.get('plan');
    if (planFromUrl && PLAN_NAMES[planFromUrl]) {
      setSelectedPlan(planFromUrl);
      localStorage.setItem('selected_plan', planFromUrl);
    } else {
      // Verificar si hay un plan guardado previamente
      const savedPlan = localStorage.getItem('selected_plan');
      if (savedPlan && PLAN_NAMES[savedPlan]) {
        setSelectedPlan(savedPlan);
      }
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      const response = await AuthService.register(data);

      // Show success message - user needs to verify email
      setSuccess(response.message || 'Registro exitoso. Por favor verifica tu correo electrónico para continuar.');

      // Redirect to verification pending page after 2 seconds
      setTimeout(() => {
        router.push('/verify-email?email=' + encodeURIComponent(data.email));
      }, 2000);

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
          Comienza a gestionar tu inventario con SRI
        </p>
      </div>

      {/* Selected Plan Banner */}
      {selectedPlan && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Plan seleccionado
              </p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
                {PLAN_NAMES[selectedPlan]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedPlan(null);
                localStorage.removeItem('selected_plan');
              }}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Cambiar plan
            </button>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Podrás activar tu suscripción después de crear tu empresa
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Nombre Completo *
          </label>
          <input
            {...register('full_name')}
            id="full_name"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            placeholder="Juan Pérez"
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.full_name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email *
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="username"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            placeholder="juan@ejemplo.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Contraseña *
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="new-password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Mínimo 8 caracteres, debe incluir mayúscula, minúscula y número
          </p>
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
          disabled={isLoading || !!success}
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

      {/* Info about next steps */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          Próximos pasos después de registrarte:
        </h3>
        <ol className="text-sm text-blue-700 dark:text-blue-400 list-decimal list-inside space-y-1">
          <li>Verificar tu correo electrónico</li>
          <li>Iniciar sesión</li>
          <li>Crear o unirte a una empresa</li>
        </ol>
      </div>

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
