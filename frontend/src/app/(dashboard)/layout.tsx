import { BottomNav } from '@/components/layout/bottom-nav';
import { DashboardAuthGate } from '@/components/layout/dashboard-auth-gate';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardAuthGate allowGuests={true}>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar — hidden below md */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-1 flex-col md:pl-0">
          <main className="@container/main flex-1 px-4 py-6 pb-24 sm:px-6 md:px-8 md:py-8 md:pb-8">
            {children}
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>
    </DashboardAuthGate>
  );
}
