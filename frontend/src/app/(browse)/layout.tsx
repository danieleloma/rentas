import { BottomNav } from '@/components/layout/bottom-nav';
import { DashboardAuthGate } from '@/components/layout/dashboard-auth-gate';
import { Sidebar } from '@/components/layout/sidebar';

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardAuthGate allowGuests>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <div className="mx-auto flex w-full max-w-7xl">
          <Sidebar />
          <main className="min-h-screen w-full flex-1 px-4 py-4 pb-24 sm:px-5 md:px-6 md:py-8 md:pb-8">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </DashboardAuthGate>
  );
}
