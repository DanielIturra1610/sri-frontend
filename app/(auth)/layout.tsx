import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autenticación - SRI Inventarios',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
