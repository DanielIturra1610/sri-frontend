import type { Metadata } from 'next';
import { DashboardLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Dashboard - SRI Inventarios',
};

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
