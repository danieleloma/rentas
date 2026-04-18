import { DashboardAuthGate } from '@/components/layout/dashboard-auth-gate';

export default function DashboardHomeLayout({ children }: { children: React.ReactNode }) {
  return <DashboardAuthGate>{children}</DashboardAuthGate>;
}
