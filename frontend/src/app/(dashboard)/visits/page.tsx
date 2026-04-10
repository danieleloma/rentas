'use client';

import { useVisits, useUpdateVisitStatus, useCancelVisit } from '@/hooks/useVisits';
import { useAuthStore } from '@/store/authStore';
import { VisitCalendar } from '@/components/visits/visit-calendar';
import { Skeleton } from '@/components/ui/skeleton';

export default function VisitsPage() {
  const userRole = useAuthStore((s) => s.user?.role ?? 'renter');
  const { data, isLoading } = useVisits();
  const visits = data?.data ?? [];
  const updateStatus = useUpdateVisitStatus();
  const cancelVisit = useCancelVisit();

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100 md:text-2xl">My Visits</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <VisitCalendar
          visits={visits}
          userRole={userRole}
          onApprove={(id) => updateStatus.mutate({ id, status: 'approved' })}
          onReject={(id) => updateStatus.mutate({ id, status: 'rejected' })}
          onCancel={(id) => cancelVisit.mutate(id)}
        />
      )}
    </div>
  );
}
