'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/services/authService';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setStatus('verifying');
    try {
      const response = await AuthService.verifyEmail(verificationToken);
      setStatus('success');
      setMessage(response.message || 'Correo verificado exitosamente');
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Error al verificar el correo');
    }
  }, [router]);

  // If token is provided, verify email automatically
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!email || isResending || resendCooldown > 0) return;

    setIsResending(true);
    try {
      const response = await AuthService.resendVerification(email);
      setMessage(response.message || 'Correo de verificación reenviado');
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error al reenviar el correo');
    } finally {
      setIsResending(false);
    }
  };

  // Token verification view
  if (token) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="mx-auto w-16 h-16 mb-4">
                <svg
                  className="animate-spin w-16 h-16 text-blue-600"
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verificando correo...
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Por favor espera mientras verificamos tu correo electrónico.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Correo verificado!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Redirigiendo al inicio de sesión...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-16 h-16 mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Error de verificación
              </h1>
              <p className="text-red-600 dark:text-red-400 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-center"
                >
                  Volver a registrarse
                </Link>
                <Link
                  href="/login"
                  className="block w-full text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium py-2 text-center"
                >
                  Ir a iniciar sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Waiting for verification view (after registration)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
      <div className="text-center">
        {/* Email Icon */}
        <div className="mx-auto w-20 h-20 mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verifica tu correo electrónico
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Hemos enviado un enlace de verificación a:
        </p>
        {email && (
          <p className="text-blue-600 dark:text-blue-400 font-medium mb-6">
            {email}
          </p>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Pasos a seguir:
          </h3>
          <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
            <li>Revisa tu bandeja de entrada</li>
            <li>Abre el correo de SRI Inventarios</li>
            <li>Haz clic en el enlace de verificación</li>
            <li>Inicia sesión en tu cuenta</li>
          </ol>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.toLowerCase().includes('error')
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* Resend Button */}
        {email && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              ¿No recibiste el correo?
            </p>
            <button
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              {isResending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                  Enviando...
                </span>
              ) : resendCooldown > 0 ? (
                `Reenviar en ${resendCooldown}s`
              ) : (
                'Reenviar correo de verificación'
              )}
            </button>
          </div>
        )}

        {/* Links */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-2">
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium text-sm"
            >
              ← Volver a iniciar sesión
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              ¿Usaste el correo incorrecto?{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Registrarse de nuevo
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
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
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
